
import { Post, Product, User, ChatSession, Message, Notification, Order } from './types';

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
    id: 'p0',
    author: { name: 'OUTDOG官方', avatar: 'https://picsum.photos/seed/system/100' },
    title: '社区文明公约及互助准则',
    content: '欢迎各位工友加入！为了营造良好的交流环境，请大家务必遵守本公约。严禁发布任何虚假招聘、中介诈骗及违法信息。所有违规内容将被立即删除并禁言账号。',
    images: [],
    categories: ['安全教育'],
    timestamp: '官方置顶',
    likes: 999,
    comments: 88,
    isPinned: true,
    isMuted: true 
  },
  {
    id: 'p1',
    author: { name: '老王闯深圳', avatar: CURRENT_USER.avatar },
    title: '今天去龙华面试，顺便拍了下这边的环境',
    content: '今天特意跑了一趟龙华，环境比我想象中要好一些。路边的绿化做得不错，人流量也很大。面试了一个电子厂，福利待遇看着还行，有老哥在里面的吗？',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAtGh3KPNBtTtfKdR8R3UT7KBBPXBKVCb4vdtUbVzrGfEPEIemRfazDV-uCaPzyL-e1bPHddGcI6yFDjGJGAj8hnMB74YC9KQ8pqtKGOhMk4NJze3T4JTvG1fYlWONTFo9txkiBSW3gPu8663EJ7z9zxEORI6Bcop4gURK1uCQh-cYamuiq0BPES-EVvLGQR8RRrrRahPuco-e1ExX-h6kbMkS0GjAn_a3nWgj9-8A4C-OWOYdoX68Wl8epBTwgJZr1e9BdR4J4NE9T'],
    categories: ['工作互助', '生活闲聊'],
    timestamp: '1小时前',
    likes: 45,
    comments: 12
  },
  {
    id: 'p2',
    author: { name: '法律先锋', avatar: 'https://picsum.photos/seed/legal/100' },
    title: '【法律科普】被克扣加班费怎么办？',
    content: '最近收到很多工友私信，问关于工厂克扣加班费的问题。记住：保留好工资条、考勤表截图和工作群记录！这些都是法律维权的关键证据。如果遇到纠纷，第一时间去当地劳动局申诉。',
    images: [],
    categories: ['法律咨询'],
    timestamp: '2小时前',
    likes: 320,
    comments: 45
  },
  {
    id: 'p3',
    author: { name: '电工阿强', avatar: 'https://picsum.photos/seed/worker1/100' },
    title: '分享一把用了三年的剥线钳，真心耐操',
    content: '做电工这些年，换了不知道多少把钳子，只有这把老牌子的剥线钳跟了我三年还没坏。刀口依旧锋利，手柄握感也舒服。工友们有需要的可以看看，真心推荐！',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuB0tgVAtLCvwh3HGnPSKJImNJDmFBzznwpkDWJVyu28SZpj-ij8YzCxJNAehmauIn16xHc29sNBXvqZGb_bTvna5iRVrDGs5nKAS5ogdp2wj8A2KlykDDaWxjLNuDJzdtB8mlYQhPgWg_SvcGzzZDTnBd-nUmpymprcNXfBP5phS79DQMxFwTwoKZPQa_Q2hWkdBv2eKv5UajTaUb0Ax0UZ1MSx5lJNLTea-GsWmF5qLVFVykHOJH3DisAG0TaLo67J6YWMoxwwqyme'],
    categories: ['工具推荐'],
    timestamp: '4小时前',
    likes: 156,
    comments: 28
  },
  {
    id: 'p4',
    author: { name: '快乐的小厂妹', avatar: 'https://picsum.photos/seed/girl1/100' },
    title: '周日休息，跟舍友一起去爬了凤凰山',
    content: '虽然爬山很累，但是山顶的风景真的很治愈！深漂的生活虽然忙碌，但也要学会寻找一点点甜。大家今天都去哪里玩了呀？',
    images: ['https://picsum.photos/seed/mountain/800/600'],
    categories: ['七彩生活'],
    timestamp: '5小时前',
    likes: 210,
    comments: 56
  },
  {
    id: 'p5',
    author: { name: '装修老李', avatar: 'https://picsum.photos/seed/worker2/100' },
    title: '紧急求助：南山这边有个活，缺两个木工师傅',
    content: '手里有个家装的活，工期挺紧的，目前缺两个手脚麻利的木工师傅。待遇面谈，管饭。有空的兄弟联系我！',
    images: [],
    categories: ['工作互助'],
    timestamp: '8小时前',
    likes: 12,
    comments: 15
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'system',
    sender: { name: 'OUTDOG官方', avatar: 'https://picsum.photos/seed/system/100' },
    content: '你的置顶帖子《社区文明公约》已被系统开启评论禁言模式。',
    relatedId: 'p0',
    timestamp: '1小时前',
    isRead: false
  },
  {
    id: 'n2',
    type: 'like',
    sender: { name: '水电工强哥', avatar: 'https://picsum.photos/seed/worker2/100' },
    content: '赞了你的帖子《今天去龙华面试，顺便拍了下这边的环境》',
    relatedId: 'p1',
    timestamp: '30分钟前',
    isRead: false
  },
  {
    id: 'n3',
    type: 'comment',
    sender: { name: '水电小李', avatar: 'https://picsum.photos/seed/user1/100' },
    content: '在你的帖子下评论了：老哥说得对，这地方确实机会多...',
    relatedId: 'p1',
    commentId: 'c1', // 对应 PostDetail.tsx 里的模拟评论ID
    timestamp: '10分钟前',
    isRead: false
  }
];

export const MOCK_CHATS: ChatSession[] = [
  {
    id: 'c1',
    participant: { id: 'u2', name: '水电小李', avatar: 'https://picsum.photos/seed/worker1/100' },
    lastMessage: '老哥，明天那个工地还缺人吗？',
    timestamp: '14:20',
    unreadCount: 2
  }
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  'c1': [
    { id: 'm1', senderId: 'u2', text: '老哥，明天那个工地还缺人吗？', timestamp: '14:20', isMe: false },
  ]
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'tool-set-1',
    name: '定制工具套装',
    description: '专为工友打造的专业级维修工具套装。',
    price: 299,
    originalPrice: 399,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0tgVAtLCvwh3HGnPSKJImNJDmFBzznwpkDWJVyu28SZpj-ij8YzCxJNAehmauIn16xHc29sNBXvqZGb_bTvna5iRVrDGs5nKAS5ogdp2wj8A2KlykDDaWxjLNuDJzdtB8mlYQhPgWg_SvcGzzZDTnBd-nUmpymprcNXfBP5phS79DQMxFwTwoKZPQa_Q2hWkdBv2eKv5UajTaUb0Ax0UZ1MSx5lJNLTea-GsWmF5qLVFVykHOJH3DisAG0TaLo67J6YWMoxwwqyme',
    badge: '热销榜 TOP1',
    specs: ['标准套装 (52件套)']
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-20231024-001',
    timestamp: '2023-10-24 14:30',
    status: 'delivered',
    totalAmount: 299,
    items: [
      {
        productId: 'tool-set-1',
        productName: '定制工具套装',
        productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0tgVAtLCvwh3HGnPSKJImNJDmFBzznwpkDWJVyu28SZpj-ij8YzCxJNAehmauIn16xHc29sNBXvqZGb_bTvna5iRVrDGs5nKAS5ogdp2wj8A2KlykDDaWxjLNuDJzdtB8mlYQhPgWg_SvcGzzZDTnBd-nUmpymprcNXfBP5phS79DQMxFwTwoKZPQa_Q2hWkdBv2eKv5UajTaUb0Ax0UZ1MSx5lJNLTea-GsWmF5qLVFVykHOJH3DisAG0TaLo67J6YWMoxwwqyme',
        price: 299,
        quantity: 1,
        spec: '标准套装 (52件套)'
      }
    ]
  }
];
