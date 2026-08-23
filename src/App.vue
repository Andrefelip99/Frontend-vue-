<template>
  <div class="app-shell">
    <header class="topbar">
      <RouterLink class="brand" to="/">
        <span class="brand-mark">MF</span>
        <span><strong>Macedo Farias</strong><small>Confeitaria artesanal</small></span>
      </RouterLink>
      <nav class="topnav" aria-label="Navegacao principal">
        <RouterLink to="/">Vitrine</RouterLink>
        <RouterLink v-if="isAdmin" to="/admin">Gestao</RouterLink>
        <button v-if="isAdmin" class="nav-logout" type="button" @click="logout">Sair</button>
      </nav>
    </header>
    <main><RouterView /></main>
    <RouterLink v-if="!isAdmin && route.name !== 'login'" class="lock-access" to="/login" aria-label="Acesso administrativo" title="Acesso administrativo">
      <LockKeyhole :size="17" aria-hidden="true" />
    </RouterLink>
    <footer class="site-footer"><span>Macedo Farias</span><span>Desenvolvido por Andre Felipe</span></footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { LockKeyhole } from 'lucide-vue-next';
import { clearSession, getToken } from './services/auth';

const route = useRoute();
const router = useRouter();
const authenticated = ref(Boolean(getToken()));
const isAdmin = computed(() => authenticated.value);
const refresh = () => { authenticated.value = Boolean(getToken()); };
function logout() { clearSession(); refresh(); router.push('/'); }
onMounted(() => window.addEventListener('auth-changed', refresh));
onUnmounted(() => window.removeEventListener('auth-changed', refresh));
</script>
