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

    // Insert test appointments
    const testDate = '2025-01-28';
    await client.query(`
      INSERT INTO appointments (title, description, date, start_time, end_time, reminder, user_id)
      VALUES 
        ('Besøg mor', '', $1, '14:00', '15:00', true, (SELECT id FROM users WHERE email = 'test@example.com')),
        ('Snak med overlæge', '', $1, '11:30', '12:00', false, (SELECT id FROM users WHERE email = 'test@example.com'))
    `, [testDate]);
    console.log('Test appointments created successfully');

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

// Test GET-rute
app.get('/', (req, res) => {
  res.send('Server is running');
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

// GET all appointments for a specific date
app.get('/appointments/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const result = await client.query(
      'SELECT * FROM appointments WHERE date = $1 ORDER BY start_time',
      [date]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new appointment
app.post('/appointments', async (req, res) => {
  try {
    const { title, description, date, startTime, endTime, reminder, userId } = req.body;
    const result = await client.query(
      `INSERT INTO appointments 
       (title, description, date, start_time, end_time, reminder, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [title, description, date, startTime, endTime, reminder, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update appointment
app.put('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, startTime, endTime, reminder } = req.body;
    const result = await client.query(
      `UPDATE appointments 
       SET title = $1, description = $2, date = $3, start_time = $4, end_time = $5, reminder = $6
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

// DELETE appointment
app.delete('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      'DELETE FROM appointments WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start serveren
app.listen(5001, '0.0.0.0', () => {
  console.log('Server kører på http://0.0.0.0:5001');
});
