import React, { useState, useEffect } from 'react';
import { AppView, Question, QuizResult, QuizSession, QUESTIONS_PER_SESSION, PASSING_SCORE } from './types';
import { shuffleArray, calculateScore } from './utils';
import FileUpload from './components/FileUpload';
import Quiz from './components/Quiz';
import Summary from './components/Summary';
import Review from './components/Review';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('upload');
  
  // Data State
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  
  // Results State
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [history, setHistory] = useState<QuizResult[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('quiz_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const handleUpload = (questions: Question[]) => {
    setAllQuestions(questions);
    startSession(questions);
  };

  const startSession = (sourceQuestions: Question[]) => {
    // Logic: Select 40 random questions
    const shuffled = shuffleArray(sourceQuestions);
    const sessionSet = shuffled.slice(0, Math.min(shuffled.length, QUESTIONS_PER_SESSION));
    
    // Shuffle options for each question as well for extra randomness? 
    // Usually MCQ options are fixed order (a,b,c,d) but requirements say "Questions... sorted random". 
    // We kept option order parsing fixed, but we shuffled questions.
    
    setSessionQuestions(sessionSet);
    setUserAnswers({});
    setLastResult(null);
    setView('quiz');
  };

  const handleQuizComplete = (answers: Record<string, string[]>) => {
    setUserAnswers(answers);
    
    const { correctCount, total, percentage } = calculateScore(sessionQuestions, answers);
    const passed = percentage >= PASSING_SCORE;
    
    const result: QuizResult = {
      date: new Date().toISOString(),
      totalQuestions: total,
      correctAnswers: correctCount,
      scorePercentage: percentage,
      passed,
    };

    setLastResult(result);
    
    const newHistory = [result, ...history];
    setHistory(newHistory);
    localStorage.setItem('quiz_history', JSON.stringify(newHistory));
    
    setView('summary');
  };

  const handleRetry = () => {
    // Generate new random set from existing bank
    startSession(allQuestions);
  };

  const handleNewFile = () => {
    setAllQuestions([]);
    setSessionQuestions([]);
    setLastResult(null);
    setView('upload');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">QuizMaster</span>
            </div>
            {allQuestions.length > 0 && view !== 'upload' && (
                <div className="flex items-center text-sm text-gray-500">
                    <span className="hidden sm:inline">Bank: {allQuestions.length} Qs</span>
                </div>
            )}
          </div>
        </div>
      </nav>

      <main>
        {view === 'upload' && <FileUpload onUpload={handleUpload} />}
        
        {view === 'quiz' && (
          <Quiz 
            questions={sessionQuestions} 
            onComplete={handleQuizComplete}
            onExit={handleNewFile}
          />
        )}

        {view === 'summary' && lastResult && (
          <Summary 
            result={lastResult} 
            history={history}
            onReview={() => setView('review')}
            onRetry={handleRetry}
            onNewFile={handleNewFile}
          />
        )}

        {view === 'review' && (
          <Review 
            questions={sessionQuestions} 
            userAnswers={userAnswers}
            onClose={() => setView('summary')}
          />
        )}
      </main>
    </div>
  );
};

export default App;