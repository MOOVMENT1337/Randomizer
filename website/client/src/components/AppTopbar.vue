<script setup lang="ts">
import { Bell, LogIn } from 'lucide-vue-next'
import AppLogo from './AppLogo.vue'
</script>

<template>
  <header class="topbar">
    <div class="mobile-logo"><AppLogo /></div>
    <div class="topbar-status"><span class="status-dot" /> Все системы работают</div>
    <div class="topbar-actions">
      <button class="icon-button" type="button" aria-label="Уведомления">
        <Bell :size="19" aria-hidden="true" />
      </button>
      <RouterLink to="/auth" class="button button-secondary button-small">
        <LogIn :size="17" aria-hidden="true" />
        Войти
      </RouterLink>
    </div>
  </header>
</template>
