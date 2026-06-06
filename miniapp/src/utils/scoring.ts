import type { MockQuestion } from '@/data/mock/test'

export interface DimensionScoreResult {
  [dimKey: string]: number
}

interface ComputeOptions {
  /** If true, normalize raw scores to 0-100 percentages */
  normalize: boolean
}

/**
 * Compute dimension scores from user answers.
 *
 * For each answer, looks up the question's scoring map and adds the
 * per-dimension weights to the accumulator. Optionally normalizes
 * all scores to a 0-100 percentage scale.
 */
export function computeDimensionScores(
  answers: Record<string, number>,
  questions: MockQuestion[],
  options: ComputeOptions = { normalize: true },
): DimensionScoreResult {
  const rawScores: Record<string, number> = {}

  // Build a lookup map for questions
  const questionMap = new Map<string, MockQuestion>()
  for (const q of questions) questionMap.set(q.id, q)

  // Accumulate raw scores
  for (const [questionId, answerIdx] of Object.entries(answers)) {
    const question = questionMap.get(questionId)
    if (!question) continue
    const dimScores = question.scoring[answerIdx]
    if (!dimScores) continue
    for (const [dimKey, weight] of Object.entries(dimScores)) {
      rawScores[dimKey] = (rawScores[dimKey] || 0) + (weight as number)
    }
  }

  // Also seed ALL possible dimension keys (even those with 0 score)
  for (const q of questions) {
    for (const scores of Object.values(q.scoring)) {
      for (const dimKey of Object.keys(scores as object)) {
        if (!(dimKey in rawScores)) rawScores[dimKey] = 0
      }
    }
  }

  if (!options.normalize) return rawScores

  // Normalize to 0-100
  const result: Record<string, number> = {}
  let maxPossible = 0
  for (const q of questions) {
    let questionMax = 0
    for (const scores of Object.values(q.scoring)) {
      const sum = Object.values(scores as object).reduce((a: number, b: number) => a + b, 0)
      if (sum > questionMax) questionMax = sum
    }
    maxPossible += questionMax
  }

  if (maxPossible > 0) {
    for (const [key, raw] of Object.entries(rawScores)) {
      result[key] = Math.min(100, Math.round((raw / maxPossible) * 100))
    }
  } else {
    Object.assign(result, rawScores)
  }

  return result
}

/**
 * Get the top N dimension keys sorted by score descending.
 */
export function topDimensions(
  scores: Record<string, number>,
  n = 3,
): string[] {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key]) => key)
}
