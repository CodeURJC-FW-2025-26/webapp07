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





router.use((req, res, next) => {
    let err = new Error('Page not found');
    err.status = 404;
    next(err);
});

router.use((err, req, res, next) => {
    console.error(err.stack); 
    res.status(err.status || 500).render('error', { title: 'Error', message: err.message }); 


module.exports = router;
