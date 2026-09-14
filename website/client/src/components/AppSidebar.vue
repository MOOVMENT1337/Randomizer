<script setup lang="ts">
import { Dices, History, LayoutDashboard, Settings, ShieldCheck, Sparkles } from 'lucide-vue-next'
import AppLogo from './AppLogo.vue'

const links = [
  { to: '/', label: 'Главная', icon: LayoutDashboard },
  { to: '/create', label: 'Рандомайзер', icon: Dices },
  { to: '/history', label: 'История', icon: History },
  { to: '/settings', label: 'Настройки', icon: Settings },
]
</script>

<template>
  <aside class="sidebar">
    <AppLogo />
    <nav class="sidebar-nav" aria-label="Основная навигация">
      <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="nav-link">
        <component :is="link.icon" :size="19" :stroke-width="1.8" aria-hidden="true" />
        <span>{{ link.label }}</span>
      </RouterLink>
    </nav>
    <RouterLink to="/admin" class="admin-entry">
      <ShieldCheck :size="17" aria-hidden="true" /> Админ-панель
    </RouterLink>
    <div class="guest-card">
      <span class="guest-icon"><Sparkles :size="17" aria-hidden="true" /></span>
      <strong>Гостевой режим</strong>
      <p>Данные пока хранятся только на этом устройстве.</p>
      <RouterLink to="/auth" class="text-link">Создать аккаунт</RouterLink>
    </div>
  </aside>
</template>
