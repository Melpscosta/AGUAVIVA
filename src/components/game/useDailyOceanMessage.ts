import { useMemo } from 'react'
import { OCEAN_MESSAGES } from './oceanMessages'
import type { OceanMessage } from './types'

function dayIndex(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

export function useDailyOceanMessage(): OceanMessage {
  return useMemo(() => {
    const index = dayIndex() % OCEAN_MESSAGES.length
    const message = OCEAN_MESSAGES[index]
    const today = new Date().toISOString().slice(0, 10)
    return { ...message, date: today }
  }, [])
}
