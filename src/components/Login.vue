<template>
  <div class="login-page"><form class="login-form" @submit.prevent="submit"><RouterLink class="back-link" to="/"><ArrowLeft :size="16" /> Voltar à vitrine</RouterLink><div><p class="eyebrow">Área reservada</p><h2>Bem-vindo de volta</h2><p class="muted">Entre para cuidar dos produtos da sua vitrine.</p></div><label>E-mail<input v-model.trim="email" type="email" autocomplete="email" required /></label><label>Senha<input v-model="password" type="password" autocomplete="current-password" minlength="4" required /></label><p v-if="error" class="form-error" role="alert">{{ error }}</p><button class="button button-dark full" type="submit" :disabled="loading">{{ loading ? 'Conectando...' : 'Entrar no painel' }} <ArrowRight :size="16" /></button></form></div>
</template>
<script setup lang="ts">
import { ref } from 'vue'; import { useRoute, useRouter, RouterLink } from 'vue-router'; import { ArrowLeft, ArrowRight } from 'lucide-vue-next'; import { login } from '../services/auth'; import { messageFromError } from '../services/api';
const email = ref(''); const password = ref(''); const loading = ref(false); const error = ref(''); const router = useRouter(); const route = useRoute();
async function submit() { loading.value = true; error.value = ''; try { await login(email.value, password.value); await router.push(typeof route.query.redirect === 'string' ? route.query.redirect : '/admin'); } catch (reason) { error.value = messageFromError(reason, 'E-mail ou senha inválidos.'); } finally { loading.value = false; } }
</script>

<style scoped>
.login-page {
  grid-template-columns: minmax(280px, 520px);
  justify-content: center;
}
</style>
