import { Router, Response } from 'express';
import db from '../database';

const router = Router();

// Get all products
router.get('/', (req, res: Response) => {
    try {
        const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();

        const formattedProducts = (products as any[]).map(product => ({
            ...product,
            specs: product.specs ? JSON.parse(product.specs) : [],
            features: product.features ? JSON.parse(product.features) : [],
            detailImages: product.detail_images ? JSON.parse(product.detail_images) : []
        }));

        res.json(formattedProducts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product
router.get('/:id', (req, res: Response) => {
    const { id } = req.params;

    try {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const formattedProduct = {
            ...product,
            specs: product.specs ? JSON.parse(product.specs) : [],
            features: product.features ? JSON.parse(product.features) : [],
            detailImages: product.detail_images ? JSON.parse(product.detail_images) : []
        };

        res.json(formattedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

export default router;
