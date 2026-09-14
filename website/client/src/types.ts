export type RandomizerType = 'list' | 'range' | 'wheel'

export interface Randomizer {
  id: string
  name: string
  type: RandomizerType
  items: string[]
  min: number
  max: number
  winnersCount: number
  updatedAt: string
}

export interface Draw {
  id: string
  randomizerId: string
  randomizerName: string
  type: RandomizerType
  result: string[]
  createdAt: string
  isForced?: boolean
}

export interface AdminRule {
  enabled: boolean
  values: string[]
  usageLimit: number | null
  remainingUses: number | null
  triggeredCount: number
  lastTriggeredAt: string | null
  updatedAt: string | null
}

export type AdminRules = Record<RandomizerType, AdminRule>

export interface Preferences {
  soundEnabled: boolean
  animationsEnabled: boolean
  volume: number
}
