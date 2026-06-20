import { createBrowserRouter } from 'react-router-dom';
import FeedbackForm from './components/feedback/FeedbackForm'; // 引入反馈页面组件

// 设置 React Router 的未来标志
export const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

// 定义路由配置
export const getRouterConfig = () => {
  return createBrowserRouter([
    {
      path: '/feedback-form',
      element: <FeedbackForm /> // 添加反馈页面路由
    },
    // 其他路由可以在这里添加
  ]);
};