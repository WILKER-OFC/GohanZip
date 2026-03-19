const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = 'database.json';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

// Database initialization
let fileDatabase = {};
if (fs.existsSync(DB_FILE)) {
    try {
        fileDatabase = JSON.parse(fs.readFileSync(DB_FILE));
    } catch (e) {
        console.error('Error loading database', e);
    }
}

function saveDatabase() {
    fs.writeFileSync(DB_FILE, JSON.stringify(fileDatabase, null, 2));
}

// Routes
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileId = uuidv4();
    fileDatabase[fileId] = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        uploadDate: new Date()
    };
    
    saveDatabase();

    const downloadLink = `${req.protocol}://${req.get('host')}/view/${fileId}`;
    res.json({ downloadLink, fileId });
});

app.get('/api/file/:id', (req, res) => {
    const file = fileDatabase[req.params.id];
    if (!file) {
        return res.status(404).json({ error: 'File not found' });
    }
    res.json(file);
});

app.get('/download/:id', (req, res) => {
    const file = fileDatabase[req.params.id];
    if (!file) {
        return res.status(404).send('File not found');
    }
    
    if (fs.existsSync(file.path)) {
        res.download(file.path, file.originalName);
    } else {
        res.status(404).send('File physical copy not found');
    }
});

// Serve the view page (frontend will handle the UI)
app.get('/view/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
