import { Router, Response } from 'express';
import db from '../database';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Get user notifications
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
    try {
        const notifications = db.prepare(`
      SELECT n.*, u.name as sender_name, u.avatar as sender_avatar
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `).all(req.userId) as any[];

        const formattedNotifications = notifications.map(notif => ({
            id: notif.id,
            type: notif.type,
            sender: notif.sender_id ? {
                name: notif.sender_name,
                avatar: notif.sender_avatar
            } : null,
            content: notif.content,
            relatedId: notif.related_id,
            commentId: notif.comment_id,
            timestamp: notif.created_at,
            isRead: Boolean(notif.is_read)
        }));

        res.json(formattedNotifications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?')
            .run(id, req.userId);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, (req: AuthRequest, res: Response) => {
    try {
        db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.userId);
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});

export default router;
