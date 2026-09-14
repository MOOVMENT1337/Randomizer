<script setup lang="ts">
import { ArrowUpRight, MoreHorizontal, Play } from 'lucide-vue-next'
import TypeIcon from './TypeIcon.vue'
import type { Randomizer } from '@/types'

defineProps<{ item: Randomizer }>()

const formatRelative = (date: string) => {
  const minutes = Math.round((Date.now() - new Date(date).getTime()) / 60000)
  if (minutes < 60) return `${Math.max(1, minutes)} мин назад`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} ч назад`
  return new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short' }).format(new Date(date))
}
</script>

<template>
  <article class="randomizer-card">
    <div class="card-head">
      <TypeIcon :type="item.type" />
      <button class="icon-button icon-button--small" type="button" aria-label="Меню рандомайзера">
        <MoreHorizontal :size="19" aria-hidden="true" />
      </button>
    </div>
    <div>
      <span class="eyebrow">{{ item.type === 'list' ? 'Список участников' : item.type === 'range' ? 'Диапазон чисел' : 'Колесо фортуны' }}</span>
      <h3>{{ item.name }}</h3>
      <p class="muted">
        {{ item.type === 'range' ? `${item.min} — ${item.max}` : `${item.items.length} вариантов` }}
        <span aria-hidden="true"> · </span>{{ formatRelative(item.updatedAt) }}
      </p>
    </div>
    <RouterLink :to="{ path: '/create', query: { id: item.id } }" class="card-action">
      <span><Play :size="16" fill="currentColor" aria-hidden="true" /> Запустить</span>
      <ArrowUpRight :size="18" aria-hidden="true" />
    </RouterLink>
  </article>
</template>
