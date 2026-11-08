const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const port = Number(process.env.PORT) || 3000;
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
const dbName = process.env.DB_NAME || 'RegistrationDB';
const siteRoot = path.resolve(__dirname, '..'); // index.html, style.css, ... live here

let usersCollection = null;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Tell the frontend to talk to this server (overrides the static demo-mode config.js)
app.get('/config.js', (req, res) => {
    res.type('application/javascript').send('window.APP_CONFIG = { apiUrl: "/api/register" };');
});

// Serve the frontend; only expose the public files, never server code or package files
const publicFiles = ['index.html', 'style.css', 'script.js', '404.html'];
publicFiles.forEach(file => {
    app.get(file === 'index.html' ? ['/', '/index.html'] : '/' + file,
        (req, res) => res.sendFile(path.join(siteRoot, file)));
});

function cleanUser(body) {
    const field = key => String((body && body[key]) ?? '').trim();
    return {
        name: field('name'),
        email: field('email'),
        phone: field('phone'),
        gender: field('gender'),
        dob: field('dob'),
        course: field('course'),
        address: field('address')
    };
}

function validate(u) {
    if (!u.name || !u.email || !u.phone || !u.gender || !u.dob || !u.course || !u.address) {
        return 'All fields are mandatory.';
    }
    if (!/^[A-Za-z ]{3,}$/.test(u.name)) return 'Name must be letters and spaces only (min 3).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email)) return 'Enter a valid email address.';
    if (!/^\d{10}$/.test(u.phone)) return 'Phone number must be exactly 10 digits.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(u.dob) || Number.isNaN(Date.parse(u.dob))) {
        return 'Enter a valid date of birth.';
    }
    if (u.address.length < 5) return 'Address is too short.';
    return null;
}

async function listUsers() {
    return usersCollection
        .find({}, { projection: { _id: 0 } })
        .sort({ registeredAt: -1 })
        .toArray();
}

function requireDb(req, res, next) {
    if (!usersCollection) {
        return res.status(503).json({
            error: 'Database is not connected. Check MONGO_URL and try again.'
        });
    }
    next();
}

app.get('/api/register', requireDb, async (req, res) => {
    try {
        res.json({ users: await listUsers() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Unable to load users.' });
    }
});

app.post('/api/register', requireDb, async (req, res) => {
    const user = cleanUser(req.body);
    const problem = validate(user);
    if (problem) return res.status(400).json({ error: problem });

    try {
        await usersCollection.insertOne({ ...user, registeredAt: new Date() });
        res.status(201).json({ users: await listUsers() });
    } catch (err) {
        console.error('Insert failed:', err.message);
        res.status(500).json({ error: 'Unable to save registration. Please try again.' });
    }
});

app.get('/healthz', (req, res) => res.json({ ok: true, db: Boolean(usersCollection) }));

// Anything else: friendly 404 page
app.use((req, res) => res.status(404).sendFile(path.join(siteRoot, '404.html')));

async function start() {
    const client = new MongoClient(mongoUrl, { serverSelectionTimeoutMS: 5000 });
    try {
        await client.connect();
        usersCollection = client.db(dbName).collection('users');
        console.log('Connected to MongoDB.');
    } catch (err) {
        console.warn(`MongoDB unavailable at ${mongoUrl}. Form submissions will fail until it is reachable.`);
    }
    app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
}

if (require.main === module) start();
module.exports = app;
