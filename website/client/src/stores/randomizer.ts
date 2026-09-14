import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { AdminRules, Draw, Preferences, Randomizer, RandomizerType } from '@/types'
import { consumeAdminRuleUse, isValidAdminRuleUseLimit } from '@/utils/adminRuleUsage'
import { isAllowedRandomNumber, MAX_DRAW_RESULTS } from '@/utils/numberLimits'

const randomizerTypes: RandomizerType[] = ['list', 'range', 'wheel']

const starterRandomizers: Randomizer[] = [
  {
    id: 'starter-team',
    name: 'Кто отвечает сегодня?',
    type: 'list',
    items: ['Алексей', 'Мария', 'Илья', 'София', 'Данил'],
    min: 1,
    max: 100,
    winnersCount: 1,
    updatedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
  {
    id: 'starter-number',
    name: 'Счастливое число',
    type: 'range',
    items: [],
    min: 1,
    max: 100,
    winnersCount: 1,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'starter-wheel',
    name: 'Колесо команды',
    type: 'wheel',
    items: ['Дизайн', 'Код', 'Тесты', 'Демо', 'Перерыв', 'Ревью'],
    min: 1,
    max: 100,
    winnersCount: 1,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
  },
]

function readLocal<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved ? (JSON.parse(saved) as T) : fallback
  } catch {
    return fallback
  }
}

function readAdminRules(): AdminRules {
  const saved = readLocal<Partial<AdminRules>>('randomizer:admin-rules', {})
  return Object.fromEntries(randomizerTypes.map((type) => {
    const rule = saved[type]
    const usageLimit = isValidAdminRuleUseLimit(rule?.usageLimit) ? rule.usageLimit : null
    const savedRemainingUses = rule?.remainingUses
    const remainingUses = usageLimit === null
      ? null
      : typeof savedRemainingUses === 'number' && Number.isSafeInteger(savedRemainingUses)
        ? Math.min(usageLimit, Math.max(0, savedRemainingUses))
        : usageLimit
    return [type, {
      enabled: Boolean(rule?.enabled) && (remainingUses === null || remainingUses > 0),
      values: Array.isArray(rule?.values) ? rule.values.filter((value): value is string => typeof value === 'string') : [],
      usageLimit,
      remainingUses,
      triggeredCount: typeof rule?.triggeredCount === 'number' && Number.isSafeInteger(rule.triggeredCount) ? Math.max(0, rule.triggeredCount) : 0,
      lastTriggeredAt: typeof rule?.lastTriggeredAt === 'string' ? rule.lastTriggeredAt : null,
      updatedAt: typeof rule?.updatedAt === 'string' ? rule.updatedAt : null,
    }]
  })) as AdminRules
}

export const useRandomizerStore = defineStore('randomizer', () => {
  const randomizers = ref<Randomizer[]>(readLocal('randomizer:sets', starterRandomizers))
  const history = ref<Draw[]>(readLocal('randomizer:history', []))
  const preferences = ref<Preferences>(
    readLocal('randomizer:preferences', {
      soundEnabled: true,
      animationsEnabled: true,
      volume: 60,
    }),
  )
  const adminRules = ref<AdminRules>(readAdminRules())

  watch(randomizers, (value) => localStorage.setItem('randomizer:sets', JSON.stringify(value)), { deep: true })
  watch(history, (value) => localStorage.setItem('randomizer:history', JSON.stringify(value)), { deep: true })
  watch(preferences, (value) => localStorage.setItem('randomizer:preferences', JSON.stringify(value)), { deep: true })
  watch(adminRules, (value) => localStorage.setItem('randomizer:admin-rules', JSON.stringify(value)), { deep: true })

  function generateId(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }

  function saveRandomizer(input: Omit<Randomizer, 'id' | 'updatedAt'> & { id?: string }) {
    const next: Randomizer = {
      ...input,
      id: input.id || generateId('set'),
      updatedAt: new Date().toISOString(),
    }
    const index = randomizers.value.findIndex((item) => item.id === next.id)
    if (index >= 0) randomizers.value[index] = next
    else randomizers.value.unshift(next)
    return next
  }

  function deleteRandomizer(id: string) {
    randomizers.value = randomizers.value.filter((item) => item.id !== id)
  }

  function drawList(items: string[], winnersCount: number) {
    const pool = [...items]
    const winners: string[] = []
    const count = Math.min(winnersCount, pool.length)
    for (let i = 0; i < count; i += 1) {
      const index = Math.floor(Math.random() * pool.length)
      const [winner] = pool.splice(index, 1)
      if (winner !== undefined) winners.push(winner)
    }
    return winners
  }

  function drawRange(min: number, max: number, winnersCount: number) {
    if (!isAllowedRandomNumber(min) || !isAllowedRandomNumber(max) || min > max) return []
    const available = Math.max(0, max - min + 1)
    const safeWinnersCount = Number.isSafeInteger(winnersCount) ? winnersCount : 1
    const count = Math.min(Math.max(1, safeWinnersCount), available, MAX_DRAW_RESULTS)
    const selected = new Set<number>()
    while (selected.size < count) selected.add(Math.floor(Math.random() * available) + min)
    return [...selected].map(String)
  }

  function applyAdminRule(type: RandomizerType, naturalResult: string[], payload: { items: string[]; min: number; max: number; winnersCount: number }) {
    const rule = adminRules.value[type]
    if (!rule.enabled || !rule.values.length) return { result: naturalResult, isForced: false }

    const targetCount = type === 'wheel' ? 1 : payload.winnersCount
    const allowed = rule.values.filter((value, index, values) => {
      if (values.indexOf(value) !== index) return false
      if (type === 'range') {
        const number = Number(value)
        return isAllowedRandomNumber(number) && number >= payload.min && number <= payload.max
      }
      return payload.items.includes(value)
    })
    if (!allowed.length) return { result: naturalResult, isForced: false }

    const forced = allowed.slice(0, targetCount)
    const remainder = naturalResult.filter((value) => !forced.includes(value))
    const usage = consumeAdminRuleUse(rule.remainingUses)
    adminRules.value[type] = {
      ...rule,
      enabled: usage.enabled,
      remainingUses: usage.remainingUses,
      triggeredCount: rule.triggeredCount + 1,
      lastTriggeredAt: new Date().toISOString(),
    }
    return { result: [...forced, ...remainder].slice(0, targetCount), isForced: true }
  }

  function runDraw(payload: {
    randomizerId?: string
    name: string
    type: RandomizerType
    items: string[]
    min: number
    max: number
    winnersCount: number
  }) {
    const naturalResult = payload.type === 'list' || payload.type === 'wheel'
      ? drawList(payload.items, payload.winnersCount)
      : drawRange(payload.min, payload.max, payload.winnersCount)
    const { result, isForced } = applyAdminRule(payload.type, naturalResult, payload)
    const draw: Draw = {
      id: generateId('draw'),
      randomizerId: payload.randomizerId || 'guest',
      randomizerName: payload.name || 'Быстрый выбор',
      type: payload.type,
      result,
      createdAt: new Date().toISOString(),
      isForced,
    }
    history.value.unshift(draw)
    return draw
  }

  function clearHistory() {
    history.value = []
  }

  function updateAdminRule(type: RandomizerType, enabled: boolean, values: string[], usageLimit: number | null) {
    const normalizedUsageLimit = isValidAdminRuleUseLimit(usageLimit) ? usageLimit : null
    adminRules.value[type] = {
      enabled,
      values,
      usageLimit: normalizedUsageLimit,
      remainingUses: normalizedUsageLimit,
      triggeredCount: 0,
      lastTriggeredAt: null,
      updatedAt: new Date().toISOString(),
    }
  }

  return { randomizers, history, preferences, adminRules, saveRandomizer, deleteRandomizer, runDraw, clearHistory, updateAdminRule }
})
