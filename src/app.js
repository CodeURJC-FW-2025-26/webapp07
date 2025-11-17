import express from 'express';
import path from 'node:path';
import mongoose from 'mongoose';
import mustacheExpress from 'mustache-express';
import { fileURLToPath } from 'node:url';
import Libro from './models/libro.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;
  const query = req.query.search || '';

  const isNumeric = !isNaN(query); // ✅ esta línea evita el error

  const searchFilter = query
    ? {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { author: { $regex: query, $options: 'i' } },
          { Genre: { $regex: query, $options: 'i' } },
          ...(isNumeric ? [{ Year: parseInt(query) }] : [])
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

app.use(express.urlencoded({ extended: true}));

app.post('/add-book.html', async (req, res) => {
  try{
    await Libro.create(req.body);
    res.redirect('/');
  } catch (error) {
    console.error('Error al crear libro:', error);
    res.status(400).send('Error al crear libro. Comprueba los campos.');
  }
});

mongoose.connect('mongodb://localhost:27017/board', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});



app.listen(3000, () => {
  console.log('Servidor activo en http://localhost:3000');
});
