<template>
  <div class="page">
    <header class="header">
      <div>
        <p class="eyebrow">Painel Admin</p>
        <h2>Pedidos</h2>
        <p class="subtitle">Acompanhe os pedidos realizados pelos clientes.</p>
      </div>
      <button class="btn ghost" @click="$router.push('/products')">Voltar para produtos</button>
    </header>

    <section class="toolbar">
      <button class="btn small" @click="load" :disabled="loading">
        {{ loading ? 'Carregando...' : 'Atualizar lista' }}
      </button>
      <input v-model="search" type="search" placeholder="Buscar por cliente ou numero" />
    </section>

    <div v-if="error" class="state error">{{ error }}</div>
    <div v-else-if="loading" class="state">Carregando pedidos...</div>
    <div v-else-if="!filteredOrders.length" class="state">Nenhum pedido encontrado.</div>

    <section v-else class="grid">
      <article v-for="order in filteredOrders" :key="order.id" class="card">
        <div class="card-header">
          <div>
            <h3>Pedido #{{ order.id }}</h3>
            <p class="muted">{{ order.clientName }}</p>
            <p v-if="clientEmail(order)" class="muted">{{ clientEmail(order) }}</p>
            <p v-if="clientPhone(order)" class="muted">{{ formatPhone(clientPhone(order)) }}</p>
          </div>
          <span class="status">{{ order.status }}</span>
        </div>

        <div class="info">
          <p><strong>Total:</strong> {{ formatPrice(order.total) }}</p>
          <p><strong>Entrega:</strong> {{ deliveryLabel(order.deliveryType) }}</p>
          <p><strong>Data:</strong> {{ formatDate(order.deliveryDate) }}</p>
          <p v-if="order.deliveryFee"><strong>Frete:</strong> {{ formatPrice(order.deliveryFee) }}</p>
          <p v-if="order.zipCode"><strong>Endereco:</strong> {{ formatAddress(order) }}</p>
        </div>

        <div class="items">
          <p><strong>Itens:</strong></p>
          <ul v-if="order.items && order.items.length">
            <li v-for="item in order.items" :key="item.id">
              {{ item.productName }} x{{ item.quantity }}
            </li>
          </ul>
          <p v-else class="muted">Nenhum item encontrado.</p>
        </div>
      </article>
    </section>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'AdminOrders',
  data() {
    return {
      orders: [],
      loading: false,
      error: '',
      search: ''
    };
  },
  computed: {
    filteredOrders() {
      const term = this.search.trim().toLowerCase();
      if (!term) return this.orders;
      return this.orders.filter(order => {
        const byId = String(order.id).includes(term);
        const byName = String(order.clientName || '').toLowerCase().includes(term);
        const byEmail = String(this.clientEmail(order) || '').toLowerCase().includes(term);
        const byPhone = String(this.clientPhone(order) || '').toLowerCase().includes(term);
        return byId || byName || byEmail || byPhone;
      });
    }
  },
  created() {
    this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      this.error = '';
      try {
        const res = await api.get('/orders');
        this.orders = res.data || [];
      } catch (e) {
        this.error = 'Nao foi possivel carregar os pedidos.';
      } finally {
        this.loading = false;
      }
    },
    formatPrice(value) {
      const number = Number(value) || 0;
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(number);
    },
    deliveryLabel(value) {
      return value === 'RETIRADA_NO_LOCAL' ? 'Retirada no local' : 'Entrega';
    },
    formatDate(value) {
      if (!value) return '-';
      try {
        const date = new Date(value + 'T00:00:00');
        return new Intl.DateTimeFormat('pt-BR').format(date);
      } catch (e) {
        return value;
      }
    },
    formatAddress(order) {
      const parts = [];
      if (order.street) parts.push(order.street);
      if (order.number) parts.push(order.number);
      if (order.complement) parts.push(order.complement);
      if (order.neighborhood) parts.push(order.neighborhood);
      if (order.city) parts.push(order.city);
      if (order.state) parts.push(order.state);
      if (order.zipCode) parts.push(`CEP ${order.zipCode}`);
      return parts.join(' - ');
    },
    clientEmail(order) {
      return (
        order.clientEmail ||
        order.email ||
        order.client?.email ||
        order.client?.emailAddress ||
        ''
      );
    },
    clientPhone(order) {
      return (
        order.clientPhoneNumber ||
        order.phoneNumber ||
        order.phone ||
        order.client?.phoneNumber ||
        order.client?.phone ||
        ''
      );
    },
    formatPhone(value) {
      if (!value) return '';
      const digits = String(value).replace(/\D/g, '');
      if (digits.length === 9) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
      if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
      if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
      return value;
    }
  }
};
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  font-weight: 600;
}

.subtitle {
  color: rgba(28, 19, 11, 0.65);
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.toolbar input {
  flex: 1;
  min-width: 220px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(28, 19, 11, 0.2);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 10px 22px rgba(28, 19, 11, 0.08);
  display: grid;
  gap: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.status {
  background: #1c130b;
  color: #fff7ea;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.info {
  display: grid;
  gap: 6px;
}

.items ul {
  padding-left: 18px;
  margin: 6px 0 0;
  display: grid;
  gap: 6px;
}

.muted {
  color: rgba(28, 19, 11, 0.65);
}

.state {
  padding: 18px;
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

.btn.ghost {
  background: transparent;
  border: 1px solid rgba(28, 19, 11, 0.2);
}

.btn.small {
  padding: 8px 14px;
  font-size: 0.85rem;
}
</style>
