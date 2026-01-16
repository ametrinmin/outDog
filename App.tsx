
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './views/Home';
import PostDetail from './views/PostDetail';
import Shop from './views/Shop';
import ProductDetail from './views/ProductDetail';
import Profile from './views/Profile';
import Settings from './views/Settings';
import Publish from './views/Publish';
import Messages from './views/Messages';
import ChatRoom from './views/ChatRoom';
import Search from './views/Search';
import Notifications from './views/Notifications';
import FollowList from './views/FollowList';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/follow/:type" element={<FollowList />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/edit/:id" element={<Publish />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/chat/:id" element={<ChatRoom />} />
          <Route path="/search" element={<Search />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
