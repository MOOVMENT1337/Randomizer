<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar from '@/components/AppTopbar.vue'
import MobileNav from '@/components/MobileNav.vue'

const route = useRoute()
const standalone = computed(() => Boolean(route.meta.standalone))
</script>

<template>
  <RouterView v-if="standalone" />
  <div v-else class="app-shell">
    <a class="skip-link" href="#main-content">Перейти к содержимому</a>
    <AppSidebar />
    <div class="app-column">
      <AppTopbar />
      <main id="main-content" class="page-shell">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
    <MobileNav />
  </div>
</template>
