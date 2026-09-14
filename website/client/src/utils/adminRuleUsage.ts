export const MAX_ADMIN_RULE_USES = 100

export function isValidAdminRuleUseLimit(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isSafeInteger(value)
    && value >= 1
    && value <= MAX_ADMIN_RULE_USES
}

export function consumeAdminRuleUse(remainingUses: number | null) {
  if (remainingUses === null) return { remainingUses: null, enabled: true }
  const nextRemainingUses = Math.max(0, remainingUses - 1)
  return { remainingUses: nextRemainingUses, enabled: nextRemainingUses > 0 }
}
