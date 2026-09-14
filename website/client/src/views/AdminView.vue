<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Check, CircleDotDashed, Hash, ListChecks, LogOut, Save, ShieldAlert, ShieldCheck, TimerReset } from 'lucide-vue-next'
import { useRandomizerStore } from '@/stores/randomizer'
import type { AdminRule, RandomizerType } from '@/types'
import { isValidAdminRuleUseLimit, MAX_ADMIN_RULE_USES } from '@/utils/adminRuleUsage'
import { getRandomNumberError, MAX_DRAW_RESULTS, randomNumberLimitsLabel } from '@/utils/numberLimits'

const store = useRandomizerStore()
const router = useRouter()
const activeType = ref<RandomizerType>('list')
const enabled = ref(false)
const rawValues = ref('')
const usageMode = ref<'unlimited' | 'limited'>('unlimited')
const usageLimit = ref(1)
const saved = ref(false)

const typeOptions = [
  { value: 'list' as const, label: 'Список', icon: ListChecks },
  { value: 'range' as const, label: 'Числа', icon: Hash },
  { value: 'wheel' as const, label: 'Колесо', icon: CircleDotDashed },
]

const values = computed(() => rawValues.value.split(/[\n,]/).map((value) => value.trim()).filter(Boolean))
const activeLabel = computed(() => typeOptions.find((option) => option.value === activeType.value)?.label || '')
const usageLimitError = computed(() => enabled.value && usageMode.value === 'limited' && !isValidAdminRuleUseLimit(usageLimit.value)
  ? `Введите целое число от 1 до ${MAX_ADMIN_RULE_USES}`
  : '')
const valuesError = computed(() => {
  if (!enabled.value) return ''
  if (!values.value.length) return 'Добавьте хотя бы одно значение или выключите правило'
  if (activeType.value !== 'range') return ''
  if (values.value.length > MAX_DRAW_RESULTS) return `Можно задать не больше ${MAX_DRAW_RESULTS} чисел`
  for (const value of values.value) {
    const numberError = getRandomNumberError(Number(value))
    if (numberError) return `Значение «${value}»: ${numberError.toLocaleLowerCase()}`
  }
  return ''
})
const formError = computed(() => valuesError.value || usageLimitError.value)

function ruleStatus(rule: AdminRule) {
  if (rule.enabled && rule.remainingUses === null) return `${rule.values.length} знач. · без лимита`
  if (rule.enabled) return `${rule.remainingUses} из ${rule.usageLimit} сраб.`
  if (rule.usageLimit !== null && rule.remainingUses === 0) return 'Лимит исчерпан'
  return 'Выключено'
}

function loadRule() {
  const rule = store.adminRules[activeType.value]
  enabled.value = rule.enabled
  rawValues.value = rule.values.join('\n')
  usageMode.value = rule.usageLimit === null ? 'unlimited' : 'limited'
  usageLimit.value = rule.remainingUses || rule.usageLimit || 1
  saved.value = false
}

function saveRule() {
  if (formError.value) return
  store.updateAdminRule(activeType.value, enabled.value, values.value, usageMode.value === 'limited' ? usageLimit.value : null)
  saved.value = true
  window.setTimeout(() => { saved.value = false }, 1800)
}

function logout() {
  localStorage.removeItem('randomizer:admin-session')
  router.push('/')
}

watch(activeType, loadRule, { immediate: true })
</script>

<template>
  <div class="page-content admin-page">
    <div class="page-title-row">
      <div>
        <span class="eyebrow admin-accent">Управление результатами</span>
        <h1>Админ-панель</h1>
        <p>Настройте значения, которые должны появиться при следующем запуске.</p>
      </div>
      <button class="button button-secondary" type="button" @click="logout"><LogOut :size="17" aria-hidden="true" /> Выйти</button>
    </div>

    <div class="admin-warning panel">
      <ShieldAlert :size="22" aria-hidden="true" />
      <div>
        <strong>Frontend-прототип</strong>
        <p>Текущий доступ хранится в браузере и не является защитой. Для production понадобятся серверная роль, журнал действий и проверка каждого запроса.</p>
      </div>
    </div>

    <div class="admin-layout">
      <section class="admin-editor panel">
        <div class="admin-section-heading">
          <span class="settings-icon settings-icon--admin"><ShieldCheck :size="20" aria-hidden="true" /></span>
          <div><h2>Принудительный результат</h2><p>Правило применяется только к выбранному типу.</p></div>
        </div>

        <div class="admin-type-switch" role="radiogroup" aria-label="Тип рандомайзера">
          <button
            v-for="option in typeOptions"
            :key="option.value"
            type="button"
            role="radio"
            :aria-checked="activeType === option.value"
            :class="{ active: activeType === option.value }"
            @click="activeType = option.value"
          >
            <component :is="option.icon" :size="18" aria-hidden="true" /> {{ option.label }}
          </button>
        </div>

        <label class="setting-row admin-toggle-row">
          <span><strong>Активировать правило</strong><small>Подходящие значения заменят случайный результат</small></span>
          <input v-model="enabled" class="switch-input" type="checkbox" />
        </label>

        <div class="form-group admin-values-field">
          <label for="admin-values">Значения для режима «{{ activeLabel }}»</label>
          <textarea
            id="admin-values"
            v-model="rawValues"
            rows="7"
            maxlength="4000"
            :aria-invalid="Boolean(valuesError)"
            :aria-describedby="valuesError ? 'admin-values-error admin-values-help' : 'admin-values-help'"
            :placeholder="activeType === 'range' ? 'Например:\n42\n73' : 'Каждое значение с новой строки'"
          />
          <p v-if="valuesError" id="admin-values-error" class="field-note field-note--error" role="alert">{{ valuesError }}</p>
          <p id="admin-values-help" class="field-note">{{ activeType === 'range' ? `До ${MAX_DRAW_RESULTS} целых чисел ${randomNumberLimitsLabel}. Значения вне выбранного пользователем диапазона будут пропущены.` : activeType === 'wheel' ? 'Значение должно точно совпадать с подписью сектора.' : 'Значения должны точно совпадать с вариантами списка.' }}</p>
        </div>

        <fieldset class="admin-usage-panel">
          <legend>Срок действия правила</legend>
          <div class="admin-usage-heading">
            <TimerReset :size="18" aria-hidden="true" />
            <p>Счётчик уменьшается только после успешной подстановки подходящего значения.</p>
          </div>
          <div class="admin-usage-grid">
            <div class="form-group">
              <label for="admin-usage-mode">Режим</label>
              <select id="admin-usage-mode" v-model="usageMode">
                <option value="unlimited">Пока не выключу</option>
                <option value="limited">Ограничить количество</option>
              </select>
            </div>
            <div v-if="usageMode === 'limited'" class="form-group">
              <label for="admin-usage-limit">Количество срабатываний</label>
              <input
                id="admin-usage-limit"
                v-model.number="usageLimit"
                type="number"
                inputmode="numeric"
                min="1"
                :max="MAX_ADMIN_RULE_USES"
                step="1"
                :aria-invalid="Boolean(usageLimitError)"
                :aria-describedby="usageLimitError ? 'admin-usage-limit-error' : 'admin-usage-limit-help'"
              />
              <p v-if="usageLimitError" id="admin-usage-limit-error" class="field-note field-note--error" role="alert">{{ usageLimitError }}</p>
              <p v-else id="admin-usage-limit-help" class="field-note">После последнего раза правило отключится.</p>
            </div>
          </div>
        </fieldset>

        <button class="button button-primary admin-save" type="button" :disabled="Boolean(formError)" @click="saveRule">
          <Check v-if="saved" :size="18" aria-hidden="true" />
          <Save v-else :size="18" aria-hidden="true" />
          {{ saved ? 'Настройка сохранена' : 'Сохранить правило' }}
        </button>
      </section>

      <aside class="admin-summary panel">
        <span class="eyebrow">Активные правила</span>
        <div v-for="option in typeOptions" :key="option.value" class="admin-rule-card">
          <component :is="option.icon" :size="18" aria-hidden="true" />
          <div>
            <strong>{{ option.label }}</strong>
            <span role="status" aria-atomic="true">{{ ruleStatus(store.adminRules[option.value]) }}</span>
            <small v-if="store.adminRules[option.value].triggeredCount">Всего сработало: {{ store.adminRules[option.value].triggeredCount }}</small>
          </div>
          <i :class="{ active: store.adminRules[option.value].enabled }" aria-hidden="true" />
        </div>
        <p>Принудительные результаты помечаются в итоговом экране и локальной истории.</p>
      </aside>
    </div>
  </div>
</template>
