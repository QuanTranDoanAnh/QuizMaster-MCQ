import React, { useEffect, useState } from 'react';
import { QuizResult, PASSING_SCORE } from '../types';

interface SummaryProps {
  result: QuizResult;
  history: QuizResult[];
  onReview: () => void;
  onRetry: () => void;
  onNewFile: () => void;
}

const Summary: React.FC<SummaryProps> = ({ result, history, onReview, onRetry, onNewFile }) => {
  const isPassed = result.passed;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
        <div className={`p-8 text-center ${isPassed ? 'bg-gradient-to-b from-green-50 to-white' : 'bg-gradient-to-b from-red-50 to-white'}`}>
          <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-md">
            <span className="text-4xl">{isPassed ? '🏆' : '📚'}</span>
          </div>
          <h2 className={`text-3xl font-bold mb-2 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
            {isPassed ? 'Passed!' : 'Failed'}
          </h2>
          <p className="text-gray-500">
            You scored <span className="font-bold text-gray-900">{result.scorePercentage}%</span>. 
            Required: {PASSING_SCORE}%
          </p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-b border-gray-100">
          <div className="p-4 text-center">
            <div className="text-sm text-gray-500 uppercase tracking-wide">Questions</div>
            <div className="text-2xl font-bold text-gray-800">{result.totalQuestions}</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-sm text-gray-500 uppercase tracking-wide">Correct</div>
            <div className="text-2xl font-bold text-gray-800">{result.correctAnswers}</div>
          </div>
        </div>

        <div className="p-6 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onReview}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Review Answers
          </button>
          <button
            onClick={onRetry}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Retry Quiz
          </button>
        </div>
        <div className="px-6 pb-6">
            <button
                onClick={onNewFile}
                className="w-full text-sm text-gray-500 hover:text-gray-800 underline"
            >
                Upload different file
            </button>
        </div>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 px-2">History</h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {history.map((h, idx) => (
                <li key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className={`w-2 h-12 rounded-full mr-4 ${h.passed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <div className="font-semibold text-gray-900">{new Date(h.date).toLocaleString()}</div>
                      <div className="text-sm text-gray-500">
                        {h.correctAnswers}/{h.totalQuestions} Correct
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${h.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {h.scorePercentage}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summary;