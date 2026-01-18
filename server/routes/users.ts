import { Router, Response } from 'express';
import db from '../database';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Get user profile by ID or name
router.get('/:identifier', (req, res: Response) => {
    const { identifier } = req.params;

    try {
        const user = db.prepare(`
      SELECT id, name, avatar, bio, created_at,
             (SELECT COUNT(*) FROM follows WHERE follower_id = users.id) as following,
             (SELECT COUNT(*) FROM follows WHERE following_id = users.id) as followers,
             (SELECT COUNT(*) FROM likes WHERE user_id = users.id) as likes
      FROM users
      WHERE id = ? OR name = ?
    `).get(identifier, identifier) as any;

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user profile
router.put('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, avatar, bio } = req.body;

    if (req.userId !== id) {
        return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    try {
        const stmt = db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          avatar = COALESCE(?, avatar),
          bio = COALESCE(?, bio)
      WHERE id = ?
    `);

        stmt.run(name, avatar, bio, id);

        const updatedUser = db.prepare('SELECT id, name, avatar, bio FROM users WHERE id = ?').get(id);
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Follow a user
router.post('/:id/follow', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id: followingId } = req.params;
    const followerId = req.userId;

    if (followerId === followingId) {
        return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    try {
        const stmt = db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)');
        stmt.run(followerId, followingId);
        res.json({ message: 'Followed successfully' });
    } catch (error: any) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Already following this user' });
        }
        res.status(500).json({ error: 'Failed to follow user' });
    }
});

// Unfollow a user
router.delete('/:id/follow', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id: followingId } = req.params;
    const followerId = req.userId;

    try {
        const stmt = db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?');
        stmt.run(followerId, followingId);
        res.json({ message: 'Unfollowed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to unfollow user' });
    }
});

// Get followers list
router.get('/:id/followers', (req, res: Response) => {
    const { id } = req.params;

    try {
        const followers = db.prepare(`
      SELECT u.id, u.name, u.avatar, u.bio
      FROM users u
      INNER JOIN follows f ON u.id = f.follower_id
      WHERE f.following_id = ?
      ORDER BY f.created_at DESC
    `).all(id);

        res.json(followers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch followers' });
    }
});

// Get following list
router.get('/:id/following', (req, res: Response) => {
    const { id } = req.params;

    try {
        const following = db.prepare(`
      SELECT u.id, u.name, u.avatar, u.bio
      FROM users u
      INNER JOIN follows f ON u.id = f.following_id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
    `).all(id);

        res.json(following);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch following' });
    }
});

export default router;
