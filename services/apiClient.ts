import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/#/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data: { name: string; email?: string; password: string; avatar?: string; bio?: string }) =>
        apiClient.post('/auth/register', data),
    login: (data: { name: string; password: string }) =>
        apiClient.post('/auth/login', data),
    getMe: () =>
        apiClient.get('/auth/me'),
    logout: () =>
        apiClient.post('/auth/logout')
};

// User API
export const userAPI = {
    getUser: (id: string) =>
        apiClient.get(`/users/${id}`),
    updateUser: (id: string, data: any) =>
        apiClient.put(`/users/${id}`, data),
    followUser: (id: string) =>
        apiClient.post(`/users/${id}/follow`),
    unfollowUser: (id: string) =>
        apiClient.delete(`/users/${id}/follow`),
    getFollowers: (id: string) =>
        apiClient.get(`/users/${id}/followers`),
    getFollowing: (id: string) =>
        apiClient.get(`/users/${id}/following`)
};

// Post API
export const postAPI = {
    getPosts: (params?: { category?: string; page?: number; limit?: number }) =>
        apiClient.get('/posts', { params }),
    getPost: (id: string) =>
        apiClient.get(`/posts/${id}`),
    createPost: (data: { title: string; content: string; images?: string[]; categories?: string[] }) =>
        apiClient.post('/posts', data),
    updatePost: (id: string, data: any) =>
        apiClient.put(`/posts/${id}`, data),
    deletePost: (id: string) =>
        apiClient.delete(`/posts/${id}`),
    likePost: (id: string) =>
        apiClient.post(`/posts/${id}/like`),
    unlikePost: (id: string) =>
        apiClient.delete(`/posts/${id}/like`)
};

// Comment API
export const commentAPI = {
    getComments: (postId: string) =>
        apiClient.get(`/posts/${postId}/comments`),
    addComment: (postId: string, data: { content: string; parentId?: string; replyToName?: string }) =>
        apiClient.post(`/posts/${postId}/comments`, data),
    updateComment: (id: string, data: { content: string }) =>
        apiClient.put(`/posts/comments/${id}`, data),
    deleteComment: (id: string) =>
        apiClient.delete(`/posts/comments/${id}`),
    likeComment: (id: string) =>
        apiClient.post(`/posts/comments/${id}/like`)
};

// Product API
export const productAPI = {
    getProducts: () =>
        apiClient.get('/products'),
    getProduct: (id: string) =>
        apiClient.get(`/products/${id}`)
};

// Cart API
export const cartAPI = {
    getCart: () =>
        apiClient.get('/cart'),
    addToCart: (data: { productId: string; quantity?: number; spec?: string }) =>
        apiClient.post('/cart/items', data),
    updateCartItem: (id: string, data: { quantity: number }) =>
        apiClient.put(`/cart/items/${id}`, data),
    removeFromCart: (id: string) =>
        apiClient.delete(`/cart/items/${id}`),
    clearCart: () =>
        apiClient.delete('/cart')
};

// Order API
export const orderAPI = {
    getOrders: () =>
        apiClient.get('/orders'),
    getOrder: (id: string) =>
        apiClient.get(`/orders/${id}`),
    createOrder: () =>
        apiClient.post('/orders'),
    updateOrderStatus: (id: string, status: string) =>
        apiClient.put(`/orders/${id}/status`, { status }),
    addReview: (id: string, data: { rating: number; content?: string; tags?: string[] }) =>
        apiClient.post(`/orders/${id}/review`, data)
};

// Message API
export const messageAPI = {
    getSessions: () =>
        apiClient.get('/messages/sessions'),
    getMessages: (sessionId: string) =>
        apiClient.get(`/messages/sessions/${sessionId}`),
    sendMessage: (data: { recipientId: string; text: string }) =>
        apiClient.post('/messages', data),
    markAsRead: (id: string) =>
        apiClient.put(`/messages/${id}/read`)
};

// Notification API
export const notificationAPI = {
    getNotifications: () =>
        apiClient.get('/notifications'),
    markAsRead: (id: string) =>
        apiClient.put(`/notifications/${id}/read`),
    markAllAsRead: () =>
        apiClient.put('/notifications/read-all')
};

// Search API
export const searchAPI = {
    search: (params: { q: string; type?: 'all' | 'posts' | 'users' | 'products' }) =>
        apiClient.get('/search', { params })
};

export default apiClient;
