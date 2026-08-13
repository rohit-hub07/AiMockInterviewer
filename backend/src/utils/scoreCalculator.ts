const DEFAULT_SKIPPED_ANSWER = "I don't know the answer of this question";

export const calculateLocalScore = (
  totalQuestions: number,
  answers: Array<{ answer: string; isSkipped?: boolean }>
): { score: number; answeredCount: number; skippedCount: number } => {
  if (totalQuestions === 0) {
    return { score: 0, answeredCount: 0, skippedCount: 0 };
  }

  const answeredCount = answers.filter(a => {
    if (a.isSkipped === true) return false;
    const text = (a.answer || "").trim();
    return text.length > 0 && text !== DEFAULT_SKIPPED_ANSWER;
  }).length;

  const skippedCount = totalQuestions - answeredCount;

  const participationScore = (answeredCount / totalQuestions) * 100;

  const score = Math.round(participationScore);

  return {
    score: Math.min(100, Math.max(0, score)),
    answeredCount,
    skippedCount,
  };
};
