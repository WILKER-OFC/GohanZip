const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Multer para almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Usar el nombre original para que se vea igual al descargar
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Ruta para subir archivos
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No se subió ningún archivo.');
    }
    res.json({ message: 'Archivo subido con éxito', file: req.file });
});

// Ruta para listar archivos
app.get('/files', (req, res) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
        return res.json([]);
    }
    fs.readdir(uploadPath, (err, files) => {
        if (err) {
            return res.status(500).send('Error al leer archivos.');
        }
        const fileList = files.map(file => {
            return {
                name: file.split('-').slice(1).join('-'),
                url: `/uploads/${file}`,
                id: file
            };
        });
        res.json(fileList);
    });
});

app.listen(PORT, () => {
    console.log(`Servidor GohanZip corriendo en http://localhost:${PORT}`);
});
