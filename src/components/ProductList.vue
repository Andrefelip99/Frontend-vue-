<template>
  <div class="page">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Macedo Farias</p>
        <h1>Confeitaria com sabor de casa</h1>
        <p class="lead">
          Doces feitos no cuidado, com ingredientes frescos e aquele toque especial
          que transforma qualquer momento em comemoracao.
        </p>
        <div class="hero-actions">
          <button class="btn primary" @click="scrollToGrid">Ver vitrine</button>
          <button class="btn ghost" @click="$router.push('/cart')">Ir para o carrinho</button>
        </div>
      </div>
      <div class="hero-card">
        <img class="hero-logo" src="/logo-da-marca.png" alt="Logo Macedo Farias" />
        <h3>Favoritos da semana</h3>
        <p>Brownies, brigadeiros gourmet e bolos especiais sob encomenda.</p>
        <ul>
          <li>Entrega rapida na regiao</li>
          <li>Retirada no local</li>
          <li>Pagamento Pix</li>
        </ul>
      </div>
    </section>

    <section class="toolbar">
      <div class="search">
        <input v-model="search" type="search" placeholder="Buscar doces, bolos e sobremesas" />
      </div>
      <div class="toolbar-actions">
        <button class="btn small" @click="refresh" :disabled="loading">
          {{ loading ? 'Carregando...' : 'Atualizar' }}
        </button>
        <button class="btn small ghost" @click="$router.push('/cart')">
          Ver carrinho
        </button>
      </div>
    </section>

    <section v-if="categories.length" class="categories">
      <span class="chip" v-for="cat in categories" :key="cat.id">
        {{ cat.name }}
      </span>
    </section>

    <section ref="grid" class="grid">
      <div v-if="error" class="state error">{{ error }}</div>
      <div v-else-if="loading" class="state">Carregando produtos...</div>
      <div v-else-if="!filteredProducts.length" class="state">
        Nenhum produto encontrado.
      </div>
      <article v-for="product in filteredProducts" :key="product.id" class="card">
        <div class="media">
          <img :src="product.imageUrl" :alt="product.name" />
          <span v-if="!product.active" class="tag">Indisponivel</span>
        </div>
        <div class="content">
          <h3>{{ product.name }}</h3>
          <p class="desc">{{ product.description }}</p>
          <div class="meta">
            <strong>{{ formatPrice(product.price) }}</strong>
            <button class="btn" :disabled="!product.active" @click="addToCart(product)">
              Adicionar
            </button>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script>
import api from '@/services/api';
import { addToCart as addItem } from '@/services/cart';

export default {
  data() {
    return {
      products: [],
      categories: [],
      search: '',
      loading: false,
      error: ''
    };
  },
  computed: {
    filteredProducts() {
      const term = this.search.trim().toLowerCase();
      if (!term) return this.products;
      return this.products.filter(p =>
        String(p.name).toLowerCase().includes(term) ||
        String(p.description).toLowerCase().includes(term)
      );
    }
  },
  async created() {
    await this.refresh();
  },
  methods: {
    async refresh() {
      this.loading = true;
      this.error = '';
      try {
        const productsRes = await api.get('/products');
        this.products = productsRes.data.content || productsRes.data;
      } catch (e) {
        this.error = 'Nao foi possivel carregar os produtos agora.';
      }
      try {
        const categoriesRes = await api.get('/categories');
        this.categories = categoriesRes.data || [];
      } catch (e) {
        this.categories = [];
      } finally {
        this.loading = false;
      }
    },
    addToCart(product) {
      addItem(product, 1);
      this.$router.push('/cart');
    },
    formatPrice(value) {
      const number = Number(value) || 0;
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(number);
    },
    scrollToGrid() {
      if (this.$refs.grid) {
        this.$refs.grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
};
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  align-items: center;
  background: linear-gradient(135deg, #fff3e2, #f8f1ff);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 18px 40px rgba(84, 51, 16, 0.12);
}

.hero-copy h1 {
  font-size: 2.4rem;
  margin: 8px 0 12px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.24em;
  font-size: 0.75rem;
  font-weight: 600;
}

.lead {
  font-size: 1.05rem;
  line-height: 1.6;
  max-width: 520px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.hero-card {
  background: #1c130b;
  color: #fff7ea;
  padding: 22px;
  border-radius: 18px;
  display: grid;
  gap: 12px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.hero-logo {
  width: 96px;
  height: 96px;
  object-fit: contain;
  border-radius: 50%;
  background: #fff3e2;
  padding: 6px;
}

.hero-card ul {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;
}

.hero-badge {
  background: #ffb347;
  color: #1c130b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  width: fit-content;
}

.toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.search input {
  width: min(460px, 90vw);
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(28, 19, 11, 0.15);
  background: rgba(255, 255, 255, 0.9);
}

.toolbar-actions {
  display: flex;
  gap: 10px;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 6px 12px;
  background: #f2e7d3;
  border-radius: 999px;
  font-size: 0.85rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(28, 19, 11, 0.08);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 30px rgba(28, 19, 11, 0.12);
}

.media {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tag {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #1c130b;
  color: #fff7ea;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
}

.content {
  padding: 16px;
  display: grid;
  gap: 10px;
}

.desc {
  color: rgba(28, 19, 11, 0.7);
  min-height: 40px;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.state {
  padding: 28px;
  text-align: center;
  color: rgba(28, 19, 11, 0.7);
}

.state.error {
  color: #c0392b;
}

.btn {
  border: none;
  background: #ffb347;
  color: #1c130b;
  padding: 10px 16px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.btn.primary {
  background: #1c130b;
  color: #fff7ea;
}

.btn.ghost {
  background: transparent;
  border: 1px solid rgba(28, 19, 11, 0.2);
}

.btn.small {
  padding: 8px 14px;
  font-size: 0.85rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 720px) {
  .hero {
    padding: 20px;
  }

  .hero-copy h1 {
    font-size: 2rem;
  }
}
</style>
