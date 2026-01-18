import { Router, Response } from 'express';
import db from '../database';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get comments for a post
router.get('/:postId/comments', (req, res: Response) => {
    const { postId } = req.params;

    try {
        const comments = db.prepare(`
      SELECT c.*, u.name as author_name, u.avatar as author_avatar,
             (SELECT COUNT(*) FROM likes WHERE target_type = 'comment' AND target_id = c.id) as likes
      FROM comments c
      INNER JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `).all(postId) as any[];

        const formattedComments = comments.map(comment => ({
            id: comment.id,
            author: {
                name: comment.author_name,
                avatar: comment.author_avatar
            },
            content: comment.content,
            timestamp: comment.created_at,
            likes: comment.likes,
            replyToName: comment.reply_to_name
        }));

        res.json(formattedComments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Add comment to post
router.post('/:postId/comments', authenticateToken, (req: AuthRequest, res: Response) => {
    const { postId } = req.params;
    const { content, parentId, replyToName } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }

    try {
        const commentId = uuidv4();
        const stmt = db.prepare(`
      INSERT INTO comments (id, post_id, author_id, content, parent_id, reply_to_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        stmt.run(commentId, postId, req.userId, content, parentId || null, replyToName || null);

        // Create notification for post author
        const post = db.prepare('SELECT author_id FROM posts WHERE id = ?').get(postId) as any;
        if (post && post.author_id !== req.userId) {
            const notificationId = uuidv4();
            db.prepare(`
        INSERT INTO notifications (id, user_id, type, sender_id, content, related_id, comment_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
                notificationId,
                post.author_id,
                'comment',
                req.userId,
                `在你的帖子下评论了：${content.substring(0, 30)}...`,
                postId,
                commentId
            );
        }

        const newComment = db.prepare('SELECT * FROM comments WHERE id = ?').get(commentId);
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Update comment
router.put('/comments/:id', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { content } = req.body;

    try {
        const comment = db.prepare('SELECT author_id FROM comments WHERE id = ?').get(id) as any;

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.author_id !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized to update this comment' });
        }

        db.prepare('UPDATE comments SET content = ? WHERE id = ?').run(content, id);

        const updatedComment = db.prepare('SELECT * FROM comments WHERE id = ?').get(id);
        res.json(updatedComment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update comment' });
    }
});

// Delete comment
router.delete('/comments/:id', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const comment = db.prepare('SELECT author_id FROM comments WHERE id = ?').get(id) as any;

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.author_id !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized to delete this comment' });
        }

        db.prepare('DELETE FROM comments WHERE id = ?').run(id);
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

// Like a comment
router.post('/comments/:id/like', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        db.prepare('INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)')
            .run(req.userId, 'comment', id);
        res.json({ message: 'Comment liked' });
    } catch (error: any) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Already liked this comment' });
        }
        res.status(500).json({ error: 'Failed to like comment' });
    }
});

export default router;
