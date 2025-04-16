const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'University';
const collectionName = 'Student';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve index.html

// Serve HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Add student
app.post('/add', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const { name, eid, email } = req.body;
    await collection.insertOne({ name, eid: parseInt(eid), email });
    res.redirect('/');
});

// Update student
app.post('/update', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const { searchField, searchValue, newName, newEid, newEmail } = req.body;

    const filter = {};
    filter[searchField] = searchField === 'eid' ? parseInt(searchValue) : searchValue;

    const updateFields = {};
    if (newName) updateFields.name = newName;
    if (newEid) updateFields.eid = parseInt(newEid);
    if (newEmail) updateFields.email = newEmail;

    if (Object.keys(updateFields).length > 0) {
        await collection.updateOne(filter, { $set: updateFields });
    }

    res.redirect('/');
});

// Delete student
app.post('/delete', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const { name } = req.body;
    await collection.deleteOne({ name });
    res.redirect('/');
});

// API to get all students (for frontend JS)
app.get('/students', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const students = await collection.find({}).toArray();
    res.json(students);
});

async function start() {
    await client.connect();
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

start();
