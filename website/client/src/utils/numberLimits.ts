export const RANDOM_NUMBER_MIN = -1_000_000_000
export const RANDOM_NUMBER_MAX = 1_000_000_000
export const MAX_DRAW_RESULTS = 10

const integerFormatter = new Intl.NumberFormat('ru-RU')

export const randomNumberLimitsLabel = `от ${integerFormatter.format(RANDOM_NUMBER_MIN)} до ${integerFormatter.format(RANDOM_NUMBER_MAX)}`

export function isAllowedRandomNumber(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isSafeInteger(value)
    && value >= RANDOM_NUMBER_MIN
    && value <= RANDOM_NUMBER_MAX
}

export function getRandomNumberError(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Введите число'
  if (!Number.isInteger(value)) return 'Введите целое число'
  if (!isAllowedRandomNumber(value)) return `Допустимы числа ${randomNumberLimitsLabel}`
  return ''
}
