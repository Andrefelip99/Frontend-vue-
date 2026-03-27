<template>
  <div class="page">
    <header class="header">
      <div>
        <p class="eyebrow">Painel Admin</p>
        <h2>Gerenciar produtos</h2>
        <p class="subtitle">Crie, atualize e organize a vitrine da confeitaria.</p>
      </div>
      <button class="btn ghost" @click="goBack">Voltar para produtos</button>
    </header>

    <section class="form-card">
      <h3>{{ form.id ? 'Editar produto' : 'Novo produto' }}</h3>
      <form class="form" @submit.prevent="submit">
        <div class="field">
          <label>Nome</label>
          <input v-model="form.name" type="text" maxlength="50" required />
        </div>
        <div class="field">
          <label>Descricao</label>
          <textarea v-model="form.description" maxlength="200" required></textarea>
        </div>
        <div class="field">
          <label>Preco (R$)</label>
          <input v-model.number="form.price" type="number" min="0" step="0.01" required />
        </div>

        <div class="field">
          <label>Imagem principal (obrigatoria)</label>
          <input type="file" accept="image/*" @change="onFileChange($event, 1)" />
          <img v-if="image1Preview" class="preview" :src="image1Preview" alt="Preview imagem principal" />
        </div>
        <div class="field">
          <label>Imagem 2 (opcional)</label>
          <input type="file" accept="image/*" @change="onFileChange($event, 2)" />
          <img v-if="image2Preview" class="preview" :src="image2Preview" alt="Preview imagem 2" />
        </div>
        <div class="field">
          <label>Imagem 3 (opcional)</label>
          <input type="file" accept="image/*" @change="onFileChange($event, 3)" />
          <img v-if="image3Preview" class="preview" :src="image3Preview" alt="Preview imagem 3" />
        </div>

        <div class="field switch">
          <label>
            <input type="checkbox" v-model="form.active" /> Produto ativo
          </label>
        </div>
        <div class="actions">
          <button class="btn primary" type="submit" :disabled="saving">
            {{ saving ? 'Salvando...' : form.id ? 'Atualizar' : 'Criar produto' }}
          </button>
          <button class="btn ghost" type="button" @click="resetForm" :disabled="saving">
            Limpar
          </button>
        </div>
        <p v-if="formError" class="error">{{ formError }}</p>
      </form>
    </section>

    <section class="list">
      <div class="list-header">
        <h3>Produtos cadastrados</h3>
        <button class="btn small" @click="load" :disabled="loading">
          {{ loading ? 'Carregando...' : 'Atualizar lista' }}
        </button>
      </div>

      <div v-if="error" class="state error">{{ error }}</div>
      <div v-else-if="loading" class="state">Carregando produtos...</div>
      <div v-else-if="!products.length" class="state">Nenhum produto cadastrado.</div>

      <div v-else class="grid">
        <article v-for="product in products" :key="product.id" class="card">
          <div class="media">
            <img :src="product.imageDataUrl || product.imageUrl" :alt="product.name" />
            <span class="tag" :class="product.active ? 'on' : 'off'">
              {{ product.active ? 'Ativo' : 'Inativo' }}
            </span>
          </div>
          <div class="content">
            <h4>{{ product.name }}</h4>
            <p>{{ product.description }}</p>
            <div class="meta">
              <strong>{{ formatPrice(product.price) }}</strong>
              <div class="card-actions">
                <button class="btn small" @click="edit(product)">Editar</button>
                <button class="btn small ghost" @click="remove(product)">Excluir</button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'AdminProducts',
  data() {
    return {
      products: [],
      loading: false,
      saving: false,
      error: '',
      formError: '',
      form: {
        id: null,
        name: '',
        description: '',
        price: 0,
        active: true
      },
      image1File: null,
      image2File: null,
      image3File: null,
      image1Preview: '',
      image2Preview: '',
      image3Preview: ''
    };
  },
  async created() {
    await this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      this.error = '';
      try {
        const res = await api.get('/products');
        this.products = res.data.content || res.data || [];
      } catch (e) {
        this.error = 'Nao foi possivel carregar os produtos.';
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.form = {
        id: null,
        name: '',
        description: '',
        price: 0,
        active: true
      };
      this.image1File = null;
      this.image2File = null;
      this.image3File = null;
      this.image1Preview = '';
      this.image2Preview = '';
      this.image3Preview = '';
      this.formError = '';
    },
    edit(product) {
      this.form = {
        id: product.id,
        name: product.name || '',
        description: product.description || '',
        price: Number(product.price) || 0,
        active: Boolean(product.active)
      };
      this.image1File = null;
      this.image2File = null;
      this.image3File = null;
      this.image1Preview = product.imageDataUrl || product.imageUrl || '';
      this.image2Preview = product.imageDataUrl2 || product.imageUrl2 || '';
      this.image3Preview = product.imageDataUrl3 || product.imageUrl3 || '';
      this.formError = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onFileChange(event, slot) {
      const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
      if (slot === 1) {
        this.image1File = file;
        this.image1Preview = file ? URL.createObjectURL(file) : '';
      } else if (slot === 2) {
        this.image2File = file;
        this.image2Preview = file ? URL.createObjectURL(file) : '';
      } else if (slot === 3) {
        this.image3File = file;
        this.image3Preview = file ? URL.createObjectURL(file) : '';
      }
    },
    async submit() {
      if (this.saving) return;
      this.saving = true;
      this.formError = '';
      try {
        if (!this.form.id && !this.image1File) {
          this.formError = 'Imagem principal obrigatoria.';
          this.saving = false;
          return;
        }
        const data = new FormData();
        data.append('name', this.form.name);
        data.append('description', this.form.description);
        data.append('price', String(Number(this.form.price)));
        data.append('active', String(this.form.active));
        if (this.image1File) data.append('image1', this.image1File);
        if (this.image2File) data.append('image2', this.image2File);
        if (this.image3File) data.append('image3', this.image3File);

        // Não defina Content-Type manualmente em FormData, o axios/browser define o boundary automaticamente.
        if (this.form.id) {
          await api.put(`/products/${this.form.id}`, data);
        } else {
          await api.post('/products', data);
        }
        await this.load();
        this.resetForm();
      } catch (e) {
        if (e?.response?.status === 403) {
          this.formError = 'Acesso negado: voce precisa ser admin para adicionar produtos.';
        } else {
          const apiMessage = e?.response?.data?.message;
          this.formError = apiMessage || 'Nao foi possivel salvar o produto.';
        }
      } finally {
        this.saving = false;
      }
    },
    async remove(product) {
      if (!product?.id) return;
      if (!window.confirm(`Excluir o produto "${product.name}"?`)) {
        return;
      }
      try {
        await api.delete(`/products/${product.id}`);
        await this.load();
      } catch (e) {
        this.error = 'Nao foi possivel excluir o produto.';
      }
    },
    formatPrice(value) {
      const number = Number(value) || 0;
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(number);
    },
    goBack() {
      this.$router.push('/products');
    }
  }
};
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.7rem;
  font-weight: 600;
}

.subtitle {
  color: rgba(28, 19, 11, 0.65);
}

.form-card {
  background: #fff;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 12px 26px rgba(28, 19, 11, 0.08);
}

.form {
  margin-top: 16px;
  display: grid;
  gap: 14px;
}

.field {
  display: grid;
  gap: 6px;
}

.field input,
.field textarea {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(28, 19, 11, 0.15);
  font-family: inherit;
}

.field input[type="file"] {
  padding: 10px 12px;
  background: #fff7ea;
}

.field textarea {
  min-height: 90px;
  resize: vertical;
}

.preview {
  width: 140px;
  height: 140px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(28, 19, 11, 0.12);
}

.field.switch label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.list {
  display: grid;
  gap: 16px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 22px rgba(28, 19, 11, 0.08);
  display: grid;
}

.media {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tag {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
}

.tag.on {
  background: #1c130b;
  color: #fff7ea;
}

.tag.off {
  background: #c0392b;
  color: #fff7ea;
}

.content {
  padding: 14px 16px 16px;
  display: grid;
  gap: 10px;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.state {
  padding: 18px;
  text-align: center;
  color: rgba(28, 19, 11, 0.7);
}

.state.error,
.error {
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
  .meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
