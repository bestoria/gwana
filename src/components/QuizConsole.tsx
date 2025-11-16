import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { QuizContent, Persona } from '@/src/lib/types';
import { generateSpeech } from '../services/geminiService';
import { audioManager } from '@/src/lib/utils';
import { VOICE_NAMES } from '@/src/lib/constants';
import { Award, X, Volume2, VolumeX, HelpCircle, Send } from 'lucide-react';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';

interface QuizShowUIProps {
  quiz: QuizContent | null;
  onQuizComplete: (score: { correct: number; incorrect: number }) => void;
  onStartQuiz: (topic: string) => void;
  isDesktop: boolean;
}

const QUIZ_TIMER_SECONDS = 20;

export const QuizShowUI: React.FC<QuizShowUIProps> = ({ quiz, onQuizComplete, onStartQuiz, isDesktop }) => {
    const { callState, speakingPersona } = useLiveAPIContext();
    const [topic, setTopic] = useState('');

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState({ correct: 0, incorrect: 0, streak: 0 });
    const [isAnswered, setIsAnswered] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(QUIZ_TIMER_SECONDS);
    const [isFinished, setIsFinished] = useState(false);
    
    const prevCallStateRef = useRef(callState);
    const hasStartedRef = useRef(false);

    useEffect(() => {
        if (quiz && !hasStartedRef.current) {
            hasStartedRef.current = true;
        }
        
        const wasActive = ['connected', 'paused'].includes(prevCallStateRef.current);
        const isNowInactive = ['idle', 'standby', 'disconnecting'].includes(callState);

        if (hasStartedRef.current && wasActive && isNowInactive) {
            onQuizComplete(score);
        }
        prevCallStateRef.current = callState;
    }, [callState, onQuizComplete, score, quiz]);


    const currentQuestion = useMemo(() => quiz ? quiz.questions[currentIndex] : null, [quiz, currentIndex]);

    // Reset state when a new quiz is provided or removed
    useEffect(() => {
        if (quiz) {
            setCurrentIndex(0);
            setScore({ correct: 0, incorrect: 0, streak: 0 });
            setIsAnswered(false);
            setSelectedOption(null);
            setTimeLeft(QUIZ_TIMER_SECONDS);
            setIsFinished(false);
            hasStartedRef.current = false;
        }
    }, [quiz]);

    // Timer effect
    useEffect(() => {
        if (!quiz || isAnswered || isFinished) return;
        
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAnswerSelect(''); // Empty string for timeout
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(timer);
    }, [quiz, currentIndex, isAnswered, isFinished]);

    // Question announcement effect
    useEffect(() => {
        if(!quiz || isFinished || !currentQuestion || callState !== 'connected') return;
        
        const announceQuestion = async () => {
            const audio = await generateSpeech(currentQuestion.questionText, VOICE_NAMES.AGENT_ZERO_DEFAULT as string);
            if (audio) await audioManager.playTTS(audio);
        };
        
        const timer = setTimeout(announceQuestion, 500);
        return () => clearTimeout(timer);

    }, [quiz, currentIndex, isFinished, currentQuestion, callState]);

    const handleAnswerSelect = async (option: string) => {
        if (isAnswered || !currentQuestion) return;

        setIsAnswered(true);
        setSelectedOption(option);
        
        const isCorrect = option === currentQuestion.correctAnswer;

        setScore(prev => ({
            correct: isCorrect ? prev.correct + 1 : prev.correct,
            incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
            streak: isCorrect ? prev.streak + 1 : 0,
        }));
        
        const confirmationText = isCorrect 
          ? "Correct!" 
          : `That's not it. The correct answer was: ${currentQuestion.correctAnswer}. ${currentQuestion.explanation || ''}`;
        
        const commentaryText = currentQuestion.commentary || "Let's move to the next question.";

        const gwaniAudio = await generateSpeech(confirmationText, VOICE_NAMES.AGENT_ZERO_DEFAULT as string);
        if (gwaniAudio) await audioManager.playTTS(gwaniAudio);

        await new Promise(resolve => setTimeout(resolve, 300));

        const gwanaAudio = await generateSpeech(commentaryText, VOICE_NAMES.AGENT_ZARA_DEFAULT as string);
        if (gwanaAudio) await audioManager.playTTS(gwanaAudio);

        setTimeout(() => {
            if (quiz && currentIndex < quiz.questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setSelectedOption(null);
                setIsAnswered(false);
                setTimeLeft(QUIZ_TIMER_SECONDS);
            } else {
                setIsFinished(true);
            }
        }, 2000);
    };
    
    const handleStartQuiz = () => {
        if (topic.trim()) onStartQuiz(topic.trim());
    };

    if (isFinished) {
        const total = score.correct + score.incorrect;
        const percentage = total > 0 ? Math.round((score.correct / total) * 100) : 0;
        return (
            <div className="quiz-console-container">
                <div className="quiz-console quiz-results-screen">
                    <h2>Quiz Complete!</h2>
                    <p className="text-lg">Your Final Score</p>
                    <p className="score-display">{percentage}%</p>
                    <p className="score-details">({score.correct} out of {total} correct)</p>
                    <button
                        onClick={() => onQuizComplete(score)}
                        className="mt-6 w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition-colors"
                    >
                        Return
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="quiz-console-container">
            {!quiz ? (
                <div className="quiz-console" style={{ justifyContent: 'space-between', padding: '1.5rem' }}>
                    <div className="flex-grow flex items-center justify-center">
                        <div className="text-center text-gray-400 animate-fade-in">
                            <HelpCircle size={48} className="mx-auto mb-4 text-cyan-400" />
                            <p className="mt-2 text-lg">Enter a topic to start the quiz.</p>
                        </div>
                    </div>
                    <div className="flex-shrink-0 mt-4">
                        <div className="w-full max-w-lg mx-auto flex items-center gap-2">
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleStartQuiz()}
                                placeholder="What topic would you like to be quizzed on?"
                                className="w-full bg-black/50 border border-[var(--border-color)] rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
                            />
                            <button
                                onClick={handleStartQuiz}
                                disabled={!topic.trim()}
                                className="w-14 h-14 flex-shrink-0 bg-cyan-600 text-white font-semibold rounded-full hover:bg-cyan-700 transition-colors disabled:bg-gray-600 flex items-center justify-center"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="quiz-console">
                    <>
                        <div className="quiz-header">
                            <span className="topic">{quiz.topic}</span>
                            <span className="progress">{currentIndex + 1} / {quiz.questions.length}</span>
                        </div>
                        <div className="quiz-timer-bar">
                             <div 
                                className={`quiz-timer-bar-inner ${timeLeft <= 5 ? 'pulsing' : ''}`} 
                                style={{ width: `${(timeLeft / QUIZ_TIMER_SECONDS) * 100}%` }}
                            />
                        </div>
                        <div className="quiz-question-display">
                            {currentQuestion?.questionText}
                        </div>
                        <div className="quiz-options-grid">
                            {currentQuestion?.options.map((option, index) => {
                                let buttonClass = 'quiz-option-btn';
                                if (isAnswered) {
                                    if(option === currentQuestion.correctAnswer) {
                                        buttonClass += ' correct';
                                    } else if (option === selectedOption) {
                                        buttonClass += ' incorrect';
                                    }
                                } else if (option === selectedOption) {
                                    buttonClass += ' selected';
                                }
                                return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(option)}
                                    disabled={isAnswered}
                                    className={buttonClass}
                                >
                                    {option}
                                </button>
                            )})}
                        </div>
                        <div className="quiz-scoreboard">
                            <div>
                                <div className="label">Correct</div>
                                <div className="value" style={{ color: 'var(--accent-green)' }}>{score.correct}</div>
                            </div>
                             <div>
                                <div className="label">Streak</div>
                                <div className="value" style={{ color: 'var(--accent-amber)' }}>{score.streak}</div>
                            </div>
                            <div>
                                <div className="label">Incorrect</div>
                                <div className="value" style={{ color: '#ff0055' }}>{score.incorrect}</div>
                            </div>
                        </div>
                    </>
                </div>
            )}
        </div>
    );
};
