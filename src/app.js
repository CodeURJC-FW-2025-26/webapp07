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
  const posts = await Libro.find(); // o [] si no usas MongoDB aún
  res.render('index', { posts, query: '' });
});

mongoose.connect('mongodb://localhost:27017/catalogo', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// ... tu ruta principal aquí ...

app.listen(3000, () => {
  console.log('Servidor activo en http://localhost:3000');
});
