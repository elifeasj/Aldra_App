const express = require('express');
const { Client } = require('pg'); // PostgreSQL-klienten
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors()); // Aktiverer CORS for alle anmodninger
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

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((error) => {
      console.error('Error connecting to PostgreSQL:', error);
      process.exit(1); // Stop serveren, hvis databasen ikke kan tilgås
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
  const { name, email, password, relationToDementiaPerson, termsAccepted } = req.body;

  try {
    // Indsæt bruger i databasen og returnér data
    const result = await client.query(
      'INSERT INTO Users (name, email, password, relation_to_dementia_person, terms_accepted) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, password, relationToDementiaPerson, termsAccepted]
    );
    console.log('User registered:', result.rows[0]); // Log den oprettede bruger
    res.status(200).json(result.rows[0]); // Returnér den oprettede bruger som JSON
  } catch (error) {
    console.error('Error registering user:', error); // Log fejlen
    res.status(500).json({ error: 'Error registering user', details: error.message });
  }
});

// Start serveren
app.listen(5001, '0.0.0.0', () => {
  console.log('Server kører på http://0.0.0.0:5001');
});
