import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Book from './models/libro.js';
import Opinion from './models/opinion.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/board', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const filePath = path.join(__dirname, '..', 'data', 'book.json');

fs.readFile(filePath, 'utf8', async (err, data) => {
  if (err) {
    console.error('Error leyendo book.json:', err);
    process.exit(1);
  }

  try {
    const books = JSON.parse(data);

    //Limpia las colecciones, para pruebas
    await Book.deleteMany();
    await Opinion.deleteMany();

    for (const bookData of books) {
      //Inserta el libro
      const book = await Book.create({
        title: bookData.title,
        author: bookData.author,
        Genre: bookData.Genre,
        Year: bookData.Year,
        Synopsis: bookData.Synopsis,
        bookimg: bookData.bookimg
      });

      // 2️ Inserta las opiniones (si las hay)
      if (bookData.opinions && Array.isArray(bookData.opinions)) {
        const formattedOpinions = bookData.opinions.map(op => ({
          email: op.email,
          opinion: op.opinion,
          rating: op.rating,
          bookId: book._id
        }));

        await Opinion.insertMany(formattedOpinions);
        console.log(` ${formattedOpinions.length} opiniones añadidas para "${book.title}"`);
      } else {
        console.log(` Libro importado sin opiniones: "${book.title}"`);
      }
    }

    console.log('Libros y opiniones importados correctamente.');
    process.exit();
  } catch (e) {
    console.error('Error al importar datos:', e);
    process.exit(1);
  }
});
