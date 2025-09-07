import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Award, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  onQuizComplete: (score: number, totalQuestions: number, passed: boolean) => void;
  lessonTitle?: string;
}

export default function LessonQuiz({ questions, onQuizComplete, lessonTitle }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);

  // Confetti animation function for quiz success
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Additional burst after a short delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 200);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (showExplanation) return; // Prevent changing answer after showing explanation
    setSelectedOption(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;

    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestion] = selectedOption;
    setSelectedAnswers(newSelectedAnswers);

    // Calculate score
    const isCorrect = selectedOption === questions[currentQuestion].correct;
    if (isCorrect) {
      setScore(score + 1);
    }

    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Quiz complete
      const finalScore = selectedAnswers.filter((answer, index) => 
        answer === questions[index].correct
      ).length;
      const passed = finalScore >= Math.ceil(questions.length * 0.8); // 80% pass rate
      setQuizComplete(true);
      
      // Trigger confetti animation for successful quiz completion
      if (passed) {
        triggerConfetti();
      }
      
      onQuizComplete(finalScore, questions.length, passed);
    }
  };

  const getScorePercentage = () => {
    const finalScore = selectedAnswers.filter((answer, index) => 
      answer === questions[index].correct
    ).length;
    return Math.round((finalScore / questions.length) * 100);
  };

  const isPassed = () => {
    return getScorePercentage() >= 80;
  };

  if (quizComplete) {
    const finalScore = selectedAnswers.filter((answer, index) => 
      answer === questions[index].correct
    ).length;
    const percentage = getScorePercentage();
    const passed = isPassed();

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {passed ? (
              <Trophy className="h-16 w-16 text-yellow-500 animate-bounce" />
            ) : (
              <Award className="h-16 w-16 text-blue-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {passed ? 'Lesson Mastered!' : 'Quiz Complete!'}
          </CardTitle>
          <div className="text-lg mt-2">
            <span className="font-bold text-2xl">{percentage}%</span>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {finalScore} out of {questions.length} correct
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex justify-center">
            <Badge 
              variant={passed ? "default" : "secondary"}
              className={`text-lg px-4 py-2 ${passed ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {passed ? 'MASTERED' : 'COMPLETED'}
            </Badge>
          </div>
          
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {passed ? (
                <>
                  🌟 Congratulations! You've mastered this lesson with an excellent score. 
                  You'll receive <strong>bonus XP</strong> for your achievement!
                </>
              ) : (
                <>
                  ✨ Well done! You've completed the lesson. 
                  Review the material and retake the quiz anytime to achieve mastery.
                </>
              )}
            </p>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            {passed ? '+25 XP (15 base + 10 mastery bonus)' : '+15 XP'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const isCorrect = selectedOption === question.correct;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline">
            Question {currentQuestion + 1} of {questions.length}
          </Badge>
          <div className="text-sm text-gray-500">
            Quiz: {lessonTitle || 'Lesson Quiz'}
          </div>
        </div>
        <CardTitle className="text-xl">{question.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {question.options.map((option, index) => {
            let buttonClass = "text-left justify-start h-auto p-4 border-2 transition-all";
            
            if (showExplanation) {
              if (index === question.correct) {
                buttonClass += " border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
              } else if (index === selectedOption && index !== question.correct) {
                buttonClass += " border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
              } else {
                buttonClass += " border-gray-200 bg-gray-50 dark:bg-gray-800 opacity-60";
              }
            } else {
              if (selectedOption === index) {
                buttonClass += " border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300";
              } else {
                buttonClass += " border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800";
              }
            }

            return (
              <Button
                key={index}
                variant="outline"
                className={buttonClass}
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
                data-testid={`quiz-option-${index}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option}</span>
                  {showExplanation && index === question.correct && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {showExplanation && index === selectedOption && index !== question.correct && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </Button>
            );
          })}
        </div>

        {showExplanation && (
          <div className={`p-4 rounded-lg border-l-4 ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-700 dark:text-green-300">Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-700 dark:text-red-300">Not quite right</span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {question.explanation}
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <div className="text-sm text-gray-500">
            Score: {score} / {currentQuestion + (showExplanation ? 1 : 0)}
          </div>
          
          {!showExplanation ? (
            <Button 
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              data-testid="submit-answer-btn"
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              onClick={handleNextQuestion}
              data-testid="next-question-btn"
            >
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}