
export interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  following: number;
  followers: number;
  likes: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  specs?: string[];
  features?: string[];
  detailImages?: string[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  spec?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderReview {
  rating: number;
  content: string;
  tags: string[];
  timestamp: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  timestamp: string;
  trackingNumber?: string;
  review?: OrderReview;
  refundReason?: string;
}

export type BlockType = 'text' | 'image' | 'video';

export interface ContentBlock {
  id: string;
  type: BlockType;
  value: string;
}

export interface Post {
  id: string;
  author: Partial<User>;
  title: string;
  content: string;
  blocks?: ContentBlock[];
  images: string[];
  categories: string[];
  timestamp: string;
  likes: number;
  comments: number;
  isPinned?: boolean;
  isMuted?: boolean;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'system' | 'mention';
  sender: Partial<User>;
  content: string;
  relatedId?: string;
  commentId?: string;
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

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  attachments?: ContentBlock[];
}

export interface ChatSession {
  id: string;
  participant: Partial<User>;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}
