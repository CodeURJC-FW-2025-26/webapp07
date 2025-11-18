import mongoose from 'mongoose';

const opinionSchema = new mongoose.Schema({
  email: String,
  opinion: String,
  rating: Number,
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Libro'
  }
});

export default mongoose.model('Opinion', opinionSchema);
