<template>
  <div class="auth">
    <div class="panel">
      <p class="eyebrow">Cadastro</p>
      <h2>Crie sua conta</h2>
      <p class="subtitle">Atendimento rapido para seus pedidos favoritos.</p>

      <form @submit.prevent="register" class="form">
        <label>
          Nome completo
          <input
            id="register-name"
            name="name"
            v-model="name"
            placeholder="Seu nome"
            minlength="2"
            maxlength="20"
            autocomplete="name"
            required
          />
        </label>
        <label>
          Email
          <input
            id="register-email"
            name="email"
            v-model="email"
            type="email"
            placeholder="seu@email.com"
            minlength="5"
            maxlength="50"
            autocomplete="email"
            required
          />
        </label>
        <label>
          Telefone
          <input
            id="register-phone"
            name="phoneNumber"
            v-model="phoneNumber"
            placeholder="999999999"
            minlength="9"
            maxlength="15"
            inputmode="numeric"
            pattern="\\d{9,15}"
            autocomplete="tel"
            required
          />
        </label>
        <label>
          Senha
          <input
            id="register-password"
            name="password"
            v-model="password"
            type="password"
            placeholder="Minimo 6 caracteres"
            minlength="6"
            maxlength="20"
            autocomplete="new-password"
            required
          />
        </label>
        <button class="btn primary" type="submit" :disabled="loading">
          {{ loading ? 'Enviando...' : 'Criar conta' }}
        </button>
      </form>
      <div class="rules">
        <p class="rules-title">Regras do cadastro</p>
        <ul>
          <li>Nome: 2 a 20 caracteres.</li>
          <li>Email: 5 a 50 caracteres.</li>
          <li>Telefone: 9 a 15 numeros (DDD opcional; salvamos sem DDD).</li>
          <li>Senha: 6 a 20 caracteres.</li>
        </ul>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <p class="helper">Ja tem conta? <router-link to="/login">Entrar</router-link></p>
    </div>

    <div class="side">
      <h3>Vantagens de se cadastrar</h3>
      <ul>
        <li>Salve seus pedidos favoritos</li>
        <li>Finalizacao rapida no Pix</li>
        <li>Receba novidades e combos</li>
      </ul>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'RegisterView',
  data() {
    return {
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      loading: false,
      error: ''
    };
  },
  methods: {
    async register() {
      this.loading = true;
      this.error = '';
      try {
        const digitsOnly = (this.phoneNumber || '').replace(/\D/g, '');
        const normalizedPhone =
          digitsOnly.length > 9 ? digitsOnly.slice(-9) : digitsOnly;
        await api.post('/clients', {
          name: this.name,
          email: this.email,
          phoneNumber: normalizedPhone,
          password: this.password
        });
        this.$router.push('/login');
      } catch (e) {
        const apiMessage = e?.response?.data?.message;
        this.error = apiMessage
          ? apiMessage.replace(/;\s*/g, '\n').trim()
          : 'Nao foi possivel concluir o cadastro.';
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
  background: #fff3e2;
  border-radius: 18px;
  padding: 24px;
  display: grid;
  gap: 12px;
}

.side ul {
  padding-left: 18px;
  margin: 0;
  display: grid;
  gap: 8px;
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

.helper {
  margin-top: 12px;
}

.error {
  color: #c0392b;
  margin-top: 8px;
  white-space: pre-line;
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

.rules {
  margin-top: 16px;
  background: #fff7ea;
  border-radius: 12px;
  padding: 12px;
  font-size: 0.85rem;
}

.rules-title {
  font-weight: 600;
  margin-bottom: 6px;
}
</style>
