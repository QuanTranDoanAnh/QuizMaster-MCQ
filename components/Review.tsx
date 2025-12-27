import React from 'react';
import { Question } from '../types';

interface ReviewProps {
  questions: Question[];
  userAnswers: Record<string, string[]>;
  onClose: () => void;
}

const Review: React.FC<ReviewProps> = ({ questions, userAnswers, onClose }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-50 py-4 z-10 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Review Quiz</h2>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded hover:bg-gray-900"
        >
          Back to Summary
        </button>
      </div>

      <div className="space-y-8">
        {questions.map((q, index) => {
          const selectedIds = userAnswers[q.id] || [];
          const correctIds = q.options.filter(o => o.isCorrect).map(o => o.id);
          const isCorrect = 
            selectedIds.length === correctIds.length && 
            correctIds.every(id => selectedIds.includes(id));

          return (
            <div key={q.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
              <div className={`p-4 border-b text-sm font-bold uppercase tracking-wide flex justify-between ${isCorrect ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                <span>Question {index + 1}</span>
                <span>{isCorrect ? 'Correct' : 'Incorrect'}</span>
              </div>
              <div className="p-6">
                <p className="text-gray-900 font-medium text-lg mb-4">{q.text}</p>
                <div className="space-y-2">
                  {q.options.map(opt => {
                    const isSelected = selectedIds.includes(opt.id);
                    const isCorrectOption = opt.isCorrect;
                    
                    // Logic for Review Colors:
                    // Green Highlight = Correct Answer (always shown)
                    // Red Highlight = Selected but Wrong
                    // Gray = Not selected, not correct
                    
                    let bgClass = "bg-white border-gray-200";
                    let textClass = "text-gray-600";
                    let icon = null;

                    if (isCorrectOption) {
                      bgClass = "bg-green-50 border-green-500";
                      textClass = "text-green-900 font-semibold";
                      icon = <span className="text-green-600">✓</span>;
                    } else if (isSelected && !isCorrectOption) {
                        bgClass = "bg-red-50 border-red-500";
                        textClass = "text-red-900";
                        icon = <span className="text-red-600">✗</span>;
                    } else if (isSelected) {
                        // Should not happen if logic matches above, but safe fallback
                        bgClass = "bg-blue-50 border-blue-500"; 
                    }

                    return (
                      <div key={opt.id} className={`flex items-start p-3 rounded border ${bgClass}`}>
                        <div className="w-6 font-bold pt-0.5">{icon}</div>
                        <div className="flex-1">
                          <span className="font-bold mr-2 uppercase text-xs opacity-70">{opt.label}.</span>
                          <span className={textClass}>{opt.text}</span>
                        </div>
                        {isSelected && <span className="text-xs text-gray-400 uppercase font-semibold ml-2 tracking-tighter">Your Choice</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20">
         <button 
          onClick={onClose}
          className="w-full sm:w-auto mx-auto block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md"
        >
          Close Review
        </button>
      </div>
    </div>
  );
};

export default Review;