import { Router, Response } from 'express';
import db from '../database';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Get user's cart
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
    try {
        const cartItems = db.prepare(`
      SELECT ci.*, p.name, p.image, p.price
      FROM cart_items ci
      INNER JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `).all(req.userId) as any[];

        const formattedCart = cartItems.map(item => ({
            id: item.id,
            productId: item.product_id,
            productName: item.name,
            productImage: item.image,
            price: item.price,
            quantity: item.quantity,
            spec: item.spec
        }));

        res.json(formattedCart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// Add item to cart
router.post('/items', authenticateToken, (req: AuthRequest, res: Response) => {
    const { productId, quantity = 1, spec } = req.body;

    if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    try {
        const stmt = db.prepare(`
      INSERT INTO cart_items (user_id, product_id, quantity, spec)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, product_id, spec) DO UPDATE SET quantity = quantity + ?
    `);

        stmt.run(req.userId, productId, quantity, spec || null, quantity);
        res.json({ message: 'Item added to cart' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
});

// Update cart item quantity
router.put('/items/:id', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
        return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    try {
        db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?')
            .run(quantity, id, req.userId);
        res.json({ message: 'Cart item updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update cart item' });
    }
});

// Remove item from cart
router.delete('/items/:id', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(id, req.userId);
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove item' });
    }
});

// Clear cart
router.delete('/', authenticateToken, (req: AuthRequest, res: Response) => {
    try {
        db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.userId);
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

export default router;
