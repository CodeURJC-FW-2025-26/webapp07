import mongoose from 'mongoose';

const libroSchema = new mongoose.Schema({
  title: String,
  author: String,
  Genre: String,
  Year: String,
  Synopsis: String,
  bookimg: String
});

export default mongoose.model('Post', libroSchema, 'posts');
