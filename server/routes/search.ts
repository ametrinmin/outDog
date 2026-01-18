import { Router, Response } from 'express';
import db from '../database';

const router = Router();

// Search posts, users, and products
router.get('/', (req, res: Response) => {
    const { q, type = 'all' } = req.query;

    if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    const searchTerm = `%${q}%`;
    const results: any = {};

    try {
        // Search posts
        if (type === 'all' || type === 'posts') {
            const posts = db.prepare(`
        SELECT p.*, u.name as author_name, u.avatar as author_avatar,
               (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.id) as likes,
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments
        FROM posts p
        INNER JOIN users u ON p.author_id = u.id
        WHERE p.title LIKE ? OR p.content LIKE ?
        ORDER BY p.created_at DESC
        LIMIT 20
      `).all(searchTerm, searchTerm) as any[];

            results.posts = posts.map(post => ({
                id: post.id,
                author: { name: post.author_name, avatar: post.author_avatar },
                title: post.title,
                content: post.content,
                images: post.images ? JSON.parse(post.images) : [],
                categories: post.categories ? JSON.parse(post.categories) : [],
                timestamp: post.created_at,
                likes: post.likes,
                comments: post.comments
            }));
        }

        // Search users
        if (type === 'all' || type === 'users') {
            results.users = db.prepare(`
        SELECT id, name, avatar, bio,
               (SELECT COUNT(*) FROM follows WHERE follower_id = users.id) as following,
               (SELECT COUNT(*) FROM follows WHERE following_id = users.id) as followers
        FROM users
        WHERE name LIKE ? OR bio LIKE ?
        LIMIT 20
      `).all(searchTerm, searchTerm);
        }

        // Search products
        if (type === 'all' || type === 'products') {
            const products = db.prepare(`
        SELECT * FROM products
        WHERE name LIKE ? OR description LIKE ?
        LIMIT 20
      `).all(searchTerm, searchTerm) as any[];

            results.products = products.map(product => ({
                ...product,
                specs: product.specs ? JSON.parse(product.specs) : [],
                features: product.features ? JSON.parse(product.features) : []
            }));
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});

export default router;
