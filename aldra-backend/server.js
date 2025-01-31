const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json());

// Log alle indkommende anmodninger (for fejlfinding)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Body:', req.body);
    next();
});

// Opret forbindelse til PostgreSQL
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'aldradatabase',
  password: '1234',
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
        status VARCHAR(50) DEFAULT 'active',
        last_activity TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
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

    // Create logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        user_id INTEGER,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
    console.log('Logs table created successfully');

    // Create push_tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS push_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        token VARCHAR(255) NOT NULL,
        platform VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
    console.log('Push tokens table created successfully');

    // Create notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        appointment_id INTEGER,
        title VARCHAR(255) NOT NULL,
        body TEXT,
        scheduled_for TIMESTAMPTZ NOT NULL,
        sent BOOLEAN DEFAULT false,
        sent_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (appointment_id) REFERENCES appointments(id)
      );
    `);
    console.log('Notifications table created successfully');

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

// Endpoint to update user's last activity
app.post('/api/update-activity', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    await client.query(`
      UPDATE users 
      SET last_activity = CURRENT_TIMESTAMP,
          status = 'active'
      WHERE id = $1
    `, [userId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint for creating a new log
app.post('/logs', async (req, res) => {
  try {
    console.log('Received log data:', req.body);
    const { title, description, date } = req.body;
    
    // For now, we'll use the test user's ID (1)
    const userId = 1;

    const result = await client.query(`
      INSERT INTO logs (title, description, date, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [title, description, date, userId]);

    res.status(201).json({
      success: true,
      message: 'Log created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating log',
      error: error.message
    });
  }
});

// Endpoint for getting all logs for a user
app.get('/logs', async (req, res) => {
  try {
    // For now, we'll use the test user's ID (1)
    const userId = 1;

    const result = await client.query(`
      SELECT * FROM logs
      WHERE user_id = $1
      ORDER BY date DESC, created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching logs',
      error: error.message
    });
  }
});

// Endpoint til at gemme push tokens
app.post('/push-token', async (req, res) => {
  try {
    const { token, platform } = req.body;
    
    // Tjek om token allerede eksisterer
    const existingToken = await client.query(
      'SELECT * FROM push_tokens WHERE token = $1',
      [token]
    );

    if (existingToken.rows.length === 0) {
      // Indsæt nyt token
      await client.query(
        'INSERT INTO push_tokens (token, platform) VALUES ($1, $2)',
        [token, platform]
      );
    }

    res.json({ message: 'Token gemt' });
  } catch (error) {
    console.error('Fejl ved gemning af push token:', error);
    res.status(500).json({ error: 'Intern serverfejl' });
  }
});

// Route til at registrere push token
app.post('/api/register-push-token', async (req, res) => {
  try {
    const { token, platform } = req.body;
    const userId = req.user.id;

    await client.query(
      'SELECT upsert_push_token($1, $2, $3)',
      [userId, token, platform]
    );

    res.status(200).json({ message: 'Push token registreret' });
  } catch (error) {
    console.error('Fejl ved registrering af push token:', error);
    res.status(500).json({ error: 'Kunne ikke registrere push token' });
  }
});

// Route til at gemme notifikation
app.post('/api/schedule-notification', async (req, res) => {
  try {
    const { appointmentId, title, body, scheduledFor } = req.body;
    const userId = req.user.id;

    const result = await client.query(
      'SELECT schedule_notification($1, $2, $3, $4, $5)',
      [userId, appointmentId, title, body, scheduledFor]
    );

    res.status(200).json({ 
      message: 'Notifikation planlagt',
      notificationId: result.rows[0].schedule_notification
    });
  } catch (error) {
    console.error('Fejl ved planlægning af notifikation:', error);
    res.status(500).json({ error: 'Kunne ikke planlægge notifikation' });
  }
});

// Funktion til at sende planlagte notifikationer
async function sendScheduledNotifications() {
  try {
    const result = await client.query(`
      SELECT n.*, pt.token 
      FROM notifications n
      JOIN push_tokens pt ON n.user_id = pt.user_id
      WHERE n.sent = false 
      AND n.scheduled_for BETWEEN NOW() AND NOW() + INTERVAL '30 minutes'
      AND pt.platform = 'ios'
    `);

    for (const notification of result.rows) {
      // Send push notifikation via Expo
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: notification.token,
          title: notification.title,
          body: notification.body,
          sound: 'default',
          badge: 1,
          priority: 'high'
        })
      });

      // Marker notifikationen som sendt
      await client.query(
        'UPDATE notifications SET sent = true, sent_at = NOW() WHERE id = $1',
        [notification.id]
      );
    }
  } catch (error) {
    console.error('Fejl ved afsendelse af planlagte notifikationer:', error);
  }
}

// Kør check for planlagte notifikationer hvert minut
setInterval(sendScheduledNotifications, 60000);

// Planlæg cron job til at køre hver nat kl. 00:00 for at tjekke inaktive brugere
cron.schedule('0 0 * * *', async () => {
  console.log('Kører cron job for at tjekke inaktive brugere...');
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    console.log(`Tjekker for brugere der har været inaktive siden: ${oneYearAgo.toISOString()}`);

    // Find brugere der skal slettes
    const usersToDelete = await client.query(`
      SELECT id, email, last_activity 
      FROM users 
      WHERE last_activity < $1
    `, [oneYearAgo]);

    if (usersToDelete.rowCount > 0) {
      console.log(`Fundet ${usersToDelete.rowCount} inaktive brugere til sletning:`);
      
      // Log brugere der skal slettes
      usersToDelete.rows.forEach(user => {
        console.log(`- Bruger ID: ${user.id}, Email: ${user.email}, Sidste aktivitet: ${user.last_activity}`);
      });

      // Slet relaterede data først (foreign key-begrænsninger)
      const userIds = usersToDelete.rows.map(user => user.id);
      
      // Slet aftaler
      await client.query(`
        DELETE FROM appointments 
        WHERE user_id = ANY($1)
      `, [userIds]);

      // Slet brugere
      const deleteResult = await client.query(`
        DELETE FROM users 
        WHERE id = ANY($1) 
        RETURNING id, email
      `, [userIds]);

      console.log(`Slettet ${deleteResult.rowCount} inaktive brugere og deres data`);
    } else {
      console.log('Ingen inaktive brugere fundet til sletning');
    }
  } catch (error) {
    console.error('Fejl ved håndtering af inaktive brugere:', error);
  }
});

// Start server
const PORT = 5001;
const HOST = '192.168.0.234';

app.listen(PORT, HOST, () => {
    console.log(`Server kørende på http://${HOST}:${PORT}/`);
});
