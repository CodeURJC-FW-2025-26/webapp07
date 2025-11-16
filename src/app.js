import express from 'express';
import path from 'node:path';
import mongoose from 'mongoose';
import mustacheExpress from 'mustache-express';
import { fileURLToPath } from 'node:url';
import Libro from './models/Libro.js'; // Asegúrate de usar extensión .js

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

  const searchFilter = query
    ? {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { author: { $regex: query, $options: 'i' } }
        ]
      }
    : {};

  const total = await Libro.countDocuments(searchFilter);
  const posts = await Libro.find(searchFilter).skip(skip).limit(limit);
  const totalPages = Math.ceil(total / limit);

  res.render('index', {
    posts,
    query,
    currentPage: page,
    totalPages,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < totalPages ? page + 1 : null
  });
});

mongoose.connect('mongodb://localhost:27017/board', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


// ... tu ruta principal aquí ...

app.listen(3000, () => {
  console.log('Servidor activo en http://localhost:3000');
});
