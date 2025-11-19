import express from 'express';
import Opinion from './models/opinion.js';

const router = express.Router();

router.post('/update-opinion', async (req, res) => {
    const { email, opinion, rating, bookId } = req.body;

    try {
        await Opinion.findOneAndUpdate(
            { email, bookId }, // busca por email y libro
            { opinion, rating }, // actualiza los campos
            { upsert: false } // no crear si no existe
        );
        res.redirect('/confirmation.html');
    } catch (error) {
        console.error('Error al actualizar opinión:', error);
        res.redirect('/error.html');
    }
});

export default router;

