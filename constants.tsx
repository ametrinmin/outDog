
import { Post, Product, User, ChatSession, Message, Notification } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: '老王闯深圳',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvAbrzPCW6OGfVV1_a3Y1Jr39UUBHC2_Z6moKAIBONp52EPd-M760Fq8-9lYphzF0SNy9GALOJrTXla8tjaAkZM6yXMWKzL4IN8vXb9r6zkmQHzCuUlKg3x7JYpq958ywXYqNvYfjsCw_4aS63MZYdpr8VlO35UsVN6XUkGvmsxIgBY5xnXL9usf-r1wLfejySpVqIip-0F1HMMnB-SZhYxErpuqj6pg1A8yweZQwX4XeKuFyT8iWm0bo56p5tYkNWT5xovDB5GPPF',
  bio: '深漂十年，专注于电子厂打工日常分享。希望能帮助到更多新来的兄弟姐妹！',
  following: 128,
  followers: 3500,
  likes: 12000
};

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    author: { name: '老王闯深圳', avatar: CURRENT_USER.avatar },
    title: '今天去龙华面试，顺便拍了下这边的环境',
    content: '今天特意跑了一趟龙华，环境比我想象中要好一些。',
    blocks: [
      { id: 'b1', type: 'text', value: '今天特意跑了一趟龙华，环境比我想象中要好一些。路边的绿化做得不错，人流量也很大。' },
      { id: 'b2', type: 'image', value: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtGh3KPNBtTtfKdR8R3UT7KBBPXBKVCb4vdtUbVzrGfEPEIemRfazDV-uCaPzyL-e1bPHddGcI6yFDjGJGAj8hnMB74YC9KQ8pqtKGOhMk4NJze3T4JTvG1fYlWONTFo9txkiBSW3gPu8663EJ7z9zxEORI6Bcop4gURK1uCQh-cYamuiq0BPES-EVvLGQR8RRrrRahPuco-e1ExX-h6kbMkS0GjAn_a3nWgj9-8A4C-OWOYdoX68Wl8epBTwgJZr1e9BdR4J4NE9T' },
      { id: 'b3', type: 'text', value: '这是面试的那家厂的大门口，看起来规模挺大的。听说最近还在招普工，待遇说是5K-7K，不知道真假。' }
    ],
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAtGh3KPNBtTtfKdR8R3UT7KBBPXBKVCb4vdtUbVzrGfEPEIemRfazDV-uCaPzyL-e1bPHddGcI6yFDjGJGAj8hnMB74YC9KQ8pqtKGOhMk4NJze3T4JTvG1fYlWONTFo9txkiBSW3gPu8663EJ7z9zxEORI6Bcop4gURK1uCQh-cYamuiq0BPES-EVvLGQR8RRrrRahPuco-e1ExX-h6kbMkS0GjAn_a3nWgj9-8A4C-OWOYdoX68Wl8epBTwgJZr1e9BdR4J4NE9T'],
    categories: ['工作互助', '生活闲聊'],
    timestamp: '刚刚',
    likes: 45,
    comments: 12
  },
  {
    id: 'p2',
    author: { name: '水电工强哥', avatar: 'https://picsum.photos/seed/worker2/100' },
    title: '工地避雷！长安镇这个项目千万别去',
    content: '拖欠工资，环境恶劣，兄弟们注意了。',
    images: [],
    categories: ['工作互助', '安全教育'],
    timestamp: '2小时前',
    likes: 89,
    comments: 34
  },
  {
    id: 'p3',
    author: { name: '深漂小陈', avatar: 'https://picsum.photos/seed/worker3/100' },
    title: '推荐一个超好用的剥线钳，省力不少',
    content: '最近刚入手的神器，效率翻倍。',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuB0tgVAtLCvwh3HGnPSKJImNJDmFBzznwpkDWJVyu28SZpj-ij8YzCxJNAehmauIn16xHc29sNBXvqZGb_bTvna5iRVrDGs5nKAS5ogdp2wj8A2KlykDDaWxjLNuDJzdtB8mlYQhPgWg_SvcGzzZDTnBd-nUmpymprcNXfBP5phS79DQMxFwTwoKZPQa_Q2hWkdBv2eKv5UajTaUb0Ax0UZ1MSx5lJNLTea-GsWmF5qLVFVykHOJH3DisAG0TaLo67J6YWMoxwwqyme'],
    categories: ['工具推荐'],
    timestamp: '昨天',
    likes: 120,
    comments: 5
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'like',
    sender: { name: '水电小李', avatar: 'https://picsum.photos/seed/user1/100' },
    content: '赞了你的帖子《今天去龙华面试...》',
    relatedId: 'p1',
    timestamp: '10分钟前',
    isRead: false
  },
  {
    id: 'n2',
    type: 'comment',
    sender: { name: '强哥装修', avatar: 'https://picsum.photos/seed/user2/100' },
    content: '评论了你：环境确实不错，加油！',
    relatedId: 'p1',
    timestamp: '30分钟前',
    isRead: false
  },
  {
    id: 'n3',
    type: 'system',
    sender: { name: 'OUTDOG官方', avatar: 'https://picsum.photos/seed/system/100' },
    content: '欢迎加入OUTDOG社区，请遵守社区公约。',
    timestamp: '1小时前',
    isRead: true
  },
  {
    id: 'n4',
    type: 'mention',
    sender: { name: '电子厂小妹', avatar: 'https://picsum.photos/seed/user3/100' },
    content: '在帖子中提到了你',
    relatedId: 'p2',
    timestamp: '3小时前',
    isRead: true
  }
];

export const MOCK_CHATS: ChatSession[] = [
  {
    id: 'c1',
    participant: { id: 'u2', name: '水电小李', avatar: 'https://picsum.photos/seed/worker1/100' },
    lastMessage: '老哥，明天那个工地还缺人吗？',
    timestamp: '14:20',
    unreadCount: 2
  },
  {
    id: 'c2',
    participant: { id: 'u3', name: '社区小助手', avatar: 'https://picsum.photos/seed/ai/100' },
    lastMessage: '您的帖子已被老王点赞，快去看看吧。',
    timestamp: '10:05',
    unreadCount: 0
  }
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  'c1': [
    { id: 'm1', senderId: 'u2', text: '老王，在吗？', timestamp: '14:15', isMe: false },
    { id: 'm2', senderId: 'u1', text: '在的，小李，怎么了？', timestamp: '14:16', isMe: true },
    { id: 'm3', senderId: 'u2', text: '老哥，明天那个工地还缺人吗？', timestamp: '14:20', isMe: false },
  ]
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'tool-set-1',
    name: '定制工具套装',
    description: '专为工友打造的专业级维修工具套装。包含扳手、钳子、螺丝刀等常用工具，采用高硬度铬钒钢制造，坚固耐用，不易生锈。',
    price: 299,
    originalPrice: 399,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0tgVAtLCvwh3HGnPSKJImNJDmFBzznwpkDWJVyu28SZpj-ij8YzCxJNAehmauIn16xHc29sNBXvqZGb_bTvna5iRVrDGs5nKAS5ogdp2wj8A2KlykDDaWxjLNuDJzdtB8mlYQhPgWg_SvcGzzZDTnBd-nUmpymprcNXfBP5phS79DQMxFwTwoKZPQa_Q2hWkdBv2eKv5UajTaUb0Ax0UZ1MSx5lJNLTea-GsWmF5qLVFVykHOJH3DisAG0TaLo67J6YWMoxwwqyme',
    badge: '热销榜 TOP1',
    specs: ['标准套装 (52件套)', '专业级铬钒钢'],
    features: ['人体工学手柄', '坚固收纳箱', '不易生锈'],
    detailImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAvAbrzPCW6OGfVV1_a3Y1Jr39UUBHC2_Z6moKAIBONp52EPd-M760Fq8-9lYphzF0SNy9GALOJrTXla8tjaAkZM6yXMWKzL4IN8vXb9r6zkmQHzCuUlKg3x7JYpq958ywXYqNvYfjsCw_4aS63MZYdpr8VlO35UsVN6XUkGvmsxIgBY5xnXL9usf-r1wLfejySpVqIip-0F1HMMnB-SZhYxErpuqj6pg1A8yweZQwX4XeKuFyT8iWm0bo56p5tYkNWT5xovDB5GPPF'
    ]
  }
];
