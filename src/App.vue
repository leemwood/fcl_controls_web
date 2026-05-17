<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Loader2, 
  SearchIcon, 
  AlertCircle, 
  GridIcon, 
  LayoutIcon, 
  LanguagesIcon 
} from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ControllerCard from '@/components/ControllerCard.vue'
import PreviewDialog from '@/components/PreviewDialog.vue'
import type { ControllerItem, Category } from '@/types'

const { t, locale } = useI18n()

const baseUrl = ref('https://repo.miawa.cn/fcl_controllers/')
const controllers = ref<ControllerItem[]>([])
const categories = ref<Category[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedCategoryId = ref<number | null>(null)
const previewController = ref<ControllerItem | null>(null)
const isPreviewOpen = ref(false)

const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const [indexRes, catRes] = await Promise.all([
      fetch(`${baseUrl.value.replace(/\/$/, '')}/index.json`),
      fetch(`${baseUrl.value.replace(/\/$/, '')}/category.json`)
    ])

    if (!indexRes.ok) throw new Error('Failed to fetch controllers index')
    if (!catRes.ok) throw new Error('Failed to fetch categories')

    controllers.value = await indexRes.json()
    categories.value = await catRes.json()
  } catch (err) {
    console.error(err)
    error.value = String(err)
  } finally {
    loading.value = false
  }
}

const getCategoryName = (catId: number) => {
    const cat = categories.value.find(c => c.id === catId)
    if (!cat) return 'Unknown'
    const lang = cat.lang.find(l => l.locale === (locale.value === 'zh' ? 'zh_CN' : 'en')) || cat.lang[0]
    return lang?.text || 'Unknown'
}

const filteredControllers = computed(() => {
  let list = controllers.value
  
  if (selectedCategoryId.value !== null) {
    list = list.filter(c => c.categories.includes(selectedCategoryId.value!))
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.introduction.toLowerCase().includes(q)
    )
  }
  
  return list
})

const handleControllerClick = (ctrl: ControllerItem) => {
  previewController.value = ctrl
  isPreviewOpen.value = true
}

const setLanguage = (lang: string) => {
  locale.value = lang
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col">
    <!-- Header -->
    <header class="border-b p-3 sm:p-4 sticky top-0 z-10 bg-background/80 backdrop-blur-md shadow-sm">
      <div class="container mx-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <div class="flex items-center justify-between w-full sm:w-auto gap-2">
            <div class="flex items-center gap-2">
                <div class="bg-primary p-1.5 sm:p-2 rounded-lg text-primary-foreground">
                    <LayoutIcon class="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h1 class="text-lg sm:text-xl font-bold tracking-tight whitespace-nowrap">{{ t('app.title') }}</h1>
            </div>
            
            <div class="flex items-center gap-2 sm:hidden">
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="icon" class="h-8 w-8">
                            <LanguagesIcon class="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem @click="setLanguage('zh')">简体中文</DropdownMenuItem>
                        <DropdownMenuItem @click="setLanguage('en')">English</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
        
        <div class="flex-1 flex gap-2 w-full max-w-2xl">
            <div class="relative flex-1">
                <SearchIcon class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input v-model="searchQuery" :placeholder="t('app.search_placeholder')" class="pl-10 w-full bg-muted/50 border-none focus-visible:ring-1 h-9 sm:h-10" />
            </div>
            <Button @click="fetchData" :disabled="loading" variant="outline" size="sm" class="hidden sm:flex h-10">
                <Loader2 v-if="loading" class="w-4 h-4 animate-spin mr-2" />
                {{ t('app.refresh') }}
            </Button>
        </div>

        <div class="hidden sm:flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon">
                        <LanguagesIcon class="w-5 h-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="setLanguage('zh')">简体中文</DropdownMenuItem>
                    <DropdownMenuItem @click="setLanguage('en')">English</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1 container mx-auto py-6 px-4 md:px-6">
      <!-- Categories -->
      <div class="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
        <Button 
          variant="outline" 
          size="sm" 
          :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': selectedCategoryId === null }"
          @click="selectedCategoryId = null"
        >
          {{ t('app.all_categories') }}
        </Button>
        <Button 
          v-for="cat in categories" 
          :key="cat.id"
          variant="outline" 
          size="sm"
          :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': selectedCategoryId === cat.id }"
          @click="selectedCategoryId = cat.id"
        >
          {{ getCategoryName(cat.id) }}
        </Button>
      </div>

      <!-- Error State -->
      <div v-if="error" class="flex flex-col items-center justify-center py-20 text-destructive">
        <AlertCircle class="w-16 h-16 mb-4 opacity-50" />
        <h2 class="text-xl font-semibold mb-2">{{ t('app.error_title') }}</h2>
        <p class="text-muted-foreground max-w-md text-center mb-6">{{ error }}</p>
        <p class="text-sm text-muted-foreground mb-4">{{ t('app.error_hint') }}</p>
        <Button @click="fetchData">{{ t('app.refresh') }}</Button>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading && controllers.length === 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="h-[200px] rounded-xl bg-muted animate-pulse" />
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredControllers.length === 0" class="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <GridIcon class="w-16 h-16 mb-4 opacity-20" />
        <p class="text-lg">{{ t('app.no_resources') }}</p>
        <Button variant="link" @click="searchQuery = ''; selectedCategoryId = null" class="mt-2">{{ t('app.clear_filters') }}</Button>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ControllerCard 
          v-for="ctrl in filteredControllers" 
          :key="ctrl.id" 
          :controller="ctrl"
          :base-url="baseUrl"
          :category-names="ctrl.categories.map(id => getCategoryName(id))"
          @click="handleControllerClick"
        />
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t py-8 mt-auto">
        <div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>{{ t('app.footer_copy') }}</p>
        </div>
    </footer>

    <!-- Preview Dialog -->
    <PreviewDialog 
      v-model:open="isPreviewOpen" 
      :controller="previewController" 
      :base-url="baseUrl"
    />
  </div>
</template>

<style>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
