import express from 'express';
import path from 'node:path';
import fs from 'fs';
import mongoose from 'mongoose';
import mustacheExpress from 'mustache-express';
import { fileURLToPath } from 'node:url';
import validator from 'validator';
import Post from './models/libro.js';

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
app.use(express.json());

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

  const libros = await Post.find(searchFilter).skip(skip).limit(limit);
  const total = await Post.countDocuments(searchFilter);
  const totalPages = Math.ceil(total / limit);

  const posts = libros
    .map(libro => {
      const obj = libro.toObject?.() || libro;
      const img = obj.bookimg || '';
      const isValidUrl = img.startsWith('http://') || img.startsWith('https://');
      return isValidUrl ? { ...obj, imgUrl: img } : null;
    })
    .filter(Boolean);

  res.render('index', {
    posts,
    query,
    currentPage: page,
    totalPages,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < totalPages ? page + 1 : null
  });
});

// Ruta POST para guardar libro con URL de imagen
app.post('/add-book', async (req, res) => {
  const { title, author, Genre, Year, Synopsis, bookimg } = req.body;

  // Validar que la URL sea válida y apunte a una imagen
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const hasValidExtension = validExtensions.some(ext => bookimg.toLowerCase().endsWith(ext));

  if (
    !validator.isURL(bookimg, { protocols: ['http', 'https'], require_protocol: true }) ||
    !hasValidExtension
  ) {
    return res.status(400).send('La URL de la imagen no es válida o no termina en .jpg, .png, etc.');
  }

  const newBook = { title, author, Genre, Year, Synopsis, bookimg };

  try {
    await Post.create(newBook);

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

app.get('/detalle/:id', async (req, res) => {
  try {
    const libro = await Post.findById(req.params.id).lean();

    if (!libro) {
      return res.status(404).send('Libro no encontrado');
    }

    const isValidUrl = libro.bookimg?.startsWith('http://') || libro.bookimg?.startsWith('https://');
    const imgUrl = isValidUrl ? libro.bookimg : null;

    res.render('detalle', {
      ...libro,
      imgUrl
    });
  } catch (error) {
    console.error('Error al cargar detalle:', error);
    res.status(500).send('Error interno del servidor');
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
