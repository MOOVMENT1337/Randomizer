import { describe, expect, it } from 'vitest'
import {
  getRandomNumberError,
  isAllowedRandomNumber,
  RANDOM_NUMBER_MAX,
  RANDOM_NUMBER_MIN,
} from './numberLimits'

describe('ограничения числового рандомайзера', () => {
  it('принимает обе безопасные границы', () => {
    expect(isAllowedRandomNumber(RANDOM_NUMBER_MIN)).toBe(true)
    expect(isAllowedRandomNumber(RANDOM_NUMBER_MAX)).toBe(true)
  })

  it('отклоняет чрезмерно большое число', () => {
    expect(isAllowedRandomNumber(9 ** 30)).toBe(false)
    expect(getRandomNumberError(9 ** 30)).toContain('Допустимы числа')
  })

  it('отклоняет дробные и нечисловые значения', () => {
    expect(getRandomNumberError(1.5)).toBe('Введите целое число')
    expect(getRandomNumberError(Number.POSITIVE_INFINITY)).toBe('Введите число')
    expect(getRandomNumberError('42')).toBe('Введите число')
  })
})
