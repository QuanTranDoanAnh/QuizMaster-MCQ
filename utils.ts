import { Question, Option } from './types';

// Fisher-Yates Shuffle
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const parseMarkdown = (text: string): Question[] => {
  const lines = text.split('\n');
  const questions: Question[] = [];
  let currentQuestion: Partial<Question> | null = null;
  let optionCounter = 0;

  // Regex to identify question start: **Question 1:** or **Question 1**:
  const questionRegex = /^\*\*Question\s+(\d+)\s*:?:?\*\*\s*:?\s*(.*)/i;
  // Regex to identify options: a. Text or **a. Text**
  // Captures: 1=BoldStart, 2=Letter, 3=Text, 4=BoldEnd
  const optionRegex = /^(\*\*)?\s*([a-zA-Z])\.\s+(.*?)(\*\*)?$/;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    const questionMatch = trimmedLine.match(questionRegex);
    if (questionMatch) {
      // Save previous question if exists
      if (currentQuestion && currentQuestion.options && currentQuestion.options.length > 0) {
        questions.push(currentQuestion as Question);
      }

      // Start new question
      currentQuestion = {
        id: `q-${questions.length}-${Date.now()}`,
        number: parseInt(questionMatch[1], 10),
        text: questionMatch[2].trim(),
        options: [],
      };
      optionCounter = 0;
    } else if (currentQuestion) {
      const optionMatch = trimmedLine.match(optionRegex);
      if (optionMatch) {
        const isBoldWrapped = !!optionMatch[1] && !!optionMatch[4];
        // Sometimes only the letter is bolded, or the whole line.
        // Based on prompt: "**b. Answer.**" is correct.
        // We assume if the line starts with ** and contains the letter, it's correct.
        
        // Let's refine check: The prompt says "formatted in bold for the whole line".
        // So line starts with ** and ends with **.
        const isCorrect = trimmedLine.startsWith('**') && trimmedLine.endsWith('**');
        
        // Clean text: remove leading/trailing ** if present
        let cleanText = trimmedLine;
        if (isCorrect) {
          cleanText = trimmedLine.slice(2, -2).trim();
        }

        // Remove the "a. " prefix from the cleaned text
        // After cleaning **, it looks like "b. Answer text"
        const prefixMatch = cleanText.match(/^([a-zA-Z])\.\s+(.*)/);
        let finalText = cleanText;
        let label = '';
        
        if (prefixMatch) {
            label = prefixMatch[1].toLowerCase();
            finalText = prefixMatch[2];
        } else {
            // Fallback if parsing gets weird
            label = String.fromCharCode(97 + optionCounter);
        }

        currentQuestion.options!.push({
          id: `opt-${questions.length}-${optionCounter}`,
          label: label,
          text: finalText,
          isCorrect: isCorrect,
        });
        optionCounter++;
      } else {
        // Implementation detail: Append multi-line question text if needed
        // But prompt implies simple structure. We append to question text if it's not an option
        // and we haven't started options yet.
        if (currentQuestion.options!.length === 0) {
            currentQuestion.text += " " + trimmedLine;
        }
      }
    }
  });

  // Push the last question
  if (currentQuestion && currentQuestion.options && currentQuestion.options.length > 0) {
    questions.push(currentQuestion as Question);
  }

  return questions;
};

export const calculateScore = (questions: Question[], userAnswers: Record<string, string[]>) => {
  let correctCount = 0;

  questions.forEach(q => {
    const userSelected = userAnswers[q.id] || [];
    const correctOptions = q.options.filter(o => o.isCorrect).map(o => o.id);

    // Sort to compare arrays
    const sortedUser = [...userSelected].sort();
    const sortedCorrect = [...correctOptions].sort();

    // Exact match required
    if (
      sortedUser.length === sortedCorrect.length &&
      sortedUser.every((val, index) => val === sortedCorrect[index])
    ) {
      correctCount++;
    }
  });

  return {
    correctCount,
    total: questions.length,
    percentage: questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0
  };
};