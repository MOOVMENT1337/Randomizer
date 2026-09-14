<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, CircleDotDashed, Clock3, Hash, ListChecks, Play, Plus } from 'lucide-vue-next'
import RandomizerCard from '@/components/RandomizerCard.vue'
import { useRandomizerStore } from '@/stores/randomizer'

const store = useRandomizerStore()
const recentRandomizers = computed(() => store.randomizers.slice(0, 4))
const heroNumber = Math.floor(Math.random() * 71) + 30
</script>

<template>
  <div class="dashboard page-content">
    <section class="hero-panel">
      <div class="hero-copy">
        <span class="hero-kicker"><span class="pulse-dot" /> Быстрый выбор без сомнений</span>
        <h1>Случайность.<br /><span>В красивой форме.</span></h1>
        <p>Добавьте варианты, нажмите кнопку — и получите честный результат за пару секунд.</p>
        <div class="hero-actions">
          <RouterLink to="/create" class="button button-primary button-large">
            Создать розыгрыш <ArrowRight :size="19" aria-hidden="true" />
          </RouterLink>
          <a href="#quick-start" class="button button-ghost button-large">Попробовать быстро</a>
        </div>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <div class="orbit orbit-one" />
        <div class="orbit orbit-two" />
        <div class="result-orb">
          <span class="orb-label">Ваш результат</span>
          <strong>{{ heroNumber }}</strong>
          <span class="orb-caption">случайно и честно</span>
        </div>
        <div class="floating-chip chip-one"><ListChecks :size="16" /> 12 вариантов</div>
        <div class="floating-chip chip-two"><Clock3 :size="16" /> 0.8 сек</div>
      </div>
    </section>

    <section id="quick-start" class="section-block">
      <div class="section-heading">
        <div>
          <span class="eyebrow accent">Быстрый старт</span>
          <h2>Что разыгрываем?</h2>
        </div>
      </div>
      <div class="quick-grid">
        <RouterLink :to="{ path: '/create', query: { type: 'list' } }" class="quick-card quick-card--list">
          <div class="quick-icon"><ListChecks :size="26" aria-hidden="true" /></div>
          <div>
            <h3>Выбор из списка</h3>
            <p>Имена, задачи, идеи — добавьте любые варианты.</p>
          </div>
          <span class="quick-arrow"><ArrowRight :size="19" aria-hidden="true" /></span>
        </RouterLink>
        <RouterLink :to="{ path: '/create', query: { type: 'range' } }" class="quick-card quick-card--range">
          <div class="quick-icon"><Hash :size="26" aria-hidden="true" /></div>
          <div>
            <h3>Случайное число</h3>
            <p>Задайте диапазон и доверьте выбор случайности.</p>
          </div>
          <span class="quick-arrow"><ArrowRight :size="19" aria-hidden="true" /></span>
        </RouterLink>
        <RouterLink :to="{ path: '/create', query: { type: 'wheel' } }" class="quick-card quick-card--wheel">
          <div class="quick-icon"><CircleDotDashed :size="26" aria-hidden="true" /></div>
          <div>
            <h3>Колесо фортуны</h3>
            <p>Создайте сектора и запустите эффектное вращение.</p>
          </div>
          <span class="quick-arrow"><ArrowRight :size="19" aria-hidden="true" /></span>
        </RouterLink>
      </div>
    </section>

    <section class="section-block">
      <div class="section-heading section-heading--row">
        <div>
          <span class="eyebrow">Ваши наборы</span>
          <h2>Продолжить работу</h2>
        </div>
        <RouterLink to="/create" class="button button-secondary button-small">
          <Plus :size="17" aria-hidden="true" /> Новый набор
        </RouterLink>
      </div>
      <div v-if="recentRandomizers.length" class="card-grid">
        <RandomizerCard v-for="item in recentRandomizers" :key="item.id" :item="item" />
      </div>
      <div v-else class="empty-state panel">
        <div class="empty-icon"><Play :size="24" aria-hidden="true" /></div>
        <h3>Здесь появятся ваши наборы</h3>
        <p>Создайте первый рандомайзер — он сохранится локально.</p>
      </div>
    </section>

    <section class="trust-strip" aria-label="Преимущества">
      <div><strong>Локально</strong><span>Без регистрации</span></div>
      <i aria-hidden="true" />
      <div><strong>Мгновенно</strong><span>Результат за секунду</span></div>
      <i aria-hidden="true" />
      <div><strong>Удобно</strong><span>На любом экране</span></div>
    </section>
  </div>
</template>
