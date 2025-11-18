import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Libro from './models/libro.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conexión a MongoDB
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

    // Limpia la colección antes de importar (opcional)
    await Libro.deleteMany();
    await Libro.insertMany(books);

    console.log(`✅ ${books.length} libros importados a MongoDB`);
    process.exit();
  } catch (e) {
    console.error('Error al importar libros:', e);
    process.exit(1);
  }
});
