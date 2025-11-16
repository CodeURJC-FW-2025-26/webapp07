import mongoose from 'mongoose';

const libroSchema = new mongoose.Schema({
  title: String,
  author: String,
  Genre: String,
  Year: Number,
  Synopsis: String,
  bookimg: String,
});


const Libro = mongoose.model('Libro', libroSchema, 'posts');
export default Libro;
