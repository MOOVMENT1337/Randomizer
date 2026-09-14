<script setup lang="ts">
import { Bell, Gauge, MonitorCog, ShieldCheck, Volume2 } from 'lucide-vue-next'
import { useRandomizerStore } from '@/stores/randomizer'

const store = useRandomizerStore()
</script>

<template>
  <div class="page-content narrow-page">
    <div class="page-title-row">
      <div>
        <span class="eyebrow accent">Персонализация</span>
        <h1>Настройки</h1>
        <p>Настройки сохраняются автоматически на этом устройстве.</p>
      </div>
    </div>

    <section class="settings-section panel">
      <div class="settings-heading">
        <span class="settings-icon"><MonitorCog :size="20" aria-hidden="true" /></span>
        <div><h2>Интерфейс и эффекты</h2><p>Выберите комфортный режим использования.</p></div>
      </div>
      <label class="setting-row">
        <span><strong>Анимация результата</strong><small>Плавный запуск и подсветка победителя</small></span>
        <input v-model="store.preferences.animationsEnabled" class="switch-input" type="checkbox" />
      </label>
      <label class="setting-row">
        <span><strong>Звуковые эффекты</strong><small>Короткий звук запуска и результата</small></span>
        <input v-model="store.preferences.soundEnabled" class="switch-input" type="checkbox" />
      </label>
      <label class="setting-row volume-row" :class="{ disabled: !store.preferences.soundEnabled }">
        <span><strong>Громкость</strong><small>{{ store.preferences.volume }}%</small></span>
        <input v-model.number="store.preferences.volume" type="range" min="0" max="100" :disabled="!store.preferences.soundEnabled" aria-label="Громкость звуков" />
      </label>
    </section>

    <section class="settings-grid">
      <article class="info-card panel">
        <span class="settings-icon"><ShieldCheck :size="20" aria-hidden="true" /></span>
        <h3>Ваши данные локальны</h3>
        <p>Сейчас наборы и история остаются только в браузере.</p>
      </article>
      <article class="info-card panel">
        <span class="settings-icon"><Gauge :size="20" aria-hidden="true" /></span>
        <h3>Уменьшение движения</h3>
        <p>Системная настройка reduced motion имеет приоритет.</p>
      </article>
      <article class="info-card panel">
        <span class="settings-icon"><Bell :size="20" aria-hidden="true" /></span>
        <h3>Без лишних уведомлений</h3>
        <p>Мы показываем только важные сообщения об действиях.</p>
      </article>
    </section>
  </div>
</template>
