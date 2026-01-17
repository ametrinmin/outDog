
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 强制将窗口滚动到顶部
    window.scrollTo(0, 0);
    
    // 兼容某些具有 overflow 容器的布局
    const mainContainers = document.querySelectorAll('.overflow-y-auto');
    mainContainers.forEach(container => {
      container.scrollTop = 0;
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
