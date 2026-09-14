<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-vue-next'
import AppLogo from '@/components/AppLogo.vue'

const route = useRoute()
const router = useRouter()
const mode = ref<'login' | 'register'>('login')
const showPassword = ref(false)
const email = ref('')
const password = ref('')
const submitted = ref(false)
const adminLogin = computed(() => route.query.role === 'admin')

function submit() {
  if (adminLogin.value) {
    localStorage.setItem('randomizer:admin-session', 'true')
    router.push(typeof route.query.redirect === 'string' ? route.query.redirect : '/admin')
    return
  }
  submitted.value = true
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-glow auth-glow--one" aria-hidden="true" />
    <div class="auth-glow auth-glow--two" aria-hidden="true" />
    <RouterLink to="/" class="auth-back"><ArrowLeft :size="18" aria-hidden="true" /> Вернуться</RouterLink>
    <section class="auth-card panel">
      <AppLogo />
      <div class="auth-heading">
        <span class="eyebrow accent">{{ adminLogin ? 'Закрытый раздел' : mode === 'login' ? 'С возвращением' : 'Новый аккаунт' }}</span>
        <h1>{{ adminLogin ? 'Вход администратора' : mode === 'login' ? 'Войдите в Randomizer' : 'Сохраните свои наборы' }}</h1>
        <p>{{ adminLogin ? 'Демонстрационная frontend-проверка доступа до подключения backend.' : mode === 'login' ? 'Продолжите с сохранёнными розыгрышами.' : 'Регистрация займёт меньше минуты.' }}</p>
      </div>
      <div v-if="adminLogin" class="auth-admin-note"><ShieldCheck :size="17" aria-hidden="true" /> В production роль должна подтверждаться сервером.</div>
      <form v-if="!submitted" @submit.prevent="submit">
        <div class="form-group">
          <label for="auth-email">Email</label>
          <div class="input-with-icon">
            <Mail :size="18" aria-hidden="true" />
            <input id="auth-email" v-model="email" type="email" autocomplete="email" placeholder="name@example.com" required />
          </div>
        </div>
        <div class="form-group">
          <div class="label-row"><label for="auth-password">Пароль</label><a v-if="mode === 'login'" href="#">Забыли пароль?</a></div>
          <div class="input-with-icon">
            <LockKeyhole :size="18" aria-hidden="true" />
            <input id="auth-password" v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" minlength="8" placeholder="Минимум 8 символов" required />
            <button type="button" :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'" @click="showPassword = !showPassword">
              <EyeOff v-if="showPassword" :size="18" aria-hidden="true" />
              <Eye v-else :size="18" aria-hidden="true" />
            </button>
          </div>
        </div>
        <button class="button button-primary button-large auth-submit" type="submit">{{ adminLogin ? 'Войти в админ-панель' : mode === 'login' ? 'Войти' : 'Создать аккаунт' }}</button>
      </form>
      <div v-else class="auth-placeholder" role="status">
        <span><LockKeyhole :size="22" aria-hidden="true" /></span>
        <h2>Форма готова к подключению</h2>
        <p>Backend пока не подключён, поэтому данные не отправлены.</p>
        <button class="button button-secondary" type="button" @click="submitted = false">Вернуться к форме</button>
      </div>
      <p v-if="!adminLogin" class="auth-switch">
        {{ mode === 'login' ? 'Впервые здесь?' : 'Уже есть аккаунт?' }}
        <button type="button" @click="mode = mode === 'login' ? 'register' : 'login'; submitted = false">
          {{ mode === 'login' ? 'Создать аккаунт' : 'Войти' }}
        </button>
      </p>
    </section>
    <p class="auth-footnote">Продолжая, вы соглашаетесь с условиями использования.</p>
  </main>
</template>
