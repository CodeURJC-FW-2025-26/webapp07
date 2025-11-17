
import mongoose from 'mongoose';
import fs from 'node:fs/promises';
import Book from './models/Book.js';

await mongoose.connect('mongodb://localhost:27017/bookcatalog');

// Leer datos de demo
const dataString = await fs.readFile('./data/data.json', 'utf8');
const posts = JSON.parse(dataString);

// Borrar libros existentes
await Book.deleteMany({});

// Insertar libros desde JSON
await Book.insertMany(posts);

console.log('Demo data loaded into MongoDB');
