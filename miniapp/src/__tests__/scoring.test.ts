import { describe, it, expect } from 'vitest'
import { computeDimensionScores } from '@/utils/scoring'
import type { MockQuestion } from '@/data/mock/test'

const sampleQuestions: MockQuestion[] = [
  {
    id: 'q1', content: 'Test Q1',
    options: [
      { label: 'A', text: 'Opt A' },
      { label: 'B', text: 'Opt B' },
    ],
    scoring: {
      0: { logic: 3, exec: 1 },
      1: { creativity: 2 },
    },
  },
  {
    id: 'q2', content: 'Test Q2',
    options: [
      { label: 'A', text: 'Opt A' },
      { label: 'B', text: 'Opt B' },
    ],
    scoring: {
      0: { logic: 1, memory: 2 },
      1: { exec: 3 },
    },
  },
]

describe('computeDimensionScores', () => {
  it('accumulates scores from multiple questions', () => {
    const answers: Record<string, number> = { q1: 0, q2: 0 }
    const result = computeDimensionScores(answers, sampleQuestions, { normalize: false })
    expect(result).toHaveProperty('logic')
    expect(result).toHaveProperty('exec')
    expect(result).toHaveProperty('memory')
    expect(result.logic).toBe(4)
    expect(result.exec).toBe(1)
    expect(result.memory).toBe(2)
  })

  it('handles empty answers', () => {
    const result = computeDimensionScores({}, sampleQuestions, { normalize: false })
    expect(Object.keys(result).length).toBeGreaterThan(0)
    Object.values(result).forEach(v => expect(v).toBe(0))
  })

  it('normalizes scores to percentages 0-100', () => {
    const answers: Record<string, number> = { q1: 0, q2: 1 }
    const result = computeDimensionScores(answers, sampleQuestions, { normalize: true })
    Object.values(result).forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(100)
    })
  })

  it('returns all known dimension keys even with zero scores', () => {
    const answers: Record<string, number> = {}
    const result = computeDimensionScores(answers, sampleQuestions, { normalize: false })
    expect(result).toHaveProperty('logic')
    expect(result).toHaveProperty('exec')
    expect(result).toHaveProperty('creativity')
    expect(result).toHaveProperty('memory')
  })

  it('returns empty object for empty question list', () => {
    const result = computeDimensionScores({ q1: 0 }, [], { normalize: false })
    expect(Object.keys(result).length).toBe(0)
  })
})
