import { createRouter, createWebHashHistory } from 'vue-router';
import ProductList from './components/ProductList.vue';
import Login from './components/Login.vue';
import AdminProducts from './components/AdminProducts.vue';
import { getToken } from './services/auth';

const router = createRouter({ history: createWebHashHistory(), routes: [
  { path: '/', name: 'catalog', component: ProductList },
  { path: '/products/:id', name: 'product-detail', component: ProductList },
  { path: '/login', name: 'login', component: Login },
  { path: '/admin', name: 'admin', component: AdminProducts, meta: { requiresAuth: true } },
  { path: '/admin/products', redirect: '/admin' }
], scrollBehavior: () => ({ top: 0 }) });
router.beforeEach((to) => to.meta.requiresAuth && !getToken() ? { name: 'login', query: { redirect: to.fullPath } } : true);
export default router;
