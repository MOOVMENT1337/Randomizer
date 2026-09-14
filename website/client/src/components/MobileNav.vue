<script setup lang="ts">
import { Dices, History, LayoutDashboard, Settings } from 'lucide-vue-next'

const links = [
  { to: '/', label: 'Главная', icon: LayoutDashboard },
  { to: '/create', label: 'Создать', icon: Dices },
  { to: '/history', label: 'История', icon: History },
  { to: '/settings', label: 'Настройки', icon: Settings },
]
</script>

<template>
  <nav class="mobile-nav" aria-label="Мобильная навигация">
    <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="mobile-nav-link">
      <component :is="link.icon" :size="20" :stroke-width="1.8" aria-hidden="true" />
      <span>{{ link.label }}</span>
    </RouterLink>
  </nav>
</template>
