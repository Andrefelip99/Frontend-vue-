<template>
  <div class="upload-slot"><span>{{ label }}</span><label class="upload-control"><img v-if="preview" :src="preview" :alt="label" /><ImagePlus v-else :size="24" /><input type="file" accept="image/*" @change="choose" /></label><small v-if="busy">Enviando {{ progress }}%...</small><small v-if="error" class="form-error">{{ error }}</small></div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'; import { ImagePlus } from 'lucide-vue-next'; import { uploadImage } from '../services/products';
const props = defineProps<{ label: string; url?: string | null }>(); const emit = defineEmits<{ uploaded: [url: string] }>(); const preview = ref(props.url || ''); const progress = ref(0); const busy = ref(false); const error = ref(''); watch(() => props.url, (url) => { if (url) preview.value = url; });
async function choose(event: Event) { const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; preview.value = URL.createObjectURL(file); busy.value = true; error.value = ''; try { const url = await uploadImage(file, (value) => progress.value = value); preview.value = url; emit('uploaded', url); } catch (reason) { error.value = reason instanceof Error ? reason.message : 'Falha no upload.'; } finally { busy.value = false; } }
</script>
