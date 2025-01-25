const express = require('express');
const { Client } = require('pg');  // PostgreSQL-klienten
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());  // Aktiverer CORS for alle anmodninger
app.use(bodyParser.json());  // Tillader JSON data i anmodninger

// Opret forbindelse til PostgreSQL
const client = new Client({
  user: 'postgres',  // PostgreSQL-brugernavn
  host: 'localhost',
  database: 'aldra_database',  // Din database
  password: '1234',  // Din adgangskode
  port: 5432,
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((error) => console.error('Error connecting to PostgreSQL:', error));

// Opret bruger rute
app.post('/register', async (req, res) => {
  const { name, email, password, relationToDementiaPerson } = req.body;

  try {
    // Indsæt bruger i databasen
    await client.query(
      'INSERT INTO Users (name, email, password, relation_to_dementia_person) VALUES ($1, $2, $3, $4)',
      [name, email, password, relationToDementiaPerson]
    );
    res.status(200).send('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
});

// Start serveren
app.listen(5001, () => {
  console.log('Server kører på http://localhost:5001');
});
