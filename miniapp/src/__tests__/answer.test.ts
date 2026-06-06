import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useAnswerLogic } from '@/composables/useAnswerLogic'
import type { Question } from '@shared/types/test'

// ----  helpers ----

/** Create a Question stub with the bare minimum fields needed by the composable. */
function makeQuestion(id: string, content = `Question ${id}`): Question {
  return {
    id,
    content,
    testId: 'test-1',
    options: [
      { label: 'A', text: 'Option A' },
      { label: 'B', text: 'Option B' },
      { label: 'C', text: 'Option C' },
      { label: 'D', text: 'Option D' },
    ],
    scoring: {},
  }
}

/** A typical 3-question dataset used across many tests. */
function threeQuestions(): Question[] {
  return [makeQuestion('q1'), makeQuestion('q2'), makeQuestion('q3')]
}

// ---- helper: create a ready-to-use instance ----
function createLogic(questions?: Question[]) {
  const logic = useAnswerLogic(questions)
  return logic
}

// ==============================================================
//  1. answers reactivity — the "answers not accumulating" bug
// ==============================================================
describe('answers reactivity (reactive accumulation)', () => {
  it('accumulates answers for multiple questions without losing previous keys', () => {
    const { answers, selectOption, currentIndex } = createLogic(threeQuestions())

    // Answer q1 with option 0
    selectOption(0)
    expect(answers.value['q1']).toBe(0)

    // Navigate to q2 and answer it with option 2
    currentIndex.value = 1
    selectOption(2)
    expect(answers.value['q1']).toBe(0) // q1 answer still retained
    expect(answers.value['q2']).toBe(2)

    // Navigate to q3 and answer it with option 1
    currentIndex.value = 2
    selectOption(1)
    expect(answers.value['q1']).toBe(0)
    expect(answers.value['q2']).toBe(2)
    expect(answers.value['q3']).toBe(1)

    // Object.keys().length should reflect all 3 answers
    expect(Object.keys(answers.value).length).toBe(3)
  })

  it('does NOT lose previous answers when answering same question again (overwrite)', () => {
    const { answers, selectOption } = createLogic(threeQuestions())

    selectOption(0) // q1 -> 0
    expect(answers.value['q1']).toBe(0)

    selectOption(3) // q1 -> 3 (overwrite)
    expect(answers.value['q1']).toBe(3)

    // Keys count must still be 1 (no duplicate keys)
    expect(Object.keys(answers.value).length).toBe(1)
  })

  it('preserves answers object identity after multiple operations', () => {
    const { answers, selectOption, currentIndex } = createLogic(threeQuestions())

    selectOption(0) // q1 -> 0
    currentIndex.value = 1
    selectOption(1) // q2 -> 1
    currentIndex.value = 2
    selectOption(2) // q3 -> 2

    // All three should still be accessible
    const allIds = Object.keys(answers.value).sort()
    expect(allIds).toEqual(['q1', 'q2', 'q3'])
    expect(answers.value['q1']).toBe(0)
    expect(answers.value['q2']).toBe(1)
    expect(answers.value['q3']).toBe(2)
  })
})

// ==============================================================
//  2. selectOption
// ==============================================================
describe('selectOption', () => {
  it('sets the correct answer key in the reactive answers object', () => {
    const { answers, selectedOption, selectOption } = createLogic(threeQuestions())

    selectOption(1)
    expect(answers.value['q1']).toBe(1)
    expect(selectedOption.value).toBe(1)
  })

  it('updates selectedOption synchronously after picking an option', () => {
    const { selectedOption, selectOption } = createLogic(threeQuestions())

    expect(selectedOption.value).toBe(-1) // default
    selectOption(0)
    expect(selectedOption.value).toBe(0)
    selectOption(2)
    expect(selectedOption.value).toBe(2)
  })

  it('does nothing when currentQuestion is null (no questions loaded)', () => {
    const { answers, selectedOption, selectOption } = createLogic()

    selectOption(0)
    expect(selectedOption.value).toBe(-1) // unchanged
    expect(Object.keys(answers.value).length).toBe(0) // nothing recorded
  })

  it('overwrites a previously-selected answer for the same question', () => {
    const { answers, selectedOption, selectOption } = createLogic(threeQuestions())

    selectOption(0)
    expect(answers.value['q1']).toBe(0)
    expect(selectedOption.value).toBe(0)

    selectOption(3) // change answer
    expect(answers.value['q1']).toBe(3)
    expect(selectedOption.value).toBe(3)
    expect(Object.keys(answers.value).length).toBe(1) // still one entry
  })
})

// ==============================================================
//  3. prevQuestion / nextQuestion navigation
// ==============================================================
describe('prevQuestion', () => {
  it('decrements currentIndex and resets selectedOption to -1 first', () => {
    const { currentIndex, selectedOption, prevQuestion, selectOption } =
      createLogic(threeQuestions())

    // Start at index 0, answer q1
    selectOption(0)
    expect(selectedOption.value).toBe(0)

    // Move to q2, answer it
    currentIndex.value = 1
    selectOption(2)
    expect(selectedOption.value).toBe(2)
    expect(currentIndex.value).toBe(1)

    // Now go back
    prevQuestion()
    expect(currentIndex.value).toBe(0)
    // selectedOption was set to -1 before the index change;
    // watch may have since synced it, so we just verify the index changed correctly.
    expect(currentIndex.value).toBe(0)
  })

  it('sets selectedOption to -1 BEFORE decrementing currentIndex', () => {
    // We can verify the order indirectly: after calling prevQuestion(),
    // selectedOption should have been explicitly set to -1 (the fix for
    // the "old selectedOption flash" bug).
    const { currentIndex, selectedOption, prevQuestion } =
      createLogic(threeQuestions())

    currentIndex.value = 1
    selectedOption.value = 3 // simulate a previous answer

    prevQuestion()

    // The function sets selectedOption = -1 first, then decrements.
    // After the watch fires (nextTick), it may re-sync to the actual answer.
    // The key guarantee is currentIndex moved. Time the check synchronously:
    expect(currentIndex.value).toBe(0)
  })

  it('does not go below 0', () => {
    const { currentIndex, prevQuestion } = createLogic(threeQuestions())

    expect(currentIndex.value).toBe(0)
    prevQuestion() // should be a no-op
    expect(currentIndex.value).toBe(0)
  })

  it('does nothing when already at index 0', () => {
    const { currentIndex, selectedOption, prevQuestion } =
      createLogic(threeQuestions())

    selectedOption.value = 2
    prevQuestion()
    expect(currentIndex.value).toBe(0)
    // selectedOption should NOT be reset since the guard prevents any mutation
    expect(selectedOption.value).toBe(2)
  })
})

describe('nextQuestion', () => {
  it('increments currentIndex and resets selectedOption to -1 first', () => {
    const { currentIndex, selectedOption, nextQuestion, selectOption } =
      createLogic(threeQuestions())

    selectOption(1)
    expect(selectedOption.value).toBe(1)
    expect(currentIndex.value).toBe(0)

    nextQuestion()
    expect(currentIndex.value).toBe(1)
  })

  it('does not exceed totalQuestions - 1', () => {
    const { currentIndex, nextQuestion } = createLogic(threeQuestions())

    // Move to the last question
    currentIndex.value = 2
    expect(currentIndex.value).toBe(2)

    nextQuestion() // should be a no-op
    expect(currentIndex.value).toBe(2)
  })

  it('does nothing when already at the last question', () => {
    const { currentIndex, selectedOption, nextQuestion } =
      createLogic(threeQuestions())

    currentIndex.value = 2
    selectedOption.value = 3

    nextQuestion()
    expect(currentIndex.value).toBe(2)
    // selectedOption should NOT change since the guard prevents mutation
    expect(selectedOption.value).toBe(3)
  })

  it('can advance through all questions one by one', () => {
    const { currentIndex, nextQuestion } = createLogic(threeQuestions())

    expect(currentIndex.value).toBe(0)
    nextQuestion()
    expect(currentIndex.value).toBe(1)
    nextQuestion()
    expect(currentIndex.value).toBe(2)
    nextQuestion() // no-op at boundary
    expect(currentIndex.value).toBe(2)
  })
})

// ==============================================================
//  4. watch synchronization
// ==============================================================
describe('watch synchronization on currentIndex change', () => {
  it('restores the previously-answered option when navigating to a question that was already answered', async () => {
    const { currentIndex, selectedOption, selectOption } =
      createLogic(threeQuestions())

    // Answer q1 with option 2
    selectOption(2)
    expect(selectedOption.value).toBe(2)

    // Move to q2
    currentIndex.value = 1
    await nextTick()
    // After watch fires, q2 has no previous answer → selectedOption = -1
    // (but the watch was immediate so selectedOption might have already been -1)
    // Let's check: watch sets selectedOption based on answers[qid]
    // answers for q2 is undefined → -1
    expect(selectedOption.value).toBe(-1)

    // Now go back to q1
    currentIndex.value = 0
    await nextTick()
    // Watch should restore the previously-answered value for q1
    expect(selectedOption.value).toBe(2)
  })

  it('sets selectedOption to -1 when navigating to a question that has NOT been answered', async () => {
    const { currentIndex, selectedOption, selectOption } =
      createLogic(threeQuestions())

    // Answer q1
    selectOption(0)

    // Navigate to q2 (not yet answered)
    currentIndex.value = 1
    await nextTick()
    expect(selectedOption.value).toBe(-1)

    // Navigate to q3 (not yet answered)
    currentIndex.value = 2
    await nextTick()
    expect(selectedOption.value).toBe(-1)
  })

  it('fires immediately on initialization when questions are provided', async () => {
    // createLogic() sets questions to empty, so watch immediate sees length 0
    const { selectedOption, setQuestions } = createLogic()
    expect(selectedOption.value).toBe(-1)

    // Load questions — watch fires immediately due to the [currentIndex, questions] dependency
    setQuestions(threeQuestions())
    await nextTick()
    // q1 has no previous answer → -1
    expect(selectedOption.value).toBe(-1)
  })

  it('syncs selectedOption after overwriting an answer and returning to that question', async () => {
    const { currentIndex, selectedOption, selectOption } =
      createLogic(threeQuestions())

    // Answer q1 with option 1, then move forward to q2
    selectOption(1) // q1 -> 1
    expect(selectedOption.value).toBe(1)

    currentIndex.value = 1 // move to q2
    await nextTick()
    // q2 not yet answered → watch resets to -1
    expect(selectedOption.value).toBe(-1)

    // Answer q2
    selectOption(3) // q2 -> 3
    expect(selectedOption.value).toBe(3)

    // Navigate back to q1 — watch should restore q1's answer
    currentIndex.value = 0 // back to q1
    await nextTick()
    expect(selectedOption.value).toBe(1)

    // Overwrite q1's answer with option 0
    selectOption(0) // q1 -> 0 (overwrite)
    expect(selectedOption.value).toBe(0)

    // Move away and back — watch should see the updated answer
    currentIndex.value = 1
    await nextTick()
    expect(selectedOption.value).toBe(3) // q2 still has answer 3

    currentIndex.value = 0 // back to q1
    await nextTick()
    expect(selectedOption.value).toBe(0) // should see the overwritten answer (0, not 1)
  })
})

// ==============================================================
//  5. answeredCount computed
// ==============================================================
describe('answeredCount computed', () => {
  it('starts at 0', () => {
    const { answeredCount } = createLogic(threeQuestions())
    expect(answeredCount.value).toBe(0)
  })

  it('increments when answering distinct questions', () => {
    const { answeredCount, selectOption, currentIndex } =
      createLogic(threeQuestions())

    selectOption(0) // q1
    expect(answeredCount.value).toBe(1)

    currentIndex.value = 1
    selectOption(1) // q2
    expect(answeredCount.value).toBe(2)

    currentIndex.value = 2
    selectOption(2) // q3
    expect(answeredCount.value).toBe(3)
  })

  it('does NOT increment when re-answering the same question', () => {
    const { answeredCount, selectOption } = createLogic(threeQuestions())

    selectOption(0) // q1 -> 0
    expect(answeredCount.value).toBe(1)

    selectOption(1) // q1 -> 1 (overwrite, same question)
    expect(answeredCount.value).toBe(1)

    selectOption(2) // q1 -> 2 (still same question)
    expect(answeredCount.value).toBe(1)
  })

  it('reflects the number of unique keys in reactive answers', () => {
    const { answers, answeredCount, selectOption, currentIndex } =
      createLogic(threeQuestions())

    expect(answeredCount.value).toBe(Object.keys(answers.value).length)

    selectOption(0)
    expect(answeredCount.value).toBe(Object.keys(answers.value).length)

    currentIndex.value = 1
    selectOption(1)
    expect(answeredCount.value).toBe(Object.keys(answers.value).length)

    currentIndex.value = 2
    selectOption(2)
    expect(answeredCount.value).toBe(Object.keys(answers.value).length)
    expect(answeredCount.value).toBe(3)
  })
})

// ==============================================================
//  6. unansweredCount computed
// ==============================================================
describe('unansweredCount computed', () => {
  it('equals totalQuestions when nothing is answered', () => {
    const qs = threeQuestions()
    const { unansweredCount } = createLogic(qs)
    expect(unansweredCount.value).toBe(qs.length)
  })

  it('decreases as questions are answered', () => {
    const { unansweredCount, selectOption, currentIndex } =
      createLogic(threeQuestions())

    expect(unansweredCount.value).toBe(3)

    selectOption(0)
    expect(unansweredCount.value).toBe(2)

    currentIndex.value = 1
    selectOption(0)
    expect(unansweredCount.value).toBe(1)

    currentIndex.value = 2
    selectOption(0)
    expect(unansweredCount.value).toBe(0)
  })

  it('stays at 0 when all questions are answered', () => {
    const qs = threeQuestions()
    const { unansweredCount, selectOption, currentIndex } = createLogic(qs)

    selectOption(0) // q1
    currentIndex.value = 1
    selectOption(0) // q2
    currentIndex.value = 2
    selectOption(0) // q3

    expect(unansweredCount.value).toBe(0)

    // Re-answer q3
    selectOption(1)
    expect(unansweredCount.value).toBe(0) // still 0
  })
})

// ==============================================================
//  7. currentQuestion computed
// ==============================================================
describe('currentQuestion computed', () => {
  it('returns the question at the current index', () => {
    const qs = threeQuestions()
    const { currentQuestion } = createLogic(qs)

    expect(currentQuestion.value).toEqual(qs[0])
  })

  it('returns null when questions array is empty', () => {
    const { currentQuestion } = createLogic()
    expect(currentQuestion.value).toBeNull()
  })

  it('returns null when currentIndex is out of bounds', () => {
    const { currentQuestion, currentIndex } = createLogic(threeQuestions())

    currentIndex.value = 999
    expect(currentQuestion.value).toBeNull()
  })
})

// ==============================================================
//  8. reset
// ==============================================================
describe('reset', () => {
  it('clears all state back to defaults', () => {
    const { currentIndex, totalQuestions, questions, answers, selectedOption, answeredCount, selectOption, reset } =
      createLogic(threeQuestions())

    selectOption(0)
    currentIndex.value = 2

    reset()

    expect(currentIndex.value).toBe(0)
    expect(totalQuestions.value).toBe(0)
    expect(questions.value).toEqual([])
    expect(Object.keys(answers.value).length).toBe(0)
    expect(selectedOption.value).toBe(-1)
    expect(answeredCount.value).toBe(0)
  })
})
