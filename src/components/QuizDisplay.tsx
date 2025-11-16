import React, { useState, useMemo } from 'react';
import type { QuizContent, QuizQuestion } from '@/src/lib/types';
import { CheckCircle, XCircle, Award, RotateCw } from 'lucide-react';

interface QuizDisplayProps {
  quiz: QuizContent;
}

const QuizDisplay: React.FC<QuizDisplayProps> = ({ quiz }) => {
    const [quizState, setQuizState] = useState<'ongoing' | 'finished'>('ongoing');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const currentQuestion = useMemo(() => quiz.questions[currentQuestionIndex], [quiz, currentQuestionIndex]);

    const handleAnswerSelect = (answer: string) => {
        if (isAnswered) return;
        setSelectedOption(answer);
        setIsAnswered(true);

        setTimeout(() => {
            const newAnswers = [...userAnswers, answer];
            setUserAnswers(newAnswers);

            if (currentQuestionIndex < quiz.questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                setQuizState('finished');
            }
            
            setIsAnswered(false);
            setSelectedOption(null);
        }, 1000); // Wait 1 second before moving to the next question
    };

    const score = useMemo(() => {
        if (quizState !== 'finished') return 0;
        return userAnswers.reduce((total, answer, index) => {
            return answer === quiz.questions[index].correctAnswer ? total + 1 : total;
        }, 0);
    }, [quizState, userAnswers, quiz.questions]);
    
    const restartQuiz = () => {
        setQuizState('ongoing');
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setSelectedOption(null);
        setIsAnswered(false);
    };

    if (quizState === 'finished') {
        const percentage = Math.round((score / quiz.questions.length) * 100);
        return (
            <div className="mt-2 p-3 border border-cyan-500/50 bg-black/30 rounded-lg font-mono text-xs max-w-xl relative text-center">
                <h3 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2 justify-center">
                    <Award size={16} /> QUIZ COMPLETE: {quiz.topic.toUpperCase()}
                </h3>
                <p className="text-lg text-white">Your Score:</p>
                <p className="text-4xl font-bold text-cyan-300 my-2">{percentage}%</p>
                <p className="text-gray-300">({score} out of {quiz.questions.length} correct)</p>
                <button
                    onClick={restartQuiz}
                    className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition-colors"
                >
                    <RotateCw size={16} /> Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="mt-2 p-3 border border-cyan-500/50 bg-black/30 rounded-lg font-mono text-xs max-w-xl relative">
            <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center justify-between">
                <span>QUIZ: {quiz.topic.toUpperCase()}</span>
                <span className="text-gray-400">{currentQuestionIndex + 1} / {quiz.questions.length}</span>
            </h3>
            
            <div className="p-4 bg-black/40 rounded-md border border-gray-700 min-h-[6rem] flex items-center justify-center">
                <p className="text-base text-center text-white">{currentQuestion.questionText}</p>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2">
                {currentQuestion.options.map((option, index) => {
                    const isCorrect = option === currentQuestion.correctAnswer;
                    let buttonStyle: React.CSSProperties = {
                      backgroundColor: 'rgba(0, 255, 255, 0.3)',
                      borderColor: 'var(--accent-cyan)',
                      color: 'var(--accent-cyan)'
                    };
                    
                    if (isAnswered && selectedOption === option) {
                        buttonStyle = isCorrect
                            ? { backgroundColor: 'var(--accent-green)', borderColor: 'var(--accent-green)', color: 'white' }
                            : { backgroundColor: '#ff0055', borderColor: '#ff0055', color: 'white' };
                    } else if (isAnswered && isCorrect) {
                        buttonStyle = { backgroundColor: 'var(--accent-green)', borderColor: 'var(--accent-green)', color: 'white' };
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => handleAnswerSelect(option)}
                            disabled={isAnswered}
                            className="w-full text-left p-3 rounded-md border transition-all duration-300 flex items-center justify-between text-sm"
                            style={buttonStyle}
                        >
                            <span>{option}</span>
                            {isAnswered && selectedOption === option && (
                                isCorrect ? <CheckCircle size={18} /> : <XCircle size={18} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuizDisplay;
