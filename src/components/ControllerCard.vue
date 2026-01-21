<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import type { ControllerItem } from '@/types'

const props = defineProps<{
  controller: ControllerItem
  baseUrl: string
  categoryNames?: string[]
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
    class="cursor-pointer hover:bg-accent/50 transition-colors group overflow-hidden flex flex-col h-full border shadow-sm"
    @click="emit('click', controller)"
  >
    <!-- Top Section: Icon + Title + Tags -->
    <div class="p-4 flex gap-4">
        <!-- Icon -->
        <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 border shadow-sm">
            <img :src="iconUrl" :alt="controller.name" class="w-full h-full object-cover" loading="lazy" />
        </div>
        
        <!-- Title & Tags -->
        <div class="flex flex-col justify-center min-w-0 flex-1">
            <h3 class="font-bold text-lg sm:text-xl leading-tight truncate mb-1" :title="controller.name">
                {{ controller.name }}
            </h3>
            <div class="flex flex-wrap gap-1.5">
                <span 
                    v-for="cat in categoryNames" 
                    :key="cat"
                    class="px-2 py-0.5 rounded-full border text-[10px] sm:text-xs font-medium bg-secondary/50 text-secondary-foreground whitespace-nowrap"
                >
                    {{ cat }}
                </span>
            </div>
        </div>
    </div>

    <!-- Separator -->
    <div class="border-t border-dashed mx-4"></div>

    <!-- Bottom Section: Introduction -->
    <CardFooter class="p-4 pt-3 flex-1 flex flex-col items-start bg-transparent">
      <p class="text-sm sm:text-base text-muted-foreground line-clamp-2 leading-relaxed italic" :title="controller.introduction">
        {{ controller.introduction }}
      </p>
    </CardFooter>
  </Card>
</template>
