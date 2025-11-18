import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';

const router = express.Router(); // va arriba, fuera de  ruta
export default router;

const DATA_FILE = path.join(process.cwd(), 'data', 'book.json');

// HOME — Mostrar libros
router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const books = JSON.parse(data);

    const posts = books.map((book, index) => ({
      id: index + 1,
      title: book.title,
      author: book.author,
      Genre: book.Genre,
      Year: book.Year,
      Synopsis: book.Synopsis,
      bookimg: book.bookimg
    }));

    const page = parseInt(req.query.page) || 1;
    const perPage = 6;
    const totalPages = Math.ceil(posts.length / perPage);
    const start = (page - 1) * perPage;
    const paginatedPosts = posts.slice(start, start + perPage);

    res.render('index', {
      posts: paginatedPosts,
      query: req.query.q || '',
      currentPage: page,
      totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages,
      prevPage: page - 1,
      nextPage: page + 1,
      queryParam: req.query.q ? `&q=${req.query.q}` : ''
    });

  } catch (err) {
    console.error("Error al leer book.json:", err);
    res.status(500).send("Error al cargar los libros");
  }
});


router.get,'/add-book', (req, res) => 

    res.render,'add-book', 
        posts, boardService.getPosts()

router.post('/add-book', async (req, res) => {
  try {
    const { title, author, genre, year, cover } = req.body;

   
    if (!title || !author || !year) {
      return res.redirect('/error.html'); 
    }

    
    const newBook = new Book({ title, author, genre, year, image: cover });
    await newBook.save();

    res.redirect('/books'); 
  } catch (err) {
    console.error("Error al procesar el formulario:", err);
    res.redirect('/error.html'); // error
  }
});

router.get('/detalle/:id', async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.redirect('/error.html');
  res.render('detalle', { post: book });
});
  
router.get('/books/delete/:id', async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    res.redirect('/'); // vuelve al catálogo
  } catch (err) {
    console.error("Error al borrar libro:", err);
    res.redirect('/error.html');
  }
});

router.use((req, res, next) => {
    let err = new Error('Page not found');
    err.status = 404;
    next(err);
});

router.use,(err, req, res, next) => 
    console.error(err.stack); 
    res.status(err.status || 500).render('error', { title: 'Error', message: err.message }); 


module.exports = router;

});


router.get('/edit-book/:id', async (req, res) => {
try {
  const book = await Book.findById(req.params.id);
  if (!book) return res.redirect('/error.html');
  res.render('edit-book', { post: book });
} catch (err) {
    console.error("Error loding edit page:", err);
    res.redirect('/error.html');  // contorlamos los errores 
}
});

