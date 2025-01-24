const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Atlas URI
const uri = 'mongodb+srv://elfitaydin:Melo11oktober!@aldra.ica31.mongodb.net/?retryWrites=true&w=majority&appName=Aldra';

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Opret forbindelse til MongoDB Atlas
client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Definere bruger-modellen
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, // For nemheds skyld, husk at hashe passwords før gemme i produktion!
  relationToDementiaPerson: String,
});

const User = mongoose.model('User', UserSchema);

// Opret bruger rute
app.post('/register', async (req, res) => {
  const { name, email, password, relationToDementiaPerson } = req.body;

  try {
    const newUser = new User({
      name,
      email,
      password, // I praksis skal du hash adgangskoden
      relationToDementiaPerson
    });

    await newUser.save();
    res.status(200).send('User registered successfully');
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

app.listen(5001, () => {
  console.log('Server kører på http://localhost:5001');
});
