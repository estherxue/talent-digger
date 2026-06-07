import { describe, it, expect } from 'vitest'
import {
  cosSim,
  riasecToTalent,
  careerMatch,
  combineScores,
  toVector,
  careerVector,
  CAREER_LIBRARY,
} from '@/utils/careerMatch'

// ---- cosSim ----
describe('cosSim', () => {
  it('returns 1 for identical vectors', () => {
    expect(cosSim([1, 2, 3], [1, 2, 3])).toBeCloseTo(1)
  })

  it('returns 0 for orthogonal vectors', () => {
    expect(cosSim([1, 0], [0, 1])).toBe(0)
  })

  it('returns 0 when either vector is zero', () => {
    expect(cosSim([0, 0], [1, 2])).toBe(0)
    expect(cosSim([1, 2], [0, 0])).toBe(0)
  })

  it('handles the design doc example: U=[85,62,90,71,45], C=[100,0,0,100,0]', () => {
    // dot = 85*100 + 71*100 = 15600
    // |U| = sqrt(85²+62²+90²+71²+45²) = sqrt(7225+3844+8100+5041+2025) = sqrt(26235) ≈ 161.97
    // |C| = sqrt(100²+100²) = sqrt(20000) ≈ 141.42
    // sim = 15600 / (161.97 * 141.42) ≈ 0.681
    const sim = cosSim([85, 62, 90, 71, 45], [100, 0, 0, 100, 0])
    expect(sim).toBeCloseTo(0.681, 2)
  })
})

// ---- riasecToTalent ----
describe('riasecToTalent', () => {
  it('converts high I (investigative) to logic focus', () => {
    const result = riasecToTalent({ I: 90 })
    expect(result.logic).toBeGreaterThan(50)
    expect(result.learn).toBeGreaterThan(0)
    expect(result.observation).toBeGreaterThan(0)
  })

  it('converts high S (social) to empathy focus', () => {
    const result = riasecToTalent({ S: 85 })
    expect(result.empathy).toBeGreaterThan(50)
    expect(result.comm).toBeGreaterThan(0)
  })

  it('converts full RIASEC with mixed values', () => {
    const result = riasecToTalent({
      R: 40, I: 85, A: 70, S: 55, E: 30, C: 60,
    })
    // All output values should be 0-100
    for (const v of Object.values(result)) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(100)
    }
    // I is strongest → logic should be high
    expect(result.logic).toBeGreaterThan(50)
    // E is weakest → lead should be relatively low
    expect(result.lead).toBeLessThan(50)
  })

  it('returns all 10 dimensions even when no scores given', () => {
    const result = riasecToTalent({})
    expect(Object.keys(result).length).toBe(10)
    for (const v of Object.values(result)) {
      expect(v).toBe(0)
    }
  })

  it('handles unknown RIASEC keys gracefully', () => {
    const result = riasecToTalent({ X: 99 })
    expect(Object.keys(result).length).toBe(10)
  })
})

// ---- careerMatch ----
describe('careerMatch', () => {
  it('returns top 5 matches for talent scores by default', () => {
    const scores = {
      logic: 85, creativity: 72, memory: 65, observation: 78, comm: 58,
      lead: 45, exec: 90, empathy: 62, resilience: 70, learn: 82,
    }
    const matches = careerMatch(scores, 'talent')
    expect(matches.length).toBe(5)
    // First match should have highest score
    expect(matches[0].matchScore).toBeGreaterThanOrEqual(matches[1].matchScore)
    // All scores should be 0-100
    for (const m of matches) {
      expect(m.matchScore).toBeGreaterThanOrEqual(0)
      expect(m.matchScore).toBeLessThanOrEqual(100)
    }
  })

  it('returns different results for different score profiles', () => {
    const techScores = { logic: 90, exec: 85, learn: 80, creativity: 40, comm: 30, lead: 20, observation: 60, empathy: 25, resilience: 35, memory: 55 }
    const creativeScores = { logic: 30, exec: 35, learn: 40, creativity: 90, comm: 85, lead: 45, observation: 80, empathy: 70, resilience: 30, memory: 40 }

    const techMatches = careerMatch(techScores, 'talent')
    const creativeMatches = careerMatch(creativeScores, 'talent')

    // Top careers should differ
    const techTop = techMatches[0]?.careerName
    const creativeTop = creativeMatches[0]?.careerName
    expect(techTop).not.toBe(creativeTop)
  })

  it('works for holland test type', () => {
    const hollandScores = { I: 85, R: 40, A: 70, S: 55, E: 30, C: 60 }
    const matches = careerMatch(hollandScores, 'holland')
    expect(matches.length).toBe(5)
    // Should favor investigative careers (logic-heavy)
    expect(matches.some(m => m.careerName === '数据分析师' || m.careerName === '科研人员')).toBe(true)
  })

  it('works for combined test type', () => {
    const scores = { logic: 85, creativity: 72, memory: 65, observation: 78, comm: 58, lead: 45, exec: 90, empathy: 62, resilience: 70, learn: 82 }
    const matches = careerMatch(scores, 'combined')
    expect(matches.length).toBe(5)
  })

  it('respects topN parameter', () => {
    const scores = { logic: 85, exec: 90, learn: 82 }
    expect(careerMatch(scores, 'talent', 3).length).toBe(3)
    expect(careerMatch(scores, 'talent', 8).length).toBe(8)
  })

  it('returns empty for all-zero scores', () => {
    const scores = { logic: 0, exec: 0, learn: 0 }
    const matches = careerMatch(scores, 'talent')
    expect(matches.every(m => m.matchScore === 0)).toBe(true)
  })
})

// ---- combineScores ----
describe('combineScores', () => {
  it('takes max per dimension', () => {
    const talent = { logic: 85, creativity: 40, exec: 60 }
    const holland = { I: 10, A: 90, C: 30 } // I→logic, A→creativity, C→exec
    const combined = combineScores(talent, holland)

    expect(combined.logic).toBe(85)  // talent logic > riasec→logic
    // creativity should be > 40 since A=90 maps strongly to creativity
    expect(combined.creativity).toBeGreaterThan(40)
  })

  it('returns all 10 dimensions', () => {
    const talent = { logic: 50 }
    const holland = { I: 50 }
    const combined = combineScores(talent, holland)
    expect(Object.keys(combined).length).toBe(10)
  })
})

// ---- toVector / careerVector ----
describe('toVector', () => {
  it('returns a 10-element array', () => {
    expect(toVector({ logic: 85, exec: 90 }).length).toBe(10)
  })

  it('fills missing dims with 0', () => {
    const vec = toVector({ logic: 50 })
    const nonZeroCount = vec.filter(v => v !== 0).length
    expect(nonZeroCount).toBe(1)
  })
})

describe('careerVector', () => {
  it('returns 100 for tagged dims, 0 for untagged', () => {
    const career = CAREER_LIBRARY[0] // 数据分析师: logic, observation
    const vec = careerVector(career)
    expect(vec.length).toBe(10)
    // logic and observation should be 100
    const logicIdx = vec.findIndex((_, i) => i === 0) // logic is at index 0
    const obsIdx = 3 // observation is at index 3
    expect(vec[logicIdx]).toBe(100)
    expect(vec[obsIdx]).toBe(100)
  })
})

// ---- Snapshot test for consistent matching ----
describe('careerMatch snapshot', () => {
  it('produces consistent top-5 for a fixed answer profile', () => {
    const scores = {
      logic: 85, creativity: 72, memory: 65, observation: 78, comm: 58,
      lead: 45, exec: 90, empathy: 62, resilience: 70, learn: 82,
    }
    const matches = careerMatch(scores, 'talent', 5)
    const snapshot = matches.map(m => ({ name: m.careerName, score: m.matchScore }))
    expect(snapshot).toMatchSnapshot()
  })

  it('produces consistent top-5 for holland scores', () => {
    const hollandScores = { R: 40, I: 85, A: 70, S: 55, E: 30, C: 60 }
    const matches = careerMatch(hollandScores, 'holland', 5)
    const snapshot = matches.map(m => ({ name: m.careerName, score: m.matchScore }))
    expect(snapshot).toMatchSnapshot()
  })
})
