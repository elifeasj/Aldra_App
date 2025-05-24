var admin = require('firebase-admin');
var path = require('path');
var fs = require('fs');
var serviceAccount;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        var raw = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
        console.log('Decoded Firebase service account JSON:', raw);
        try {
            serviceAccount = JSON.parse(raw);
        }
        catch (e) {
            console.error('Parsing error:', e);
            throw e;
        }
    }
}
catch (error) {
    console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64, falling back to local file:', error.message);
    var serviceAccountPath = path.resolve(__dirname, './aldraapp-firebase-adminsdk-fbsvc-00dc6aadb0.json');
    if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = require(serviceAccountPath);
    }
    else {
        throw new Error('Firebase Service Account file not found and env var missing');
    }
}
if (serviceAccount.private_key) {
    serviceAccount.privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');
    delete serviceAccount.private_key;
}
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'aldraapp.firebasestorage.app'
});
var auth = admin.auth();
var db = admin.firestore();
var bucket = admin.storage().bucket();
module.exports = { auth: auth, db: db, bucket: bucket };
