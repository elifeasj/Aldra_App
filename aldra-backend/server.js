require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
const { auth, db, bucket } = require('./firebaseAdmin');

console.log('🔐 Firebase Admin SDK initialized — Firestore and Auth are ready to use!');

async function testFirebaseConnection() {
  try {
    const collections = await db.listCollections();
    console.log('✅ Firestore connected, collections count:', collections.length);
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
  }
}

testFirebaseConnection();


const app = express();


console.log('🔐 Resend API key loaded:', process.env.RESEND_API_KEY ? '✅' : '❌');

const resend = new Resend(process.env.RESEND_API_KEY);


// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

console.log('🔐 Supabase URL loaded:', process.env.SUPABASE_URL ? '✅' : '❌');
console.log('🔐 Supabase Service Role Key loaded:', process.env.SUPABASE_SERVICE_ROLE ? '✅' : '❌');

// Enable CORS
app.use(cors());

app.use(bodyParser.json({ limit: '5mb' }));
app.use((req, res, next) => {
  if (req.path === '/change-password') {
    const clone = { ...req.body };
    ['password', 'currentPassword', 'newPassword'].forEach(key => {
      if (clone[key]) clone[key] = '[REDACTED]';
    });
    console.log('Processing password change request:', clone);
  } else {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});


// Custom request logging middleware
app.use((req, res, next) => {
  if (req.path === '/change-password') {
    console.log('Processing password change request');
  } else {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});

app.use((req, res, next) => {
  if (req.path !== '/upload-avatar') {
    bodyParser.urlencoded({ extended: true, limit: '5mb' })(req, res, next);
  } else {
    next();
  }
});


// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

// Override console.log to filter out sensitive data
const originalConsoleLog = console.log;
console.log = function() {
  const args = Array.from(arguments);
  // Check if any argument contains sensitive data
  const sanitizedArgs = args.map(arg => {
    if (typeof arg === 'string') {
      // Remove any password-related information from strings
      return arg.replace(/(['"]?(?:password|currentPassword|newPassword|hashed_password)['"]?\s*[:=]\s*['"])[^'"]+(['"])/gi, '$1[REDACTED]$2');
    }
    if (typeof arg === 'object' && arg !== null) {
      // Deep clone the object to avoid modifying the original
      const clone = JSON.parse(JSON.stringify(arg));
      // Remove sensitive fields
      ['password', 'currentPassword', 'newPassword', 'hashed_password'].forEach(field => {
        if (clone[field]) clone[field] = '[REDACTED]';
        if (clone.body && clone.body[field]) clone.body[field] = '[REDACTED]';
      });
      return clone;
    }
    return arg;
  });
  originalConsoleLog.apply(console, sanitizedArgs);
};



// Minimal request logging middleware
app.use((req, res, next) => {
  if (req.path === '/change-password') {
    console.log('Processing password change request');
  } else {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});



// Apply JSON parser only for non-file upload routes
app.use((req, res, next) => {
  if (req.path === '/upload-avatar') {
    return next();
  }
  express.json()(req, res, next);
});

// Apply URL-encoded parser only for non-file upload routes
app.use((req, res, next) => {
  if (req.path === '/upload-avatar') {
    return next();
  }
  bodyParser.urlencoded({limit: '5mb', extended: true})(req, res, next);
});


// Handle profile image upload
app.post('/upload-avatar', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const userId = req.body.userId;

    if (!file || !userId) {
      return res.status(400).json({ error: 'Missing file or userId' });
    }

    const filename = `avatars/user_${userId}_${Date.now()}.jpg`;

    // Upload til Firebase Storage bucket
    const fileUpload = bucket.file(filename);

    await fileUpload.save(file.buffer, {
      metadata: { contentType: file.mimetype },
      public: false,
    });

    // Lav signed URL til billedet
    const [signedUrl] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 time
    });

    // Opdater Firestore med filsti og signed URL
    await db.collection('users').doc(userId).update({
      profile_image: filename,
      profile_image_url: signedUrl,
    });

    // Returner info til klient
    res.status(200).json({ path: filename, signedUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed' });
  }
});


// Log request sizes
app.use((req, res, next) => {
  const contentLength = req.headers['content-length'];
  if (contentLength) {
    console.log(`Request size: ${(parseInt(contentLength) / 1024 / 1024).toFixed(2)}MB`);
  }
  next();
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});


// Helper function to get Supabase URL
function getSupabaseImageUrl(filename) {
  return `${process.env.SUPABASE_STORAGE_URL}/${filename}`;
}

// Endpoint to get image URL
app.post('/user/:id/avatar-url', async (req, res) => {
  const { path } = req.body;

  if (!path) {
    return res.status(400).json({ error: 'Missing image path' });
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase
    .storage
    .from('profile-images')
    .createSignedUrl(path, 60 * 60);

  if (signedUrlError) {
    console.error('Error creating signed URL:', signedUrlError);
    return res.status(500).json({ error: 'Failed to generate signed URL' });
  }

  console.log('Fetched signed URL:', signedUrlData.signedUrl); 

  res.status(200).json({ signedUrl: signedUrlData.signedUrl });
});

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

// Ensure uploads directory exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}




// Change password endpoint
app.post('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Hent bruger fra Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('hashed_password')
      .eq('id', userId)
      .single();

    if (userError || !user || !user.hashed_password) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Tjek adgangskode
    const isValidPassword = await bcrypt.compare(currentPassword, user.hashed_password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Tjek om ny adgangskode er den samme som den gamle
    const isSamePassword = await bcrypt.compare(newPassword, user.hashed_password);
    if (isSamePassword) {
      return res.status(400).json({ error: 'Den nye adgangskode må ikke være den samme som den nuværende' });
    }

    // Hash ny adgangskode
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Opdater i Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update({ hashed_password: hashedPassword })
      .eq('id', userId);

      console.log('Updating user with ID:', userId);
      console.log('New hashed password:', hashedPassword);
      
      if (updateError) {
        console.error('Fejl ved opdatering:', updateError);
        return res.status(500).json({ error: 'Failed to update password' });
      }
      

    res.json({ success: true });
  } catch (error) {
    console.error('Error in change-password route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email }); // Undgå at logge password

  if (!email || !password) {
    return res.status(400).json({ error: 'Email og adgangskode er påkrævet' });
  }

  try {
    // 1. Find bruger i Firebase Authentication via email
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error) {
      // Bruger ikke fundet
      if (error.code === 'auth/user-not-found') {
        return res.status(401).json({ error: 'Forkert email eller adgangskode' });
      }
      throw error;
    }

    const uid = userRecord.uid;

    // 2. Hent brugerdata fra Firestore
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(401).json({ error: 'Forkert email eller adgangskode' });
    }

    const userData = userDoc.data();

    // 3. Tjek adgangskode mod hashed_password i Firestore (hvis du gemmer hashed password der)
    const isPasswordValid = await bcrypt.compare(password, userData.hashed_password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Forkert email eller adgangskode' });
    }

    // 4. Formater evt. fødselsdato
    const formattedBirthday = userData.birthday ? userData.birthday.split('T')[0] : null;

    // 5. Return relevant brugerdata
    res.json({
      id: uid,
      name: userData.name,
      email: userData.email,
      relationToDementiaPerson: userData.relation_to_dementia_person,
      profile_image: userData.profile_image || null,
      birthday: formattedBirthday,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Der opstod en fejl under login' });
  }
});


// Get a specific log
app.get('/logs/:id', async (req, res) => {
  const logId = req.params.id;
  const { user_id } = req.query;

  if (!user_id) return res.status(400).json({ error: 'User ID is required' });

  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .eq('id', logId)
    .eq('user_id', user_id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Error fetching log', message: error.message });
  if (!data) return res.status(404).json({ error: 'Log not found' });

  res.json(data);
});

// Update a log
app.put('/logs/:id', async (req, res) => {
  const logId = req.params.id;
  const { title, description, date, appointment_id, user_id } = req.body;

  if (!user_id) return res.status(400).json({ error: 'User ID is required' });

  const { data, error } = await supabase
    .from('logs')
    .update({
      title,
      description,
      date,
      appointment_id,
      updated_at: new Date().toISOString()
    })
    .eq('id', logId)
    .eq('user_id', user_id)
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Error updating log', message: error.message });
  if (!data) return res.status(404).json({ error: 'Log not found' });

  res.json(data);
});


// Generate a unique family link
app.post('/family-link/generate', async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) return res.status(400).json({ error: 'User ID is required' });

  // Generate a random 10-character code
  const uniqueCode = Math.random().toString(36).substring(2, 12).toUpperCase();

  const { error } = await supabase
    .from('family_links')
    .insert({ creator_user_id: user_id, unique_code: uniqueCode });

  if (error) return res.status(500).json({ error: 'Error generating family link', message: error.message });

  res.json({
    code: uniqueCode,
    shareLink: `aldra://register?familyCode=${uniqueCode}`
  });
});


// Validate and use a family code
app.get('/family-link/:uid', async (req, res) => {
  const uid = req.params.uid;

  if (!uid) return res.status(400).json({ error: 'UID is required' });

  try {
    const { data, error } = await supabase
      .from('family_links')
      .select('unique_code')
      .eq('creator_user_id', uid)
      .eq('status', 'active')
      .maybeSingle();

    if (error) return res.status(500).json({ error: 'Error fetching family link', message: error.message });
    if (!data) return res.status(404).json({ error: 'No active family link found for this user' });

    res.json({ unique_code: data.unique_code });
  } catch (err) {
    console.error('Error in GET /family-link/:uid', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});


// Get family members
app.get('/users/family/:userId', async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from('users')
    .select('id, name, relation_to_dementia_person')
    .eq('family_id', userId);

  if (error) return res.status(500).json({ error: 'Error fetching family members', message: error.message });

  res.json(data);
});




// Root endpoint for health check
// Update family link status
app.put('/family-link/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be either "active" or "inactive"' });
  }

  const { data, error } = await supabase
    .from('family_links')
    .update({ status })
    .eq('id', id)
    .select('id, unique_code, status, member_count, last_used_at')
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Internal server error', message: error.message });
  if (!data) return res.status(404).json({ error: 'Family link not found' });

  res.json(data);
});



// Register
app.post('/register', async (req, res) => {
  const { name, email, password, relationToDementiaPerson, termsAccepted, familyCode } = req.body;
  console.log('=== START REGISTRATION ===');
  // Masking sensitive data før log evt.
  console.log('Registration attempt:', { name, email, relationToDementiaPerson, termsAccepted, familyCode });
  console.log('=== END REGISTRATION ===');

  if (!name || !email || !password || !relationToDementiaPerson || termsAccepted === undefined) {
    return res.status(400).json({ error: 'Alle felter er påkrævede' });
  }

  try {
    // 1. Tjek om bruger med email allerede findes i Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      if (userRecord) {
        return res.status(409).json({ error: 'Bruger eksisterer allerede' });
      }
    } catch (error) {
      // Hvis fejlen er "user-not-found" kan vi oprette bruger
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // 2. Opret bruger i Firebase Authentication
    const createdUser = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    const uid = createdUser.uid;

    // 3. Håndter family_links i Firestore
    let familyId = null;

    if (familyCode) {
      const familyQuery = await db.collection('family_links')
        .where('unique_code', '==', familyCode)
        .limit(1)
        .get();

      if (familyQuery.empty) {
        return res.status(400).json({ error: 'Ugyldigt Aldra-link' });
      }

      familyId = familyQuery.docs[0].id;
    } else {
      // Opret nyt family_links dokument med unikt kode
      const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const newFamilyRef = db.collection('family_links').doc();
      await newFamilyRef.set({
        unique_code: uniqueCode,
        member_count: 1,
        status: 'active',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      familyId = newFamilyRef.id;
    }

    // 4. Hash password (valgfrit, da Firebase Auth håndterer adgangskoder)
    // Hvis du ikke bruger hashed_password i Firestore, kan du droppe dette.
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Gem brugerprofil i Firestore under 'users' collection med dokument-id = uid
    await db.collection('users').doc(uid).set({
      name,
      email,
      hashed_password: hashedPassword,
      relation_to_dementia_person: relationToDementiaPerson,
      termsAccepted,
      family_id: familyId,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 6. Return svar med brugerdata
    res.status(201).json({
      id: uid,
      name,
      email,
      relationToDementiaPerson,
      familyId,
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Fejl under registrering', message: error.message });
  }
});



// Get all dates with appointments
app.get('/appointments/dates/all', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) return res.status(400).json({ error: 'User ID is required' });

  const { data, error } = await supabase
    .from('appointments')
    .select('date')
    .eq('user_id', user_id)
    .order('date', { ascending: true });

  if (error) return res.status(500).json({ error: 'Error fetching dates', message: error.message });

  // Brug Set til at fjerne dubletter, hvis Supabase returnerer flere med samme dato
  const uniqueDates = [...new Set(data.map(row => row.date))];
  res.json(uniqueDates);
});



// Get logs for a specific user
app.get('/logs/user/:user_id', async (req, res) => {
  const { user_id } = req.params;

  const { data, error } = await supabase
    .from('logs')
    .select('id, appointment_id')
    .eq('user_id', user_id);

  if (error) return res.status(500).json({ error: 'Error fetching logs for user', message: error.message });

  res.json(data);
});



// Get logs for a specific appointment
app.get('/logs/:appointment_id', async (req, res) => {
  const { appointment_id } = req.params;
  const { user_id } = req.query;

  if (!user_id) return res.status(400).json({ error: 'User ID is required' });

  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .eq('appointment_id', appointment_id)
    .eq('user_id', user_id)
    .order('date', { ascending: false });

  if (error) return res.status(500).json({ error: 'Error fetching logs', message: error.message });

  res.json(data);
});


// Create new log
app.post('/logs', async (req, res) => {
  const { appointment_id, user_id, title, description, date } = req.body;

  if (!user_id || !title || !date) {
    return res.status(400).json({ error: 'Missing required fields: user_id, title, and date are required' });
  }

  // Tjek ejer af appointment, hvis en appointment_id er angivet
  if (appointment_id) {
    const { data: appointmentCheck, error: checkError } = await supabase
      .from('appointments')
      .select('id')
      .eq('appointment_id', appointment_id)
      .eq('user_id', user_id)
      .maybeSingle();

    if (checkError) return res.status(500).json({ error: 'Error validating appointment', message: checkError.message });

    if (!appointmentCheck) {
      return res.status(403).json({ error: 'Unauthorized: This appointment does not belong to the user' });
    }
  }

  const { data, error } = await supabase
    .from('logs')
    .insert([{
      appointment_id,
      user_id,
      title,
      description,
      date
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Error creating log', message: error.message });

  res.status(201).json(data);
});


// Get ALL appointments for a user (Oversigt.tsx)
app.get('/appointments/all', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id || isNaN(Number(user_id))) {
    return res.status(400).json({ error: 'User ID is invalid or missing' });
  }

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', user_id)
    .gte('date', today)
    .not('start_time', 'is', null)
    .not('end_time', 'is', null)
    .order('date', { ascending: true });

  if (error) return res.status(500).json({ error: 'Error fetching appointments', message: error.message });

  res.json(data);
});


// Get appointments for a specific date
app.get('/appointments/:date', async (req, res) => {
  const { date } = req.params;
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('date', date)
    .eq('user_id', user_id)
    .order('start_time', { ascending: true });

  if (error) return res.status(500).json({ error: 'Error fetching appointments', message: error.message });

  res.json(data);
});


// Create new appointment
app.post('/appointments', async (req, res) => {
  const { title, description, date, start_time, end_time, reminder, user_id } = req.body;

  const { data, error } = await supabase
    .from('appointments')
    .insert([{
      title,
      description,
      date,
      start_time,
      end_time,
      reminder,
      user_id
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Error creating appointment', message: error.message });

  res.status(201).json(data);
});


// PUT update appointment
app.put('/appointments/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, date, start_time, end_time, reminder } = req.body;

  const { data, error } = await supabase
    .from('appointments')
    .update({
      title,
      description,
      date,
      start_time,
      end_time,
      reminder,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Error updating appointment', message: error.message });
  if (!data) return res.status(404).json({ error: 'Appointment not found' });

  res.json(data);
});


// Delete an appointment
app.delete('/appointments/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Slet logs først
    const { error: logError } = await supabase
      .from('logs')
      .delete()
      .eq('appointment_id', id);

    if (logError) throw logError;

    // Slet selve aftalen
    const { data, error: deleteError } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (deleteError) throw deleteError;
    if (!data) return res.status(404).json({ error: 'Appointment not found' });

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});


// Endpoint to update user's last activity
// Get latest logs for a user
// Update user data
app.put('/users/:userId', async (req, res) => {
  const { userId } = req.params;
  const { name, email, password, birthday, profile_image, relationToDementiaPerson } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (password) updateData.hashed_password = await bcrypt.hash(password, 10);
  if (birthday) updateData.birthday = birthday;
  if (profile_image !== undefined) updateData.profile_image = profile_image;
  if (relationToDementiaPerson) updateData.relation_to_dementia_person = relationToDementiaPerson;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select('id, name, email, birthday, profile_image, relation_to_dementia_person')
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Error updating user data', details: error.message });
  if (!data) return res.status(404).json({ error: 'User not found' });

  res.json(data);
});

app.get('/user-logs/:userId', async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) return res.status(500).json({ error: 'Error fetching user logs', message: error.message });

  res.json(data);
});

app.post('/api/update-activity', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const { error } = await supabase
    .from('users')
    .update({
      last_activity: new Date().toISOString(),
      status: 'active'
    })
    .eq('id', userId);

  if (error) return res.status(500).json({ error: 'Internal server error', message: error.message });

  res.json({ success: true });
});

// Get or create unique family link code
app.get('/api/family-link/:userId', async (req, res) => {
  const { userId } = req.params;

  const { data: existingLink, error: findError } = await supabase
    .from('family_links')
    .select('unique_code')
    .eq('creator_user_id', userId)
    .maybeSingle();

  if (findError) return res.status(500).json({ error: 'Internal server error', message: findError.message });

  if (existingLink) {
    return res.status(200).json({ unique_code: existingLink.unique_code });
  }

  const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data, error } = await supabase
    .from('family_links')
    .insert({
      creator_user_id: userId,
      unique_code: uniqueCode,
      member_count: 1,
      status: 'active'
    })
    .select('unique_code')
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Internal server error', message: error.message });

  res.status(200).json({ unique_code: data.unique_code });
});

// Get all logs with appointment info
app.get('/admin/logs-view', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('logs')
      .select(`
        *,
        appointments (
          title,
          description,
          start_time,
          end_time
        )
      `)
      .order('date', { ascending: false });

    if (error) throw error;

    const logsWithReferences = data.map(log => ({
      ...log,
      appointment_title: log.appointments?.title ?? null,
      appointment_description: log.appointments?.description ?? null,
      appointment_start_time: log.appointments?.start_time ?? null,
      appointment_end_time: log.appointments?.end_time ?? null,
      appointment_reference: log.appointment_id
        ? `Aftale #${log.appointment_id}: ${log.appointments?.title ?? 'Ukendt'}`
        : 'Ingen aftale',
    }));

    console.log('Logs with appointments:', logsWithReferences);
    res.json(logsWithReferences);
  } catch (err) {
    console.error('Error fetching logs with appointments:', err);
    res.status(500).json({ error: 'Error fetching logs with appointments' });
  }
});


// Get all logs
app.get('/logs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    console.log('Sending logs:', data);
    res.json(data);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ error: 'Error fetching logs' });
  }
});


// Health check
app.get('/test', (req, res) => {
  res.send('✅ Backend kører');
});


// Email change request endpoint
app.post('/request-email-change', async (req, res) => {
  try {
    const { userId, newEmail } = req.body;

    // 1. Tjek om email allerede er i brug
    const existingUsers = await db.collection('users')
      .where('email', '==', newEmail)
      .get();

    if (!existingUsers.empty) {
      return res.status(400).json({ error: 'Denne e-mailadresse er allerede i brug' });
    }

    // 2. Generér 6-cifret kode og hash den
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(confirmationCode, 10);

    // 3. Hent tidligere uverificerede anmodninger
    const existingRequests = await db.collection('email_change_requests')
      .where('userId', '==', userId)
      .where('verifiedAt', '==', null)
      .orderBy('sentAt', 'desc')
      .limit(1)
      .get();

    // 4. RATE LIMIT – afvis hvis sidste anmodning var < 60 sekunder siden
    if (!existingRequests.empty) {
      const lastRequest = existingRequests.docs[0].data();
      const requestAge = Date.now() - new Date(lastRequest.sentAt).getTime();
      if (requestAge < 60 * 1000) {
        return res.status(429).json({ error: 'Vent et øjeblik før du prøver igen' });
      }
    }

    // 5. Slet gamle uverificerede anmodninger
    for (const doc of existingRequests.docs) {
      await doc.ref.delete();
    }

    // 6. Gem ny e-mailændringsanmodning
    await db.collection('email_change_requests').add({
      userId,
      newEmail,
      confirmationCode: hashedCode,
      sentAt: new Date().toISOString(),
      verifiedAt: null
    });

    // 7. Send e-mail via Resend
    await resend.emails.send({
      from: 'Aldra App <noreply@aldra.dk>',
      to: newEmail,
      subject: 'Bekræft din nye e-mailadresse',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Bekræft din nye e-mailadresse</h2>
          <p>Du har anmodet om at ændre din e-mailadresse i Aldra App.</p>
          <p>Din bekræftelseskode er: <strong style="font-size: 24px; color: #42865F;">${confirmationCode}</strong></p>
          <p>Koden udløber om 10 minutter.</p>
          <p>Hvis du ikke har anmodet om denne ændring, kan du ignorere denne e-mail.</p>
        </div>
      `
    });

    // 8. Send svar
    res.json({ success: true });

  } catch (error) {
    console.error('Error requesting email change:', error);
    res.status(500).json({ error: 'Der opstod en fejl' });
  }
});

// Confirm email change endpoint
app.post('/confirm-email-change', async (req, res) => {
  try {
    const { userId, code } = req.body;

    // 1. Find seneste uverificerede anmodning
    const requestSnapshot = await db.collection('email_change_requests')
      .where('userId', '==', userId)
      .where('verifiedAt', '==', null)
      .orderBy('sentAt', 'desc')
      .limit(1)
      .get();

    if (requestSnapshot.empty) {
      return res.status(400).json({ error: 'Ingen aktiv anmodning fundet' });
    }

    const requestDoc = requestSnapshot.docs[0];
    const request = requestDoc.data();
    const requestId = requestDoc.id;

    // 2. Tjek om koden er udløbet (efter 10 minutter)
    const requestAge = Date.now() - new Date(request.sentAt).getTime();
    if (requestAge > 10 * 60 * 1000) {
      return res.status(400).json({ error: 'Bekræftelseskoden er udløbet' });
    }

    // 3. Sammenlign koden
    const isValidCode = await bcrypt.compare(code, request.confirmationCode);
    if (!isValidCode) {
      return res.status(400).json({ error: 'Ugyldig bekræftelseskode' });
    }

    const newEmail = request.newEmail;

    // 4. Opdater Firebase Authentication
    await auth.updateUser(userId, { email: newEmail });

    // 5. Opdater e-mail i Firestore (users)
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      await userRef.update({ email: newEmail });
    }

    // 6. Markér anmodningen som verificeret
    await requestDoc.ref.update({
      verifiedAt: new Date().toISOString()
    });

    // 7. Ryd op – slet ældre uverificerede anmodninger
    const oldRequests = await db.collection('email_change_requests')
      .where('userId', '==', userId)
      .where('verifiedAt', '==', null)
      .get();

    for (const doc of oldRequests.docs) {
      if (doc.id !== requestId) {
        await doc.ref.delete();
      }
    }

    // 8. Send OK-svar
    res.json({ success: true, email: newEmail });

  } catch (error) {
    console.error('Error confirming email change:', error);
    res.status(500).json({ error: 'Der opstod en fejl under bekræftelse af e-mail' });
  }
});


// Middleware til Firebase Auth validering
const authenticateFirebase = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Ingen autorisation header' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);

    if (decodedToken.uid !== req.params.id) {
      return res.status(403).json({ error: 'Ikke tilladt' });
    }

    req.user = { uid: decodedToken.uid };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Ugyldig eller udløbet token' });
  }
};

app.delete('/user/:id/delete-account', authenticateFirebase, async (req, res) => {
  try {
    const userId = req.params.id;
    const batch = db.batch();

    // Slet brugerprofil
    batch.delete(db.collection('users').doc(userId));

    // Slet alle brugerrelaterede dokumenter - fx appointments, logs, notifications
    const collectionsToDelete = ['appointments', 'logs', 'notifications', 'push_tokens', 'family_links', 'email_change_requests'];

    for (const collectionName of collectionsToDelete) {
      const snapshot = await db.collection(collectionName).where('user_id', '==', userId).get();
      snapshot.forEach(doc => batch.delete(doc.ref));
    }

    await batch.commit();

    // Slet Firebase Authentication brugeren
    await auth.deleteUser(userId);

    res.json({ success: true, message: 'Konto slettet' });
  } catch (error) {
    console.error('Fejl ved sletning af konto:', error);
    res.status(500).json({ error: 'Der opstod en fejl ved sletning af kontoen' });
  }
});


// Feedback endpoint
app.post('/submit-feedback', async (req, res) => {
  try {
    const { user_id, rating, comment } = req.body;

    if (!user_id || !rating || !comment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating' });
    }

    const docRef = db.collection('feedback').doc();
    await docRef.set({
      user_id,
      rating,
      comment,
      created_at: new Date().toISOString(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error in submit-feedback route:', error);
    res.status(500).json({ error: 'Der opstod en fejl ved indsendelse af feedback' });
  }
});

// Personalization endpoint
app.post('/save-answers', async (req, res) => {
  const { user_id, answers } = req.body;

  const { data, error } = await supabase
    .from('personalization')
    .insert([{ user_id, ...answers }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ data });
});


// Guide matching endpoint
app.post('/match-guides', async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

  try {
    console.log('🔐 Modtaget user_id:', user_id);

    // 1. Hent brugerens svar fra Supabase
    const { data: answers, error } = await supabase
      .from('user_profile_answers')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (error || !answers) {
      console.error('❌ Brugerens svar ikke fundet eller fejl:', error);
      return res.status(404).json({ error: 'User answers not found' });
    }

    console.log('📋 Brugerens svar:', JSON.stringify(answers, null, 2));

    // 2. Byg base query til Strapi
    const baseUrl = `${process.env.STRAPI_URL.replace(/\/api$/, '')}/api/guides`;
    const filters = [
      `filters[relation][$eq]=${encodeURIComponent(answers.relation_to_person)}`,
      `filters[visible][$eq]=true`,
      `populate[tags][fields][0]=name`,
      `populate[help_tags][fields][0]=name`,
      `populate=image`,
      `populate=category`
    ];

    const url = `${baseUrl}?${filters.join('&')}`;
    console.log('🔍 Bygget Strapi Query URL:', url);

    // 3. Fetch alle guides fra Strapi
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Strapi fetch fejl:', JSON.stringify(result, null, 2));
      return res.status(response.status).json({ error: result?.error?.message || 'Failed fetching guides from Strapi' });
    }

    const { data } = result;
    console.log('📦 Raw Strapi data:', JSON.stringify(data, null, 2));

    // 4. Brug main_challenges eller help_needs som aktive tags
    const activeTags = answers.main_challenges?.length > 0
      ? answers.main_challenges
      : answers.help_needs;

    if (!activeTags || activeTags.length === 0) {
      console.log('ℹ️ Ingen aktive tags fundet, returnerer alle guides');
    }

    // 5. Filtrér guides baseret på tags i JS
    const matchesTag = (guide, tag) =>
      guide.tags?.some(t => t.name?.toLowerCase().includes(tag.toLowerCase())) ||
      guide.help_tags?.some(t => t.name?.toLowerCase().includes(tag.toLowerCase()));

    const filteredGuides = (data || []).filter(guide =>
      activeTags.some(tag => matchesTag(guide, tag))
    );

    console.log('✅ Antal matchende guides:', filteredGuides.length);
    if (filteredGuides.length > 0) {
      console.log('👀 Første matched guide:', JSON.stringify(filteredGuides[0], null, 2));
    }

    // 6. Transformér data
    const guides = filteredGuides.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content || '',
      category: item.category,
      image: item.image?.url || 'https://via.placeholder.com/280x180.png?text=Aldra',
      tags: item.tags || [],
      help_tags: item.help_tags || [],
      relation: item.relation,
      visible: item.visible ?? true,
    }));

    return res.json({ guides });

  } catch (err) {
    console.error('❌ /match-guides catch-fejl:', err.message, err.stack);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});



// Start server
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
