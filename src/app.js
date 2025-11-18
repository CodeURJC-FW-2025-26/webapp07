import express from 'express';
import path from 'node:path';
import fs from 'fs';
import mongoose from 'mongoose';
import mustacheExpress from 'mustache-express';
import { fileURLToPath } from 'node:url';
import validator from 'validator';
import Post from './models/libro.js';
import Opinion from './models/opinion.js';

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

/* ---------------------- RUTAS DE LIBROS ---------------------- */

// Página principal con búsqueda y paginación
app.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;
  const query = req.query.search || '';
  const genres = req.query.genres
    ? req.query.genres.split(',').map(g => decodeURIComponent(g))
    : [];

  const searchFilter = {
    ...(query && {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { Genre: { $regex: query, $options: 'i' } },
        { Year: { $regex: query, $options: 'i' } }
      ]
    }),
    ...(genres.length > 0 && { Genre: { $in: genres } })
  };

  const libros = await Post.find(searchFilter).skip(skip).limit(limit).lean();
  const total = await Post.countDocuments(searchFilter);
  const totalPages = Math.ceil(total / limit);

  const posts = libros
    .map(libro => {
      const img = libro.bookimg || '';
      const isValidUrl = img.startsWith('http://') || img.startsWith('https://');
      return isValidUrl ? { ...libro, imgUrl: img } : null;
    })
    .filter(Boolean);

  const encodedGenres = genres.map(g => encodeURIComponent(g)).join(',');

  res.render('index', {
    posts,
    query,
    selectedGenres: encodedGenres,
    selectedGenresArray: genres,
    currentPage: page,
    totalPages,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < totalPages ? page + 1 : null,
    hasFilters: genres.length > 0,
    isRomance: genres.includes('Romance'),
    isYouth: genres.includes('Youth'),
    isForChildren: genres.includes('For Children'),
    isNovel: genres.includes('Novel')
  });
});



// Guardar nuevo libro
app.post('/add-book', async (req, res) => {
  const { title, author, Genre, Year, Synopsis, bookimg } = req.body;

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


// Detalle de libro
app.get('/detalle/:id', async (req, res) => {
  try {
    const libro = await Post.findById(req.params.id).lean();
    const opinions = await Opinion.find({ bookId: req.params.id }).lean();

    if (!libro) return res.status(404).send('Libro no encontrado');

    const imgUrl = libro.bookimg?.startsWith('http') ? libro.bookimg : null;

    res.render('detalle', {
      ...libro,
      _id:libro._id,
      imgUrl,
      opinions
    });
  } catch (error) {
    console.error('Error al cargar detalle:', error);
    res.status(500).send('Error interno del servidor');
  }
});
// Delete a book
app.delete('/Post/:id', async (req, res) => {
  console.log('Trying to delete book:', req.params.id);

  try {
    const result = await Post.findByIdAndDelete(req.params.id);
    if (!result) {
      console.log('Book not found:', req.params.id);
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    console.log('Deleted book:', result);
    res.json({ success: true, message: 'Deleted book' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ success: false, message: 'Error deleting book' });
  }
});

// delete an opinion

app.delete('/Opinion/:id', async (req, res) => {
  console.log('Trying to delete opinion:', req.params.id);

  try {
    const result = await Post.findByIdAndDelete(req.params.id);
    if (!result) {
      console.log('Book not found:', req.params.id);
      return res.status(404).json({ success: false, message: 'Opinion not found' });
    }

    console.log('Deleted opinion:', result);
    res.json({ success: true, message: 'Deleted opinion' });
  } catch (error) {
    console.error('Error deleting opinion:', error);
    res.status(500).json({ success: false, message: 'Error deleting opinion' });
  }
});


//insertar opinion manual
app.get('/insert-opinion-manual', async (req, res) => {
  try {
    await Opinion.create({
      email: 'alicia@example.com',
      password: '1234',
      opinion: 'Me encantó el libro, muy emocionante.',
      rating: 5,
      bookId: 'ID_DEL_LIBRO'
    });
    res.send('Opinión añadida manualmente');
  } catch (error) {
    console.error('Error al insertar opinión:', error);
    res.status(500).send('Error al insertar');
  }
});

/* ---------------------- RUTAS DE OPINIONES ---------------------- */

// Guardar nueva opinión
app.post('/add-opinion', async (req, res) => {
  const { email, password, opinion, rating } = req.body;
  try {
    await Opinion.create({ email, password, opinion, rating });
    res.redirect('/confirmation.html');
  } catch (error) {
    console.error('Error al guardar opinión:', error);
    res.status(500).send('Error al guardar la opinión');
  }
});

// Mostrar formulario para editar opinión
app.get('/edit-opinion/:id', async (req, res) => {
  try {
    const opinion = await Opinion.findById(req.params.id).lean();
    if (!opinion) return res.status(404).send('Opinión no encontrada');
    res.render('edit-opinion', { opinion });
  } catch (error) {
    console.error('Error al buscar opinión:', error);
    res.status(500).send('Error interno');
  }
});

// Guardar cambios en la opinión
app.post('/edit-opinion/:id', async (req, res) => {
  const { email, password, opinion, rating } = req.body;
  try {
    await Opinion.findByIdAndUpdate(req.params.id, { email, password, opinion, rating });
    res.redirect('/confirmation.html');
  } catch (error) {
    console.error('Error al actualizar opinión:', error);
    res.status(500).send('Error al actualizar');
  }
});

// Mostrar formulario de edición
app.get('/edit-book/:id', async (req, res) => {
  const libro = await Post.findById(req.params.id).lean();
  if (!libro) return res.status(404).send('Libro no encontrado');
  res.render('edit-book', libro);
});

// Guardar cambios del libro
app.post('/edit-book/:id', async (req, res) => {
  const { title, author, Genre, Year, Synopsis, bookimg } = req.body;
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title, author, Genre, Year, Synopsis, bookimg
    });
    res.redirect(`/detalle/${req.params.id}`);
  } catch (error) {
    console.error('Error al actualizar libro:', error);
    res.status(500).send('Error al actualizar libro');
  }
});

/* ---------------------- CONEXIÓN Y SERVIDOR ---------------------- */

mongoose.connect('mongodb://localhost:27017/board', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.listen(3000, () => {
  console.log('Servidor activo en http://localhost:3000');
});
