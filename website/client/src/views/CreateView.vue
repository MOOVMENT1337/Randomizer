<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePreferredReducedMotion } from '@vueuse/core'
import { Check, ChevronDown, CircleDotDashed, Hash, ListChecks, Plus, RotateCcw, Save, ShieldAlert, Sparkles, Volume2, VolumeX, X } from 'lucide-vue-next'
import { z } from 'zod'
import { useRandomizerStore } from '@/stores/randomizer'
import type { Draw, RandomizerType } from '@/types'
import { getRandomNumberError, isAllowedRandomNumber, MAX_DRAW_RESULTS, RANDOM_NUMBER_MAX, RANDOM_NUMBER_MIN, randomNumberLimitsLabel } from '@/utils/numberLimits'

const store = useRandomizerStore()
const route = useRoute()
const router = useRouter()
const reducedMotion = usePreferredReducedMotion()

const requestedType = route.query.type
const type = ref<RandomizerType>(requestedType === 'range' ? 'range' : requestedType === 'wheel' ? 'wheel' : 'list')
const currentId = ref<string>()
const name = ref('Мой розыгрыш')
const rawItems = ref('Алексей\nМария\nИлья\nСофия\nДанил')
const min = ref(1)
const max = ref(100)
const winnersCount = ref(1)
const error = ref('')
const isRunning = ref(false)
const result = ref<Draw | null>(null)
const resultRegion = ref<HTMLElement | null>(null)
const wheelRotation = ref(0)
const wheelDuration = ref(0)

const wheelColors = ['#79f7cb', '#9b8cff', '#ffcf70', '#59bfff', '#ff8298', '#8fe37d', '#d896ff', '#ff9e64', '#62e1d1', '#7896ff', '#f179c6', '#b7e36f']

const items = computed(() => rawItems.value.split('\n').map((item) => item.trim()).filter(Boolean))
const duplicates = computed(() => {
  const normalized = items.value.map((item) => item.toLocaleLowerCase())
  return normalized.length - new Set(normalized).size
})
const minError = computed(() => getRandomNumberError(min.value))
const maxError = computed(() => getRandomNumberError(max.value))
const rangeOrderError = computed(() => !minError.value && !maxError.value && min.value > max.value ? 'Минимальное число не может быть больше максимального' : '')
const rangeSize = computed(() => isAllowedRandomNumber(min.value) && isAllowedRandomNumber(max.value) ? Math.max(0, max.value - min.value + 1) : 0)
const rangeWinnerOptions = computed(() => Math.max(1, Math.min(rangeSize.value, MAX_DRAW_RESULTS)))
const canRun = computed(() => {
  if (type.value === 'list') return items.value.length > 0 && winnersCount.value <= items.value.length
  if (type.value === 'wheel') return items.value.length >= 2 && items.value.length <= 12
  return !minError.value && !maxError.value && !rangeOrderError.value && winnersCount.value <= rangeSize.value
})

function polarPoint(radius: number, angle: number) {
  const radians = angle * Math.PI / 180
  return { x: 160 + radius * Math.sin(radians), y: 160 - radius * Math.cos(radians) }
}

function wheelSectorPath(index: number) {
  const step = 360 / Math.max(items.value.length, 1)
  const start = polarPoint(148, index * step)
  const end = polarPoint(148, (index + 1) * step)
  return `M 160 160 L ${start.x} ${start.y} A 148 148 0 ${step > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`
}

function wheelTextProps(index: number) {
  const angle = (index + 0.5) * (360 / Math.max(items.value.length, 1))
  const point = polarPoint(102, angle)
  let rotation = (angle + 90) % 360
  if (rotation > 90 && rotation < 270) rotation += 180
  return { x: point.x, y: point.y, transform: `rotate(${rotation} ${point.x} ${point.y})` }
}

function shortWheelLabel(value: string) {
  return value.length > 11 ? `${value.slice(0, 10)}…` : value
}

function loadSet(id: string) {
  const saved = store.randomizers.find((item) => item.id === id)
  if (!saved) return
  currentId.value = saved.id
  type.value = saved.type
  name.value = saved.name
  rawItems.value = saved.items.join('\n')
  min.value = saved.min
  max.value = saved.max
  winnersCount.value = saved.winnersCount
}

function validate() {
  error.value = ''
  const titleResult = z.string().trim().min(1, 'Добавьте название розыгрыша').safeParse(name.value)
  if (!titleResult.success) error.value = titleResult.error.issues[0]?.message || 'Проверьте название розыгрыша'
  else if (type.value === 'list' && !items.value.length) error.value = 'Добавьте хотя бы один вариант'
  else if (type.value === 'list' && winnersCount.value > items.value.length) error.value = 'Победителей не может быть больше, чем вариантов'
  else if (type.value === 'wheel' && items.value.length < 2) error.value = 'Для колеса добавьте минимум два сектора'
  else if (type.value === 'wheel' && items.value.length > 12) error.value = 'В колесе может быть не больше 12 секторов'
  else if (type.value === 'range' && minError.value) error.value = `Поле «От»: ${minError.value.toLocaleLowerCase()}`
  else if (type.value === 'range' && maxError.value) error.value = `Поле «До»: ${maxError.value.toLocaleLowerCase()}`
  else if (type.value === 'range' && rangeOrderError.value) error.value = rangeOrderError.value
  else if (type.value === 'range' && winnersCount.value > rangeSize.value) error.value = 'Количество результатов не может превышать размер диапазона'
  return !error.value
}

function save() {
  if (!validate()) return
  const saved = store.saveRandomizer({
    id: currentId.value,
    name: name.value.trim(),
    type: type.value,
    items: items.value,
    min: min.value,
    max: max.value,
    winnersCount: winnersCount.value,
  })
  currentId.value = saved.id
  router.replace({ query: { id: saved.id } })
}

function playTone(final = false) {
  if (!store.preferences.soundEnabled) return
  try {
    const Context = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const context = new Context()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = final ? 740 : 260
    gain.gain.value = (store.preferences.volume / 100) * 0.08
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + (final ? 0.35 : 0.12))
    oscillator.stop(context.currentTime + (final ? 0.35 : 0.12))
  } catch { /* Web Audio is optional */ }
}

async function run() {
  if (!validate() || isRunning.value) return
  isRunning.value = true
  result.value = null
  playTone()
  const motionEnabled = store.preferences.animationsEnabled && reducedMotion.value !== 'reduce'
  const delay = motionEnabled ? (type.value === 'wheel' ? 3600 : 1150) : 80

  let wheelDraw: Draw | null = null
  if (type.value === 'wheel') {
    // The outcome is fixed before the visual spin starts.
    wheelDraw = store.runDraw({
      randomizerId: currentId.value,
      name: name.value,
      type: type.value,
      items: items.value,
      min: min.value,
      max: max.value,
      winnersCount: 1,
    })
    const winnerIndex = Math.max(0, items.value.findIndex((item) => item === wheelDraw?.result[0]))
    const sectorCenter = (winnerIndex + 0.5) * (360 / items.value.length)
    const target = (360 - sectorCenter) % 360
    const current = ((wheelRotation.value % 360) + 360) % 360
    const delta = (target - current + 360) % 360
    wheelDuration.value = motionEnabled ? 3400 : 0
    wheelRotation.value += (motionEnabled ? 1440 : 0) + delta
  }

  window.setTimeout(async () => {
    result.value = wheelDraw || store.runDraw({ randomizerId: currentId.value, name: name.value, type: type.value, items: items.value, min: min.value, max: max.value, winnersCount: winnersCount.value })
    isRunning.value = false
    playTone(true)
    if ('vibrate' in navigator) navigator.vibrate?.([40, 30, 70])
    await nextTick()
    resultRegion.value?.focus()
  }, delay)
}

function newSet() {
  currentId.value = undefined
  name.value = 'Мой розыгрыш'
  rawItems.value = ''
  min.value = 1
  max.value = 100
  winnersCount.value = 1
  result.value = null
  wheelRotation.value = 0
  router.replace({ query: { type: type.value } })
}

watch(type, (nextType) => {
  error.value = ''
  result.value = null
  wheelRotation.value = 0
  if (nextType === 'wheel') winnersCount.value = 1
  else if (nextType === 'range') winnersCount.value = Math.min(winnersCount.value, rangeWinnerOptions.value)
  else winnersCount.value = Math.min(winnersCount.value, Math.max(items.value.length, 1))
})

watch(rangeSize, (size) => {
  if (type.value === 'range') winnersCount.value = Math.min(winnersCount.value, Math.max(1, Math.min(size, MAX_DRAW_RESULTS)))
})

onMounted(() => {
  if (typeof route.query.id === 'string') loadSet(route.query.id)
})
</script>

<template>
  <div class="studio page-content">
    <div class="studio-heading">
      <div>
        <span class="eyebrow accent">Конструктор</span>
        <h1>Настройте выбор</h1>
        <p>Результат фиксируется до запуска анимации.</p>
      </div>
      <button class="button button-secondary" type="button" @click="newSet">
        <Plus :size="17" aria-hidden="true" /> Новый
      </button>
    </div>

    <div class="studio-layout">
      <section class="builder-panel panel">
        <div class="type-switch" role="radiogroup" aria-label="Тип рандомайзера">
          <button type="button" :class="{ active: type === 'list' }" role="radio" :aria-checked="type === 'list'" @click="type = 'list'">
            <ListChecks :size="19" aria-hidden="true" /> Из списка
          </button>
          <button type="button" :class="{ active: type === 'range' }" role="radio" :aria-checked="type === 'range'" @click="type = 'range'">
            <Hash :size="19" aria-hidden="true" /> Диапазон
          </button>
          <button type="button" :class="{ active: type === 'wheel' }" role="radio" :aria-checked="type === 'wheel'" @click="type = 'wheel'">
            <CircleDotDashed :size="19" aria-hidden="true" /> Колесо
          </button>
        </div>

        <div class="form-group">
          <label for="draw-name">Название</label>
          <input id="draw-name" v-model="name" type="text" maxlength="80" autocomplete="off" />
        </div>

        <template v-if="type === 'list' || type === 'wheel'">
          <div class="form-group">
            <div class="label-row">
              <label for="draw-items">{{ type === 'wheel' ? 'Секторы колеса' : 'Участники или варианты' }}</label>
              <span>{{ items.length }} добавлено</span>
            </div>
            <textarea id="draw-items" v-model="rawItems" rows="9" placeholder="Каждый вариант с новой строки" />
            <p v-if="duplicates" class="field-note field-note--warn">Найдено повторов: {{ duplicates }}. Они увеличивают шанс выбора.</p>
            <p v-else class="field-note">{{ type === 'wheel' ? 'От 2 до 12 секторов, каждый с новой строки.' : 'Каждый вариант добавляйте с новой строки.' }}</p>
          </div>
          <div v-if="type === 'list'" class="form-group compact-field">
            <label for="winner-count">Количество победителей</label>
            <div class="select-wrap">
              <select id="winner-count" v-model.number="winnersCount">
                <option v-for="count in Math.max(1, Math.min(items.length, 10))" :key="count" :value="count">{{ count }}</option>
              </select>
              <ChevronDown :size="17" aria-hidden="true" />
            </div>
          </div>
        </template>

        <div v-else-if="type === 'range'" class="range-grid">
          <div class="form-group">
            <label for="min-number">От</label>
            <input
              id="min-number"
              v-model.number="min"
              type="number"
              inputmode="numeric"
              step="1"
              :min="RANDOM_NUMBER_MIN"
              :max="RANDOM_NUMBER_MAX"
              :aria-invalid="Boolean(minError)"
              :aria-describedby="minError ? 'min-number-error range-number-limits' : 'range-number-limits'"
            />
            <p v-if="minError" id="min-number-error" class="field-note field-note--error">{{ minError }}</p>
          </div>
          <div class="range-divider" aria-hidden="true">—</div>
          <div class="form-group">
            <label for="max-number">До</label>
            <input
              id="max-number"
              v-model.number="max"
              type="number"
              inputmode="numeric"
              step="1"
              :min="RANDOM_NUMBER_MIN"
              :max="RANDOM_NUMBER_MAX"
              :aria-invalid="Boolean(maxError)"
              :aria-describedby="maxError ? 'max-number-error range-number-limits' : 'range-number-limits'"
            />
            <p v-if="maxError" id="max-number-error" class="field-note field-note--error">{{ maxError }}</p>
          </div>
          <p id="range-number-limits" class="field-note range-limits-note">Целые числа {{ randomNumberLimitsLabel }}.</p>
          <p v-if="rangeOrderError" class="field-note field-note--error range-order-error" role="alert">{{ rangeOrderError }}</p>
          <div class="form-group compact-field range-winners-field">
            <label for="range-winner-count">Количество результатов</label>
            <div class="select-wrap">
              <select id="range-winner-count" v-model.number="winnersCount">
                <option v-for="count in rangeWinnerOptions" :key="count" :value="count">{{ count }}</option>
              </select>
              <ChevronDown :size="17" aria-hidden="true" />
            </div>
            <p class="field-note">Числа в результате не повторяются.</p>
          </div>
        </div>

        <div v-if="error" class="form-error" role="alert"><X :size="17" aria-hidden="true" /> {{ error }}</div>

        <div class="builder-footer">
          <button class="button button-secondary" type="button" @click="save">
            <Save :size="17" aria-hidden="true" /> {{ currentId ? 'Сохранить' : 'Сохранить набор' }}
          </button>
          <span v-if="currentId" class="saved-state"><Check :size="15" aria-hidden="true" /> Локальный набор</span>
        </div>
      </section>

      <section class="runner-panel panel" :class="{ 'is-running': isRunning, 'has-result': result }">
        <div class="runner-top">
          <span class="eyebrow">Предпросмотр</span>
          <button
            class="icon-button icon-button--small"
            type="button"
            :aria-label="store.preferences.soundEnabled ? 'Выключить звук' : 'Включить звук'"
            :aria-pressed="store.preferences.soundEnabled"
            @click="store.preferences.soundEnabled = !store.preferences.soundEnabled"
          >
            <Volume2 v-if="store.preferences.soundEnabled" :size="18" aria-hidden="true" />
            <VolumeX v-else :size="18" aria-hidden="true" />
          </button>
        </div>

        <div class="runner-stage">
          <div v-if="type === 'wheel'" class="fortune-wheel-scene">
            <div class="wheel-pointer" aria-hidden="true" />
            <div
              class="fortune-wheel"
              :class="{ spinning: isRunning }"
              aria-hidden="true"
            >
              <svg viewBox="0 0 320 320" role="presentation">
                <g class="wheel-rotor" :style="{ transform: `rotate(${wheelRotation}deg)`, transitionDuration: `${wheelDuration}ms` }">
                  <path
                    v-for="(_, index) in items"
                    :key="`sector-${index}`"
                    class="wheel-sector"
                    :d="wheelSectorPath(index)"
                    :fill="wheelColors[index % wheelColors.length]"
                  />
                  <text
                    v-for="(item, index) in items"
                    :key="`label-${index}`"
                    class="wheel-label"
                    v-bind="wheelTextProps(index)"
                  >{{ shortWheelLabel(item) }}</text>
                </g>
              </svg>
              <span class="wheel-hub"><CircleDotDashed :size="30" /></span>
            </div>
            <div ref="resultRegion" class="wheel-outcome" tabindex="-1" aria-live="polite">
              <template v-if="result">
                <span>Выпало</span><strong>{{ result.result[0] }}</strong>
              </template>
              <template v-else-if="isRunning"><strong>Колесо вращается…</strong></template>
              <template v-else><strong>{{ items.length >= 2 ? 'Готово к запуску' : 'Добавьте сектора' }}</strong></template>
            </div>
          </div>
          <div v-else-if="isRunning" class="selection-loader" role="status" aria-live="polite">
            <div class="loader-rings"><span /><span /><span /></div>
            <strong>Случайность работает…</strong>
            <p>Определяем результат</p>
          </div>
          <div v-else-if="result" ref="resultRegion" class="winner-result" tabindex="-1" aria-live="polite">
            <span class="winner-spark"><Sparkles :size="21" aria-hidden="true" /></span>
            <p>{{ result.result.length > 1 ? 'Победители' : 'Результат' }}</p>
            <div class="result-values" :class="{ 'result-values--many': result.result.length > 1 }">
              <strong v-for="winner in result.result" :key="winner">{{ winner }}</strong>
            </div>
            <time :datetime="result.createdAt">{{ new Intl.DateTimeFormat('ru', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'long' }).format(new Date(result.createdAt)) }}</time>
          </div>
          <div v-else class="runner-empty">
            <div class="preview-number">?</div>
            <h2>{{ name || 'Новый розыгрыш' }}</h2>
            <p v-if="type === 'list'">{{ items.length }} вариантов · {{ winnersCount }} {{ winnersCount === 1 ? 'победитель' : 'победителя' }}</p>
            <p v-else-if="minError || maxError || rangeOrderError" class="runner-validation-note">Проверьте границы диапазона</p>
            <p v-else>{{ winnersCount }} {{ winnersCount === 1 ? 'число' : 'числа' }} от {{ min }} до {{ max }}</p>
          </div>
        </div>

        <button class="run-button" type="button" :disabled="!canRun || isRunning" @click="run">
          <RotateCcw v-if="result" :size="21" aria-hidden="true" />
          <Sparkles v-else :size="21" aria-hidden="true" />
          {{ isRunning ? (type === 'wheel' ? 'Колесо вращается…' : 'Выбираем…') : result ? 'Запустить ещё раз' : type === 'wheel' ? 'Крутить колесо' : 'Запустить рандомайзер' }}
        </button>
        <p class="runner-note">Результат сохраняется в локальной истории</p>
      </section>
    </div>
  </div>
</template>
