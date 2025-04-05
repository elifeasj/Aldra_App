const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();

// CORS konfiguration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));
app.use(bodyParser.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Funktion til at maskere følsomme data
function maskSensitiveData(obj) {
    if (!obj) return obj;
    const masked = { ...obj };
    if (masked.password) masked.password = '****';
    if (masked.adgangskode) masked.adgangskode = '****';
    return masked;
}

// Log alle indkommende anmodninger (for fejlfinding)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    const maskedBody = maskSensitiveData(req.body);
    console.log('Body:', maskedBody);
    next();
});

// Opret forbindelse til Superbase
const client = new Client({
  connectionString: 'postgresql://postgres.zmanqocbqjgswnkgwxgd:AldraSecure2025!@aws-0-eu-north-1.pooler.supabase.com:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

// Add connection error handler
client.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});



// Initialize database
async function initializeDatabase() {
  try {
    // Create family_links table
    await client.query(`
      CREATE TABLE IF NOT EXISTS family_links (
        id SERIAL PRIMARY KEY,
        creator_user_id INTEGER NOT NULL,
        family_id INTEGER,
        unique_code VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        last_used_at TIMESTAMPTZ,
        member_count INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        FOREIGN KEY (creator_user_id) REFERENCES users(id),
        CONSTRAINT valid_member_count CHECK (member_count >= 0)
      );
    `);
    console.log('Family links table created successfully');

    // Remove family_id column from users table if it exists
    await client.query(`
      DO $$ 
      BEGIN 
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'family_id') THEN
          ALTER TABLE users DROP COLUMN family_id;
        END IF;
      END $$;
    `);
    console.log('Family ID column added to users table if it did not exist');

    // Drop appointments_and_logs table if it exists
    await client.query('DROP TABLE IF EXISTS appointments_and_logs CASCADE');

    // Create users table med ny kolonne profile_image
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        relation_to_dementia_person VARCHAR(255),
        profile_image TEXT,  -- Ny kolonne til profilbillede URL
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        termsAccepted BOOLEAN DEFAULT false
      );
    `);
    console.log('Users table created successfully');

    // Create appointments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        appointment_id INTEGER UNIQUE NOT NULL GENERATED ALWAYS AS IDENTITY,
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
        appointment_id INTEGER,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date TIMESTAMPTZ NOT NULL,
        user_id INTEGER,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
    console.log('Logs table created successfully');

    // Create push_tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS push_tokens (
        id SERIAL PRIMARY KEY,
        token TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
    console.log('Push tokens table created successfully');

    // Create notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        body TEXT,
        appointment_id INTEGER,
        user_id INTEGER,
        scheduled_for TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
    console.log('Notifications table created successfully');

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

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

// Konfigurer multer til filupload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Sørg for, at denne mappe eksisterer
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});
const upload = multer({ storage: storage });

// Endpoint til upload af profilbillede
app.post('/upload-profile-image', upload.single('profileImage'), async (req, res) => {
  try {
    console.log('Request body:', req.body);  // Log the request body
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `http://192.168.0.215:5001/uploads/${req.file.filename}`;
    console.log('Image URL:', imageUrl);  // Log the image URL before saving
    const { userId } = req.body;
    if (userId) {
      await client.query(
        'UPDATE users SET profile_image = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [imageUrl, userId]
      );
    }
    return res.json({ imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const maskedData = maskSensitiveData({ email, password });
    console.log('Login attempt:', maskedData);

    if (!email || !password) {
        return res.status(400).json({ error: 'Email og adgangskode er påkrævet' });
    }

    try {
        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Forkert email eller adgangskode' });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.hashed_password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Forkert email eller adgangskode' });
        }

        // Send brugerdata tilbage (uden adgangskode)
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            relationToDementiaPerson: user.relation_to_dementia_person,
            profile_image: user.profile_image
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Der opstod en fejl under login' });
    }
});

// Get a specific log
app.get('/logs/:id', async (req, res) => {
  try {
    const logId = req.params.id;
    const { user_id } = req.query;

    console.log('GET /logs/:id - Parameters:', { logId, user_id });

    if (!user_id) {
      console.log('No user_id provided in query');
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await client.query(`
      SELECT * FROM logs
      WHERE id = $1 AND user_id = $2
    `, [logId, user_id]);

    if (result.rows.length === 0) {
      console.log('No log found with these parameters');
      return res.status(404).json({ error: 'Log not found' });
    }

    console.log('Sending log:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching log:', err);
    res.status(500).json({ error: 'Error fetching log' });
  }
});

// Update a log
app.put('/logs/:id', async (req, res) => {
  try {
    const logId = req.params.id;
    const { title, description, date, appointment_id, user_id } = req.body;

    console.log('PUT /logs/:id - Parameters:', { logId, user_id });

    if (!user_id) {
      console.log('No user_id provided in body');
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await client.query(`
      UPDATE logs
      SET title = $1, 
          description = $2, 
          date = $3,
          appointment_id = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND user_id = $6
      RETURNING *
    `, [title, description, date, appointment_id, logId, user_id]);

    if (result.rows.length === 0) {
      console.log('No log found with these parameters');
      return res.status(404).json({ error: 'Log not found' });
    }

    console.log('Updated log:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating log:', err);
    res.status(500).json({ error: 'Error updating log' });
  }
});

// Generate a unique family link
app.post('/family-link/generate', async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Generate a random 10-character code
    const uniqueCode = Math.random().toString(36).substring(2, 12).toUpperCase();

    // Save the link in the database
    const result = await client.query(
      'INSERT INTO family_links (creator_user_id, unique_code) VALUES ($1, $2) RETURNING *',
      [user_id, uniqueCode]
    );

    res.json({
      code: uniqueCode,
      shareLink: `aldra://register?familyCode=${uniqueCode}`
    });
  } catch (error) {
    console.error('Error generating family link:', error);
    res.status(500).json({ error: 'Error generating family link' });
  }
});

// Validate and use a family code
app.get('/family-link/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    // Get the family link and update last_used_at and member count
    const result = await client.query(
      `UPDATE family_links 
       SET last_used_at = CURRENT_TIMESTAMP,
           member_count = member_count + 1
       WHERE unique_code = $1 AND status = 'active' 
       RETURNING id, creator_user_id, member_count`,
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or inactive family link' });
    }

    // Get creator info
    const creatorResult = await client.query(
      'SELECT id, name FROM users WHERE id = $1',
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid family code' });
    }

    res.json({ creator_user_id: result.rows[0].creator_user_id });
  } catch (error) {
    console.error('Error validating family code:', error);
    res.status(500).json({ error: 'Error validating family code' });
  }
});

// Get family members
app.get('/users/family/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Hent alle brugere der har den givne bruger som deres family_id
    const result = await client.query(`
      SELECT id, name, relation_to_dementia_person
      FROM users
      WHERE family_id = $1
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({ error: 'Error fetching family members' });
  }
});

// Start server
const PORT = 5001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});


// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const maskedData = maskSensitiveData({ email, password });
    console.log('Login attempt:', maskedData);

    if (!email || !password) {
        return res.status(400).json({ error: 'Email og adgangskode er påkrævet' });
    }

    try {
        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Forkert email eller adgangskode' });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.hashed_password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Forkert email eller adgangskode' });
        }

        // Send brugerdata tilbage (uden adgangskode)
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            relationToDementiaPerson: user.relation_to_dementia_person,
            profile_image: user.profile_image
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Der opstod en fejl under login' });
    }
});

// Root endpoint for health check
// Update family link status
app.put('/family-link/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be either "active" or "inactive"' });
    }

    const result = await client.query(
      `UPDATE family_links
       SET status = $1
       WHERE id = $2
       RETURNING id, unique_code, status, member_count, last_used_at`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Family link not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating family link status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/register', async (req, res) => {
    const { name, email, password, relationToDementiaPerson, termsAccepted, familyCode } = req.body;
    console.log('=== START REGISTRATION ===');
    const maskedData = maskSensitiveData({ name, email, password, relationToDementiaPerson, termsAccepted, familyCode });
    console.log('Registration attempt:', maskedData);
    console.log('=== END REGISTRATION ===');

    // Validate input
    if (!name || !email || !password || !relationToDementiaPerson || termsAccepted === undefined) {
        console.error('Missing required fields for user:', email);
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if user already exists
        const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUser.rows.length > 0) {
            console.error('User already exists:', email);
            return res.status(409).json({ error: 'User already exists' });
        }

        // Start a transaction
        await client.query('BEGIN');

        // Hash adgangskoden før gemning
        const hashedPassword = await bcrypt.hash(password, 10);

        // Indsæt bruger i databasen
        const result = await client.query(
            'INSERT INTO users (name, email, hashed_password, relation_to_dementia_person, termsAccepted) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, relation_to_dementia_person',
            [name, email, hashedPassword, relationToDementiaPerson, termsAccepted]
        );

        await client.query('COMMIT');

        const newUser = result.rows[0];
        console.log('User registered successfully:', newUser);

        res.status(201).json({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            relationToDementiaPerson: newUser.relation_to_dementia_person,
            familyId: newUser.family_id
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Detailed error registering user:', {
            error: error.message,
            stack: error.stack,
            code: error.code
        });

        if (error.code === '23505') { // Unique constraint violation
            res.status(409).json({ error: 'Email already registered' });
        } else {
            res.status(500).json({ error: 'Error registering user', message: error.message });
        }
    }



  
});


// Get all dates with appointments
app.get('/appointments/dates/all', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await client.query(
      `SELECT DISTINCT date FROM appointments 
       WHERE user_id = $1 
       ORDER BY date ASC`,
      [user_id]
    );

    const dates = result.rows.map(row => row.date);
    console.log('Fetched dates with appointments:', dates);
    res.json(dates);
  } catch (error) {
    console.error('Error fetching dates with appointments:', error);
    res.status(500).json({ error: 'Error fetching dates' });
  }
});

// Get logs for a specific appointment
app.get('/logs/:appointment_id', async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await client.query(
      `SELECT * FROM logs 
       WHERE appointment_id = $1 AND user_id = $2 
       ORDER BY date DESC`,
      [appointment_id, user_id]
    );

    console.log('Fetched logs for appointment:', appointment_id, 'logs:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Error fetching logs' });
  }
});

// Create new log
app.post('/logs', async (req, res) => {
  try {
    const { appointment_id, user_id, title, description, date } = req.body;
    console.log('Creating log:', { appointment_id, user_id, title, description, date });

    // If appointment_id is provided, verify that it belongs to the user
    if (appointment_id) {
      const appointmentCheck = await client.query(
        'SELECT id FROM appointments WHERE appointment_id = $1 AND user_id = $2',
        [appointment_id, user_id]
      );

      if (appointmentCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Unauthorized: This appointment does not belong to the user' });
      }
    }

    // Validate required fields
    if (!user_id || !title || !date) {
      return res.status(400).json({ error: 'Missing required fields: user_id, title, and date are required' });
    }

    const result = await client.query(
      `INSERT INTO logs 
       (appointment_id, user_id, title, description, date) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [appointment_id, user_id, title, description, date]
    );

    console.log('Log created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ error: 'Error creating log' });
  }
});

// Get appointments for a specific date
app.get('/appointments/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await client.query(
      `SELECT * FROM appointments 
       WHERE date = $1 AND user_id = $2 
       ORDER BY start_time ASC`,
      [date, user_id]
    );

    console.log('Fetched appointments for date:', date, 'appointments:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Error fetching appointments' });
  }
});

// Create new appointment
app.post('/appointments', async (req, res) => {
  try {
    const { title, description, date, start_time, end_time, reminder, user_id } = req.body;
    console.log('Creating appointment:', { title, description, date, start_time, end_time, reminder, user_id });

    const result = await client.query(
      `INSERT INTO appointments 
       (title, description, date, start_time, end_time, reminder, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [title, description, date, start_time, end_time, reminder, user_id]
    );

    console.log('Appointment created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Error creating appointment' });
  }
});

// PUT update appointment
app.put('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, start_time, end_time, reminder } = req.body;
    const result = await client.query(
      `UPDATE appointments 
       SET title = $1, description = $2, date = $3, start_time = $4, end_time = $5, reminder = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 
       RETURNING *`,
      [title, description, date, start_time, end_time, reminder, id]
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
    
    const result = await client.query('BEGIN');
    try {
      // Først sletter vi alle logs der er knyttet til denne aftale
      await client.query('DELETE FROM logs WHERE appointment_id = $1', [id]);
      console.log('Deleted associated logs');

      // Derefter sletter vi selve aftalen
      const result = await client.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Appointment not found');
      }

      await client.query('COMMIT');
      console.log('Appointment deleted successfully');
      res.json({ message: 'Appointment deleted successfully' });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error deleting appointment:', err);
      res.status(500).json({ error: 'Failed to delete appointment' });
    }
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
// Get latest logs for a user
// Update user data
app.put('/users/:userId', async (req, res) => {
  console.log('Received update request for user:', req.params.userId);
  console.log('Update data:', req.body);
  try {
    const { userId } = req.params;
    const { name, email, password, birthday } = req.body;

    // Verify that the user exists first
    const userCheck = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      console.log('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Found user:', userCheck.rows[0]);

    // Start building the update query
    let updateFields = [];
    let queryParams = [];
    let paramCounter = 1;

    if (name) {
      updateFields.push(`name = $${paramCounter}`);
      queryParams.push(name);
      paramCounter++;
    }

    if (email) {
      updateFields.push(`email = $${paramCounter}`);
      queryParams.push(email);
      paramCounter++;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push(`hashed_password = $${paramCounter}`);
      queryParams.push(hashedPassword);
      paramCounter++;
    }

    if (birthday) {
      updateFields.push(`birthday = $${paramCounter}`);
      queryParams.push(birthday);
      paramCounter++;
    }

    // Add the userId as the last parameter
    queryParams.push(userId);

    // If there are no fields to update, return early
    if (updateFields.length === 0) {
      console.log('No fields to update');
      return res.status(400).json({ error: 'No fields to update' });
    }

    console.log('Building update query with fields:', updateFields);
    console.log('And parameters:', queryParams);

    const query = `
      UPDATE users
      SET ${updateFields.join(', ')},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCounter}
      RETURNING id, name, email, birthday, profile_image, relation_to_dementia_person
    `;

    console.log('Executing query:', query);
    const result = await client.query(query, queryParams);

    if (result.rows.length === 0) {
      console.log('No rows updated');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Successfully updated user:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Detailed error:', error);
    if (error.code === '23505') {
      // Unique constraint violation
      return res.status(400).json({ error: 'Email already exists' });
    }
    if (error.code === '23502') {
      // Not null constraint violation
      return res.status(400).json({ error: 'Required field missing' });
    }
    res.status(500).json({ 
      error: 'Error updating user data',
      details: error.message,
      code: error.code
    });
  }
});

app.get('/user-logs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await client.query(
      `SELECT * FROM logs 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 3`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user logs:', error);
    res.status(500).json({ error: 'Error fetching user logs' });
  }
});

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

// Get or create unique family link code
app.get('/api/family-link/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user already has a family link
    let familyLink = await client.query(
      'SELECT * FROM family_links WHERE creator_user_id = $1',
      [userId]
    );

    if (familyLink.rows.length > 0) {
      return res.status(200).json({ unique_code: familyLink.rows[0].unique_code });
    }

    // If no family link exists, create one
    const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const result = await client.query(
      'INSERT INTO family_links (creator_user_id, unique_code, member_count, status) VALUES ($1, $2, 1, $3) RETURNING unique_code',
      [userId, uniqueCode, 'active']
    );

    res.status(200).json({ unique_code: result.rows[0].unique_code });
  } catch (error) {
    console.error('Error getting/creating family link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all logs with appointment info
app.get('/admin/logs-view', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT 
        l.*,
        a.title as appointment_title,
        a.description as appointment_description,
        a.start_time as appointment_start_time,
        a.end_time as appointment_end_time,
        CASE 
          WHEN l.appointment_id IS NOT NULL THEN 'Aftale #' || l.appointment_id || ': ' || a.title
          ELSE 'Ingen aftale'
        END as appointment_reference
      FROM logs l
      LEFT JOIN appointments a ON l.appointment_id = a.appointment_id
      ORDER BY l.date DESC;
    `);
    
    console.log('Logs with appointments:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching logs with appointments:', err);
    res.status(500).json({ error: 'Error fetching logs with appointments' });
  }
});

// Get all logs
app.get('/logs', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM logs ORDER BY date DESC');
    console.log('Sending logs:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ error: 'Error fetching logs' });
  }
});

// Get a specific log
