import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器 - 自动附加 Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一错误处理
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        // Token 过期或无效,清除并跳转登录
        localStorage.removeItem('adminToken');
        localStorage.removeItem('isAdmin');
        if (window.location.pathname.includes('/admin')) {
          window.location.href = '/admin/login';
        }
      } else if (status === 403) {
        console.error('权限不足');
      }
      
      return Promise.reject(data || error.response);
    }
    
    return Promise.reject({ message: '网络错误' });
  }
);

export default api;
