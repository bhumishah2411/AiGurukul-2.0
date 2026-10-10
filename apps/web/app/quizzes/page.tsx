'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api';

interface QuizSummary {
  id: string;
  title: string;
  description?: string;
  domain: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionCount: number;
  tags: string[];
  isDynamic?: boolean;
}

interface QuestionClient {
  questionIndex: number;
  questionText: string;
  options: string[];
  sourceRef?: string;
}

interface ActiveQuiz {
  id: string;
  title: string;
  description?: string;
  domain: string;
  difficulty: string;
  totalQuestions: number;
  questions: QuestionClient[];
  isDynamic?: boolean;
}

interface AttemptAnswerResult {
  questionIndex: number;
  questionText: string;
  options: string[];
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
  sourceRef?: string;
}

interface QuizAttemptResult {
  id: string;
  quizId: string;
  quizTitle: string;
  domain: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  answers: AttemptAnswerResult[];
  weakAreas: string[];
  timeSpentSeconds?: number;
  completedAt: string;
}

const DOMAIN_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  all: { label: 'All Traditions', icon: '🪷', color: '#D4AF37' },
  gita: { label: 'Bhagavad Gita', icon: '🏹', color: '#7B68EE' },
  chanakya: { label: 'Chanakya Neeti', icon: '🏛️', color: '#C46B3A' },
  upanishads: { label: 'Upanishads', icon: '✨', color: '#4fd1c5' },
  ayurveda: { label: 'Ayurveda', icon: '🌿', color: '#3A9B8C' },
  mahabharata: { label: 'Mahabharata', icon: '⚔️', color: '#e53e3e' },
  ramayana: { label: 'Ramayana', icon: '🔆', color: '#f6ad55' },
  panchatantra: { label: 'Panchatantra', icon: '📖', color: '#3182ce' },
  general: { label: 'Universal Vedic', icon: '🕉️', color: '#d69e2e' },
};

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizTimer, setQuizTimer] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Results State
  const [attemptResult, setAttemptResult] = useState<QuizAttemptResult | null>(null);

  // Dynamic Quiz Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genDomain, setGenDomain] = useState('gita');
  const [genTopic, setGenTopic] = useState('');
  const [genDifficulty, setGenDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(
    'intermediate'
  );
  const [genCount, setGenCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch quizzes list
  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      let endpoint = '/quizzes?limit=50';
      if (selectedDomain !== 'all') endpoint += `&domain=${selectedDomain}`;
      if (selectedDifficulty !== 'all') endpoint += `&difficulty=${selectedDifficulty}`;
      if (searchQuery.trim()) endpoint += `&search=${encodeURIComponent(searchQuery.trim())}`;

      const res = await apiClient<QuizSummary[]>(endpoint);
      if (res.success && res.data) {
        setQuizzes(res.data);
      } else {
        setErrorMsg(res.error?.message || 'Failed to load quizzes');
      }
    } catch {
      setErrorMsg('Failed to fetch quizzes from server');
    } finally {
      setLoading(false);
    }
  }, [selectedDomain, selectedDifficulty, searchQuery]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  // Quiz timer effect
  useEffect(() => {
    let interval: any = null;
    if (activeQuiz && !attemptResult) {
      interval = setInterval(() => {
        setQuizTimer((t) => t + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeQuiz, attemptResult]);

  // Start a Quiz
  const handleStartQuiz = async (quizId: string) => {
    setErrorMsg('');
    try {
      const res = await apiClient<ActiveQuiz>(`/quizzes/${quizId}`);
      if (res.success && res.data) {
        setActiveQuiz(res.data);
        setCurrentQuestionIdx(0);
        setSelectedAnswers({});
        setQuizTimer(0);
        setAttemptResult(null);
      } else {
        setErrorMsg(res.error?.message || 'Unable to load quiz details');
      }
    } catch {
      setErrorMsg('Failed to load quiz');
    }
  };

  // Submit Answer & Attempt
  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setIsSubmitting(true);
    setErrorMsg('');

    const answersPayload = Object.entries(selectedAnswers).map(([qIdx, optIdx]) => ({
      questionIndex: Number(qIdx),
      selectedIndex: optIdx,
    }));

    try {
      const res = await apiClient<QuizAttemptResult>('/quizzes/attempt', {
        method: 'POST',
        body: JSON.stringify({
          quizId: activeQuiz.id,
          answers: answersPayload,
          timeSpentSeconds: quizTimer,
        }),
      });

      if (res.success && res.data) {
        setAttemptResult(res.data);
      } else {
        setErrorMsg(res.error?.message || 'Failed to evaluate quiz submission');
      }
    } catch {
      setErrorMsg('Network error submitting quiz attempt');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate Dynamic AI Quiz
  const handleGenerateAIQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMsg('');

    try {
      const res = await apiClient<ActiveQuiz>('/quizzes/generate', {
        method: 'POST',
        body: JSON.stringify({
          domain: genDomain,
          topic: genTopic || undefined,
          difficulty: genDifficulty,
          questionCount: Number(genCount),
        }),
      });

      if (res.success && res.data) {
        setShowGenerateModal(false);
        setActiveQuiz(res.data);
        setCurrentQuestionIdx(0);
        setSelectedAnswers({});
        setQuizTimer(0);
        setAttemptResult(null);
      } else {
        setErrorMsg(res.error?.message || 'Failed to synthesize AI quiz');
      }
    } catch {
      setErrorMsg('Error generating dynamic quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  // Format Timer
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)', padding: '2.5rem 1rem 5rem' }}>
      <div className="temple-container">
        {/* Navigation Breadcrumb */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '2rem',
            fontSize: '0.9rem',
          }}
        >
          <Link href="/" style={{ color: 'var(--text-dust)', textDecoration: 'none' }}>
            ← Sanctum
          </Link>
          <span style={{ color: 'rgba(212, 175, 55, 0.3)' }}>/</span>
          <span style={{ color: '#f6ad55', fontWeight: 600 }}>
            Vedic Quizzes &amp; Dynamic Assessments
          </span>
        </div>

        {/* Banner Section */}
        <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🎯</span>
            <span
              style={{
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'var(--gold-sacred)',
                fontWeight: 600,
              }}
            >
              वैदिक परीक्षा • Vedic Discernment Engine
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.5rem',
              fontWeight: 700,
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
            className="gold-gradient-text"
          >
            Vedic Quizzes & Dynamic Assessments
          </h1>
          <p
            style={{
              color: 'var(--text-dust)',
              maxWidth: '700px',
              margin: '0 auto',
              fontSize: '1.05rem',
            }}
          >
            Deepen your experiential understanding of ancient wisdom. Challenge yourself with
            curated scriptural tests or summon an AI Sage to synthesize interactive quizzes on any
            spiritual or pragmatic topic.
          </p>

          {/* Quick Action Button */}
          {!activeQuiz && !attemptResult && (
            <div style={{ marginTop: '1.75rem' }}>
              <button
                onClick={() => setShowGenerateModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #8B6914 100%)',
                  color: '#0D0B08',
                  border: 'none',
                  padding: '0.85rem 2rem',
                  borderRadius: '30px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(212, 175, 55, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>⚡</span> Summon AI Sage Quiz
              </button>
            </div>
          )}
        </section>

        {errorMsg && (
          <div
            style={{
              background: 'rgba(229, 62, 62, 0.15)',
              border: '1px solid rgba(229, 62, 62, 0.4)',
              color: '#fc8181',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* =========================================================================
            STATE 1: RESULTS VIEW
        ========================================================================== */}
        {attemptResult && (
          <div
            className="temple-card"
            style={{
              maxWidth: '850px',
              margin: '0 auto',
              padding: '2.5rem',
              borderColor: attemptResult.passed
                ? 'rgba(72, 187, 120, 0.4)'
                : 'rgba(212, 175, 55, 0.3)',
            }}
          >
            {/* Header Result */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>
                {attemptResult.passed ? '🏆' : '📜'}
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '2rem',
                  color: attemptResult.passed ? '#68d391' : 'var(--text-vellum)',
                  marginBottom: '0.5rem',
                }}
              >
                {attemptResult.passed
                  ? attemptResult.percentage >= 90
                    ? 'Param Pandita (Supreme Master)'
                    : 'Acharya of Vedic Discernment'
                  : 'Sadhaka in Contemplation'}
              </h2>
              <p style={{ color: 'var(--text-dust)', fontSize: '0.95rem' }}>
                Completed {attemptResult.quizTitle} in{' '}
                {formatTime(attemptResult.timeSpentSeconds || 0)}
              </p>
            </div>

            {/* Score Ring & Stats Summary */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2.5rem',
              }}
            >
              <div
                style={{
                  background: 'rgba(13, 11, 8, 0.6)',
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-dust)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Score Percentage
                </div>
                <div
                  style={{
                    fontSize: '2.2rem',
                    fontWeight: 700,
                    color: attemptResult.passed ? '#48bb78' : '#e53e3e',
                  }}
                >
                  {attemptResult.percentage}%
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(13, 11, 8, 0.6)',
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-dust)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Correct Responses
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--gold-sacred)' }}>
                  {attemptResult.score} / {attemptResult.totalQuestions}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(13, 11, 8, 0.6)',
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-dust)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Result Status
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    marginTop: '0.5rem',
                    color: attemptResult.passed ? '#48bb78' : '#e53e3e',
                  }}
                >
                  {attemptResult.passed ? 'PASSED (उत्तीर्ण)' : 'REVIEW NEEDED'}
                </div>
              </div>
            </div>

            {/* Weak Areas if any */}
            {attemptResult.weakAreas.length > 0 && (
              <div
                style={{
                  background: 'rgba(196, 107, 58, 0.1)',
                  border: '1px solid rgba(196, 107, 58, 0.3)',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  marginBottom: '2.5rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--accent-chanakya)',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>🔍</span> Areas Recommended for Deeper Reflection:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {attemptResult.weakAreas.map((w, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'rgba(13, 11, 8, 0.6)',
                        border: '1px solid rgba(196, 107, 58, 0.4)',
                        color: 'var(--text-vellum)',
                        fontSize: '0.85rem',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '20px',
                      }}
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Question Review */}
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.35rem',
                color: 'var(--gold-sacred)',
                marginBottom: '1.5rem',
                borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
                paddingBottom: '0.5rem',
              }}
            >
              Detailed Question Analysis & Scriptural Commentary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {attemptResult.answers.map((a, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(13, 11, 8, 0.7)',
                    border: `1px solid ${a.isCorrect ? 'rgba(72, 187, 120, 0.3)' : 'rgba(229, 62, 62, 0.3)'}`,
                    borderRadius: '8px',
                    padding: '1.25rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: a.isCorrect ? '#48bb78' : '#e53e3e',
                      }}
                    >
                      {a.isCorrect ? '✓ CORRECT' : '✗ INCORRECT'} • Question {idx + 1}
                    </span>
                    {a.sourceRef && (
                      <span
                        style={{
                          fontSize: '0.8rem',
                          background: 'rgba(212, 175, 55, 0.1)',
                          color: 'var(--gold-sacred)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                        }}
                      >
                        📜 {a.sourceRef}
                      </span>
                    )}
                  </div>

                  <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '1rem' }}>
                    {a.questionText}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      marginBottom: '1rem',
                    }}
                  >
                    {a.options.map((opt, oIdx) => {
                      const isChosen = a.selectedIndex === oIdx;
                      const isAnswer = a.correctIndex === oIdx;
                      let bg = 'rgba(255, 255, 255, 0.02)';
                      let border = 'rgba(212, 175, 55, 0.1)';
                      let color = 'var(--text-vellum)';

                      if (isAnswer) {
                        bg = 'rgba(72, 187, 120, 0.15)';
                        border = '#48bb78';
                        color = '#68d391';
                      } else if (isChosen && !isAnswer) {
                        bg = 'rgba(229, 62, 62, 0.15)';
                        border = '#e53e3e';
                        color = '#fc8181';
                      }

                      return (
                        <div
                          key={oIdx}
                          style={{
                            background: bg,
                            border: `1px solid ${border}`,
                            color: color,
                            padding: '0.65rem 1rem',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span>{opt}</span>
                          {isAnswer && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                              CORRECT ANSWER
                            </span>
                          )}
                          {isChosen && !isAnswer && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                              YOUR CHOICE
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      background: 'rgba(33, 29, 18, 0.7)',
                      borderLeft: '3px solid var(--gold-sacred)',
                      padding: '0.75rem 1rem',
                      fontSize: '0.88rem',
                      color: 'var(--text-vellum)',
                    }}
                  >
                    <span style={{ color: 'var(--gold-sacred)', fontWeight: 600 }}>
                      Commentary:{' '}
                    </span>
                    {a.explanation}
                  </div>
                </div>
              ))}
            </div>

            {/* Result Action Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginTop: '2.5rem',
              }}
            >
              <button
                onClick={() => {
                  if (activeQuiz) handleStartQuiz(activeQuiz.id);
                }}
                className="gold-button"
                style={{ padding: '0.75rem 1.75rem', borderRadius: '24px' }}
              >
                🔄 Retake Assessment
              </button>
              <button
                onClick={() => {
                  setAttemptResult(null);
                  setActiveQuiz(null);
                  loadQuizzes();
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--gold-sacred)',
                  color: 'var(--gold-sacred)',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                ← Back to Quiz Catalog
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 2: ACTIVE QUIZ IN PROGRESS
        ========================================================================== */}
        {activeQuiz && !attemptResult && (
          <div
            className="temple-card"
            style={{
              maxWidth: '800px',
              margin: '0 auto',
              padding: '2.5rem',
            }}
          >
            {/* Active Quiz Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
                paddingBottom: '1rem',
                marginBottom: '1.75rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    color: 'var(--gold-sacred)',
                    letterSpacing: '0.08em',
                  }}
                >
                  {DOMAIN_LABELS[activeQuiz.domain]?.label || activeQuiz.domain.toUpperCase()} •{' '}
                  {activeQuiz.difficulty.toUpperCase()}
                </span>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>
                  {activeQuiz.title}
                </h2>
              </div>
              <div
                style={{
                  background: 'rgba(13, 11, 8, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  color: 'var(--gold-radiance)',
                  fontWeight: 600,
                }}
              >
                ⏱️ {formatTime(quizTimer)}
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  color: 'var(--text-dust)',
                  marginBottom: '0.5rem',
                }}
              >
                <span>
                  Question {currentQuestionIdx + 1} of {activeQuiz.totalQuestions}
                </span>
                <span>
                  {Math.round(((currentQuestionIdx + 1) / activeQuiz.totalQuestions) * 100)}%
                </span>
              </div>
              <div
                style={{
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${((currentQuestionIdx + 1) / activeQuiz.totalQuestions) * 100}%`,
                    background: 'linear-gradient(90deg, #D4AF37, #F2D675)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            {/* Current Question */}
            {activeQuiz.questions[currentQuestionIdx] && (
              <div>
                {activeQuiz.questions[currentQuestionIdx].sourceRef && (
                  <span
                    style={{
                      display: 'inline-block',
                      background: 'rgba(212, 175, 55, 0.1)',
                      color: 'var(--gold-sacred)',
                      fontSize: '0.8rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      marginBottom: '0.75rem',
                    }}
                  >
                    📜 {activeQuiz.questions[currentQuestionIdx].sourceRef}
                  </span>
                )}
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    marginBottom: '1.5rem',
                    lineHeight: 1.5,
                  }}
                >
                  {activeQuiz.questions[currentQuestionIdx].questionText}
                </h3>

                {/* Option Choices */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    marginBottom: '2.5rem',
                  }}
                >
                  {activeQuiz.questions[currentQuestionIdx].options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[currentQuestionIdx] === oIdx;
                    return (
                      <div
                        key={oIdx}
                        onClick={() => {
                          setSelectedAnswers({
                            ...selectedAnswers,
                            [currentQuestionIdx]: oIdx,
                          });
                        }}
                        style={{
                          background: isSelected
                            ? 'rgba(212, 175, 55, 0.15)'
                            : 'rgba(13, 11, 8, 0.6)',
                          border: `1px solid ${isSelected ? 'var(--gold-sacred)' : 'rgba(212, 175, 55, 0.15)'}`,
                          padding: '1rem 1.25rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: `2px solid ${isSelected ? 'var(--gold-sacred)' : 'var(--text-dust)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isSelected && (
                            <div
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: 'var(--gold-sacred)',
                              }}
                            />
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: '0.95rem',
                            color: isSelected ? 'var(--gold-radiance)' : 'var(--text-vellum)',
                          }}
                        >
                          {opt}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <button
                    disabled={currentQuestionIdx === 0}
                    onClick={() => setCurrentQuestionIdx((i) => i - 1)}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      color: currentQuestionIdx === 0 ? 'var(--text-dust)' : 'var(--text-vellum)',
                      padding: '0.65rem 1.25rem',
                      borderRadius: '20px',
                      cursor: currentQuestionIdx === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    ← Previous
                  </button>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => {
                        if (confirm('Cancel assessment and return to catalog?')) {
                          setActiveQuiz(null);
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-dust)',
                        cursor: 'pointer',
                        padding: '0.65rem 1rem',
                        fontSize: '0.9rem',
                      }}
                    >
                      Exit
                    </button>

                    {currentQuestionIdx < activeQuiz.totalQuestions - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIdx((i) => i + 1)}
                        className="gold-button"
                        style={{ padding: '0.65rem 1.5rem', borderRadius: '20px' }}
                      >
                        Next Question →
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={isSubmitting}
                        style={{
                          background: 'linear-gradient(135deg, #48bb78 0%, #2f855a 100%)',
                          border: 'none',
                          color: '#fff',
                          padding: '0.65rem 1.75rem',
                          borderRadius: '20px',
                          fontWeight: 700,
                          cursor: isSubmitting ? 'wait' : 'pointer',
                          boxShadow: '0 4px 15px rgba(72, 187, 120, 0.3)',
                        }}
                      >
                        {isSubmitting ? 'Evaluating...' : 'Submit Assessment ✓'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            STATE 3: CATALOG BROWSER & FILTERING
        ========================================================================== */}
        {!activeQuiz && !attemptResult && (
          <div>
            {/* Filter Tabs */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                justifyContent: 'center',
                marginBottom: '1.75rem',
              }}
            >
              {Object.entries(DOMAIN_LABELS).map(([domainKey, meta]) => {
                const isActive = selectedDomain === domainKey;
                return (
                  <button
                    key={domainKey}
                    onClick={() => setSelectedDomain(domainKey)}
                    style={{
                      background: isActive ? 'rgba(212, 175, 55, 0.2)' : 'var(--surface-stone)',
                      border: `1px solid ${isActive ? 'var(--gold-sacred)' : 'rgba(212, 175, 55, 0.15)'}`,
                      color: isActive ? 'var(--gold-radiance)' : 'var(--text-vellum)',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 600 : 400,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Secondary Controls: Search & Difficulty */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '2rem',
                background: 'rgba(33, 29, 18, 0.5)',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid rgba(212, 175, 55, 0.1)',
              }}
            >
              {/* Difficulty selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dust)' }}>Difficulty:</span>
                {['all', 'beginner', 'intermediate', 'advanced'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    style={{
                      background:
                        selectedDifficulty === diff ? 'var(--gold-sacred)' : 'transparent',
                      color: selectedDifficulty === diff ? '#0D0B08' : 'var(--text-vellum)',
                      border: 'none',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  loadQuizzes();
                }}
                style={{ display: 'flex', gap: '0.5rem' }}
              >
                <input
                  type="text"
                  placeholder="Search topics, verses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'rgba(13, 11, 8, 0.7)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    color: 'var(--text-vellum)',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'rgba(212, 175, 55, 0.2)',
                    border: '1px solid var(--gold-sacred)',
                    color: 'var(--gold-radiance)',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Search
                </button>
              </form>
            </div>

            {/* Quiz Cards Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-dust)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🪷</div>
                Loading classical Vedic assessments...
              </div>
            ) : quizzes.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '4rem 0',
                  background: 'var(--surface-stone)',
                  borderRadius: '8px',
                  border: '1px dashed rgba(212, 175, 55, 0.2)',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📜</div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.25rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  No Quizzes Found for Current Filter
                </h3>
                <p
                  style={{ color: 'var(--text-dust)', fontSize: '0.9rem', marginBottom: '1.5rem' }}
                >
                  Try adjusting the domain or generate an on-the-fly AI assessment.
                </p>
                <button
                  onClick={() => setShowGenerateModal(true)}
                  className="gold-button"
                  style={{ padding: '0.65rem 1.5rem', borderRadius: '20px' }}
                >
                  ⚡ Synthesize AI Quiz Now
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {quizzes.map((quiz) => {
                  const domainMeta = DOMAIN_LABELS[quiz.domain] || DOMAIN_LABELS.general;
                  return (
                    <div
                      key={quiz.id}
                      className="temple-card"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '1.75rem',
                      }}
                    >
                      <div>
                        {/* Domain Badge & Difficulty */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem',
                          }}
                        >
                          <span
                            style={{
                              background: 'rgba(212, 175, 55, 0.1)',
                              color: domainMeta.color,
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              padding: '0.25rem 0.65rem',
                              borderRadius: '12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <span>{domainMeta.icon}</span>
                            <span>{domainMeta.label}</span>
                          </span>

                          <span
                            style={{
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              color:
                                quiz.difficulty === 'advanced'
                                  ? '#fc8181'
                                  : quiz.difficulty === 'intermediate'
                                    ? 'var(--gold-radiance)'
                                    : '#68d391',
                              fontWeight: 700,
                              letterSpacing: '0.05em',
                            }}
                          >
                            {quiz.difficulty}
                          </span>
                        </div>

                        {/* Title */}
                        <h3
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1.18rem',
                            fontWeight: 600,
                            marginBottom: '0.75rem',
                            lineHeight: 1.4,
                          }}
                        >
                          {quiz.title}
                        </h3>

                        {/* Description */}
                        {quiz.description && (
                          <p
                            style={{
                              color: 'var(--text-dust)',
                              fontSize: '0.88rem',
                              marginBottom: '1.25rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {quiz.description}
                          </p>
                        )}

                        {/* Tags */}
                        {quiz.tags && quiz.tags.length > 0 && (
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '0.35rem',
                              marginBottom: '1.5rem',
                            }}
                          >
                            {quiz.tags.slice(0, 4).map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                style={{
                                  fontSize: '0.72rem',
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  color: 'var(--text-dust)',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '4px',
                                }}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid rgba(212, 175, 55, 0.1)',
                          paddingTop: '1rem',
                        }}
                      >
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-dust)' }}>
                          📝 {quiz.questionCount} Questions
                        </span>
                        <button
                          onClick={() => handleStartQuiz(quiz.id)}
                          className="gold-button"
                          style={{
                            padding: '0.5rem 1.25rem',
                            fontSize: '0.85rem',
                            borderRadius: '16px',
                          }}
                        >
                          Begin Test →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            DYNAMIC AI QUIZ GENERATION MODAL
        ========================================================================== */}
        {showGenerateModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              className="temple-card"
              style={{
                maxWidth: '560px',
                width: '100%',
                padding: '2.25rem',
                border: '1px solid var(--gold-sacred)',
                boxShadow: '0 8px 40px rgba(212, 175, 55, 0.25)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>⚡</span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.35rem',
                      color: 'var(--gold-sacred)',
                    }}
                  >
                    Summon AI Sage Quiz
                  </h3>
                </div>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dust)',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>

              <p style={{ color: 'var(--text-dust)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Instruct the Vedic AI to generate a custom assessment tailored to your chosen
                scriptural domain and topic.
              </p>

              <form onSubmit={handleGenerateAIQuiz}>
                {/* Domain Picker */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      marginBottom: '0.5rem',
                      color: 'var(--text-vellum)',
                    }}
                  >
                    Wisdom Domain
                  </label>
                  <select
                    value={genDomain}
                    onChange={(e) => setGenDomain(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(13, 11, 8, 0.8)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: 'var(--text-vellum)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  >
                    <option value="gita">Bhagavad Gita (Krishna Wisdom)</option>
                    <option value="chanakya">Chanakya Neeti & Arthashastra</option>
                    <option value="upanishads">Upanishads & Vedanta</option>
                    <option value="ayurveda">Ayurveda & Tridosha</option>
                    <option value="mahabharata">Mahabharata (Dharma & War)</option>
                    <option value="ramayana">Ramayana (Maryada Purushottama)</option>
                    <option value="panchatantra">Panchatantra (Moral Fables)</option>
                    <option value="general">Universal Vedic Philosophy</option>
                  </select>
                </div>

                {/* Specific Topic */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      marginBottom: '0.5rem',
                      color: 'var(--text-vellum)',
                    }}
                  >
                    Specific Topic or Focus (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sthitaprajna, Agni in Winter, The 4 Expedients..."
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(13, 11, 8, 0.8)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: 'var(--text-vellum)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Difficulty & Count */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '2rem',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        marginBottom: '0.5rem',
                        color: 'var(--text-vellum)',
                      }}
                    >
                      Difficulty Level
                    </label>
                    <select
                      value={genDifficulty}
                      onChange={(e) => setGenDifficulty(e.target.value as any)}
                      style={{
                        width: '100%',
                        background: 'rgba(13, 11, 8, 0.8)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: 'var(--text-vellum)',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    >
                      <option value="beginner">Beginner (Sadhaka)</option>
                      <option value="intermediate">Intermediate (Pandita)</option>
                      <option value="advanced">Advanced (Acharya)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        marginBottom: '0.5rem',
                        color: 'var(--text-vellum)',
                      }}
                    >
                      Question Count: {genCount}
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="10"
                      value={genCount}
                      onChange={(e) => setGenCount(Number(e.target.value))}
                      style={{
                        width: '100%',
                        marginTop: '0.75rem',
                        accentColor: 'var(--gold-sacred)',
                      }}
                    />
                  </div>
                </div>

                {/* Modal Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'var(--text-vellum)',
                      padding: '0.65rem 1.25rem',
                      borderRadius: '20px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="gold-button"
                    style={{ padding: '0.65rem 1.75rem', borderRadius: '20px' }}
                  >
                    {isGenerating ? 'Synthesizing...' : '⚡ Generate & Start'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
