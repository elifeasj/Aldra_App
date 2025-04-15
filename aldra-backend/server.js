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

const app = express();


console.log('🔐 Resend API key loaded:', process.env.RESEND_API_KEY ? '✅' : '❌');

const resend = new Resend(process.env.RESEND_API_KEY);


// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

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
    const userId = req.body.userId;
    const file = req.file;

    if (!file || !userId) {
      return res.status(400).json({ error: 'Missing file or userId' });
    }

    const fileName = `avatars/user_${userId}_${Date.now()}.jpg`; 
    console.log('Uploading to bucket: profile-images');
    console.log('File name:', fileName);    

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    // Gem kun stien i databasen – ikke URL
    await supabase
      .from('users')
      .update({ profile_image: fileName })
      .eq('id', userId);

    // Få signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('profile-images')
      .createSignedUrl(fileName, 60 * 60); // 1 time

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError);
      return res.status(500).json({ error: 'Could not create signed URL' });
    }

    // ✅ Success
    res.status(200).json({ success: true, path: fileName, imageUrl: signedUrlData.signedUrl });

  } catch (error) {
    console.error('Error in upload-avatar route:', error);
    res.status(500).json({ error: 'Internal server error' });
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
  const maskedData = maskSensitiveData({ email, password });
  console.log('Login attempt:', maskedData);

  if (!email || !password) {
      return res.status(400).json({ error: 'Email og adgangskode er påkrævet' });
  }

  try {
      const { data: user, error: fetchError } = await supabase
          .from('users')
          .select('id, name, email, relation_to_dementia_person, profile_image, birthday, hashed_password')
          .eq('email', email)
          .maybeSingle();

      console.log('Database query result:', user);

      if (fetchError) throw fetchError;

      if (!user) {
          return res.status(401).json({ error: 'Forkert email eller adgangskode' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.hashed_password);

      if (!isPasswordValid) {
          return res.status(401).json({ error: 'Forkert email eller adgangskode' });
      }

      const formattedBirthday = user.birthday ? user.birthday.split('T')[0] : null;

      console.log('User data being sent:', {
          id: user.id,
          name: user.name,
          email: user.email,
          relationToDementiaPerson: user.relation_to_dementia_person,
          profile_image: user.profile_image,
          birthday: formattedBirthday,
      });

      res.json({
          id: user.id,
          name: user.name,
          email: user.email,
          relationToDementiaPerson: user.relation_to_dementia_person,
          profile_image: user.profile_image,
          birthday: formattedBirthday
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
app.get('/family-link/validate/:code', async (req, res) => {
  const { code } = req.params;

  const { data, error } = await supabase
    .from('family_links')
    .update({
      last_used_at: new Date().toISOString(),
      member_count: supabase.rpc('increment_member_count', { code }) // eller gør det manuelt
    })
    .eq('unique_code', code)
    .eq('status', 'active')
    .select('id, creator_user_id, member_count')
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Error validating family code', message: error.message });
  if (!data) return res.status(404).json({ error: 'Invalid or inactive family link' });

  res.json({ creator_user_id: data.creator_user_id });
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
      const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingUser) {
          console.error('User already exists:', email);
          return res.status(409).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{
              name,
              email,
              hashed_password: hashedPassword,
              relation_to_dementia_person: relationToDementiaPerson,
              termsAccepted
          }])
          .select('id, name, email, relation_to_dementia_person, family_id')
          .single();

      if (insertError) throw insertError;

      console.log('User registered successfully:', newUser);

      res.status(201).json({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          relationToDementiaPerson: newUser.relation_to_dementia_person,
          familyId: newUser.family_id
      });

  } catch (error) {
      console.error('Detailed error registering user:', error);

      if (error.code === '23505') {
          res.status(409).json({ error: 'Email already registered' });
      } else {
          res.status(500).json({ error: 'Error registering user', message: error.message });
      }
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
    
    // Check if email is already in use
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', newEmail)
      .single();

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Denne e-mailadresse er allerede i brug' 
      });
    }

    // Generate 6-digit code
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(confirmationCode, 10);

    // Delete any existing unverified requests for this user
    await supabase
      .from('email_change_requests')
      .delete()
      .eq('user_id', userId)
      .is('verified_at', null);

    // Create new request
    const { error: insertError } = await supabase
      .from('email_change_requests')
      .insert([{
        user_id: userId,
        new_email: newEmail,
        confirmation_code: hashedCode,
      }]);

    if (insertError) throw insertError;

    // Send email
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

    // Get the latest unverified request
    const { data: request, error: requestError } = await supabase
      .from('email_change_requests')
      .select('*')
      .eq('user_id', userId)
      .is('verified_at', null)
      .order('sent_at', { ascending: false })
      .limit(1)
      .single();

    if (requestError || !request) {
      return res.status(400).json({ 
        error: 'Ingen aktiv anmodning fundet' 
      });
    }

    // Check if request is expired (10 minutes)
    const requestAge = Date.now() - new Date(request.sent_at).getTime();
    if (requestAge > 10 * 60 * 1000) {
      return res.status(400).json({ 
        error: 'Bekræftelseskoden er udløbet' 
      });
    }

    // Verify code
    const isValidCode = await bcrypt.compare(code, request.confirmation_code);
    if (!isValidCode) {
      return res.status(400).json({ 
        error: 'Ugyldig bekræftelseskode' 
      });
    }

    // Update user's email
    const { error: updateError } = await supabase
      .from('users')
      .update({ email: request.new_email })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Mark request as verified
    await supabase
      .from('email_change_requests')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', request.id);

      // Cleanup old requests
      const { error: cleanupError } = await supabase.rpc('cleanup_expired_email_requests');
      if (cleanupError) {
        console.warn('⚠️ Cleanup RPC fejlede:', cleanupError);
      }

    res.json({ 
      success: true,
      email: request.new_email 
    });
  } catch (error) {
    console.error('Error confirming email change:', error);
    res.status(500).json({ error: 'Der opstod en fejl' });
  }
});

// Delete account endpoint
app.delete('/user/:id/delete-account', async (req, res) => {
  try {
    const { id } = req.params;

    // Slet ALT afhængigt data manuelt først
    await Promise.all([
      supabase.from('appointments').delete().eq('user_id', id),
      supabase.from('logs').delete().eq('user_id', id),
      supabase.from('notifications').delete().eq('user_id', id),
      supabase.from('push_tokens').delete().eq('user_id', id),
      supabase.from('family_links').delete().eq('creator_user_id', id),
      supabase.from('email_change_requests').delete().eq('user_id', id)
    ]);

    // Slet brugeren til sidst
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return res.status(500).json({ error: 'Kunne ikke slette kontoen' });
    }

    res.json({ success: true, message: 'Konto slettet' });

  } catch (error) {
    console.error('Error in delete-account route:', error);
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

    const { error: insertError } = await supabase
      .from('feedback')
      .insert([{
        user_id,
        rating,
        comment
      }]);

    if (insertError) {
      console.error('Error inserting feedback:', insertError);
      throw insertError;
    }

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
    // 1. Hent brugerens svar
    const { data: answers, error } = await supabase
      .from('user_profile_answers')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (error || !answers) {
      return res.status(404).json({ error: 'User answers not found' });
    }

    // 2. Byg query
    const baseUrl = `${process.env.STRAPI_URL.replace(/\/api$/, '')}/api/guides`;
    const filters = [
      `filters[relation][$eq]=${encodeURIComponent(answers.relation_to_person)}`,
      `filters[visible][$eq]=true`,
      `populate=*`
    ];

    // 3. Tilføj tags (OR-logik)
    const activeTags = answers.main_challenges?.length > 0 
      ? answers.main_challenges
      : answers.help_needs;

    if (activeTags?.length) {
      filters.push(`filters[tags][$containsi][0]=${encodeURIComponent(activeTags[0])}`);
      if (activeTags.length > 1) {
        filters.push(`filters[tags][$containsi][1]=${encodeURIComponent(activeTags[1])}`);
      }
    }

    const url = `${baseUrl}?${filters.join('&')}`;
    console.log('🔍 Strapi Query:', url);

    // 4. Hent data
    const response = await fetch(url);
    const { data } = await response.json();
    console.log('Raw Strapi data:', JSON.stringify(data, null, 2)); // Debug

    // 5. Transformér data
    const guides = data?.map(item => ({
      id: item.id,
      title: item.attributes?.title || 'Uden titel',
      content: item.attributes?.content || '',
      category: item.attributes?.category || 'Ukategoriseret',
      image: item.attributes?.image?.data?.attributes?.url 
        ? `${process.env.STRAPI_URL}${item.attributes.image.data.attributes.url}`
        : 'https://aldra-cms.up.railway.app/uploads/image2.png',
      help_tags: item.attributes?.help_tags || [],
      relation: item.attributes?.relation || ''
    })) || [];

    return res.json({ guides });
    
  } catch (err) {
    console.error('❌ /match-guides error:', err.message);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});

