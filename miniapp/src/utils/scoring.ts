import type { MockQuestion } from '@/data/mock/test'

export interface DimensionScoreResult {
  [dimKey: string]: number
}

interface ComputeOptions {
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

  // Compute per-dimension max possible score
  const dimMaxPossible: Record<string, number> = {}
  for (const q of questions) {
    const dimBest: Record<string, number> = {}
    for (const optScores of Object.values(q.scoring)) {
      for (const [dimKey, weight] of Object.entries(optScores as object)) {
        dimBest[dimKey] = Math.max(dimBest[dimKey] || 0, weight as number)
      }
    }
    for (const [dimKey, best] of Object.entries(dimBest)) {
      dimMaxPossible[dimKey] = (dimMaxPossible[dimKey] || 0) + best
    }
  }

  const result: Record<string, number> = {}
  for (const [key, raw] of Object.entries(rawScores)) {
    const maxPossible = dimMaxPossible[key] || 1
    result[key] = Math.min(100, Math.round((raw / maxPossible) * 100))
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
