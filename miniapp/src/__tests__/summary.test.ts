import { describe, it, expect } from 'vitest'
import { generateSummary } from '@/utils/summary'

describe('generateSummary', () => {
  it('returns "逻辑缜密的行动派" when top dims include exec + logic', () => {
    const top = ['exec', 'logic', 'learn']
    expect(generateSummary(top)).toContain('逻辑缜密')
    expect(generateSummary(top)).toContain('行动派')
  })

  it('returns "敏锐细腻的创造者" when top dims include creativity + observation', () => {
    const top = ['creativity', 'observation', 'memory']
    expect(generateSummary(top)).toContain('创造者')
  })

  it('returns "善解人意的沟通者" when top dims include empathy + comm', () => {
    const top = ['empathy', 'comm', 'observation']
    expect(generateSummary(top)).toContain('沟通者')
  })

  it('returns "坚韧不拔的领导者" when top dims include lead + resilience', () => {
    const top = ['lead', 'resilience', 'exec']
    expect(generateSummary(top)).toContain('领导者')
  })

  it('returns fallback when no pattern matches', () => {
    // Use dimension set that doesn't match any specific pattern (no exec+logic, no creativity+observation, etc.)
    const top = ['memory', 'resilience', 'realistic']
    expect(generateSummary(top)).toContain('探索者')
  })

  it('handles empty array', () => {
    expect(generateSummary([])).toBeDefined()
    expect(typeof generateSummary([])).toBe('string')
  })
})
