import { describe, expect, it } from 'vitest'
import { consumeAdminRuleUse, isValidAdminRuleUseLimit, MAX_ADMIN_RULE_USES } from './adminRuleUsage'

describe('лимит срабатываний административного правила', () => {
  it('оставляет бессрочное правило активным', () => {
    expect(consumeAdminRuleUse(null)).toEqual({ remainingUses: null, enabled: true })
  })

  it('уменьшает счётчик после успешного срабатывания', () => {
    expect(consumeAdminRuleUse(3)).toEqual({ remainingUses: 2, enabled: true })
  })

  it('отключает правило после последнего срабатывания', () => {
    expect(consumeAdminRuleUse(1)).toEqual({ remainingUses: 0, enabled: false })
  })

  it('принимает только целые лимиты от 1 до максимума', () => {
    expect(isValidAdminRuleUseLimit(1)).toBe(true)
    expect(isValidAdminRuleUseLimit(MAX_ADMIN_RULE_USES)).toBe(true)
    expect(isValidAdminRuleUseLimit(0)).toBe(false)
    expect(isValidAdminRuleUseLimit(MAX_ADMIN_RULE_USES + 1)).toBe(false)
    expect(isValidAdminRuleUseLimit(1.5)).toBe(false)
  })
})
