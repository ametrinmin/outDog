import { Router, Response } from 'express';
import db from '../database';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get user's orders
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
    try {
        const orders = db.prepare(`
      SELECT * FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.userId) as any[];

        const formattedOrders = orders.map(order => {
            const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
            const review = db.prepare('SELECT * FROM order_reviews WHERE order_id = ?').get(order.id) as any;

            return {
                ...order,
                items,
                review: review ? {
                    ...review,
                    tags: review.tags ? JSON.parse(review.tags) : []
                } : null
            };
        });

        res.json(formattedOrders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get single order
router.get('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
            .get(id, req.userId) as any;

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
        const review = db.prepare('SELECT * FROM order_reviews WHERE order_id = ?').get(id) as any;

        const formattedOrder = {
            ...order,
            items,
            review: review ? {
                ...review,
                tags: review.tags ? JSON.parse(review.tags) : []
            } : null
        };

        res.json(formattedOrder);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// Create order from cart
router.post('/', authenticateToken, (req: AuthRequest, res: Response) => {
    try {
        const cartItems = db.prepare(`
      SELECT ci.*, p.name, p.image, p.price
      FROM cart_items ci
      INNER JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.userId) as any[];

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderId = `ORD-${Date.now()}-${uuidv4().substring(0, 8)}`;

        // Create order
        db.prepare(`
      INSERT INTO orders (id, user_id, total_amount, status)
      VALUES (?, ?, ?, ?)
    `).run(orderId, req.userId, totalAmount, 'pending');

        // Create order items
        const orderItemStmt = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, spec)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        for (const item of cartItems) {
            orderItemStmt.run(
                orderId,
                item.product_id,
                item.name,
                item.image,
                item.price,
                item.quantity,
                item.spec
            );
        }

        // Clear cart
        db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.userId);

        res.status(201).json({ orderId, message: 'Order created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Update order status
router.put('/:id/status', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        db.prepare('UPDATE orders SET status = ? WHERE id = ? AND user_id = ?')
            .run(status, id, req.userId);
        res.json({ message: 'Order status updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Add product review
router.post('/:id/review', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id: orderId } = req.params;
    const { rating, content, tags = [] } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    try {
        const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
            .get(orderId, req.userId) as any;

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.status !== 'delivered') {
            return res.status(400).json({ error: 'Can only review delivered orders' });
        }

        db.prepare(`
      INSERT INTO order_reviews (order_id, rating, content, tags)
      VALUES (?, ?, ?, ?)
    `).run(orderId, rating, content || '', JSON.stringify(tags));

        res.json({ message: 'Review added successfully' });
    } catch (error: any) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Order already reviewed' });
        }
        res.status(500).json({ error: 'Failed to add review' });
    }
});

export default router;
