import { Router, Response } from 'express';
import db from '../database';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all chat sessions for user
router.get('/sessions', authenticateToken, (req: AuthRequest, res: Response) => {
    try {
        const sessions = db.prepare(`
      SELECT cs.id, cs.created_at,
             CASE 
               WHEN cs.user1_id = ? THEN cs.user2_id
               ELSE cs.user1_id
             END as participant_id
      FROM chat_sessions cs
      WHERE cs.user1_id = ? OR cs.user2_id = ?
      ORDER BY cs.created_at DESC
    `).all(req.userId, req.userId, req.userId) as any[];

        const formattedSessions = sessions.map(session => {
            const participant = db.prepare('SELECT id, name, avatar FROM users WHERE id = ?')
                .get(session.participant_id) as any;

            const lastMessage = db.prepare(`
        SELECT text, created_at
        FROM messages
        WHERE session_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `).get(session.id) as any;

            const unreadCount = db.prepare(`
        SELECT COUNT(*) as count
        FROM messages
        WHERE session_id = ? AND sender_id != ? AND is_read = 0
      `).get(session.id, req.userId) as any;

            return {
                id: session.id,
                participant,
                lastMessage: lastMessage?.text || '',
                timestamp: lastMessage?.created_at || session.created_at,
                unreadCount: unreadCount.count
            };
        });

        res.json(formattedSessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat sessions' });
    }
});

// Get messages in a session
router.get('/sessions/:id', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id: sessionId } = req.params;

    try {
        const messages = db.prepare(`
      SELECT * FROM messages
      WHERE session_id = ?
      ORDER BY created_at ASC
    `).all(sessionId) as any[];

        const formattedMessages = messages.map(msg => ({
            id: msg.id,
            senderId: msg.sender_id,
            text: msg.text,
            timestamp: msg.created_at,
            isMe: msg.sender_id === req.userId
        }));

        // Mark messages as read
        db.prepare(`
      UPDATE messages
      SET is_read = 1
      WHERE session_id = ? AND sender_id != ?
    `).run(sessionId, req.userId);

        res.json(formattedMessages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Send a message
router.post('/', authenticateToken, (req: AuthRequest, res: Response) => {
    const { recipientId, text } = req.body;

    if (!recipientId || !text) {
        return res.status(400).json({ error: 'Recipient ID and text are required' });
    }

    try {
        // Find or create chat session
        let session = db.prepare(`
      SELECT id FROM chat_sessions
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `).get(req.userId, recipientId, recipientId, req.userId) as any;

        if (!session) {
            const sessionId = uuidv4();
            db.prepare(`
        INSERT INTO chat_sessions (id, user1_id, user2_id)
        VALUES (?, ?, ?)
      `).run(sessionId, req.userId, recipientId);
            session = { id: sessionId };
        }

        // Create message
        const messageId = uuidv4();
        db.prepare(`
      INSERT INTO messages (id, session_id, sender_id, text)
      VALUES (?, ?, ?, ?)
    `).run(messageId, session.id, req.userId, text);

        // Create notification for recipient
        const notificationId = uuidv4();
        db.prepare(`
      INSERT INTO notifications (id, user_id, type, sender_id, content, related_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
            notificationId,
            recipientId,
            'message',
            req.userId,
            text.substring(0, 50),
            session.id
        );

        res.status(201).json({ messageId, sessionId: session.id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Mark message as read
router.put('/:id/read', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(id);
        res.json({ message: 'Message marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark message as read' });
    }
});

export default router;
