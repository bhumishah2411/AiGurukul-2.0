'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  custom: { label: 'My Quizzes', icon: '✨', color: '#ec4899' },
  gita: { label: 'Bhagavad Gita', icon: '🏹', color: '#7B68EE' },
  chanakya: { label: 'Chanakya Neeti', icon: '🏛️', color: '#C46B3A' },
  upanishads: { label: 'Upanishads', icon: '✨', color: '#4fd1c5' },
  ayurveda: { label: 'Ayurveda', icon: '🌿', color: '#3A9B8C' },
  mahabharata: { label: 'Mahabharata', icon: '⚔️', color: '#e53e3e' },
  ramayana: { label: 'Ramayana', icon: '🔆', color: '#f6ad55' },
  panchatantra: { label: 'Panchatantra', icon: '📖', color: '#3182ce' },
  yoga: { label: 'Patanjali Yoga', icon: '🧘', color: '#38bdf8' },
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
  const quizRunnerRef = useRef<HTMLDivElement | null>(null);

  // Results State
  const [attemptResult, setAttemptResult] = useState<QuizAttemptResult | null>(null);

  // Dynamic Quiz Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genDomain, setGenDomain] = useState('gita');
  const [genGuru, setGenGuru] = useState('');
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
      let endpoint = '/quizzes?limit=100';
      if (selectedDomain === 'custom') {
        endpoint += '&domain=custom';
      } else if (selectedDomain !== 'all') {
        endpoint += `&domain=${selectedDomain}`;
      }
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
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
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

  // Generate Dynamic AI Quiz grounded in RAG
  const handleGenerateAIQuiz = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setErrorMsg('');

    try {
      const res = await apiClient<ActiveQuiz>('/quizzes/generate', {
        method: 'POST',
        body: JSON.stringify({
          domain: genDomain,
          guru: genGuru || undefined,
          topic: genTopic.trim() || undefined,
          difficulty: genDifficulty,
          questionCount: Number(genCount),
        }),
      });

      if (res.success && res.data) {
        setShowGenerateModal(false);
        loadQuizzes();
        setActiveQuiz(res.data);
        setCurrentQuestionIdx(0);
        setSelectedAnswers({});
        setQuizTimer(0);
        setAttemptResult(null);
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
      } else {
        setErrorMsg(res.error?.message || 'Failed to synthesize AI quiz grounded in RAG data');
      }
    } catch {
      setErrorMsg('Error communicating with knowledge base to generate dynamic quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  // Retry with New Dynamic Questions from RAG
  const handleRetryWithNewQuestions = async () => {
    if (!attemptResult) return;
    setIsGenerating(true);
    setErrorMsg('');

    try {
      const res = await apiClient<ActiveQuiz>('/quizzes/generate', {
        method: 'POST',
        body: JSON.stringify({
          domain: attemptResult.domain || 'gita',
          difficulty: attemptResult.difficulty,
          questionCount: attemptResult.totalQuestions || 5,
        }),
      });

      if (res.success && res.data) {
        setActiveQuiz(res.data);
        setCurrentQuestionIdx(0);
        setSelectedAnswers({});
        setQuizTimer(0);
        setAttemptResult(null);
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
      } else {
        setErrorMsg(res.error?.message || 'Failed to synthesize new quiz questions from knowledge base');
      }
    } catch {
      setErrorMsg('Error generating new questions from the scriptural knowledge base');
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
    <div
      className={`quiz-page-wrapper ${activeQuiz && !attemptResult ? 'active-mode' : ''}`}
      suppressHydrationWarning
    >
      <div className="temple-container" style={{ width: '100%', maxWidth: '1200px', boxSizing: 'border-box' }}>
        {/* Compact Navigation when in Active Quiz Mode */}
        {activeQuiz && !attemptResult && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.6rem',
              padding: '0.2rem 0.5rem',
              fontSize: '0.82rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => {
                if (confirm('Exit assessment and return to quiz catalog?')) {
                  setActiveQuiz(null);
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--gold-radiance)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              ← Exit Assessment to Catalog
            </button>
            <span style={{ color: 'var(--text-dust)', fontSize: '0.78rem' }}>
              Active Vedic Assessment
            </span>
          </div>
        )}

        {/* Navigation Breadcrumb & Banner - Only when NOT in active quiz mode */}
        {!activeQuiz && !attemptResult && (
          <>
            {/* Small Single-Word Back Button */}
            <div style={{ marginBottom: '0.75rem' }}>
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: 'var(--text-dust)',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(212, 175, 55, 0.18)',
                  transition: 'all 0.2s ease',
                }}
              >
                ← Back
              </Link>
            </div>

            {/* Banner Section - Tightly aligned without unnecessary space */}
            <section className="quiz-banner">
              <div className="quiz-banner-badge">
                <span style={{ fontSize: '1rem' }}>🎯</span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: 'var(--gold-sacred)',
                    fontWeight: 600,
                  }}
                >
                  वैदिक परीक्षा • Vedic Discernment Engine
                </span>
              </div>
              <h1 className="quiz-banner-title gold-gradient-text">
                Vedic Quizzes &amp; Dynamic Assessments
              </h1>
              <p className="quiz-banner-desc">
                Deepen your experiential understanding of ancient wisdom. Challenge yourself with
                curated scriptural tests or summon an AI Sage to synthesize interactive quizzes on any
                spiritual or pragmatic topic.
              </p>

              {/* Quick Action Buttons (Compact 1-2 words) */}
              <div className="quiz-quick-actions">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowGenerateModal(true)}
                  className="quiz-quick-action-btn"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #8B6914 100%)',
                    color: '#0D0B08',
                    border: 'none',
                    boxShadow: '0 4px 16px rgba(212, 175, 55, 0.3)',
                  }}
                >
                  <span>✨</span> Create Quiz
                </button>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setSelectedDomain('custom')}
                  className="quiz-quick-action-btn"
                  style={{
                    background:
                      selectedDomain === 'custom' ? 'rgba(236, 72, 153, 0.25)' : 'rgba(20, 17, 11, 0.85)',
                    color: selectedDomain === 'custom' ? '#f472b6' : 'var(--text-vellum)',
                    border:
                      selectedDomain === 'custom'
                        ? '1px solid rgba(236, 72, 153, 0.6)'
                        : '1px solid rgba(212, 175, 55, 0.25)',
                  }}
                >
                  <span>🪪</span> My Quizzes
                </button>
              </div>
            </section>
          </>
        )}

        {errorMsg && (
          <div
            style={{
              background: errorMsg.toLowerCase().includes('knowledge base') || errorMsg.toLowerCase().includes('passages')
                ? 'rgba(196, 107, 58, 0.15)'
                : 'rgba(229, 62, 62, 0.15)',
              border: `1px solid ${
                errorMsg.toLowerCase().includes('knowledge base') || errorMsg.toLowerCase().includes('passages')
                  ? 'rgba(196, 107, 58, 0.45)'
                  : 'rgba(229, 62, 62, 0.4)'
              }`,
              color: errorMsg.toLowerCase().includes('knowledge base') || errorMsg.toLowerCase().includes('passages')
                ? '#fbd38d'
                : '#fc8181',
              padding: '1.25rem 1.5rem',
              borderRadius: '10px',
              marginBottom: '2rem',
              maxWidth: '850px',
              margin: '0 auto 2rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
              {errorMsg.toLowerCase().includes('knowledge base') || errorMsg.toLowerCase().includes('passages')
                ? '📜'
                : '⚠️'}
            </span>
            <div style={{ flex: 1, fontSize: '0.92rem', lineHeight: 1.5 }}>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: '#fff' }}>
                {errorMsg.toLowerCase().includes('knowledge base') || errorMsg.toLowerCase().includes('passages')
                  ? 'RAG Knowledge Grounding Advisory'
                  : 'Assessment System Advisory'}
              </div>
              <p style={{ margin: 0 }}>{errorMsg}</p>
            </div>
            <button
              onClick={() => setErrorMsg('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dust)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '0 0.5rem',
              }}
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        {/* =========================================================================
            STATE 1: RESULTS VIEW
        ========================================================================== */}
        {attemptResult && (
          <div
            className="temple-card quiz-results-card"
            style={{
              borderColor: attemptResult.passed
                ? 'rgba(72, 187, 120, 0.4)'
                : 'rgba(212, 175, 55, 0.3)',
            }}
          >
            {/* Header Result */}
            <div className="quiz-results-header">
              <div className="quiz-results-icon">
                {attemptResult.passed ? '🏆' : '📜'}
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.2rem, 3.8vw, 1.85rem)',
                  color: attemptResult.passed ? '#68d391' : 'var(--text-vellum)',
                  marginBottom: '0.35rem',
                  lineHeight: 1.25,
                  wordBreak: 'break-word',
                }}
              >
                {attemptResult.passed
                  ? attemptResult.percentage >= 90
                    ? 'Param Pandita (Supreme Master)'
                    : 'Acharya of Vedic Discernment'
                  : 'Sadhaka in Contemplation'}
              </h2>
              <p style={{ color: 'var(--text-dust)', fontSize: 'clamp(0.8rem, 1.9vw, 0.92rem)', wordBreak: 'break-word', margin: 0 }}>
                Completed {attemptResult.quizTitle} in{' '}
                {formatTime(attemptResult.timeSpentSeconds || 0)}
              </p>
            </div>

            {/* Score Ring & Stats Summary */}
            <div className="quiz-results-stats-grid">
              <div className="quiz-stat-card">
                <div className="quiz-stat-label">
                  Score Percentage
                </div>
                <div
                  className="quiz-stat-value"
                  style={{
                    color: attemptResult.passed ? '#48bb78' : '#e53e3e',
                  }}
                >
                  {attemptResult.percentage}%
                </div>
              </div>

              <div className="quiz-stat-card">
                <div className="quiz-stat-label">
                  Correct Responses
                </div>
                <div className="quiz-stat-value" style={{ color: 'var(--gold-sacred)' }}>
                  {attemptResult.score} / {attemptResult.totalQuestions}
                </div>
              </div>

              <div className="quiz-stat-card quiz-stat-card-status">
                <div className="quiz-stat-label">
                  Result Status
                </div>
                <div
                  className="quiz-stat-value quiz-stat-status-text"
                  style={{
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
                className="quiz-weak-areas-card"
                style={{
                  background: 'rgba(196, 107, 58, 0.1)',
                  border: '1px solid rgba(196, 107, 58, 0.3)',
                  padding: 'clamp(0.85rem, 2vw, 1.25rem)',
                  borderRadius: '8px',
                  marginBottom: 'clamp(1.25rem, 3vw, 2.25rem)',
                }}
              >
                <div
                  style={{
                    fontSize: 'clamp(0.82rem, 1.9vw, 0.9rem)',
                    fontWeight: 600,
                    color: 'var(--accent-chanakya)',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>🔍</span> Areas Recommended for Deeper Reflection:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {attemptResult.weakAreas.map((w, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'rgba(13, 11, 8, 0.6)',
                        border: '1px solid rgba(196, 107, 58, 0.4)',
                        color: 'var(--text-vellum)',
                        fontSize: 'clamp(0.76rem, 1.8vw, 0.85rem)',
                        padding: '0.25rem 0.65rem',
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
                fontSize: 'clamp(1.05rem, 2.6vw, 1.35rem)',
                color: 'var(--gold-sacred)',
                marginBottom: 'clamp(0.85rem, 2vw, 1.25rem)',
                borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
                paddingBottom: '0.5rem',
                wordBreak: 'break-word',
              }}
            >
              Detailed Question Analysis & Scriptural Commentary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.85rem, 2vw, 1.25rem)' }}>
              {attemptResult.answers.map((a, idx) => (
                <div
                  key={idx}
                  className="quiz-review-item"
                  style={{
                    border: `1px solid ${a.isCorrect ? 'rgba(72, 187, 120, 0.3)' : 'rgba(229, 62, 62, 0.3)'}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem',
                      flexWrap: 'wrap',
                      gap: '0.4rem',
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

                  <p style={{ fontWeight: 600, fontSize: 'clamp(0.92rem, 2vw, 1rem)', marginBottom: '1rem', lineHeight: 1.45, wordBreak: 'break-word' }}>
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
                          className="quiz-review-option-row"
                          style={{
                            background: bg,
                            border: `1px solid ${border}`,
                            color: color,
                          }}
                        >
                          <span style={{ wordBreak: 'break-word', flex: 1, minWidth: 0 }}>{opt}</span>
                          {isAnswer && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                              CORRECT ANSWER
                            </span>
                          )}
                          {isChosen && !isAnswer && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
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
                      fontSize: 'clamp(0.82rem, 1.8vw, 0.88rem)',
                      color: 'var(--text-vellum)',
                      lineHeight: 1.5,
                      wordBreak: 'break-word',
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
            <div className="quiz-results-actions">
              <button
                type="button"
                suppressHydrationWarning
                onClick={handleRetryWithNewQuestions}
                disabled={isGenerating}
                className="gold-button quiz-result-btn"
                style={{ padding: '0.75rem 1.75rem', borderRadius: '24px' }}
              >
                {isGenerating ? 'Synthesizing...' : '🎲 Retry with New Questions'}
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  if (activeQuiz) handleStartQuiz(activeQuiz.id);
                }}
                className="quiz-result-btn"
                style={{
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid var(--gold-sacred)',
                  color: 'var(--gold-radiance)',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                🔄 Retake Same Quiz
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setAttemptResult(null);
                  setActiveQuiz(null);
                  loadQuizzes();
                }}
                className="quiz-result-btn"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: 'var(--text-vellum)',
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
            STATE 2: ACTIVE QUIZ IN PROGRESS (Compact & Fit on Screen)
        ========================================================================== */}
        {activeQuiz && !attemptResult && (
          <div
            ref={quizRunnerRef}
            className="temple-card quiz-active-card"
          >
            {/* Active Quiz Header - Compact */}
            <div className="quiz-active-header">
              <div className="quiz-active-title-group">
                <span
                  style={{
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    color: 'var(--gold-sacred)',
                    letterSpacing: '0.06em',
                    fontWeight: 700,
                    background: 'rgba(212, 175, 55, 0.1)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {DOMAIN_LABELS[activeQuiz.domain]?.label || activeQuiz.domain.toUpperCase()} •{' '}
                  {activeQuiz.difficulty.toUpperCase()}
                </span>
                <h2 className="quiz-active-title">
                  {activeQuiz.title}
                </h2>
              </div>
              <div className="quiz-timer-pill">
                ⏱️ {formatTime(quizTimer)}
              </div>
            </div>

            {/* Progress Bar - Compact */}
            <div style={{ marginBottom: '0.85rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 'clamp(0.72rem, 1.8vw, 0.78rem)',
                  color: 'var(--text-dust)',
                  marginBottom: '0.35rem',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <span>
                  Question <strong style={{ color: 'var(--gold-radiance)' }}>{currentQuestionIdx + 1}</strong> of {activeQuiz.totalQuestions}
                </span>
                <span>
                  {Math.round(((currentQuestionIdx + 1) / activeQuiz.totalQuestions) * 100)}% Complete
                </span>
              </div>
              <div
                style={{
                  height: '5px',
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

            {/* Current Question & Options */}
            {activeQuiz.questions[currentQuestionIdx] && (
              <div>
                {activeQuiz.questions[currentQuestionIdx].sourceRef && (
                  <span
                    style={{
                      display: 'inline-block',
                      background: 'rgba(212, 175, 55, 0.1)',
                      color: 'var(--gold-sacred)',
                      fontSize: '0.75rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '10px',
                      marginBottom: '0.5rem',
                    }}
                  >
                    📜 {activeQuiz.questions[currentQuestionIdx].sourceRef}
                  </span>
                )}
                <h3 className="quiz-question-heading">
                  {activeQuiz.questions[currentQuestionIdx].questionText}
                </h3>

                {/* Option Choices */}
                <div className="quiz-options-grid">
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
                        className="quiz-option-item"
                        style={{
                          background: isSelected
                            ? 'rgba(212, 175, 55, 0.18)'
                            : 'rgba(13, 11, 8, 0.65)',
                          border: `1px solid ${isSelected ? 'var(--gold-sacred)' : 'rgba(212, 175, 55, 0.2)'}`,
                          boxShadow: isSelected ? '0 0 12px rgba(212, 175, 55, 0.2)' : 'none',
                        }}
                      >
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
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
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: 'var(--gold-sacred)',
                              }}
                            />
                          )}
                        </div>
                        <span
                          className="quiz-option-text"
                          style={{
                            color: isSelected ? 'var(--gold-radiance)' : 'var(--text-vellum)',
                            fontWeight: isSelected ? 600 : 400,
                          }}
                        >
                          {opt}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="quiz-nav-bar">
                  <button
                    type="button"
                    suppressHydrationWarning
                    disabled={currentQuestionIdx === 0}
                    onClick={() => setCurrentQuestionIdx((i) => i - 1)}
                    className="quiz-nav-btn"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      color: currentQuestionIdx === 0 ? 'var(--text-dust)' : 'var(--text-vellum)',
                      cursor: currentQuestionIdx === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    ← Previous
                  </button>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      suppressHydrationWarning
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
                        padding: '0.45rem 0.65rem',
                        fontSize: 'clamp(0.78rem, 2vw, 0.85rem)',
                      }}
                    >
                      Exit
                    </button>

                    {currentQuestionIdx < activeQuiz.totalQuestions - 1 ? (
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => setCurrentQuestionIdx((i) => i + 1)}
                        className="gold-button quiz-nav-btn"
                        style={{
                          padding: '0.55rem 1.4rem',
                        }}
                      >
                        Next Question →
                      </button>
                    ) : (
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={handleSubmitQuiz}
                        disabled={isSubmitting}
                        className="quiz-nav-btn"
                        style={{
                          background: 'linear-gradient(135deg, #48bb78 0%, #2f855a 100%)',
                          border: 'none',
                          color: '#fff',
                          padding: '0.55rem 1.5rem',
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
            {/* Card Navigation Segmented Tabs */}
            <div className="quiz-tabs-container">
              <div className="card-nav-tabs">
                {Object.entries(DOMAIN_LABELS).map(([domainKey, meta]) => {
                  const isActive = selectedDomain === domainKey;
                  return (
                    <button
                      key={domainKey}
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setSelectedDomain(domainKey)}
                      className={`card-nav-tab ${isActive ? 'active' : ''}`}
                      style={{
                        padding: '0.45rem 0.95rem',
                        fontSize: '0.84rem',
                      }}
                    >
                      <span style={{ fontSize: '1.05rem' }}>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary Controls: Search & Difficulty */}
            <div className="quiz-filter-bar">
              {/* Difficulty selector */}
              <div className="quiz-difficulty-wrapper">
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dust)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  Difficulty:
                </span>
                <div className="quiz-difficulty-pills">
                  {['all', 'beginner', 'intermediate', 'advanced'].map((diff) => {
                    const isDiffActive = selectedDifficulty === diff;
                    return (
                      <button
                        key={diff}
                        type="button"
                        suppressHydrationWarning
                        onClick={() => setSelectedDifficulty(diff)}
                        className="quiz-difficulty-btn"
                        style={{
                          background: isDiffActive
                            ? 'linear-gradient(135deg, var(--gold-sacred) 0%, var(--gold-antique) 100%)'
                            : 'transparent',
                          color: isDiffActive ? '#0D0B08' : 'var(--text-vellum)',
                          fontWeight: isDiffActive ? 700 : 500,
                        }}
                      >
                        {diff}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  loadQuizzes();
                }}
                className="quiz-search-form"
              >
                <input
                  type="text"
                  placeholder="Search topics, verses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="quiz-search-input"
                  suppressHydrationWarning
                />
                <button
                  type="submit"
                  suppressHydrationWarning
                  className="quiz-search-btn"
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
                  padding: '4rem 1.5rem',
                  background: selectedDomain === 'custom' ? 'rgba(236, 72, 153, 0.04)' : 'var(--surface-stone)',
                  borderRadius: '12px',
                  border: selectedDomain === 'custom' ? '1px dashed rgba(236, 72, 153, 0.35)' : '1px dashed rgba(212, 175, 55, 0.2)',
                }}
              >
                <div style={{ fontSize: '2.8rem', marginBottom: '0.75rem' }}>
                  {selectedDomain === 'custom' ? '✨' : '📜'}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.35rem',
                    marginBottom: '0.5rem',
                    color: selectedDomain === 'custom' ? '#f472b6' : 'var(--text-vellum)',
                  }}
                >
                  {selectedDomain === 'custom'
                    ? 'No Custom Quizzes Created Yet'
                    : 'No Quizzes Found for Current Filter'}
                </h3>
                <p
                  style={{ color: 'var(--text-dust)', fontSize: '0.92rem', marginBottom: '1.5rem', maxWidth: '520px', margin: '0 auto 1.5rem' }}
                >
                  {selectedDomain === 'custom'
                    ? 'Create an interactive quiz on any ancient wisdom topic with up to 15 questions generated instantly by the AI Sage!'
                    : 'Try adjusting the domain or generate an on-the-fly AI assessment.'}
                </p>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowGenerateModal(true)}
                  className="gold-button"
                  style={{ padding: '0.7rem 1.8rem', borderRadius: '25px', fontWeight: 700 }}
                >
                  ✨ Create Quiz from Topic Now
                </button>
              </div>
            ) : (
              <div className="quiz-catalog-grid">
                {quizzes.map((quiz) => {
                  const domainMeta = DOMAIN_LABELS[quiz.domain] || DOMAIN_LABELS.general;
                  const isUserCreated =
                    quiz.isDynamic ||
                    quiz.domain === 'custom' ||
                    quiz.tags?.includes('user-created') ||
                    quiz.tags?.includes('custom') ||
                    quiz.tags?.includes('your-quiz');

                  return (
                    <div
                      key={quiz.id}
                      className="temple-card temple-card-interactive quiz-catalog-card"
                      style={{
                        borderTop: isUserCreated ? '3px solid #ec4899' : `3px solid ${domainMeta.color}`,
                        boxShadow: isUserCreated
                          ? '0 10px 32px -4px rgba(0, 0, 0, 0.65), 0 0 20px rgba(236, 72, 153, 0.2)'
                          : `0 10px 32px -4px rgba(0, 0, 0, 0.65), 0 0 20px ${domainMeta.color}15`,
                      }}
                      onClick={() => handleStartQuiz(quiz.id)}
                    >
                      <div>
                        {/* Domain Badge & Difficulty */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.25rem',
                            flexWrap: 'wrap',
                            gap: '0.4rem',
                          }}
                        >
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            {isUserCreated && (
                              <span
                                className="badge"
                                style={{
                                  background: 'rgba(236, 72, 153, 0.15)',
                                  color: '#f472b6',
                                  borderColor: 'rgba(236, 72, 153, 0.45)',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  boxShadow: '0 0 10px rgba(236, 72, 153, 0.2)',
                                }}
                              >
                                <span>✨</span>
                                <span>Your Quiz</span>
                              </span>
                            )}
                            <span
                              className="badge"
                              style={{
                                background: `${domainMeta.color}14`,
                                color: domainMeta.color,
                                borderColor: `${domainMeta.color}45`,
                                fontSize: '0.78rem',
                                fontWeight: 700,
                              }}
                            >
                              <span>{domainMeta.icon}</span>
                              <span>{domainMeta.label}</span>
                            </span>
                          </div>

                          <span
                            style={{
                              fontSize: '0.74rem',
                              textTransform: 'uppercase',
                              color:
                                quiz.difficulty === 'advanced'
                                   ? '#fc8181'
                                  : quiz.difficulty === 'intermediate'
                                    ? 'var(--gold-radiance)'
                                    : '#68d391',
                              fontWeight: 700,
                              letterSpacing: '0.06em',
                              background: 'rgba(0, 0, 0, 0.3)',
                              padding: '0.15rem 0.55rem',
                              borderRadius: '9999px',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            {quiz.difficulty}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="quiz-card-title">
                          {quiz.title}
                        </h3>

                        {/* Description */}
                        {quiz.description && (
                          <p
                            className="quiz-card-desc"
                            style={{
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
                                  background: 'rgba(212, 175, 55, 0.08)',
                                  color: 'var(--gold-radiance)',
                                  padding: '0.18rem 0.55rem',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(212, 175, 55, 0.18)',
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
                          borderTop: '1px solid rgba(212, 175, 55, 0.15)',
                          paddingTop: '1.15rem',
                          marginTop: '0.5rem',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-dust)', fontWeight: 600 }}>
                          📝 {quiz.questionCount} Questions
                        </span>
                        <button
                          type="button"
                          suppressHydrationWarning
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartQuiz(quiz.id);
                          }}
                          className="btn-outline-sacred card-action-link"
                          style={{
                            padding: '0.45rem 1.15rem',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            borderColor: domainMeta.color,
                            color: domainMeta.color,
                            background: `${domainMeta.color}10`,
                          }}
                        >
                          <span>Begin Test</span>
                          <span className="action-arrow">→</span>
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
              padding: '0.75rem',
            }}
          >
            <div
              className="temple-card quiz-modal-card"
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>✨</span>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.2rem',
                        color: 'var(--gold-sacred)',
                        margin: 0,
                      }}
                    >
                      Create Quiz from Topic
                    </h3>
                    <span style={{ fontSize: '0.72rem', color: '#f472b6', fontWeight: 600 }}>
                      Saves to &quot;My Quizzes&quot; • Up to 15 Questions
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowGenerateModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dust)',
                    fontSize: '1.3rem',
                    cursor: 'pointer',
                    padding: '0.2rem',
                  }}
                >
                  ✕
                </button>
              </div>

              <p style={{ color: 'var(--text-dust)', fontSize: '0.8rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                Enter any spiritual, philosophical, or practical topic. The AI Sage will synthesize an authentic
                assessment grounded in Vedic principles that you can take immediately.
              </p>

              <form onSubmit={handleGenerateAIQuiz}>
                {/* Specific Topic Input - Primary */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      marginBottom: '0.3rem',
                      color: 'var(--gold-radiance)',
                      fontWeight: 600,
                    }}
                  >
                    Enter Topic or Concept <span style={{ color: '#fc8181' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sthitaprajna, Tridoshas in Winter, Chanakya's Four Expedients..."
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    suppressHydrationWarning
                    style={{
                      width: '100%',
                      background: 'rgba(13, 11, 8, 0.9)',
                      border: '1px solid rgba(212, 175, 55, 0.45)',
                      color: 'var(--text-vellum)',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxShadow: '0 0 10px rgba(212, 175, 55, 0.1)',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* 2-Column Grid: Domain Picker & Guru Picker */}
                <div className="quiz-modal-grid-2col">
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.78rem',
                        marginBottom: '0.3rem',
                        color: 'var(--text-vellum)',
                      }}
                    >
                      Category / Tradition
                    </label>
                    <select
                      value={genDomain}
                      onChange={(e) => setGenDomain(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(13, 11, 8, 0.8)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: 'var(--text-vellum)',
                        padding: '0.5rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="gita">🏹 Bhagavad Gita</option>
                      <option value="chanakya">🏛️ Chanakya Neeti</option>
                      <option value="upanishads">✨ Upanishads</option>
                      <option value="ayurveda">🌿 Ayurveda</option>
                      <option value="mahabharata">⚔️ Mahabharata</option>
                      <option value="ramayana">🔆 Ramayana</option>
                      <option value="panchatantra">📖 Panchatantra</option>
                      <option value="yoga">🧘 Yoga Sutras</option>
                      <option value="general">🕉️ Universal Vedic</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.78rem',
                        marginBottom: '0.3rem',
                        color: 'var(--text-vellum)',
                      }}
                    >
                      Sage Voice (Optional)
                    </label>
                    <select
                      value={genGuru}
                      onChange={(e) => {
                        const guru = e.target.value;
                        setGenGuru(guru);
                        if (guru === 'krishna') setGenDomain('gita');
                        else if (guru === 'chanakya') setGenDomain('chanakya');
                        else if (guru === 'charaka') setGenDomain('ayurveda');
                        else if (guru === 'vyasa') setGenDomain('mahabharata');
                        else if (guru === 'patanjali') setGenDomain('yoga');
                      }}
                      style={{
                        width: '100%',
                        background: 'rgba(13, 11, 8, 0.8)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: 'var(--text-vellum)',
                        padding: '0.5rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="">All Gurus</option>
                      <option value="krishna">Lord Krishna</option>
                      <option value="chanakya">Chanakya</option>
                      <option value="charaka">Vaidya Charaka</option>
                      <option value="vyasa">Sage Vyasa</option>
                      <option value="patanjali">Sage Patanjali</option>
                    </select>
                  </div>
                </div>

                {/* Difficulty & Count */}
                <div className="quiz-modal-grid-2col" style={{ marginBottom: '1rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.78rem',
                        marginBottom: '0.3rem',
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
                        padding: '0.5rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        outline: 'none',
                        boxSizing: 'border-box',
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
                        fontSize: '0.78rem',
                        marginBottom: '0.3rem',
                        color: 'var(--text-vellum)',
                      }}
                    >
                      Question Count: <strong style={{ color: 'var(--gold-radiance)' }}>{genCount}</strong>
                    </label>
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      {[3, 5, 8, 10, 15].map((num) => (
                        <button
                          key={num}
                          type="button"
                          suppressHydrationWarning
                          onClick={() => setGenCount(num)}
                          style={{
                            flex: 1,
                            minWidth: '28px',
                            padding: '0.25rem 0.2rem',
                            borderRadius: '5px',
                            border: `1px solid ${genCount === num ? 'var(--gold-sacred)' : 'rgba(212, 175, 55, 0.25)'}`,
                            background: genCount === num ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(184, 134, 11, 0.2) 100%)' : 'rgba(0,0,0,0.4)',
                            color: genCount === num ? 'var(--gold-radiance)' : 'var(--text-dust)',
                            fontWeight: genCount === num ? 700 : 500,
                            fontSize: '0.76rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {num} Qs
                        </button>
                      ))}
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={genCount}
                      onChange={(e) => setGenCount(Number(e.target.value))}
                      style={{
                        width: '100%',
                        accentColor: 'var(--gold-sacred)',
                      }}
                    />
                  </div>
                </div>

                {/* Modal Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setShowGenerateModal(false)}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'var(--text-vellum)',
                      padding: '0.5rem 1.1rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    suppressHydrationWarning
                    disabled={isGenerating || !genTopic.trim()}
                    className="gold-button"
                    style={{
                      padding: '0.55rem 1.4rem',
                      borderRadius: '20px',
                      fontSize: '0.88rem',
                      opacity: !genTopic.trim() ? 0.6 : 1,
                      cursor: !genTopic.trim() ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isGenerating ? `Synthesizing ${genCount} Qs...` : `✨ Generate & Start Quiz (${genCount} Qs)`}
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
