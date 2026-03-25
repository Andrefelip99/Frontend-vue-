<template>
  <div class="auth">
    <div class="panel">
      <p class="eyebrow">Macedo Farias</p>
      <h2>Bem-vindo de volta</h2>
      <p class="subtitle">Entre para acompanhar seus pedidos e finalizar compras.</p>

      <form @submit.prevent="login" class="form">
        <label>
          Email
          <input v-model="email" type="email" placeholder="seu@email.com" required />
        </label>
        <label>
          Senha
          <input v-model="password" type="password" placeholder="Digite sua senha" required />
        </label>
        <button class="btn primary" type="submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
      <p class="helper">Ainda nao tem conta? <router-link to="/register">Criar cadastro</router-link></p>
    </div>

    <div class="side">
      <h3>Doces feitos sob medida</h3>
      <p>
        Cadastre-se para receber novidades e garantir sua encomenda com rapidez.
      </p>
      <div class="highlight">
        <strong>Pix liberado</strong>
        <span>Finalize o pedido e receba o QR Code na hora.</span>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';
import { setUser, setAuthBasic } from '@/services/user';

export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      error: ''
    };
  },
  methods: {
    async login() {
      this.loading = true;
      this.error = '';
      try {
        const response = await api.post('/clients/login', {
          email: this.email,
          password: this.password
        });
        const authBasic = btoa(`${this.email}:${this.password}`);
        setAuthBasic(authBasic);
        setUser(response.data);
        this.$router.push('/products');
      } catch (e) {
        this.error = 'Email ou senha invalidos.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.auth {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  align-items: stretch;
}

.panel {
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 12px 26px rgba(28, 19, 11, 0.08);
}

.side {
  background: linear-gradient(135deg, #1c130b, #4b2f14);
  color: #fff7ea;
  border-radius: 18px;
  padding: 24px;
  display: grid;
  gap: 12px;
  align-content: start;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.7rem;
}

.subtitle {
  color: rgba(28, 19, 11, 0.7);
}

.form {
  margin-top: 18px;
  display: grid;
  gap: 14px;
}

label {
  display: grid;
  gap: 6px;
  font-size: 0.9rem;
}

input {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(28, 19, 11, 0.15);
}

.highlight {
  background: rgba(255, 255, 255, 0.12);
  padding: 12px;
  border-radius: 12px;
  display: grid;
  gap: 6px;
}

.helper {
  margin-top: 12px;
}

.error {
  color: #c0392b;
  margin-top: 8px;
}

.btn {
  border: none;
  background: #ffb347;
  color: #1c130b;
  padding: 12px 16px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.btn.primary {
  background: #1c130b;
  color: #fff7ea;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
