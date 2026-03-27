<template>
  <div class="page">
    <header class="header">
      <div>
        <p class="eyebrow">Seu carrinho</p>
        <h2>Revise seu pedido</h2>
      </div>
      <button class="btn ghost" @click="$router.push('/products')">Continuar comprando</button>
    </header>

    <section v-if="!items.length" class="empty">
      <p>Seu carrinho esta vazio.</p>
      <button class="btn" @click="$router.push('/products')">Ver produtos</button>
    </section>

    <section v-else class="content">
      <div class="items">
        <article v-for="item in items" :key="item.productId" class="item">
          <img :src="item.imageUrl" :alt="item.name" />
          <div class="info">
            <h3>{{ item.name }}</h3>
            <p>{{ formatPrice(item.price) }}</p>
            <div class="qty">
              <label>Quantidade</label>
              <input type="number" min="1" :value="item.quantity" @input="onQtyChange(item.productId, $event)" />
            </div>
          </div>
          <div class="actions">
            <strong>{{ formatPrice(item.price * item.quantity) }}</strong>
            <button class="btn ghost" @click="remove(item.productId)">Remover</button>
          </div>
        </article>
      </div>

      <aside class="summary">
        <h3>Resumo</h3>
        <div class="row">
          <span>Subtotal</span>
          <span>{{ formatPrice(subtotal) }}</span>
        </div>
        <div class="row">
          <span>Entrega</span>
          <span>{{ formatPrice(deliveryFee) }}</span>
        </div>
        <div class="row total">
          <span>Total estimado</span>
          <span>{{ formatPrice(totalPreview) }}</span>
        </div>

        <div class="delivery">
          <p>Como voce prefere receber?</p>
          <label>
            <input type="radio" value="ENTREGA" v-model="deliveryType" /> Entrega
          </label>
          <label>
            <input type="radio" value="RETIRADA_NO_LOCAL" v-model="deliveryType" /> Retirada no local
          </label>
        </div>

        <div class="date">
          <label>Dia de entrega (minimo 48 horas)</label>
          <input type="date" v-model="deliveryDate" :min="minDeliveryDate" required />
        </div>

        <button class="btn primary" @click="checkout" :disabled="processing">
          {{ processing ? 'Processando...' : 'Finalizar e gerar Pix' }}
        </button>
        <p v-if="!user" class="hint">Entre com sua conta para finalizar.</p>
        <p v-if="error" class="error">{{ error }}</p>
      </aside>
    </section>

    <section v-if="order" class="order">
      <h3>Pedido criado</h3>
      <div class="order-grid">
        <div>
          <p><strong>Numero:</strong> {{ order.id }}</p>
          <p><strong>Status:</strong> {{ order.status }}</p>
          <p><strong>Total:</strong> {{ formatPrice(order.total) }}</p>
          <p><strong>Entrega:</strong> {{ deliveryLabel(order.deliveryType) }}</p>
          <p><strong>Data:</strong> {{ formatDate(order.deliveryDate) }}</p>
        </div>
        <div>
          <p><strong>Itens:</strong></p>
          <ul v-if="order.items && order.items.length">
            <li v-for="item in order.items" :key="item.id">
              {{ item.productName }} x{{ item.quantity }}
            </li>
          </ul>
          <p v-else>Nenhum item encontrado.</p>
        </div>
      </div>
    </section>

    <section v-if="payment" class="payment">
      <div class="payment-card">
        <div class="payment-info">
          <h3>Pagamento Pix</h3>
          <p>Escaneie o QR Code ou copie o codigo abaixo para pagar.</p>
          <p class="status">Status: {{ payment.status }}</p>
          <textarea readonly :value="payment.qrCode"></textarea>
          <button class="btn" @click="copyQr">Copiar codigo</button>
        </div>
        <div class="payment-qr" v-if="payment.qrCodeBase64">
          <img :src="`data:image/png;base64,${payment.qrCodeBase64}`" alt="QR Code Pix" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import api from '@/services/api';
import { getCart, updateQuantity, removeFromCart, clearCart, getCartSubtotal } from '@/services/cart';
import { getUser } from '@/services/user';

export default {
  name: 'CartView',
  data() {
    return {
      items: [],
      deliveryType: 'ENTREGA',
      deliveryDate: '',
      minDeliveryDate: '',
      order: null,
      payment: null,
      processing: false,
      error: '',
      user: null
    };
  },
  computed: {
    subtotal() {
      return getCartSubtotal();
    },
    deliveryFee() {
      return this.deliveryType === 'ENTREGA' ? 6 : 0;
    },
    totalPreview() {
      return this.subtotal + this.deliveryFee;
    }
  },
  created() {
    this.user = getUser();
    this.items = getCart();
    const min = this.addDays(new Date(), 2);
    this.minDeliveryDate = this.formatInputDate(min);
    this.deliveryDate = this.minDeliveryDate;
  },
  methods: {
    onQtyChange(productId, event) {
      const qty = Number(event.target.value) || 1;
      this.items = updateQuantity(productId, qty);
    },
    remove(productId) {
      this.items = removeFromCart(productId);
    },
    async checkout() {
      if (!this.user) {
        this.$router.push('/login');
        return;
      }
      if (!this.items.length || this.processing) {
        return;
      }
      this.processing = true;
      this.error = '';
      this.order = null;
      this.payment = null;
      try {
        const orderPayload = {
          clientId: this.user.id,
          deliveryType: this.deliveryType,
          deliveryDate: this.deliveryDate
        };
        const orderRes = await api.post('/orders', orderPayload);
        this.order = orderRes.data;

        for (const item of this.items) {
          await api.post(`/orders/${this.order.id}/items`, {
            productId: item.productId,
            quantity: item.quantity
          });
        }

        const updatedOrder = await api.get(`/orders/${this.order.id}`);
        this.order = updatedOrder.data;

        const paymentRes = await api.post(`/payments/${this.order.id}`);
        this.payment = paymentRes.data;

        clearCart();
        this.items = [];
      } catch (e) {
        this.error = 'Erro ao finalizar o pedido. Tente novamente.';
      } finally {
        this.processing = false;
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
    addDays(date, days) {
      const copy = new Date(date);
      copy.setDate(copy.getDate() + days);
      return copy;
    },
    formatInputDate(date) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    },
    async copyQr() {
      if (!this.payment || !this.payment.qrCode) return;
      try {
        await navigator.clipboard.writeText(this.payment.qrCode);
      } catch (e) {
        this.error = 'Nao foi possivel copiar o codigo.';
      }
    }
  }
};
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.75rem;
}

.content {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(240px, 1fr);
  gap: 24px;
}

.items {
  display: grid;
  gap: 16px;
}

.item {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 16px;
  align-items: center;
  background: #fff;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 10px 22px rgba(28, 19, 11, 0.08);
}

.item img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
}

.info {
  display: grid;
  gap: 8px;
}

.qty {
  display: grid;
  gap: 6px;
  max-width: 120px;
}

.qty input {
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid rgba(28, 19, 11, 0.2);
}

.actions {
  display: grid;
  gap: 10px;
  justify-items: end;
}

.summary {
  background: #fff7ea;
  padding: 18px;
  border-radius: 18px;
  box-shadow: 0 10px 22px rgba(28, 19, 11, 0.08);
  display: grid;
  gap: 12px;
  align-content: start;
}

.row {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
}

.row.total {
  font-weight: 700;
  border-top: 1px dashed rgba(28, 19, 11, 0.2);
  padding-top: 10px;
}

.delivery {
  display: grid;
  gap: 6px;
  margin: 10px 0;
}

.date {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
}

.date input {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(28, 19, 11, 0.2);
}

.delivery label {
  display: flex;
  gap: 8px;
  align-items: center;
}

.empty {
  text-align: center;
  padding: 32px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 10px 22px rgba(28, 19, 11, 0.08);
}

.order {
  background: #fff;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 10px 22px rgba(28, 19, 11, 0.08);
}

.order-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.order ul {
  padding-left: 18px;
  margin: 0;
  display: grid;
  gap: 6px;
}

.payment {
  background: #1c130b;
  color: #fff7ea;
  border-radius: 20px;
  padding: 20px;
}

.payment-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  align-items: center;
}

.payment-info textarea {
  width: 100%;
  min-height: 120px;
  padding: 10px;
  border-radius: 12px;
  border: none;
  resize: none;
  font-family: inherit;
  background: #fff;
  color: #1c130b;
}

.payment-qr img {
  width: 100%;
  max-width: 220px;
  background: #fff;
  padding: 12px;
  border-radius: 12px;
}

.status {
  font-weight: 600;
  margin-bottom: 10px;
}

.hint {
  font-size: 0.85rem;
  color: rgba(28, 19, 11, 0.6);
}

.error {
  color: #c0392b;
  font-size: 0.9rem;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .content {
    grid-template-columns: 1fr;
  }

  .item {
    grid-template-columns: 1fr;
  }

  .actions {
    justify-items: start;
  }
}
</style>
