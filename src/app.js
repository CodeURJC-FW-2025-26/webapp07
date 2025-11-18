import express from 'express';
import path from 'node:path';
import fs from 'fs';
import mongoose from 'mongoose';
import mustacheExpress from 'mustache-express';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import Libro from './models/libro.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuración de Mustache
app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '..', 'views'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

// Middleware para leer formularios
app.use(express.urlencoded({ extended: true }));

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'images'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// Ruta principal con búsqueda y paginación
app.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;
  const query = req.query.search || '';

  const searchFilter = query
    ? {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { author: { $regex: query, $options: 'i' } },
          { Genre: { $regex: query, $options: 'i' } },
          { Year: { $regex: query, $options: 'i' } }
        ]
      }
    : {};

  const libros = await Libro.find(searchFilter).skip(skip).limit(limit);
  const total = await Libro.countDocuments(searchFilter);
  const totalPages = Math.ceil(total / limit);

  const posts = libros.map(libro => libro.toObject?.() || libro);

  res.render('index', {
    posts,
    query,
    currentPage: page,
    totalPages,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < totalPages ? page + 1 : null
  });
});

// Ruta POST para guardar libro y subir imagen
app.post('/add-book', upload.single('bookimg'), async (req, res) => {
  const { title, author, Genre, Year, Synopsis } = req.body;
  const bookimg = req.file?.filename || '';

  const newBook = { title, author, Genre, Year, Synopsis, bookimg };

  try {
    await Libro.create(newBook);

    const filePath = path.join(__dirname, '..', 'data', 'book.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
      let books = [];
      if (!err && data) {
        try {
          books = JSON.parse(data);
        } catch (parseErr) {
          console.error('Error al parsear book.json:', parseErr);
        }
      }
      books.push(newBook);
      fs.writeFile(filePath, JSON.stringify(books, null, 2), (writeErr) => {
        if (writeErr) {
          console.error('Error al guardar en book.json:', writeErr);
        }
        res.redirect('/');
      });
    });
  } catch (error) {
    console.error('Error al guardar libro:', error);
    res.status(500).send('Error al guardar el libro');
  }
});

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/board', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Servidor activo
app.listen(3000, () => {
  console.log('Servidor activo en http://localhost:3000');
});
