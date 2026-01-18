import { Router, Response } from 'express';
import db from '../database';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get posts feed with pagination and filtering
router.get('/', (req, res: Response) => {
    const { category, page = '1', limit = '10' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    try {
        let query = `
      SELECT p.*, u.name as author_name, u.avatar as author_avatar,
             (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.id) as likes,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments
      FROM posts p
      INNER JOIN users u ON p.author_id = u.id
    `;

        const params: any[] = [];

        if (category) {
            query += ` WHERE p.categories LIKE ?`;
            params.push(`%${category}%`);
        }

        query += ` ORDER BY p.is_pinned DESC, p.created_at DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), offset);

        const posts = db.prepare(query).all(...params) as any[];

        const formattedPosts = posts.map(post => ({
            id: post.id,
            author: {
                name: post.author_name,
                avatar: post.author_avatar
            },
            title: post.title,
            content: post.content,
            images: post.images ? JSON.parse(post.images) : [],
            categories: post.categories ? JSON.parse(post.categories) : [],
            timestamp: post.created_at,
            likes: post.likes,
            comments: post.comments,
            isPinned: Boolean(post.is_pinned),
            isMuted: Boolean(post.is_muted)
        }));

        res.json(formattedPosts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Get single post
router.get('/:id', (req, res: Response) => {
    const { id } = req.params;

    try {
        const post = db.prepare(`
      SELECT p.*, u.name as author_name, u.avatar as author_avatar,
             (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.id) as likes,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments
      FROM posts p
      INNER JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `).get(id) as any;

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const formattedPost = {
            id: post.id,
            author: {
                id: post.author_id,
                name: post.author_name,
                avatar: post.author_avatar
            },
            title: post.title,
            content: post.content,
            images: post.images ? JSON.parse(post.images) : [],
            categories: post.categories ? JSON.parse(post.categories) : [],
            timestamp: post.created_at,
            likes: post.likes,
            comments: post.comments,
            isPinned: Boolean(post.is_pinned),
            isMuted: Boolean(post.is_muted)
        };

        res.json(formattedPost);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// Create new post
router.post('/', authenticateToken, (req: AuthRequest, res: Response) => {
    const { title, content, images = [], categories = [] } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    try {
        const postId = uuidv4();
        const stmt = db.prepare(`
      INSERT INTO posts (id, author_id, title, content, images, categories)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            postId,
            req.userId,
            title,
            content,
            JSON.stringify(images),
            JSON.stringify(categories)
        );

        const newPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Update post
router.put('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title, content, images, categories } = req.body;

    try {
        const post = db.prepare('SELECT author_id FROM posts WHERE id = ?').get(id) as any;

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.author_id !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized to update this post' });
        }

        const stmt = db.prepare(`
      UPDATE posts
      SET title = COALESCE(?, title),
          content = COALESCE(?, content),
          images = COALESCE(?, images),
          categories = COALESCE(?, categories)
      WHERE id = ?
    `);

        stmt.run(
            title,
            content,
            images ? JSON.stringify(images) : null,
            categories ? JSON.stringify(categories) : null,
            id
        );

        const updatedPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// Delete post
router.delete('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const post = db.prepare('SELECT author_id FROM posts WHERE id = ?').get(id) as any;

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.author_id !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized to delete this post' });
        }

        db.prepare('DELETE FROM posts WHERE id = ?').run(id);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Like a post
router.post('/:id/like', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const stmt = db.prepare('INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)');
        stmt.run(req.userId, 'post', id);
        res.json({ message: 'Post liked' });
    } catch (error: any) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Already liked this post' });
        }
        res.status(500).json({ error: 'Failed to like post' });
    }
});

// Unlike a post
router.delete('/:id/like', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        db.prepare('DELETE FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?')
            .run(req.userId, 'post', id);
        res.json({ message: 'Post unliked' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to unlike post' });
    }
});

export default router;
