<script setup lang="ts">
import { computed, ref } from 'vue'
import { CalendarDays, ChevronRight, History, Search, ShieldAlert, Trash2 } from 'lucide-vue-next'
import TypeIcon from '@/components/TypeIcon.vue'
import { useRandomizerStore } from '@/stores/randomizer'

const store = useRandomizerStore()
const search = ref('')
const filtered = computed(() => store.history.filter((draw) => draw.randomizerName.toLocaleLowerCase().includes(search.value.toLocaleLowerCase())))
const formatDate = (date: string) => new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
</script>

<template>
  <div class="page-content narrow-page">
    <div class="page-title-row">
      <div>
        <span class="eyebrow accent">Архив</span>
        <h1>История запусков</h1>
        <p>Все гостевые результаты хранятся в этом браузере.</p>
      </div>
      <button v-if="store.history.length" class="button button-danger-ghost" type="button" @click="store.clearHistory">
        <Trash2 :size="17" aria-hidden="true" /> Очистить
      </button>
    </div>

    <div v-if="store.history.length" class="history-toolbar panel">
      <label class="search-field">
        <Search :size="18" aria-hidden="true" />
        <span class="sr-only">Найти запуск</span>
        <input v-model="search" type="search" placeholder="Найти по названию" />
      </label>
      <span class="history-count">{{ filtered.length }} запусков</span>
    </div>

    <div v-if="filtered.length" class="history-list">
      <article v-for="draw in filtered" :key="draw.id" class="history-item panel">
        <TypeIcon :type="draw.type" />
        <div class="history-meta">
          <strong>{{ draw.randomizerName }}</strong>
          <span><CalendarDays :size="14" aria-hidden="true" /> {{ formatDate(draw.createdAt) }}</span>
          <span v-if="draw.isForced" class="history-admin-mark"><ShieldAlert :size="12" aria-hidden="true" /> Задано администратором</span>
        </div>
        <div class="history-result">
          <span>Результат</span>
          <strong>{{ draw.result.join(', ') }}</strong>
        </div>
        <RouterLink :to="{ path: '/create', query: { id: draw.randomizerId } }" class="icon-button" aria-label="Открыть рандомайзер">
          <ChevronRight :size="19" aria-hidden="true" />
        </RouterLink>
      </article>
    </div>
    <div v-else class="empty-state panel large-empty">
      <div class="empty-icon"><History :size="25" aria-hidden="true" /></div>
      <h2>{{ search ? 'Ничего не найдено' : 'История пока пуста' }}</h2>
      <p>{{ search ? 'Попробуйте изменить поисковый запрос.' : 'Запустите первый рандомайзер, и результат появится здесь.' }}</p>
      <RouterLink v-if="!search" to="/create" class="button button-primary">Запустить выбор</RouterLink>
    </div>
  </div>
</template>
