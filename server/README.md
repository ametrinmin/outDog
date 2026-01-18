# OUTDOG Backend API 使用指南

## 快速启动

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置必要的环境变量：
```
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_secret_key_change_in_production
PORT=3001
```

### 3. 初始化数据库并添加种子数据

```bash
npm run seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3001` 启动。

---

## API 端点总览

### 认证系统 (`/api/auth`)
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 登出

### 用户管理 (`/api/users`)
- `GET /api/users/:id` - 获取用户资料
- `PUT /api/users/:id` - 更新用户资料
- `POST /api/users/:id/follow` - 关注用户
- `DELETE /api/users/:id/follow` - 取消关注
- `GET /api/users/:id/followers` - 获取粉丝列表
- `GET /api/users/:id/following` - 获取关注列表

### 帖子系统 (`/api/posts`)
- `GET /api/posts` - 获取帖子列表
- `GET /api/posts/:id` - 获取单个帖子
- `POST /api/posts` - 创建帖子
- `PUT /api/posts/:id` - 更新帖子
- `DELETE /api/posts/:id` - 删除帖子
- `POST /api/posts/:id/like` - 点赞帖子
- `DELETE /api/posts/:id/like` - 取消点赞

### 评论系统
- `GET /api/posts/:postId/comments` - 获取评论
- `POST /api/posts/:postId/comments` - 添加评论
- `PUT /api/posts/comments/:id` - 更新评论
- `DELETE /api/posts/comments/:id` - 删除评论
- `POST /api/posts/comments/:id/like` - 点赞评论

### 商品系统 (`/api/products`)
- `GET /api/products` - 获取所有商品
- `GET /api/products/:id` - 获取商品详情

### 购物车 (`/api/cart`)
- `GET /api/cart` - 获取购物车
- `POST /api/cart/items` - 添加商品到购物车
- `PUT /api/cart/items/:id` - 更新购物车商品数量
- `DELETE /api/cart/items/:id` - 移除购物车商品
- `DELETE /api/cart` - 清空购物车

### 订单系统 (`/api/orders`)
- `GET /api/orders` - 获取订单列表
- `GET /api/orders/:id` - 获取订单详情
- `POST /api/orders` - 创建订单
- `PUT /api/orders/:id/status` - 更新订单状态
- `POST /api/orders/:id/review` - 添加订单评价

### 消息系统 (`/api/messages`)
- `GET /api/messages/sessions` - 获取聊天会话
- `GET /api/messages/sessions/:id` - 获取会话消息
- `POST /api/messages` - 发送消息
- `PUT /api/messages/:id/read` - 标记消息已读

### 通知系统 (`/api/notifications`)
- `GET /api/notifications` - 获取通知
- `PUT /api/notifications/:id/read` - 标记通知已读
- `PUT /api/notifications/read-all` - 标记所有通知已读

### 搜索 (`/api/search`)
- `GET /api/search?q=关键词&type=all` - 搜索内容

---

## 认证说明

大多数 API 端点需要 JWT 认证。在请求头中包含：

```
Authorization: Bearer <your_jwt_token>
```

登录或注册成功后，服务器会返回 JWT token，需要保存并在后续请求中使用。

---

## 数据库

使用 SQLite 数据库，数据文件：`server/outdog.db`

数据库包含以下表：
- users - 用户信息
- posts - 帖子
- comments - 评论
- likes - 点赞
- follows - 关注关系
- products - 商品
- cart_items - 购物车
- orders - 订单
- order_items - 订单项
- order_reviews - 订单评价
- chat_sessions - 聊天会话
- messages - 消息
- notifications - 通知
