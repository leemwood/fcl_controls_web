<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import VueEasyLightbox from 'vue-easy-lightbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DownloadIcon, UserIcon, InfoIcon, HistoryIcon, XIcon, ExternalLinkIcon } from 'lucide-vue-next'
import type { ControllerItem, ControllerDetail } from '@/types'
import { downloadFile } from '@/lib/utils'

const props = defineProps<{
  open: boolean
  controller: ControllerItem | null
  baseUrl: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const { t } = useI18n()
const isOpen = ref(props.open)
const detail = ref<ControllerDetail | null>(null)
const loading = ref(false)

// Lightbox state
const showLightbox = ref(false)
const lightboxIndex = ref(0)

const onShowLightbox = (index: number) => {
  lightboxIndex.value = index
  showLightbox.value = true
}

const onHideLightbox = () => {
  showLightbox.value = false
}

watch(() => props.open, (val) => {
  isOpen.value = val
  if (val && props.controller) {
    fetchDetail()
  }
})

watch(isOpen, (val) => {
  emit('update:open', val)
})

const fetchDetail = async () => {
  if (!props.controller) return
  loading.value = true
  try {
    const res = await fetch(`${props.baseUrl.replace(/\/$/, '')}/repo_json/${props.controller.id}/version.json`)
    if (res.ok) {
      detail.value = await res.json()
    }
  } catch (err) {
    console.error('Failed to fetch detail:', err)
  } finally {
    loading.value = false
  }
}

const screenshots = computed(() => {
  if (!detail.value || !props.controller) return []
  const list = []
  for (let i = 1; i <= detail.value.screenshot; i++) {
    const num = i.toString().padStart(2, '0')
    list.push(`${props.baseUrl.replace(/\/$/, '')}/repo_json/${props.controller.id}/screenshots/${num}.png`)
  }
  return list
})

const downloadUrl = (version: string) => {
    if (!props.controller) return '#'
    return `${props.baseUrl.replace(/\/$/, '')}/repo_json/${props.controller.id}/versions/${version}.json`
}

const redirectUrl = (version: string) => {
    const url = downloadUrl(version)
    if (url === '#') return '#'
    return `fcl://install/controller?url=${encodeURIComponent(url)}`
}

const handleDownload = (version: string) => {
    const url = downloadUrl(version)
    if (url === '#') return
    const filename = `${props.controller?.name || 'controller'}_${version}.json`
    downloadFile(url, filename)
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="w-[95vw] sm:max-w-[800px] max-h-[85vh] flex flex-col p-0 rounded-xl overflow-hidden border-none shadow-2xl">
      <div v-if="loading" class="p-12 flex justify-center shrink-0">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
      
      <template v-else-if="controller">
        <DialogHeader class="p-4 sm:p-6 pb-4 shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b relative">
          <!-- Close Button for Mobile & Desktop -->
          <DialogClose class="absolute right-4 top-4 rounded-full p-2 hover:bg-muted transition-colors z-20">
            <XIcon class="w-5 h-5 text-muted-foreground" />
          </DialogClose>

          <div class="flex items-start gap-3 sm:gap-5 pr-8">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 shadow-sm">
                <img :src="`${baseUrl.replace(/\/$/, '')}/repo_json/${controller.id}/icon.png`" :alt="controller.name" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
                <DialogTitle class="text-xl sm:text-2xl truncate">{{ controller.name }}</DialogTitle>
                <DialogDescription class="mt-1 flex items-center gap-2 flex-wrap">
                    <span v-if="detail?.author" class="flex items-center gap-1 text-xs sm:text-sm">
                        <UserIcon class="w-3 h-3" /> {{ detail.author }}
                    </span>
                    <span v-if="detail?.latest" class="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium">
                        {{ t('controller.version') }} {{ detail.latest.versionName }}
                    </span>
                </DialogDescription>
            </div>
            <div class="flex flex-col gap-2 shrink-0">
                <a :href="redirectUrl(detail?.latest.versionCode.toString() || '1')">
                    <Button size="sm" class="sm:h-10 w-full bg-primary hover:bg-primary/90">
                        <ExternalLinkIcon class="w-4 h-4 sm:mr-2" />
                        <span class="hidden sm:inline">{{ t('controller.redirect') }}</span>
                    </Button>
                </a>
                <Button 
                    size="sm" 
                    variant="outline" 
                    class="sm:h-10 w-full"
                    @click="handleDownload(detail?.latest.versionCode.toString() || '1')"
                >
                    <DownloadIcon class="w-4 h-4 sm:mr-2" />
                    <span class="hidden sm:inline">{{ t('controller.download') }}</span>
                </Button>
            </div>
          </div>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto min-h-0 py-4 space-y-5 sm:space-y-6">
          <!-- Screenshots -->
          <section v-if="screenshots.length > 0">
            <h4 class="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 px-4 sm:px-6 flex items-center gap-2">
              <InfoIcon class="w-4 h-4" /> {{ t('controller.screenshots') }}
            </h4>
            <div class="flex gap-3 sm:gap-4 overflow-x-auto pb-4 px-4 sm:px-6 snap-x snap-mandatory touch-pan-x">
              <div 
                v-for="(src, idx) in screenshots" 
                :key="idx" 
                class="flex-shrink-0 h-[180px] sm:h-[240px] w-auto rounded-lg overflow-hidden border bg-muted cursor-zoom-in snap-start"
                @click.stop="onShowLightbox(idx)"
              >
                  <img :src="src" class="h-full w-auto object-contain hover:scale-105 transition-transform" loading="lazy" />
              </div>
              <!-- Empty spacer to allow padding-right at the end of scroll -->
              <div class="flex-shrink-0 w-1 sm:w-2"></div>
            </div>
          </section>

          <!-- Description -->
          <section class="px-4 sm:px-6">
            <h4 class="text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2">
              <InfoIcon class="w-4 h-4" /> {{ t('controller.introduction') }}
            </h4>
            <p class="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {{ detail?.description || controller.introduction }}
            </p>
          </section>

          <!-- Version History -->
          <section v-if="detail?.history && detail.history.length > 0" class="px-4 sm:px-6">
            <h4 class="text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2">
              <HistoryIcon class="w-4 h-4" /> {{ t('controller.history') }}
            </h4>
            <div class="space-y-2">
              <div v-for="ver in detail.history" :key="ver.versionCode" class="flex items-center justify-between p-2.5 sm:p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-sm sm:text-base">
                <div class="flex flex-col">
                  <span class="font-medium">{{ t('controller.version') }} {{ ver.versionName }}</span>
                  <span class="text-[10px] sm:text-xs text-muted-foreground">Code: {{ ver.versionCode }}</span>
                </div>
                <div class="flex gap-1">
                  <a :href="redirectUrl(ver.versionCode.toString())">
                    <Button variant="ghost" size="sm" class="text-primary hover:text-primary hover:bg-primary/10">
                        <ExternalLinkIcon class="w-4 h-4" />
                    </Button>
                  </a>
                  <Button 
                     variant="ghost" 
                     size="sm"
                     @click="handleDownload(ver.versionCode.toString())"
                   >
                       <DownloadIcon class="w-4 h-4" />
                   </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </template>
    </DialogContent>
  </Dialog>

  <Teleport to="body">
    <VueEasyLightbox
      :visible="showLightbox"
      :imgs="screenshots"
      :index="lightboxIndex"
      @hide="onHideLightbox"
      class="z-[99999]"
    />
  </Teleport>
</template>
