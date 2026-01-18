import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../database';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Register new user
router.post('/register', async (req, res: Response) => {
    const { name, email, password, avatar, bio } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: 'Name and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        const stmt = db.prepare(`
      INSERT INTO users (id, name, email, password, avatar, bio)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        stmt.run(userId, name, email || null, hashedPassword, avatar || null, bio || '');

        const token = generateToken(userId);

        res.status(201).json({
            userId,
            name,
            email,
            avatar,
            bio,
            token
        });
    } catch (error: any) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res: Response) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: 'Name and password are required' });
    }

    try {
        const user = db.prepare('SELECT * FROM users WHERE name = ?').get(name) as any;

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user.id);

        res.json({
            userId: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
            token
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user
router.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
    try {
        const user = db.prepare(`
      SELECT id, name, email, avatar, bio, created_at,
             (SELECT COUNT(*) FROM follows WHERE follower_id = users.id) as following,
             (SELECT COUNT(*) FROM follows WHERE following_id = users.id) as followers,
             (SELECT COUNT(*) FROM likes WHERE user_id = users.id) as likes
      FROM users
      WHERE id = ?
    `).get(req.userId) as any;

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

// Logout (client-side token deletion)
router.post('/logout', (req, res: Response) => {
    res.json({ message: 'Logged out successfully' });
});

export default router;
