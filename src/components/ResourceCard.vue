<script setup lang="ts">
import { computed } from 'vue'
import { FileIcon, FolderIcon, ImageIcon } from 'lucide-vue-next'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import type { Resource } from '@/types'

const props = defineProps<{
  resource: Resource
}>()

const emit = defineEmits<{
  (e: 'click', resource: Resource): void
}>()

const isImage = computed(() => {
  const ext = props.resource.name.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')
})

const icon = computed(() => {
  if (props.resource.type === 'directory') return FolderIcon
  if (isImage.value) return ImageIcon
  return FileIcon
})
</script>

<template>
  <Card 
    class="cursor-pointer hover:bg-accent/50 transition-colors group overflow-hidden"
    @click="emit('click', resource)"
  >
    <CardContent class="p-4 flex flex-col items-center justify-center aspect-square relative">
        <div v-if="isImage && resource.url" class="absolute inset-0">
            <img :src="resource.url" :alt="resource.name" class="w-full h-full object-cover" loading="lazy" />
            <div class="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        </div>
        <component :is="icon" v-else class="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
    </CardContent>
    <CardFooter class="p-3 border-t bg-card">
      <div class="flex flex-col w-full">
        <span class="font-medium truncate text-sm" :title="resource.name">{{ resource.name }}</span>
        <span v-if="resource.size" class="text-xs text-muted-foreground">{{ resource.size }}</span>
      </div>
    </CardFooter>
  </Card>
</template>
