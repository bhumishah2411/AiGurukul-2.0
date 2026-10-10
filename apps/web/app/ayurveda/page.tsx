'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../lib/api';
import {
  AyurvedaQuestion,
  AyurvedaProfileDTO,
  AyurvedaRecommendation,
  DoshaType,
} from '@ai-gurukul/types';

export default function AyurvedaPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [questions, setQuestions] = useState<AyurvedaQuestion[]>([]);
  const [symptomCatalog, setSymptomCatalog] = useState<
    Array<{ id: string; label: string; dosha: DoshaType }>
  >([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<AyurvedaProfileDTO | null>(null);

  const [activeTab, setActiveTab] = useState<'physical' | 'physiological' | 'psychological'>(
    'physical'
  );
  const [activeRecCategory, setActiveRecCategory] = useState<string>('all');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomNotes, setSymptomNotes] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [symptomSubmitting, setSymptomSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isRetaking, setIsRetaking] = useState<boolean>(false);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch Questionnaire and Symptom Catalog
      const qRes = await apiClient<{
        totalQuestions: number;
        questions: AyurvedaQuestion[];
        availableSymptoms: Array<{ id: string; label: string; dosha: DoshaType }>;
      }>('/ayurveda/questionnaire');

      if (qRes.success && qRes.data) {
        setQuestions(qRes.data.questions);
        setSymptomCatalog(qRes.data.availableSymptoms);
      }

      // 2. If authenticated, fetch existing profile
      if (isAuthenticated) {
        const pRes = await apiClient<AyurvedaProfileDTO | null>('/ayurveda/profile');
        if (pRes.success && pRes.data) {
          setProfile(pRes.data);
          if (pRes.data.currentImbalances) {
            setSelectedSymptoms((pRes.data.recentVikritiLogs?.[0]?.symptoms as string[]) || []);
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to load Ayurveda consultation data.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent =
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const handleSubmitPrakriti = async () => {
    if (answeredCount < 12) {
      setErrorMsg(
        `Please answer at least 12 questions (currently answered: ${answeredCount}/${questions.length}).`
      );
      return;
    }

    if (!isAuthenticated) {
      setErrorMsg(
        'Please log in or enroll to record and save your Ayurvedic Prakriti constitution.'
      );
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      }));

      const res = await apiClient<AyurvedaProfileDTO>('/ayurveda/prakriti', {
        method: 'POST',
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      if (res.success && res.data) {
        setProfile(res.data);
        setIsRetaking(false);
        setSuccessMsg('Your inborn Prakriti constitution has been calculated and saved.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error evaluating Prakriti assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId]
    );
  };

  const handleLogSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      setErrorMsg('Please select at least one symptom to evaluate acute Vikriti imbalances.');
      return;
    }

    if (!isAuthenticated) {
      setErrorMsg('Please log in to record acute symptoms in your Ayurvedic wellness journal.');
      return;
    }

    setSymptomSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await apiClient<AyurvedaProfileDTO>('/ayurveda/symptoms', {
        method: 'POST',
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          notes: symptomNotes || undefined,
        }),
      });

      if (res.success && res.data) {
        setProfile(res.data);
        setSuccessMsg('Acute symptoms evaluated and tailored recommendations updated.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating symptom log.');
    } finally {
      setSymptomSubmitting(false);
    }
  };

  const getFilteredRecommendations = () => {
    if (!profile) return [];
    if (activeRecCategory === 'all') return profile.recommendations;
    return profile.recommendations.filter((r) => r.category === activeRecCategory);
  };

  const filteredQuestions = questions.filter((q) => q.category === activeTab);

  if (loading || authLoading) {
    return (
      <div className="temple-container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <span style={{ fontSize: '3rem' }}>🌿</span>
        <h2
          style={{ fontFamily: 'var(--font-serif)', marginTop: '1rem' }}
          className="gold-gradient-text"
        >
          Opening Charaka Samhita Sanctuary...
        </h2>
        <p style={{ color: 'var(--text-dust)', marginTop: '0.5rem' }}>
          Loading diagnostic matrices and herbal catalog
        </p>
      </div>
    );
  }

  return (
    <div className="temple-container" style={{ padding: '2rem 1.5rem 5rem', maxWidth: '1100px' }}>
      {/* Quick Navigation Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            href="/"
            style={{
              color: 'var(--text-dust)',
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            ← Sanctum
          </Link>
          <span style={{ color: 'rgba(212, 175, 55, 0.3)' }}>/</span>
          <span style={{ color: '#4fd1c5', fontSize: '0.9rem', fontWeight: 600 }}>
            Ayurveda &amp; Dosha Matrix
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span
            className="badge"
            style={{
              borderColor: 'rgba(58, 155, 140, 0.4)',
              color: '#4fd1c5',
              fontSize: '0.75rem',
            }}
          >
            🌿 Charaka Samhita Diagnostic
          </span>
          <span
            className="badge"
            style={{
              borderColor: 'rgba(212, 175, 55, 0.3)',
              color: 'var(--gold-radiance)',
              fontSize: '0.75rem',
            }}
          >
            18 Indicators
          </span>
        </div>
      </div>

      {/* HEADER SECTION */}
      <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}
        >
          <span className="badge" style={{ borderColor: 'var(--accent-vaidya)', color: '#4fd1c5' }}>
            🌿 Science of Longevity (Ayurveda)
          </span>
          <span className="badge">Phase 4A Active</span>
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.75rem',
            marginBottom: '0.75rem',
            letterSpacing: '0.02em',
          }}
          className="gold-gradient-text"
        >
          Discover Your Inborn Prakriti &amp; Balance Vikriti
        </h1>
        <p
          style={{
            color: 'var(--text-dust)',
            maxWidth: '720px',
            margin: '0 auto',
            fontSize: '1.05rem',
            lineHeight: '1.7',
          }}
        >
          <em>
            &ldquo;When diet is wrong, medicine is of no use. When diet is correct, medicine is of
            no need.&rdquo;
          </em>
          <br />
          Ground your daily lifestyle, nutrition, and seasonal habits in the timeless diagnostic
          wisdom of the <strong>Charaka Samhita</strong>.
        </p>
      </section>

      {/* ALERT NOTIFICATIONS */}
      {errorMsg && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '6px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>⚠️ {errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fca5a5',
              cursor: 'pointer',
              fontSize: '1.1rem',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '6px',
            background: 'rgba(58, 155, 140, 0.15)',
            border: '1px solid rgba(58, 155, 140, 0.35)',
            color: '#81e6d9',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>✓ {successMsg}</span>
          <button
            onClick={() => setSuccessMsg(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#81e6d9',
              cursor: 'pointer',
              fontSize: '1.1rem',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ACTIVE PROFILE DASHBOARD (IF ALREADY ASSESSED AND NOT RETAKING) */}
      {profile && !isRetaking ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* CONSTITUTION CARD */}
          <div
            className="temple-card"
            style={{
              background:
                'linear-gradient(145deg, rgba(33, 29, 18, 0.95) 0%, rgba(42, 37, 21, 0.8) 100%)',
              border: '1px solid rgba(58, 155, 140, 0.35)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '180px',
                height: '180px',
                background: 'radial-gradient(circle, rgba(58, 155, 140, 0.18) 0%, transparent 70%)',
                borderRadius: '50%',
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#4fd1c5',
                    fontWeight: 700,
                  }}
                >
                  Your Vedic Constitution (Prakriti)
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '2.2rem',
                    marginTop: '0.25rem',
                  }}
                  className="gold-gradient-text"
                >
                  {profile.prakriti.dominantDosha.toUpperCase()} CONSTITUTION
                </h2>
                <p style={{ color: 'var(--text-dust)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                  Determined through classical somatic, metabolic, and cognitive indicators.
                </p>
              </div>
              <button
                onClick={() => setIsRetaking(true)}
                className="btn-sacred"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--gold-antique)',
                  color: 'var(--gold-sacred)',
                  fontSize: '0.85rem',
                  padding: '0.5rem 1rem',
                }}
              >
                ↺ Retake Assessment
              </button>
            </div>

            {/* TRI-DOSHA PERCENTAGE METERS */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem',
              }}
            >
              {/* VATA */}
              <div
                style={{
                  background: 'rgba(13, 11, 8, 0.6)',
                  padding: '1.25rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(123, 104, 238, 0.25)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      color: '#9d8df1',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    💨 Vata (Air/Ether)
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--text-vellum)' }}>
                    {profile.prakriti.vata}%
                  </span>
                </div>
                <div
                  style={{
                    height: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${profile.prakriti.vata}%`,
                      height: '100%',
                      background: '#7B68EE',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dust)', marginTop: '0.5rem' }}>
                  Governs motion, nervous transmission, breath, and imagination.
                </p>
              </div>

              {/* PITTA */}
              <div
                style={{
                  background: 'rgba(13, 11, 8, 0.6)',
                  padding: '1.25rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(196, 107, 58, 0.25)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      color: '#e07a5f',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    🔥 Pitta (Fire/Water)
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--text-vellum)' }}>
                    {profile.prakriti.pitta}%
                  </span>
                </div>
                <div
                  style={{
                    height: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${profile.prakriti.pitta}%`,
                      height: '100%',
                      background: '#C46B3A',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dust)', marginTop: '0.5rem' }}>
                  Governs digestion, metabolism, body heat, intellect, and vision.
                </p>
              </div>

              {/* KAPHA */}
              <div
                style={{
                  background: 'rgba(13, 11, 8, 0.6)',
                  padding: '1.25rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(58, 155, 140, 0.25)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      color: '#4fd1c5',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    🌊 Kapha (Earth/Water)
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--text-vellum)' }}>
                    {profile.prakriti.kapha}%
                  </span>
                </div>
                <div
                  style={{
                    height: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${profile.prakriti.kapha}%`,
                      height: '100%',
                      background: '#3A9B8C',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dust)', marginTop: '0.5rem' }}>
                  Governs biological structure, joint lubrication, immunity, and stability.
                </p>
              </div>
            </div>

            {/* CURRENT ACUTE IMBALANCE STATUS */}
            {profile.currentImbalances && profile.currentImbalances.length > 0 && (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '6px',
                  background: 'rgba(196, 107, 58, 0.1)',
                  border: '1px solid rgba(196, 107, 58, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>⚡</span>
                <div>
                  <strong style={{ color: 'var(--gold-sacred)', fontSize: '0.9rem' }}>
                    Active Vikriti Imbalance Detected:
                  </strong>
                  <span
                    style={{
                      color: 'var(--text-vellum)',
                      fontSize: '0.85rem',
                      marginLeft: '0.5rem',
                    }}
                  >
                    Elevated {profile.currentImbalances.map((d) => d.toUpperCase()).join(' & ')}.
                    Your prescriptions below prioritize pacifying these flare-ups.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* PRESCRIPTIONS SECTION */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.6rem',
                    color: 'var(--text-vellum)',
                  }}
                >
                  Vaidya Charaka&apos;s Prescriptions
                </h3>
                <p style={{ color: 'var(--text-dust)', fontSize: '0.9rem' }}>
                  Shastric regimens calibrated to your specific dosha constitution.
                </p>
              </div>

              {/* CATEGORY FILTER PILLS */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['all', 'diet', 'routine', 'herbs', 'lifestyle'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveRecCategory(cat)}
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border:
                        activeRecCategory === cat
                          ? '1px solid var(--accent-vaidya)'
                          : '1px solid rgba(212, 175, 55, 0.2)',
                      background:
                        activeRecCategory === cat
                          ? 'rgba(58, 155, 140, 0.25)'
                          : 'rgba(33, 29, 18, 0.7)',
                      color: activeRecCategory === cat ? '#4fd1c5' : 'var(--text-dust)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {cat === 'all' ? 'All Guidance' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* PRESCRIPTION CARDS GRID */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {getFilteredRecommendations().map((rec) => (
                <div
                  key={rec.id}
                  className="temple-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderLeft: '4px solid var(--accent-vaidya)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <span className="badge" style={{ fontSize: '0.7rem' }}>
                        {rec.category.toUpperCase()}
                      </span>
                      {rec.classicalReference && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--gold-sacred)',
                            fontFamily: 'var(--font-serif)',
                          }}
                        >
                          📜 {rec.classicalReference}
                        </span>
                      )}
                    </div>
                    <h4
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.2rem',
                        color: 'var(--text-vellum)',
                        margin: '0.5rem 0',
                      }}
                    >
                      {rec.title}
                    </h4>
                    <p style={{ color: 'var(--text-dust)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      {rec.guidance}
                    </p>
                  </div>

                  {rec.benefits && rec.benefits.length > 0 && (
                    <div
                      style={{
                        marginTop: '1.25rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid rgba(212, 175, 55, 0.1)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#4fd1c5',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                        }}
                      >
                        Shastric Benefits:
                      </span>
                      <ul
                        style={{
                          margin: '0.4rem 0 0 1.25rem',
                          padding: 0,
                          fontSize: '0.82rem',
                          color: 'var(--text-vellum)',
                        }}
                      >
                        {rec.benefits.map((b, i) => (
                          <li key={i} style={{ marginBottom: '0.2rem' }}>
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ACUTE SYMPTOM EVALUATION DRAWER */}
          <div
            className="temple-card"
            style={{
              background: 'var(--surface-stone)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              padding: '2rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <span style={{ fontSize: '1.75rem' }}>🩺</span>
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.4rem',
                    color: 'var(--text-vellum)',
                  }}
                >
                  Acute Vikriti Symptom Check
                </h3>
                <p style={{ color: 'var(--text-dust)', fontSize: '0.85rem' }}>
                  Are you currently experiencing bodily or mental flare-ups? Select all that apply
                  to recalibrate recommendations.
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '0.75rem',
                margin: '1.5rem 0',
              }}
            >
              {symptomCatalog.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom.id);
                return (
                  <div
                    key={symptom.id}
                    onClick={() => handleToggleSymptom(symptom.id)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: isSelected
                        ? '1px solid var(--accent-vaidya)'
                        : '1px solid rgba(212, 175, 55, 0.12)',
                      background: isSelected ? 'rgba(58, 155, 140, 0.2)' : 'rgba(13, 11, 8, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      style={{ accentColor: 'var(--accent-vaidya)', cursor: 'pointer' }}
                    />
                    <span
                      style={{
                        fontSize: '0.85rem',
                        color: isSelected ? 'var(--text-vellum)' : 'var(--text-dust)',
                      }}
                    >
                      {symptom.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleLogSymptoms}
                disabled={symptomSubmitting}
                className="btn-sacred"
                style={{
                  background: 'linear-gradient(135deg, #3A9B8C 0%, #22645a 100%)',
                  color: '#EDE8D5',
                }}
              >
                {symptomSubmitting ? 'Evaluating Imbalances...' : 'Recalibrate Vikriti Imbalances'}
              </button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dust)' }}>
                {selectedSymptoms.length} symptom{selectedSymptoms.length === 1 ? '' : 's'} selected
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* QUESTIONNAIRE WIZARD */
        <div>
          {/* PROGRESS & CATEGORY TABS */}
          <div className="temple-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {(['physical', 'physiological', 'psychological'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border:
                        activeTab === tab
                          ? '1px solid var(--gold-sacred)'
                          : '1px solid transparent',
                      background: activeTab === tab ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                      color: activeTab === tab ? 'var(--gold-radiance)' : 'var(--text-dust)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      fontSize: '0.9rem',
                    }}
                  >
                    {tab === 'physical' && '🧘 1. Physical'}
                    {tab === 'physiological' && '🌿 2. Physiological'}
                    {tab === 'psychological' && '🧠 3. Psychological'}
                  </button>
                ))}
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--gold-sacred)', fontWeight: 700 }}>
                  Answered: {answeredCount} / {questions.length} ({progressPercent}%)
                </span>
              </div>
            </div>

            {/* PROGRESS BAR */}
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
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #7B68EE 0%, #C46B3A 50%, #3A9B8C 100%)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* QUESTIONS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredQuestions.map((q, qIndex) => {
              const currentSelected = answers[q.id];
              return (
                <div
                  key={q.id}
                  className="temple-card"
                  style={{
                    background: 'var(--surface-stone)',
                    border: currentSelected
                      ? '1px solid rgba(58, 155, 140, 0.35)'
                      : '1px solid rgba(212, 175, 55, 0.15)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span className="badge" style={{ fontSize: '0.7rem' }}>
                      Question {questions.indexOf(q) + 1} of {questions.length}
                    </span>
                    {currentSelected && (
                      <span style={{ color: '#4fd1c5', fontSize: '0.8rem', fontWeight: 600 }}>
                        ✓ Answered
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.15rem',
                      color: 'var(--text-vellum)',
                      margin: '0.5rem 0',
                    }}
                  >
                    {q.question}
                  </h3>
                  {q.explanation && (
                    <p
                      style={{
                        color: 'var(--text-dust)',
                        fontSize: '0.82rem',
                        marginBottom: '1rem',
                        fontStyle: 'italic',
                      }}
                    >
                      {q.explanation}
                    </p>
                  )}

                  {/* 3 DOSHA OPTIONS */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: '0.75rem',
                      marginTop: '0.75rem',
                    }}
                  >
                    {q.options.map((opt) => {
                      const isOptionSelected = currentSelected === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleSelectOption(q.id, opt.id)}
                          style={{
                            padding: '1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            border: isOptionSelected
                              ? '1px solid var(--accent-vaidya)'
                              : '1px solid rgba(212, 175, 55, 0.15)',
                            background: isOptionSelected
                              ? 'rgba(58, 155, 140, 0.2)'
                              : 'rgba(13, 11, 8, 0.4)',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.25rem',
                            }}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              checked={isOptionSelected}
                              readOnly
                              style={{ accentColor: 'var(--accent-vaidya)', cursor: 'pointer' }}
                            />
                            <span
                              style={{
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                fontWeight: 700,
                                color:
                                  opt.dosha === 'vata'
                                    ? '#9d8df1'
                                    : opt.dosha === 'pitta'
                                      ? '#e07a5f'
                                      : '#4fd1c5',
                              }}
                            >
                              {opt.dosha} trait
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: '0.88rem',
                              color: isOptionSelected ? 'var(--text-vellum)' : 'var(--text-dust)',
                              margin: 0,
                            }}
                          >
                            {opt.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* SUBMIT / NAVIGATION BAR */}
          <div
            className="temple-card"
            style={{
              marginTop: '2.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              background: 'var(--surface-wood)',
            }}
          >
            <div>
              {answeredCount < 12 ? (
                <span style={{ color: 'var(--gold-sacred)', fontSize: '0.9rem' }}>
                  Please answer at least {12 - answeredCount} more questions to generate your
                  diagnostic profile.
                </span>
              ) : (
                <span style={{ color: '#4fd1c5', fontSize: '0.9rem', fontWeight: 600 }}>
                  ✓ Diagnostic threshold reached ({answeredCount}/{questions.length} completed).
                  Ready to evaluate.
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {profile && (
                <button
                  onClick={() => setIsRetaking(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dust)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSubmitPrakriti}
                disabled={submitting || answeredCount < 12}
                className="btn-sacred"
                style={{
                  opacity: answeredCount < 12 ? 0.5 : 1,
                  cursor: answeredCount < 12 ? 'not-allowed' : 'pointer',
                  background:
                    'linear-gradient(135deg, var(--gold-sacred) 0%, var(--gold-antique) 100%)',
                }}
              >
                {submitting
                  ? 'Analyzing Diagnostic Matrix...'
                  : 'Reveal My Prakriti Constitution →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
