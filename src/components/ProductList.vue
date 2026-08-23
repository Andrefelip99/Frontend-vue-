<template>

  <div class="catalog-page">

    <section ref="hero" class="catalog-hero">

      <div class="hero-copy">

        <p class="eyebrow hero-eyebrow">
          Macedo Farias · desde sempre, feito à mão
        </p>

        <div class="mobile-title-row">

          <h1 class="hero-title">
            <span class="title-line">Pequenos rituais,</span><br />
            <em class="title-line">grandes sabores.</em>
          </h1>

          <!-- Chocolate pequeno exclusivo do mobile -->
          <div
            class="mobile-chocolate"
            aria-hidden="true"
          >

            <img
              class="mobile-chocolate-art"
              :src="chocolateImage"
              alt=""
            />

            <img
              class="mobile-brand-overlay"
              src="/logo-da-marca.png"
              alt=""
            />

          </div>

        </div>

        <p class="hero-text hero-description">
          Uma vitrine de doces artesanais para tornar qualquer encontro mais especial.
        </p>

        <button
          class="button button-dark hero-button"
          type="button"
          @click="scrollToCatalog"
        >
          Explorar a vitrine
          <ArrowDown :size="16" />
        </button>

      </div>


      <!-- Chocolate grande usado no desktop -->
      <div
        class="chocolate-orbit"
        aria-hidden="true"
      >

        <div class="orbit-ring"></div>

        <img
          class="chocolate-art"
          :src="chocolateImage"
          alt=""
        />

        <img
          class="brand-overlay"
          src="/logo-da-marca.png"
          alt=""
        />

      </div>

    </section>


    <section
      ref="catalog"
      class="catalog-section"
      aria-labelledby="catalog-title"
    >

      <div class="section-heading">

        <div>

          <p class="eyebrow">
            A vitrine
          </p>

          <h2 id="catalog-title">
            Escolha seu momento
          </h2>

        </div>

        <span
          v-if="updatedAt"
          class="sync-note"
        >
          Atualizado {{ updatedAt }}
        </span>

      </div>


      <div class="catalog-tools">

        <label class="search-box">

          <Search
            :size="18"
            aria-hidden="true"
          />

          <input
            v-model="search"
            type="search"
            placeholder="Buscar por sabor..."
            aria-label="Buscar produtos"
          />

        </label>


        <div
          class="filters"
          role="group"
          aria-label="Filtrar por categoria"
        >

          <button
            :class="{ active: !selectedCategory }"
            type="button"
            @click="selectedCategory = ''"
          >
            Todos
          </button>

          <button
            v-for="category in CATEGORIES"
            :key="category"
            :class="{ active: selectedCategory === category }"
            type="button"
            @click="selectedCategory = category"
          >
            {{ categoryLabel(category) }}
          </button>

        </div>

      </div>


      <div
        v-if="loading && !products.length"
        class="state"
      >

        <LoaderCircle
          class="spin"
          :size="24"
        />

        Abrindo a vitrine...

      </div>


      <div
        v-else-if="error && !products.length"
        class="state error-state"
      >

        <p>
          {{ error }}
        </p>

        <button
          class="button button-outline"
          type="button"
          @click="load"
        >
          Tentar novamente
        </button>

      </div>


      <div
        v-else-if="!filteredProducts.length"
        class="state"
      >
        Nenhum doce encontrado com esses filtros.
      </div>


      <div
        v-else
        class="product-grid"
      >

        <article
          v-for="(product, index) in filteredProducts"
          :key="product.id"
          class="product-card"
          :style="{ '--delay': `${index * 70}ms` }"
        >

          <RouterLink
            :to="`/products/${product.id}`"
            class="product-link"
          >

            <div class="product-image">

              <img
                :src="product.oneImageUrl || fallbackImage"
                :alt="product.title"
                loading="lazy"
                @error="useFallback"
              />

              <span>
                {{ categoryLabel(product.category) }}
              </span>

            </div>


            <div class="product-info">

              <h3>
                {{ product.title }}
              </h3>

              <p>
                {{ product.description }}
              </p>

              <strong>
                {{ formatPrice(product.price) }}
              </strong>

            </div>

          </RouterLink>

        </article>

      </div>


      <p
        v-if="error && products.length"
        class="sync-warning"
      >
        {{ error }}
        Os produtos exibidos são os últimos salvos neste dispositivo.
      </p>

    </section>


    <!-- DETALHES DO PRODUTO -->

    <section
      v-if="detailProduct"
      class="detail-panel"
      aria-label="Detalhes do produto"
      aria-modal="true"
      role="dialog"
    >

      <button
        class="close-detail"
        type="button"
        aria-label="Fechar detalhes"
        @click="router.push('/')"
      >
        <X :size="20" />
      </button>


      <img
        :src="detailProduct.oneImageUrl || fallbackImage"
        :alt="detailProduct.title"
      />


      <div>

        <p class="eyebrow">
          {{ categoryLabel(detailProduct.category) }}
        </p>

        <h2>
          {{ detailProduct.title }}
        </h2>

        <p>
          {{ detailProduct.description }}
        </p>

        <strong>
          {{ formatPrice(detailProduct.price) }}
        </strong>


        <!-- BOTÃO DE PEDIDO -->

        <a
          v-if="detailProduct.link"
          class="button button-dark"
          :href="detailProduct.link"
          target="_blank"
          rel="noopener"
        >
          Fazer pedido
          <ArrowUpRight :size="16" />
        </a>

      </div>

    </section>

  </div>

</template>


<script setup lang="ts">

import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  watch
} from 'vue';

import {
  RouterLink,
  useRoute,
  useRouter
} from 'vue-router';

import {
  ArrowDown,
  ArrowUpRight,
  LoaderCircle,
  Search,
  X
} from 'lucide-vue-next';

import { gsap } from 'gsap';

import chocolateImage from '../../chocolate.png';

import type {
  Category,
  Product
} from '../types';

import {
  CATEGORIES
} from '../types';

import {
  messageFromError
} from '../services/api';

import {
  getCachedProducts,
  PRODUCTS_UPDATED_AT_KEY,
  refreshProducts
} from '../services/products';


const route = useRoute();

const router = useRouter();

const hero = ref<HTMLElement | null>(null);

const catalog = ref<HTMLElement | null>(null);

const products = ref<Product[]>(
  getCachedProducts() || []
);

const loading = ref(false);

const error = ref('');

const search = ref('');

const selectedCategory = ref<Category | ''>('');

const updatedAt = ref(
  localStorage.getItem(PRODUCTS_UPDATED_AT_KEY)
    ? 'recentemente'
    : ''
);


const fallbackImage = chocolateImage;


const detailProduct = computed(() =>
  route.params.id
    ? products.value.find(
        (item) => item.id === Number(route.params.id)
      ) || null
    : null
);

watch(
  detailProduct,
  (product) => {
    document.body.style.overflow = product ? 'hidden' : '';
  },
  { immediate: true }
);


const filteredProducts = computed(() =>
  products.value.filter(
    (product) =>
      (!selectedCategory.value ||
        product.category === selectedCategory.value) &&

      (!search.value.trim() ||
        `${product.title} ${product.description}`
          .toLowerCase()
          .includes(search.value.toLowerCase()))
  )
);


function categoryLabel(category: Category) {

  return (
    {
      Sliciecakes: 'Slice Cakes',
      DeliciasDePote: 'Delícias no pote',
      DatasEspeciais: 'Datas especiais'
    } as Record<string, string>
  )[category] || category;

}


function formatPrice(value: number) {

  return new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL'
    }
  ).format(Number(value) || 0);

}


function useFallback(event: Event) {

  (event.target as HTMLImageElement).src = fallbackImage;

}


function scrollToCatalog() {

  catalog.value?.scrollIntoView({
    behavior: 'smooth'
  });

}


async function load() {

  const cached = getCachedProducts();

  if (cached) {
    products.value = cached;
  }

  loading.value = !products.value.length;

  error.value = '';

  try {

    const fresh = await refreshProducts();

    products.value = fresh;

    updatedAt.value = 'agora';

  } catch (reason) {

    if (!products.value.length) {

      error.value = messageFromError(
        reason,
        'A vitrine está temporariamente indisponível.'
      );

    } else {

      error.value = 'Não foi possível sincronizar agora.';

    }

  } finally {

    loading.value = false;

  }

}


let removeHeroMotion = () => {};


function animateHero() {

  if (!hero.value) return;

  const reducedMotion =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;


  const context = gsap.context(() => {

    if (reducedMotion) {

      gsap.set(
        '.hero-eyebrow, .title-line, .hero-description, .hero-button, .chocolate-art, .brand-overlay, .mobile-chocolate, .mobile-chocolate-art, .mobile-brand-overlay',
        {
          clearProps: 'all'
        }
      );

      return;

    }


    const timeline = gsap.timeline({
      defaults: {
        ease: 'power3.out'
      }
    });


    timeline

      .fromTo(
        '.hero-eyebrow',
        {
          autoAlpha: 0,
          y: 12,
          filter: 'blur(4px)'
        },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.55
        },
        0.1
      )

      .fromTo(
        '.title-line',
        {
          autoAlpha: 0,
          y: 28,
          filter: 'blur(7px)'
        },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.85,
          stagger: 0.18,
          ease: 'power4.out'
        },
        0.22
      )

      .fromTo(
        '.hero-description',
        {
          autoAlpha: 0,
          y: 18,
          filter: 'blur(4px)'
        },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.65
        },
        0.72
      )

      .fromTo(
        '.hero-button',
        {
          autoAlpha: 0,
          y: 14
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55
        },
        0.9
      )

      .fromTo(
        '.chocolate-art, .brand-overlay, .mobile-chocolate, .mobile-chocolate-art, .mobile-brand-overlay',
        {
          autoAlpha: 0,
          scale: 0.96
        },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.9,
          stagger: 0.08
        },
        1.02
      );


    gsap.to(
      '.chocolate-art',
      {
        y: -7,
        rotation: 1.5,
        duration: 5.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1.4
      }
    );


    gsap.to(
      '.brand-overlay',
      {
        y: -4,
        rotation: -1,
        duration: 5.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1.4
      }
    );


    gsap.to(
      '.mobile-chocolate',
      {
        y: -7,
        rotation: 1.5,
        duration: 5.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1.4
      }
    );


    gsap.to(
      '.mobile-brand-overlay',
      {
        y: -4,
        rotation: -1,
        duration: 5.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1.4
      }
    );


    const onPointerMove = (
      event: PointerEvent
    ) => {

      if (event.pointerType === 'touch') return;

      const x =
        (event.clientX / window.innerWidth - 0.5) * 2;

      const y =
        (event.clientY / window.innerHeight - 0.5) * 2;


      gsap.to(
        '.chocolate-orbit',
        {
          x: x * 5,
          y: y * 4,
          duration: 1.2,
          ease: 'power2.out',
          overwrite: 'auto'
        }
      );

    };


    window.addEventListener(
      'pointermove',
      onPointerMove,
      {
        passive: true
      }
    );


    const removePointerMotion = () =>
      window.removeEventListener(
        'pointermove',
        onPointerMove
      );


    removeHeroMotion = () => {

      removePointerMotion();

      context.revert();

    };

  }, hero.value);

}


onMounted(() => {

  animateHero();

  void load();

});


onUnmounted(() => {

  removeHeroMotion();

  document.body.style.overflow = '';

});

</script>


<style scoped>

.detail-panel {
  position: fixed;
  inset: 0;
  z-index: 30;
  width: 100vw;
  max-width: none;
  height: 100dvh;
  margin: 0;
  padding: clamp(24px, 6vw, 80px);
  grid-template-columns: minmax(280px, 0.95fr) minmax(280px, 0.8fr);
  align-items: center;
  background: rgba(35, 22, 16, 0.82);
  animation: detail-backdrop-in 0.45s ease both;
  overflow-y: auto;
}

.detail-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 18% 20%, rgba(210, 154, 85, 0.18), transparent 35%);
  pointer-events: none;
}

.detail-panel > img,
.detail-panel > div {
  position: relative;
  z-index: 1;
  animation: detail-content-in 0.7s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.detail-panel > img {
  width: min(100%, 620px);
  height: min(70vh, 620px);
  justify-self: end;
  object-fit: cover;
  box-shadow: 18px 22px 45px rgba(0, 0, 0, 0.25);
}

.detail-panel > div {
  max-width: 480px;
  padding: clamp(24px, 5vw, 60px);
  background: var(--paper);
  box-shadow: 18px 22px 45px rgba(0, 0, 0, 0.2);
}

.detail-panel h2 {
  font-size: clamp(38px, 5vw, 66px);
}

.close-detail {
  z-index: 2;
  position: fixed;
  top: 24px;
  right: 28px;
  background: var(--paper);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
}

@keyframes detail-backdrop-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes detail-content-in {
  from { opacity: 0; transform: translateY(22px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.catalog-hero {

  overflow: hidden;

  position: relative;

  isolation: isolate;

}


.hero-eyebrow,
.hero-title .title-line,
.hero-description,
.hero-button,
.chocolate-art,
.brand-overlay {

  will-change:
    transform,
    opacity,
    filter;

}


/* =========================================
   DESKTOP
   ========================================= */

.chocolate-orbit {

  width: min(32vw, 350px);

}


/* =========================================
   ELEMENTOS MOBILE
   ========================================= */

.mobile-title-row {

  position: relative;

}


.mobile-chocolate {

  display: none;

}


/* =========================================
   MOBILE
   ========================================= */

@media (max-width: 1000px) {

  .detail-panel {
    inset: 0;
    margin: 0;
    padding: 72px 18px 24px;
    grid-template-columns: 1fr;
    align-content: center;
    gap: 18px;
  }

  .detail-panel > img {
    width: 100%;
    height: min(42vh, 360px);
    justify-self: stretch;
  }

  .detail-panel > div {
    max-width: none;
    padding: 24px;
  }

  /*
   * Esconde o chocolate grande
   * usado no desktop.
   */

  .chocolate-orbit {

    display: none;

  }


  /*
   * Título + chocolate pequeno
   */

  .mobile-title-row {

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 10px;

  }


  .mobile-title-row h1 {

    flex: 1;

    margin: 0;

  }


  /*
   * CHOCOLATE MOBILE
   */

  .mobile-chocolate {

    position: relative;

    display: flex;

    flex: 0 0 150px;

    width: 150px;

    height: 150px;

    align-items: center;

    justify-content: center;

    margin-right: 2px;

  }


  /*
   * CHOCOLATE
   */

  .mobile-chocolate img:first-child {

    width: 100%;

    height: 100%;

    object-fit: contain;

  }


  /*
   * LOGO
   */

  .mobile-chocolate img:last-child {

    position: absolute;

    width: 80px;

    height: auto;

    object-fit: contain;

  }

}


/* =========================================
   FLUTUAÇÃO DO CONJUNTO
   ========================================= */

@keyframes mobileChocolateFloat {

  0% {

    transform:
      translateY(0)
      rotate(0deg);

  }

  50% {

    transform:
      translateY(-8px)
      rotate(2deg);

  }

  100% {

    transform:
      translateY(0)
      rotate(0deg);

  }

}


/* =========================================
   MOVIMENTO DO CHOCOLATE
   ========================================= */

@keyframes mobileChocolateRotate {

  0% {

    transform:
      rotate(-3deg);

  }

  50% {

    transform:
      rotate(3deg);

  }

  100% {

    transform:
      rotate(-3deg);

  }

}


/* =========================================
   MOVIMENTO DO LOGO
   ========================================= */

@keyframes mobileLogoFloat {

  0% {

    transform:
      translateY(0);

  }

  50% {

    transform:
      translateY(-4px);

  }

  100% {

    transform:
      translateY(0);

  }

}


/* =========================================
   CELULARES PEQUENOS
   ========================================= */

@media (max-width: 420px) {

  .mobile-title-row {

    gap: 6px;

  }


  .mobile-chocolate {

    width: 150px;

    height: 150px;

    flex-basis: 150px;

  }


  .mobile-chocolate img:last-child {

    width: 80px;

  }

}


/* =========================================
   BOTÃO DO PRODUTO — MOBILE
   ========================================= */

@media (max-width: 1000px) {

  /*
   * Organiza o conteúdo do detalhe
   * verticalmente.
   */

  .detail-panel > div {

    display: flex;

    flex-direction: column;

    align-items: stretch;

  }


  /*
   * Preço fica acima do botão.
   */

  .detail-panel > div > strong {

    display: block;

    margin-top: 8px;

    margin-bottom: 18px;

  }


  .detail-panel > div > .button {

    width: 100%;

    display: flex;

    align-items: center;

    justify-content: center;

  }

}

</style>