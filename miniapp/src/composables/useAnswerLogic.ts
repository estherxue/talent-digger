import { ref, toRaw, computed, watch } from 'vue'
import type { Question } from '@shared/types/test'

/**
 * Core reactive state logic for the quiz answer page.
 * Extracted from answer.vue so the reactive state, navigation, answer
 * accumulation, and watch synchronization can be unit-tested independently
 * of the uni-app/page lifecycle.
 *
 * Uses ref + toRaw + spread for answers to avoid Proxy set-trap issues
 * observed with reactive() in the uni-app WeChat mini-program runtime.
 */
export function useAnswerLogic(initialQuestions: Question[] = []) {
  const currentIndex = ref(0)
  const totalQuestions = ref(initialQuestions.length)
  const questions = ref<Question[]>([...initialQuestions])

  const answers = ref<Record<string, number>>({})

  const selectedOption = ref<number>(-1)

  // ---- computed ----
  const currentQuestion = computed(() => questions.value[currentIndex.value] || null)

  const answeredCount = computed(() => Object.keys(answers.value).length)

  const unansweredCount = computed(() => totalQuestions.value - answeredCount.value)

  // ---- watch: sync selectedOption when navigating between questions ----
  // When currentIndex changes (or questions are first loaded), restore the
  // previously-chosen answer for the now-current question, or reset to -1.
  watch(
    [currentIndex, questions],
    () => {
      if (questions.value.length > 0) {
        const qid = questions.value[currentIndex.value]?.id
        if (qid) {
          const prev = answers.value[qid]
          selectedOption.value = prev !== undefined ? prev : -1
        }
      }
    },
    { immediate: true },
  )

  // ---- actions ----
  function selectOption(idx: number) {
    if (!currentQuestion.value) return
    // Use ref + toRaw + spread to avoid reactive Proxy set-trap failures
    // in the WeChat mini-program runtime.
    answers.value = { ...toRaw(answers.value), [currentQuestion.value.id]: idx }
    selectedOption.value = idx
  }

  function prevQuestion() {
    if (currentIndex.value > 0) {
      // Reset selectedOption *before* changing currentIndex so the UI never
      // shows a stale selection while the watch re-syncs.
      selectedOption.value = -1
      currentIndex.value--
    }
  }

  function nextQuestion() {
    if (currentIndex.value < totalQuestions.value - 1) {
      selectedOption.value = -1
      currentIndex.value++
    }
  }

  /** Replace the question list (e.g. after loading from the server). */
  function setQuestions(list: Question[]) {
    questions.value = list
    totalQuestions.value = list.length
  }

  /** Reset all state back to defaults (useful between test runs). */
  function reset() {
    currentIndex.value = 0
    totalQuestions.value = 0
    questions.value = []
    answers.value = {}
    selectedOption.value = -1
  }

  return {
    // state
    currentIndex,
    totalQuestions,
    questions,
    answers,
    selectedOption,
    // computed
    currentQuestion,
    answeredCount,
    unansweredCount,
    // actions
    selectOption,
    prevQuestion,
    nextQuestion,
    setQuestions,
    reset,
  }
}
