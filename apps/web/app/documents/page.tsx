'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface DocumentDTO {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  domain: string;
  language: string;
  author?: string;
  era?: string;
  status: 'pending' | 'extracting' | 'chunking' | 'embedding' | 'indexed' | 'failed';
  chunkCount: number;
  tokenCount: number;
  errorMessage?: string;
  createdAt: string;
}

interface DocumentChunkDTO {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  tokenCount: number;
  canonicalReference?: string;
}

interface CitationDTO {
  documentId: string;
  documentTitle: string;
  author?: string;
  canonicalReference?: string;
  chunkIndex: number;
  snippet: string;
  similarityScore: number;
}

interface RAGStats {
  totalDocuments: number;
  indexedDocuments: number;
  totalChunks: number;
  totalTokens: number;
  domainCounts: Record<string, number>;
}

const PRESET_TEMPLATES = [
  {
    name: 'Mandukya Upanishad: Four States of Consciousness',
    title: 'Mandukya Upanishad on AUM and Turiya',
    domain: 'vedanta',
    author: 'Sage Gaudapada / Vedic Rishis',
    era: 'c. 6th–5th Century BCE',
    language: 'sa',
    content:
      'सर्वं ह्येतद् ब्रह्म अयमात्मा ब्रह्म सोऽयमात्मा चतुष्पात्॥ [Mandukya 2] All this is verily Brahman. This Atman is Brahman. This same Atman has four quarters (states of consciousness).\n\nजागरितस्थानो बहिष्प्रज्ञः सप्ताङ्ग एकोनविंशतिमुखः स्थूलभुग्वैश्वानरः प्रथमः पादः॥ [Mandukya 3] The first quarter is Vaishvanara, whose sphere is the waking state, conscious of external objects, having seven limbs and nineteen mouths, enjoying gross objects.\n\nनान्तःप्रज्ञं न बहिष्प्रज्ञं नोभयतःप्रज्ञं न प्रज्ञानघनं न प्रज्ञं नाप्रज्ञम्। अदृष्टमव्यवहार्यमग्राह्यमलक्षणमचिन्त्यमव्यपदेश्यमेकात्मप्रत्ययसारं प्रपञ्चोपशमं शान्तं शिवमद्वैतं चतुर्थं मन्यन्ते स आत्मा स विज्ञेयः॥ [Mandukya 7] Turiya is not that which is conscious of the inner world, nor that which is conscious of the outer world. It is unperceived, beyond empirical dealings, incomprehensible, uninferable, unthinkable, indescribable; the essence of the consciousness of the one Self, the cessation of all phenomena, tranquil, auspicious, non-dual. That is the Self; that is to be realized.',
  },
  {
    name: 'Chanakya Arthashastra: Seven Pillars of Sovereign State',
    title: 'Kautilya Arthashastra on Saptanga Rajya',
    domain: 'chanakya',
    author: 'Acharya Kautilya (Chanakya)',
    era: 'c. 4th Century BCE',
    language: 'sa',
    content:
      'स्वाम्यमात्यजनपददुर्गकोशदण्डमित्राणि प्रकृतयः॥ [Arthashastra 6.1.1] The sovereign King (Svamin), the council of ministers (Amatya), the countryside and territory (Janapada), the fortified city (Durga), the treasury (Kosha), the military army (Danda), and reliable allies (Mitra)—these constitute the seven constituents (Saptanga) of an enduring state.\n\nप्रजासुखे सुखं राज्ञः प्रजानां च हिते हितम्। नात्मप्रियं हितं राज्ञः प्रजानां तु प्रियं हितम्॥ [Arthashastra 1.19.34] In the happiness of his subjects lies the king’s happiness; in their welfare his welfare. The king shall not consider what pleases him as good, but what pleases his subjects he shall consider as good.',
  },
  {
    name: 'Ashtanga Hridaya: Daily Regimen (Dinacharya)',
    title: 'Vagbhata Ashtanga Hridaya on Dinacharya & Longevity',
    domain: 'ayurveda',
    author: 'Acharya Vagbhata',
    era: 'c. 6th Century CE',
    language: 'sa',
    content:
      'ब्राह्मे मुहूर्ते उत्तिष्ठेत् स्वस्थो रक्षार्थमायुषः। [Ashtanga Hridaya Sutrasthana 2.1] An individual seeking health and longevity should wake up in the Brahma Muhurta (approx. 48 minutes before sunrise), when the atmosphere is rich in pure Sattva and prana.\n\nव्यायामं कुर्वतो नित्यं विरुद्धमपि भोजनम्। विदग्धमथवाऽप्यन्नं निर्दोषं परिपच्यते॥ [Ashtanga Hridaya Sutrasthana 2.11] For a person who performs regular physical exercise (Vyayama) suited to their constitution, even contradictory or unwholesome food gets digested without creating disease or toxicity.',
  },
];

export default function DocumentsRAGPage() {
  const [activeTab, setActiveTab] = useState<'archive' | 'ingest' | 'playground'>('archive');
  const [documents, setDocuments] = useState<DocumentDTO[]>([]);
  const [stats, setStats] = useState<RAGStats | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Ingestion form state
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('gita');
  const [author, setAuthor] = useState('');
  const [era, setEra] = useState('');
  const [language, setLanguage] = useState('sa');
  const [content, setContent] = useState('');
  const [ingesting, setIngesting] = useState(false);
  const [ingestStatusMessage, setIngestStatusMessage] = useState('');
  const [ingestSuccess, setIngestSuccess] = useState<DocumentDTO | null>(null);

  // Chunk inspection drawer
  const [inspectingDoc, setInspectingDoc] = useState<{
    document: DocumentDTO;
    chunks: DocumentChunkDTO[];
  } | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  // RAG query playground state
  const [ragQuery, setRagQuery] = useState(
    'What does the Gita teach about duty and attachment to fruits of action?'
  );
  const [topK, setTopK] = useState(4);
  const [domainFilter, setDomainFilter] = useState('');
  const [ragLoading, setRagLoading] = useState(false);
  const [ragResult, setRagResult] = useState<{
    query: string;
    resultsCount: number;
    citations: CitationDTO[];
    synthesizedContext: string;
  } | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await fetch('http://localhost:5000/api/v1/rag/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch RAG stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoadingDocs(true);
      const res = await fetch('http://localhost:5000/api/v1/documents?limit=50');
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data.documents);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchDocuments();
  }, [fetchStats, fetchDocuments]);

  const loadPreset = (preset: (typeof PRESET_TEMPLATES)[0]) => {
    setTitle(preset.title);
    setDomain(preset.domain);
    setAuthor(preset.author);
    setEra(preset.era);
    setLanguage(preset.language);
    setContent(preset.content);
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setIngesting(true);
      setIngestStatusMessage('Uploading to Object Storage & validating structure...');
      setIngestSuccess(null);

      const res = await fetch('http://localhost:5000/api/v1/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          domain,
          author: author || undefined,
          era: era || undefined,
          language,
          content,
        }),
      });

      setIngestStatusMessage('Semantic chunking & vector indexing in progress...');
      const data = await res.json();

      if (data.success) {
        setIngestSuccess(data.data);
        setIngestStatusMessage('Document successfully indexed and verified! 🟢');
        setTitle('');
        setContent('');
        setAuthor('');
        setEra('');
        fetchDocuments();
        fetchStats();
      } else {
        setIngestStatusMessage(`Ingestion failed: ${data.error?.message || 'Unknown error'}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setIngestStatusMessage(`Ingestion error: ${msg}`);
    } finally {
      setIngesting(false);
    }
  };

  const handleInspectChunks = async (docId: string) => {
    try {
      setInspectLoading(true);
      const res = await fetch(`http://localhost:5000/api/v1/documents/${docId}`);
      const data = await res.json();
      if (data.success) {
        setInspectingDoc(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch chunks:', err);
    } finally {
      setInspectLoading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (
      !confirm('Are you sure you want to delete this document and all its indexed vector chunks?')
    ) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/v1/documents/${docId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        if (inspectingDoc?.document.id === docId) {
          setInspectingDoc(null);
        }
        fetchDocuments();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const handleRAGQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ragQuery.trim()) return;

    try {
      setRagLoading(true);
      const res = await fetch('http://localhost:5000/api/v1/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: ragQuery,
          topK,
          domainFilter: domainFilter || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRagResult(data.data);
      }
    } catch (err) {
      console.error('RAG query failed:', err);
    } finally {
      setRagLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-obsidian)',
        color: 'var(--text-vellum)',
        padding: '2rem 1.5rem',
      }}
    >
      <div className="temple-container" style={{ maxWidth: '1240px', margin: '0 auto' }}>
        {/* Navigation Breadcrumb */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
          }}
        >
          <Link href="/" style={{ color: 'var(--gold-radiance)', textDecoration: 'none' }}>
            Sanctum Home
          </Link>
          <span style={{ color: 'var(--text-dust)' }}>/</span>
          <span style={{ color: 'var(--text-vellum)' }}>
            Sacred Knowledge Ingestion &amp; RAG Studio
          </span>
        </div>

        {/* Hero Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              gap: '0.5rem',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <span
              className="badge"
              style={{ borderColor: 'var(--gold-sacred)', color: 'var(--gold-radiance)' }}
            >
              📜 Production RAG Engine
            </span>
            <span className="badge">Sacred Knowledge Ingestion &amp; Grounding</span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.5rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              marginBottom: '0.75rem',
            }}
            className="gold-gradient-text"
          >
            Sacred Knowledge Ingestion &amp; RAG Studio
          </h1>
          <p
            style={{
              maxWidth: '820px',
              margin: '0 auto',
              color: 'var(--text-dust)',
              fontSize: '1.05rem',
              lineHeight: '1.6',
            }}
          >
            Enterprise RAG pipeline for classical Vedic texts. Multi-format ingestion, deterministic
            semantic chunking, cosine vector embeddings, and zero-hallucination source attribution.
          </p>
        </div>

        {/* KPI Metrics Dashboard */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          <div
            className="temple-card"
            style={{
              padding: '1.25rem',
              textAlign: 'center',
              borderTop: '3px solid var(--gold-sacred)',
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-dust)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Indexed Documents
            </div>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--gold-radiance)',
                marginTop: '0.25rem',
              }}
            >
              {statsLoading ? '...' : (stats?.totalDocuments ?? 0)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>
              ✓ {stats?.indexedDocuments ?? 0} Active In Corpus
            </div>
          </div>

          <div
            className="temple-card"
            style={{ padding: '1.25rem', textAlign: 'center', borderTop: '3px solid #6366f1' }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-dust)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Semantic Chunks
            </div>
            <div
              style={{ fontSize: '2rem', fontWeight: 700, color: '#a5b4fc', marginTop: '0.25rem' }}
            >
              {statsLoading ? '...' : (stats?.totalChunks ?? 0)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dust)', marginTop: '0.25rem' }}>
              Overlapping Window (~600 chars)
            </div>
          </div>

          <div
            className="temple-card"
            style={{ padding: '1.25rem', textAlign: 'center', borderTop: '3px solid #14b8a6' }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-dust)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Corpus Tokens
            </div>
            <div
              style={{ fontSize: '2rem', fontWeight: 700, color: '#5eead4', marginTop: '0.25rem' }}
            >
              {statsLoading ? '...' : (stats?.totalTokens ?? 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dust)', marginTop: '0.25rem' }}>
              Normalized Vector Dimensions (384d)
            </div>
          </div>

          <div
            className="temple-card"
            style={{ padding: '1.25rem', textAlign: 'center', borderTop: '3px solid #f43f5e' }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-dust)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Wisdom Domains
            </div>
            <div
              style={{ fontSize: '2rem', fontWeight: 700, color: '#fda4af', marginTop: '0.25rem' }}
            >
              {statsLoading ? '...' : Object.keys(stats?.domainCounts ?? {}).length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dust)', marginTop: '0.25rem' }}>
              Gita, Ayurveda, Chanakya, Yoga
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
            marginBottom: '2rem',
          }}
        >
          <button
            onClick={() => setActiveTab('archive')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom:
                activeTab === 'archive' ? '3px solid var(--gold-sacred)' : '3px solid transparent',
              color: activeTab === 'archive' ? 'var(--gold-radiance)' : 'var(--text-dust)',
              padding: '0.75rem 1.5rem',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>📜</span> Corpus Archive ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('ingest')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom:
                activeTab === 'ingest' ? '3px solid var(--gold-sacred)' : '3px solid transparent',
              color: activeTab === 'ingest' ? 'var(--gold-radiance)' : 'var(--text-dust)',
              padding: '0.75rem 1.5rem',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>✍️</span> Ingestion Pipeline Studio
          </button>
          <button
            onClick={() => setActiveTab('playground')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom:
                activeTab === 'playground'
                  ? '3px solid var(--gold-sacred)'
                  : '3px solid transparent',
              color: activeTab === 'playground' ? 'var(--gold-radiance)' : 'var(--text-dust)',
              padding: '0.75rem 1.5rem',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>🔍</span> Grounded RAG Citation Playground
          </button>
        </div>

        {/* TAB 1: Corpus Archive */}
        {activeTab === 'archive' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.3rem',
                  color: 'var(--text-vellum)',
                  margin: 0,
                }}
              >
                Indexed Canonical &amp; Custom Documents
              </h2>
              <button
                onClick={() => {
                  fetchDocuments();
                  fetchStats();
                }}
                className="btn-outline-sacred"
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
              >
                ↻ Refresh Corpus
              </button>
            </div>

            {loadingDocs ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dust)' }}>
                Retrieving sacred documents from MongoDB...
              </div>
            ) : documents.length === 0 ? (
              <div className="temple-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-dust)', marginBottom: '1rem' }}>
                  No documents found in corpus.
                </p>
                <button
                  onClick={() => setActiveTab('ingest')}
                  className="btn-sacred"
                  style={{ padding: '0.6rem 1.25rem' }}
                >
                  Ingest First Text
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="temple-card"
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      borderLeft: '4px solid var(--gold-sacred)',
                    }}
                  >
                    <div style={{ flex: '1 1 300px' }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          alignItems: 'center',
                          marginBottom: '0.35rem',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: 'rgba(212, 175, 55, 0.15)',
                            color: 'var(--gold-radiance)',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                          }}
                        >
                          {doc.domain}
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background:
                              doc.status === 'indexed'
                                ? 'rgba(16, 185, 129, 0.2)'
                                : 'rgba(244, 63, 94, 0.2)',
                            color: doc.status === 'indexed' ? '#10b981' : '#f43f5e',
                            fontWeight: 600,
                          }}
                        >
                          ● {doc.status}
                        </span>
                        {doc.language && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dust)' }}>
                            [{doc.language.toUpperCase()}]
                          </span>
                        )}
                      </div>
                      <h3
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '1.15rem',
                          color: 'var(--text-vellum)',
                          margin: '0 0 0.25rem 0',
                        }}
                      >
                        {doc.title}
                      </h3>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-dust)',
                          display: 'flex',
                          gap: '1rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        {doc.author && <span>Author: {doc.author}</span>}
                        {doc.era && <span>Era: {doc.era}</span>}
                        <span>File: {doc.fileName}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: 'var(--gold-radiance)',
                          }}
                        >
                          {doc.chunkCount} chunks
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dust)' }}>
                          {doc.tokenCount.toLocaleString()} tokens
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleInspectChunks(doc.id)}
                          className="btn-outline-sacred"
                          style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                        >
                          🔍 Inspect Chunks
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(doc.id)}
                          style={{
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.3)',
                            color: '#fda4af',
                            borderRadius: '6px',
                            padding: '0.45rem 0.8rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Ingestion Pipeline Studio */}
        {activeTab === 'ingest' && (
          <div
            style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}
          >
            {/* Presets Sidebar */}
            <div className="temple-card" style={{ padding: '1.5rem' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.15rem',
                  color: 'var(--gold-radiance)',
                  marginBottom: '1rem',
                }}
              >
                Canonical Presets
              </h3>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-dust)',
                  marginBottom: '1.25rem',
                  lineHeight: '1.5',
                }}
              >
                Load pre-formatted ancient Sanskrit &amp; philosophical treatises into the ingestion
                studio:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {PRESET_TEMPLATES.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => loadPreset(preset)}
                    style={{
                      background: 'rgba(212, 175, 55, 0.08)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      color: 'var(--text-vellum)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      lineHeight: '1.4',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        color: 'var(--gold-radiance)',
                        marginBottom: '0.2rem',
                      }}
                    >
                      {preset.name}
                    </div>
                    <div style={{ color: 'var(--text-dust)', fontSize: '0.75rem' }}>
                      {preset.domain.toUpperCase()} • {preset.author}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ingestion Form */}
            <div className="temple-card" style={{ padding: '2rem' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.4rem',
                  color: 'var(--text-vellum)',
                  marginBottom: '1.25rem',
                }}
              >
                Stage &amp; Ingest Document
              </h2>

              <form
                onSubmit={handleIngest}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: 'var(--text-dust)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Bhagavad Gita Chapter 2 Analysis"
                    className="temple-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: 'var(--text-dust)',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Wisdom Domain *
                    </label>
                    <select
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="temple-input"
                      style={{ width: '100%' }}
                    >
                      <option value="gita">Bhagavad Gita</option>
                      <option value="chanakya">Chanakya Neeti</option>
                      <option value="ayurveda">Ayurveda</option>
                      <option value="yoga">Yoga Sutras</option>
                      <option value="vedanta">Advaita Vedanta</option>
                      <option value="general">General Philosophical</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: 'var(--text-dust)',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Sage / Author
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Maharishi Veda Vyasa"
                      className="temple-input"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: 'var(--text-dust)',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Historical Era
                    </label>
                    <input
                      type="text"
                      value={era}
                      onChange={(e) => setEra(e.target.value)}
                      placeholder="e.g. c. 500 BCE"
                      className="temple-input"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-dust)' }}>
                      Sacred Text Content (Include verse tags like [BG 2.47] for automatic citation
                      indexing) *
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gold-radiance)' }}>
                      ~{Math.ceil(content.length / 4)} est. tokens ({content.length} chars)
                    </span>
                  </div>
                  <textarea
                    required
                    rows={10}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter or paste sacred text content, treatises, commentaries, or verses..."
                    className="temple-input"
                    style={{
                      width: '100%',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                    }}
                  />
                </div>

                {ingestStatusMessage && (
                  <div
                    style={{
                      padding: '0.85rem',
                      borderRadius: '6px',
                      background: ingestSuccess
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(212, 175, 55, 0.15)',
                      border: ingestSuccess
                        ? '1px solid rgba(16, 185, 129, 0.3)'
                        : '1px solid rgba(212, 175, 55, 0.3)',
                      color: ingestSuccess ? '#10b981' : 'var(--gold-radiance)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {ingestStatusMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={ingesting || !title.trim() || !content.trim()}
                  className="btn-sacred"
                  style={{
                    padding: '0.85rem 1.5rem',
                    fontSize: '1rem',
                    cursor: ingesting ? 'not-allowed' : 'pointer',
                    opacity: ingesting ? 0.6 : 1,
                  }}
                >
                  {ingesting
                    ? 'Processing Ingestion Pipeline...'
                    : '🚀 Ingest, Chunk & Index Document'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: Grounded RAG Citation Playground */}
        {activeTab === 'playground' && (
          <div
            style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}
          >
            {/* Query Options Sidebar */}
            <div className="temple-card" style={{ padding: '1.5rem', height: 'fit-content' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.15rem',
                  color: 'var(--gold-radiance)',
                  marginBottom: '1rem',
                }}
              >
                Retrieval Parameters
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: 'var(--text-dust)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Domain Filter
                  </label>
                  <select
                    value={domainFilter}
                    onChange={(e) => setDomainFilter(e.target.value)}
                    className="temple-input"
                    style={{ width: '100%' }}
                  >
                    <option value="">All Domains (Global Search)</option>
                    <option value="gita">Bhagavad Gita</option>
                    <option value="chanakya">Chanakya Neeti</option>
                    <option value="ayurveda">Ayurveda</option>
                    <option value="yoga">Yoga Sutras</option>
                    <option value="vedanta">Advaita Vedanta</option>
                  </select>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-dust)' }}>
                      Top K Chunks
                    </label>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--gold-radiance)',
                        fontWeight: 600,
                      }}
                    >
                      {topK}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--gold-sacred)' }}
                  />
                </div>

                <div
                  style={{ borderTop: '1px solid rgba(212, 175, 55, 0.15)', paddingTop: '1rem' }}
                >
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text-vellum)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Sample Queries:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      'What is Nishkama Karma according to Krishna?',
                      'How is life (Ayu) defined in Charaka Samhita?',
                      'What does Chanakya say about knowledge without practice?',
                      'What are the limbs of Yoga that still mental fluctuations?',
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setRagQuery(q);
                        }}
                        style={{
                          background: 'rgba(212, 175, 55, 0.05)',
                          border: '1px solid rgba(212, 175, 55, 0.2)',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          color: 'var(--text-vellum)',
                          fontSize: '0.78rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Query Playground */}
            <div>
              <div className="temple-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                <form onSubmit={handleRAGQuery}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      color: 'var(--gold-radiance)',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                    }}
                  >
                    Ask a Philosophical or Classical Inquiry
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      type="text"
                      required
                      value={ragQuery}
                      onChange={(e) => setRagQuery(e.target.value)}
                      placeholder="e.g. Explain the duty without attachment to results in the Gita"
                      className="temple-input"
                      style={{ flex: 1, fontSize: '1rem', padding: '0.75rem 1rem' }}
                    />
                    <button
                      type="submit"
                      disabled={ragLoading || !ragQuery.trim()}
                      className="btn-sacred"
                      style={{ padding: '0.75rem 1.5rem', fontWeight: 600, whiteSpace: 'nowrap' }}
                    >
                      {ragLoading ? 'Searching...' : '⚡ Retrieve Citations'}
                    </button>
                  </div>
                </form>
              </div>

              {/* RAG Results View */}
              {ragResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Citations List */}
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.25rem',
                        color: 'var(--text-vellum)',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span>🎯</span> Retrieved Grounded Citations ({ragResult.citations.length})
                    </h3>

                    {ragResult.citations.length === 0 ? (
                      <div
                        className="temple-card"
                        style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dust)' }}
                      >
                        No direct matching citations found for this query.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {ragResult.citations.map((c, i) => (
                          <div
                            key={i}
                            className="temple-card"
                            style={{
                              padding: '1.25rem 1.5rem',
                              borderLeft: '4px solid #10b981',
                              background: 'rgba(13, 11, 8, 0.75)',
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
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span
                                  style={{
                                    fontWeight: 700,
                                    color: 'var(--gold-radiance)',
                                    fontSize: '0.95rem',
                                  }}
                                >
                                  Source {i + 1}: {c.documentTitle}
                                </span>
                                {c.canonicalReference && (
                                  <span
                                    style={{
                                      fontSize: '0.75rem',
                                      padding: '0.15rem 0.5rem',
                                      borderRadius: '4px',
                                      background: 'rgba(212, 175, 55, 0.15)',
                                      color: 'var(--gold-radiance)',
                                      fontWeight: 600,
                                    }}
                                  >
                                    Ref: {c.canonicalReference}
                                  </span>
                                )}
                              </div>
                              <span
                                style={{
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  color: '#10b981',
                                  background: 'rgba(16, 185, 129, 0.15)',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '4px',
                                }}
                              >
                                {Math.round(c.similarityScore * 100)}% Match
                              </span>
                            </div>

                            <p
                              style={{
                                margin: 0,
                                fontSize: '0.95rem',
                                color: 'var(--text-vellum)',
                                lineHeight: '1.6',
                                background: 'rgba(0,0,0,0.3)',
                                padding: '0.85rem',
                                borderRadius: '6px',
                              }}
                            >
                              &ldquo;{c.snippet}&rdquo;
                            </p>

                            {c.author && (
                              <div
                                style={{
                                  marginTop: '0.5rem',
                                  fontSize: '0.8rem',
                                  color: 'var(--text-dust)',
                                }}
                              >
                                Preceptor: {c.author} • Chunk Index #{c.chunkIndex}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Synthesized Provenance Prompt Preview */}
                  <div
                    className="temple-card"
                    style={{ padding: '1.5rem', borderTop: '3px solid var(--gold-sacred)' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <h4
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '1.05rem',
                          color: 'var(--gold-radiance)',
                          margin: 0,
                        }}
                      >
                        Synthesized Grounded Context (Prompt Payload)
                      </h4>
                      <span className="badge">Verified Provenance</span>
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: '1rem',
                        borderRadius: '6px',
                        background: 'rgba(0, 0, 0, 0.5)',
                        color: 'var(--text-dust)',
                        fontSize: '0.82rem',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.5',
                        border: '1px solid rgba(212, 175, 55, 0.15)',
                      }}
                    >
                      {ragResult.synthesizedContext}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chunk Inspection Drawer */}
        {inspectingDoc && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '560px',
              background: 'var(--surface-sanctum)',
              borderLeft: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.8)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              padding: '2rem',
              overflowY: 'auto',
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
              <div>
                <span className="badge" style={{ color: 'var(--gold-radiance)' }}>
                  {inspectingDoc.document.domain.toUpperCase()}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.3rem',
                    color: 'var(--text-vellum)',
                    margin: '0.35rem 0 0 0',
                  }}
                >
                  {inspectingDoc.document.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectingDoc(null)}
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

            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-dust)',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <span>Total Chunks: {inspectingDoc.chunks.length}</span>
              <span>Tokens: {inspectingDoc.document.tokenCount}</span>
              <span>Status: {inspectingDoc.document.status}</span>
            </div>

            <h4
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1rem',
                color: 'var(--gold-radiance)',
                marginBottom: '0.75rem',
              }}
            >
              Extracted Semantic Chunks
            </h4>

            {inspectLoading ? (
              <div style={{ color: 'var(--text-dust)' }}>Loading chunks...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {inspectingDoc.chunks.map((chunk) => (
                  <div
                    key={chunk.id}
                    style={{
                      background: 'rgba(13, 11, 8, 0.8)',
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                      borderRadius: '8px',
                      padding: '1rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                        fontSize: '0.75rem',
                      }}
                    >
                      <span style={{ color: 'var(--gold-radiance)', fontWeight: 600 }}>
                        Chunk #{chunk.chunkIndex}
                      </span>
                      {chunk.canonicalReference && (
                        <span style={{ color: '#10b981', fontWeight: 600 }}>
                          Ref: {chunk.canonicalReference}
                        </span>
                      )}
                      <span style={{ color: 'var(--text-dust)' }}>{chunk.tokenCount} tokens</span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        color: 'var(--text-vellum)',
                        lineHeight: '1.6',
                      }}
                    >
                      {chunk.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
