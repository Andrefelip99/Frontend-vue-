import { createRouter, createWebHashHistory } from 'vue-router';
import Login from '@/components/Login.vue';
import Register from '@/components/Register.vue';
import ProductList from '@/components/ProductList.vue';
import Cart from '@/components/Cart.vue';
import AdminProducts from '@/components/AdminProducts.vue';
import { getUser } from '@/services/user';

const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/products', component: ProductList },
  { path: '/cart', component: Cart },
  { path: '/admin/products', component: AdminProducts, meta: { requiresAdmin: true } },
  { path: '/', redirect: '/products' }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach((to, from, next) => {
  if (!to.meta?.requiresAdmin) {
    next();
    return;
  }
  const user = getUser();
  if (!user) {
    next('/login');
    return;
  }
  if (user.role !== 'ADMIN') {
    next('/products');
    return;
  }
  next();
});

export default router;
