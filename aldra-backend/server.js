const express = require('express');
const { Client } = require('pg'); // PostgreSQL-klienten
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json()); // Tillader JSON data i anmodninger

// Log alle indkommende anmodninger (for fejlfinding)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Body:', req.body); // Log body for at se indkommende data
    next();
});

// Opret forbindelse til PostgreSQL
const client = new Client({
  user: 'postgres', // PostgreSQL-brugernavn
  host: 'localhost', // Eller din computers IP-adresse
  database: 'aldradatabase', // Din database
  password: '1234', // Din adgangskode
  port: 5432,
});

// Initialize database
const initializeDatabase = async () => {
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        relation_to_dementia_person VARCHAR(255),
        terms_accepted BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Users table created successfully');

    // Create appointments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        reminder BOOLEAN DEFAULT false,
        user_id INTEGER,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
    console.log('Appointments table created successfully');

    // Insert test user if not exists
    const userResult = await client.query(
      "SELECT id FROM users WHERE email = 'test@example.com'"
    );
    
    if (userResult.rows.length === 0) {
      await client.query(`
        INSERT INTO users (name, email, password, relation_to_dementia_person, terms_accepted)
        VALUES ('Test User', 'test@example.com', 'password123', 'Caregiver', true)
      `);
      console.log('Test user created successfully');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Connect to database and initialize
client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL');
    return initializeDatabase();
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

// Helper function to format time
function formatTimeForDB(timeStr) {
  return timeStr.replace('.', ':');
}

// Helper function to format date for comparison
function formatDateForComparison(dateStr) {
  // Create date object in local timezone
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Root endpoint for health check
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Tilføj en GET-rute til /register for test
app.get('/register', (req, res) => {
  res.send('This is the register endpoint. Use POST to register a user.');
});

// Opret bruger-rute
app.post('/register', async (req, res) => {
  console.log('Received registration request with body:', req.body);
  
  const { name, email, password, relationToDementiaPerson, termsAccepted } = req.body;

  // Validate input
  if (!name || !email || !password || !relationToDementiaPerson || termsAccepted === undefined) {
    console.error('Missing required fields:', { name, email, password, relationToDementiaPerson, termsAccepted });
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.error('User already exists:', email);
      return res.status(409).json({ error: 'User already exists' });
    }

    // Indsæt bruger i databasen og returnér data
    const result = await client.query(
      'INSERT INTO users (name, email, password, relation_to_dementia_person, terms_accepted) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, password, relationToDementiaPerson, termsAccepted]
    );
    
    const newUser = result.rows[0];
    console.log('User registered successfully:', newUser);
    
    // Send only necessary user data back
    res.status(200).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      relationToDementiaPerson: newUser.relation_to_dementia_person
    });
  } catch (error) {
    console.error('Detailed error registering user:', {
      error: error.message,
      stack: error.stack,
      code: error.code
    });
    
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Email already registered' });
    } else {
      res.status(500).json({ 
        error: 'Error registering user',
        message: error.message
      });
    }
  }
});

// Get all dates that have appointments
app.get('/appointments/dates/all', async (req, res) => {
  try {
    console.log('Fetching all appointment dates');
    const result = await client.query(
      `SELECT DISTINCT date::date as date
       FROM appointments 
       ORDER BY date`
    );

    console.log('Raw dates from database:', result.rows);

    // Format all dates
    const dates = result.rows.map(row => formatDateForComparison(row.date));
    console.log('Final formatted dates:', dates);
    res.json(dates);
  } catch (error) {
    console.error('Error fetching appointment dates:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Get appointments for a specific date
app.get('/appointments/:date', async (req, res) => {
  try {
    const { date } = req.params;
    console.log('Fetching appointments for date:', date);
    
    // Format the date for comparison
    const formattedDate = formatDateForComparison(date);
    console.log('Formatted date for query:', formattedDate);

    const result = await client.query(
      `SELECT * FROM appointments 
       WHERE date::date = $1::date
       ORDER BY start_time ASC`,
      [formattedDate]
    );

    // Format the time strings
    const formattedAppointments = result.rows.map(appointment => ({
      ...appointment,
      date: formatDateForComparison(appointment.date),
      start_time: appointment.start_time.substring(0, 5),
      end_time: appointment.end_time.substring(0, 5)
    }));

    console.log('Returning appointments:', formattedAppointments);
    res.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Create new appointment
app.post('/appointments', async (req, res) => {
  try {
    console.log('Received appointment data:', req.body);
    const { title, description, date, startTime, endTime, reminder } = req.body;

    // Validate required fields
    if (!title || !date || !startTime || !endTime) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { title, date, startTime, endTime }
      });
    }

    // Format date and times for database
    const formattedDate = formatDateForComparison(date);
    const formattedStartTime = formatTimeForDB(startTime);
    const formattedEndTime = formatTimeForDB(endTime);

    // Get test user id
    const userResult = await client.query(
      "SELECT id FROM users WHERE email = 'test@example.com'"
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Test user not found' });
    }

    const userId = userResult.rows[0].id;

    console.log('Inserting appointment with values:', {
      title,
      description,
      date: formattedDate,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      reminder,
      userId
    });

    const result = await client.query(
      `INSERT INTO appointments (title, description, date, start_time, end_time, reminder, user_id)
       VALUES ($1, $2, $3::date, $4::time, $5::time, $6, $7)
       RETURNING *`,
      [title, description, formattedDate, formattedStartTime, formattedEndTime, reminder, userId]
    );

    // Format the returned appointment
    const appointment = result.rows[0];
    const formattedAppointment = {
      ...appointment,
      date: formatDateForComparison(appointment.date),
      start_time: appointment.start_time.substring(0, 5),
      end_time: appointment.end_time.substring(0, 5)
    };

    console.log('Appointment created:', formattedAppointment);
    res.json(formattedAppointment);
  } catch (error) {
    console.error('Detailed error in /appointments POST:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack
    });
  }
});

// PUT update appointment
app.put('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, startTime, endTime, reminder } = req.body;
    const result = await client.query(
      `UPDATE appointments 
       SET title = $1, description = $2, date = $3, start_time = $4, end_time = $5, reminder = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 
       RETURNING *`,
      [title, description, date, startTime, endTime, reminder, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an appointment
app.delete('/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Received delete request for appointment ID:', id);
        
        const result = await client.query(
            'DELETE FROM appointments WHERE id = $1 RETURNING *',
            [id]
        );
        console.log('Delete query result:', result.rows);

        if (result.rows.length === 0) {
            console.log('No appointment found with ID:', id);
            return res.status(404).json({ error: 'Appointment not found' });
        }

        console.log('Successfully deleted appointment with ID:', id);
        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('Detailed error deleting appointment:', {
            error: error.message,
            stack: error.stack,
            params: req.params
        });
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
const PORT = 5001;
const HOST = '192.168.0.234';

app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}/`);
});
