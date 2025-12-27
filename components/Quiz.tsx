import React, { useState, useEffect, useRef } from 'react';
import { Question, TIME_LIMIT_SECONDS } from '../types';
import { formatTime } from '../utils';

interface QuizProps {
  questions: Question[];
  onComplete: (userAnswers: Record<string, string[]>) => void;
  onExit: () => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onComplete, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [isAnswered, setIsAnswered] = useState(false); // Has user clicked submit for current question?
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
  
  // Ref to hold the latest answers to avoid stale closures in setTimeout/Effect
  const userAnswersRef = useRef(userAnswers);

  useEffect(() => {
    userAnswersRef.current = userAnswers;
  }, [userAnswers]);

  // Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-submit when time expires
  useEffect(() => {
    if (timeLeft === 0) {
      // Small timeout to ensure the state update renders 00:00 before alerting/switching
      setTimeout(() => {
        alert("Time's up! Submitting your answers.");
        onComplete(userAnswersRef.current);
      }, 100);
    }
  }, [timeLeft, onComplete]);

  const currentQuestion = questions[currentIndex];
  
  // Determine if multiple correct answers exist to toggle UI (Radio vs Checkbox)
  const correctOptionsCount = currentQuestion.options.filter(o => o.isCorrect).length;
  const isMultiSelect = correctOptionsCount > 1;

  const handleOptionSelect = (optionId: string) => {
    if (isAnswered) return; // Prevent changing after submission

    setUserAnswers(prev => {
      const currentSelected = prev[currentQuestion.id] || [];
      let newSelected;

      if (isMultiSelect) {
        if (currentSelected.includes(optionId)) {
          newSelected = currentSelected.filter(id => id !== optionId);
        } else {
          newSelected = [...currentSelected, optionId];
        }
      } else {
        // Single select behavior (radio)
        newSelected = [optionId];
      }
      
      return {
        ...prev,
        [currentQuestion.id]: newSelected
      };
    });
  };

  const currentSelectedIds = userAnswers[currentQuestion.id] || [];
  const isSelected = currentSelectedIds.length > 0;

  const handleSubmitAnswer = () => {
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
    } else {
      onComplete(userAnswers);
    }
  };
  
  // Check correctness for immediate feedback
  const correctIds = currentQuestion.options.filter(o => o.isCorrect).map(o => o.id);
  const isCorrect = isAnswered && 
    correctIds.length === currentSelectedIds.length && 
    correctIds.every(id => currentSelectedIds.includes(id));

  // Determine Timer Color (Red if < 5 minutes)
  const isLowTime = timeLeft < 300; // 5 minutes

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
          <div className="text-sm font-semibold text-gray-500 mr-6">
            Question {currentIndex + 1} of {questions.length}
          </div>
          {/* Timer Display */}
          <div className={`flex items-center px-4 py-2 rounded-full font-mono font-bold text-sm shadow-sm border ${isLowTime ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {formatTime(timeLeft)}
          </div>
        </div>
        
        <button 
          onClick={onExit}
          className="text-gray-400 hover:text-red-500 transition-colors text-sm font-semibold self-end sm:self-auto"
        >
          Exit Quiz
        </button>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-800 leading-relaxed">
            {currentQuestion.text}
          </h3>
          <div className="mt-2 text-xs font-semibold text-blue-600 uppercase tracking-wide">
            {isMultiSelect ? `Select ${correctOptionsCount} correct answers` : 'Select 1 correct answer'}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelectedOption = currentSelectedIds.includes(option.id);
            const isCorrectOption = option.isCorrect;
            
            // Styles based on state
            let containerClass = "relative flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ";
            let indicatorColor = "bg-gray-200 border-gray-300";
            
            if (isAnswered) {
              // Result state
              if (isCorrectOption) {
                containerClass += "bg-green-50 border-green-500 ";
                indicatorColor = "bg-green-500 border-green-500";
              } else if (isSelectedOption && !isCorrectOption) {
                containerClass += "bg-red-50 border-red-500 ";
                indicatorColor = "bg-red-500 border-red-500";
              } else {
                containerClass += "border-gray-200 opacity-50 ";
              }
            } else {
              // Selection state
              if (isSelectedOption) {
                containerClass += "bg-blue-50 border-blue-500 shadow-sm ";
                indicatorColor = "bg-blue-500 border-blue-500";
              } else {
                containerClass += "border-gray-200 hover:bg-gray-50 ";
              }
            }

            return (
              <div 
                key={option.id} 
                className={containerClass}
                onClick={() => handleOptionSelect(option.id)}
              >
                <div className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border ${indicatorColor} flex items-center justify-center mr-3`}>
                  {(isAnswered ? isCorrectOption || isSelectedOption : isSelectedOption) && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-bold mr-2 uppercase text-gray-500">{option.label}.</span>
                  <span className={isAnswered && isCorrectOption ? "font-medium text-gray-900" : "text-gray-700"}>
                    {option.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Immediate Feedback Banner */}
      {isAnswered && (
        <div className={`mb-24 p-4 rounded-lg border flex items-center ${isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <div className="mr-3 text-2xl">
            {isCorrect ? '🎉' : '❌'}
          </div>
          <div>
            <p className="font-bold">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
            {!isCorrect && <p className="text-sm mt-1">Review the correct answers highlighted in green above.</p>}
          </div>
        </div>
      )}

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10">
        <div className="max-w-3xl mx-auto flex justify-end">
          {!isAnswered ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!isSelected}
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors shadow-lg ${
                isSelected 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Submit Answer
            </button>
          ) : (
             <button
              onClick={handleNext}
              className="px-8 py-3 rounded-lg font-semibold text-white bg-gray-900 hover:bg-black transition-colors shadow-lg"
            >
              {currentIndex < questions.length - 1 ? 'Next Question →' : 'Finish Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;