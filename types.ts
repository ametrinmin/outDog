
export interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  following: number;
  followers: number;
  likes: number;
}

export type BlockType = 'text' | 'image' | 'video';

export interface ContentBlock {
  id: string;
  type: BlockType;
  value: string; // text content or media URL/blob
}

export interface Post {
  id: string;
  author: Partial<User>;
  title: string;
  content: string; // fallback or summary
  blocks?: ContentBlock[]; // interspersed content
  images: string[]; // keep for compatibility
  categories: string[]; // Replaces singular category and tags
  timestamp: string;
  likes: number;
  comments: number;
  isPinned?: boolean;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'system' | 'mention';
  sender: Partial<User>;
  content: string;
  relatedId?: string; // post id
  timestamp: string;
  isRead: boolean;
}

export interface Comment {
  id: string;
  author: Partial<User>;
  content: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
  isAuthor?: boolean;
  replyToName?: string;
  attachments?: ContentBlock[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  badge?: string;
  specs?: string[];
  features?: string[];
  detailImages?: string[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  attachments?: ContentBlock[]; // 新增：支持聊天附件
}

export interface ChatSession {
  id: string;
  participant: Partial<User>;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}
