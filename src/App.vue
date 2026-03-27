<template>
  <div id="app" class="app">
    <header class="site-header">
      <div class="brand" @click="$router.push('/products')">
        <img class="brand-logo" :src="`${publicPath}logo-da-marca.png`" alt="Logo Macedo Farias" />
        <div>
          <strong>Macedo Farias</strong>
          <small>Confeitaria</small>
        </div>
      </div>
      <nav class="nav">
        <router-link to="/products">Produtos</router-link>
        <router-link to="/cart">Carrinho ({{ cartCount }})</router-link>
        <router-link v-if="user && user.role === 'ADMIN'" to="/admin/products">Admin</router-link>
        <router-link to="/login" v-if="!user">Login</router-link>
        <router-link to="/register" v-if="!user">Registrar</router-link>
        <button v-if="user" class="btn ghost" @click="logout">Sair</button>
      </nav>
    </header>

    <main class="main">
      <router-view />
    </main>

    <footer class="footer">
      <div>
        <strong>Macedo Farias</strong>
        <p>Confeitaria com carinho, do nosso forno para sua mesa.</p>
      </div>
      <div>
        <p class="credit">Desenvolvido por: Andre Felipe</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { getCartCount } from '@/services/cart';
import { getUser, clearUser } from '@/services/user';

export default {
  name: 'App',
  data() {
    return {
      cartCount: 0,
      user: null,
      publicPath: process.env.BASE_URL
    };
  },
  created() {
    this.refreshState();
  },
  mounted() {
    window.addEventListener('cart-updated', this.refreshState);
    window.addEventListener('user-updated', this.refreshState);
  },
  beforeUnmount() {
    window.removeEventListener('cart-updated', this.refreshState);
    window.removeEventListener('user-updated', this.refreshState);
  },
  watch: {
    $route() {
      this.refreshState();
    }
  },
  methods: {
    refreshState() {
      this.cartCount = getCartCount();
      this.user = getUser();
    },
    logout() {
      clearUser();
      this.refreshState();
      this.$router.push('/products');
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Manrope:wght@300;400;500;600&display=swap');

:root {
  color-scheme: light;
  --bg: #f7f1e7;
  --text: #1c130b;
  --muted: rgba(28, 19, 11, 0.65);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: radial-gradient(circle at top left, #fff1d6, #f7f1e7 40%, #efe8dd 100%);
  color: var(--text);
  font-family: 'Manrope', sans-serif;
}

h1, h2, h3, h4 {
  font-family: 'Fraunces', serif;
  margin: 0;
}

p {
  margin: 0;
}

a {
  color: inherit;
  text-decoration: none;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 8vw;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(12px);
  background: rgba(247, 241, 231, 0.8);
  border-bottom: 1px solid rgba(28, 19, 11, 0.08);
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  cursor: pointer;
}

.brand-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.brand small {
  color: var(--muted);
}

.nav {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.nav a.router-link-active {
  font-weight: 700;
}

.main {
  flex: 1;
  padding: 32px 8vw 48px;
}

.footer {
  padding: 28px 8vw 36px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  border-top: 1px solid rgba(28, 19, 11, 0.08);
}

.credit {
  font-size: 0.85rem;
  color: var(--muted);
}

.btn {
  border: none;
  background: #ffb347;
  color: #1c130b;
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.btn.ghost {
  background: transparent;
  border: 1px solid rgba(28, 19, 11, 0.2);
}

@media (max-width: 720px) {
  .site-header {
    flex-direction: column;
    gap: 12px;
  }

  .main {
    padding: 24px 6vw 40px;
  }
}
</style>
