<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import type { ControllerItem } from '@/types'

const props = defineProps<{
  controller: ControllerItem
  baseUrl: string
}>()

const emit = defineEmits<{
  (e: 'click', controller: ControllerItem): void
}>()

const iconUrl = computed(() => {
  // e.g. http://.../repo_json/00000000/icon.png
  return `${props.baseUrl.replace(/\/$/, '')}/repo_json/${props.controller.id}/icon.png`
})
</script>

<template>
  <Card 
    class="cursor-pointer hover:bg-accent/50 transition-colors group overflow-hidden flex flex-col h-full"
    @click="emit('click', controller)"
  >
    <CardContent class="p-3 sm:p-4 flex flex-col items-center justify-center pt-5 sm:pt-6">
        <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-muted shadow-sm">
            <img :src="iconUrl" :alt="controller.name" class="w-full h-full object-cover" loading="lazy" />
        </div>
    </CardContent>
    <CardFooter class="p-3 sm:p-4 border-t bg-card flex-1 flex flex-col items-start gap-1">
      <h3 class="font-semibold text-base sm:text-lg leading-tight line-clamp-1" :title="controller.name">{{ controller.name }}</h3>
      <p class="text-xs sm:text-sm text-muted-foreground line-clamp-2" :title="controller.introduction">
        {{ controller.introduction }}
      </p>
    </CardFooter>
  </Card>
</template>
