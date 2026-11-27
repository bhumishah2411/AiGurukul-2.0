'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import {
  ConversationDTO,
  MessageCitation,
  MessageDTO,
  PersonaInfo,
  WisdomPersona,
} from '@ai-gurukul/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const DEFAULT_PERSONAS: PersonaInfo[] = [
  {
    id: 'krishna',
    name: 'Lord Krishna',
    title: 'Supreme Guide & Charioteer of Dharma',
    domain: 'Bhagavad Gita & Karma Yoga',
    color: '#7B68EE',
    avatarIcon: '🪷',
    description:
      'Provides compassionate, balanced counsel rooted in duty (Svadharma), selfless action (Nishkama Karma), and inner reflection.',
    philosophicalCore:
      'Nishkama Karma (dedicated action without anxious clinging to results), emotional equanimity (Sthitaprajna), and self-mastery.',
    sampleInquiries: [
      'How do I handle fear and anxiety over the outcome of my work?',
      'How do I make difficult choices when personal emotions cloud my duty?',
      'What is true equanimity in the face of praise and blame?',
    ],
  },
  {
    id: 'chanakya',
    name: 'Chanakya Pandit',
    title: 'Master Strategist & Prime Minister',
    domain: 'Arthashastra & Neeti Shastra',
    color: '#C46B3A',
    avatarIcon: '📜',
    description:
      'Delivers direct, strategic, analytical, and practical counsel on leadership, ethics, resource allocation, and real-world strategy.',
    philosophicalCore:
      'Vinaya (disciplined governance), foresight, psychological realism, accountability, and effective statecraft.',
    sampleInquiries: [
      'How do I maintain authority and trust among a competitive team?',
      'How should I navigate deceit or broken trust in professional alliances?',
      'What are the foundational principles of sustainable strategic planning?',
    ],
  },
  {
    id: 'vaidya',
    name: 'Vaidya Charaka',
    title: 'Holistic Physician & Ayurvedic Sage',
    domain: 'Ayurveda & Doshic Wellness',
    color: '#3A9B8C',
    avatarIcon: '🌿',
    description:
      'Offers educational wellness guidance on psycho-physical balance, seasonal attunement, digestive fire (Agni), and holistic living.',
    philosophicalCore:
      'Tridosha harmony (Vata, Pitta, Kapha), Dinacharya (daily rituals), Ritucharya (seasonal adaptation), and Agni balance.',
    sampleInquiries: [
      'How can I balance elevated stress and mental agitation according to Ayurveda?',
      'What daily morning practices support optimal digestive Agni and vitality?',
      'How should I adjust my routine and diet during seasonal transitions?',
    ],
  },
  {
    id: 'vyasa',
    name: 'Sage Vyasa',
    title: 'Chronicler of Epics & Cosmic Observer',
    domain: 'Mahabharata & Puranic Wisdom',
    color: '#B8860B',
    avatarIcon: '📖',
    description:
      'Explores the multi-layered complexity of human destiny, moral dilemmas in grey areas, and the unfolding cycles of time.',
    philosophicalCore:
      'Dharma in ambiguity, the law of cause and effect across generations, and profound narrative introspection.',
    sampleInquiries: [
      'Why do virtuous individuals encounter unjust suffering in life?',
      'How does one navigate loyalty to family versus adherence to truth?',
      'What does epic narrative teach us about navigating moral grey areas?',
    ],
  },
  {
    id: 'patanjali',
    name: 'Sage Patanjali',
    title: 'Author of the Yoga Sutras',
    domain: 'Ashtanga Yoga & Mental Mastery',
    color: '#4682B4',
    avatarIcon: '🧘',
    description:
      'Directs the seeker toward profound stilling of the mind, mental discipline, and discriminative discernment.',
    philosophicalCore:
      'Citta-Vritti-Nirodha (stilling mental fluctuations), Abhyasa & Vairagya (practice and dispassion), and eight-limbed yoga.',
    sampleInquiries: [
      'How can I train the wandering mind to remain anchored in singular focus?',
      'What is the practical difference between thought suppression and serene detachment?',
      'How do the Yamas and Niyamas establish psychological peace?',
    ],
  },
];

/**
 * Safely renders markdown-like text segments (paragraphs, bold, italic, list items)
 * as pure React elements without dangerouslySetInnerHTML.
 */
function renderSafeMarkdown(text: string, keyPrefix: string): React.ReactNode {
  const paragraphs = text.split(/\n\n+/);
  return (
    <div key={keyPrefix} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n').filter((l) => l.trim().length > 0);
        const isList = lines.every((l) => /^[-*•]\s+/.test(l.trim()));

        if (isList) {
          return (
            <ul
              key={`${keyPrefix}-p-${pIdx}`}
              style={{ margin: '0.25rem 0', paddingLeft: '1.25rem', listStyleType: 'disc' }}
            >
              {lines.map((line, lIdx) => (
                <li key={`${keyPrefix}-li-${lIdx}`} style={{ marginBottom: '0.2rem' }}>
                  {formatInlineText(line.replace(/^[-*•]\s+/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`${keyPrefix}-p-${pIdx}`} style={{ margin: 0 }}>
            {lines.map((line, lIdx) => (
              <span key={`${keyPrefix}-l-${lIdx}`}>
                {lIdx > 0 && <br />}
                {formatInlineText(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Parses bold (**text**) and italic (*text*) into safe React elements
 */
function formatInlineText(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|\*[^*]+?\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.substring(lastIndex, match.index));
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
      tokens.push(
        <strong key={`b-${lastIndex}`} style={{ color: 'var(--gold-radiance, #ffd700)' }}>
          {matchedStr.slice(2, -2)}
        </strong>
      );
    } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
      tokens.push(
        <em key={`i-${lastIndex}`} style={{ opacity: 0.9 }}>
          {matchedStr.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.substring(lastIndex));
  }

  return tokens.length > 0 ? tokens : [text];
}

interface SafeMessageContentProps {
  content: string;
  citations?: MessageCitation[];
  onCitationClick?: (citation: MessageCitation) => void;
  isStreaming?: boolean;
}

function SafeMessageContent({
  content,
  citations = [],
  onCitationClick,
  isStreaming = false,
}: SafeMessageContentProps) {
  // If streaming and there is an unclosed <cite tag at the very end, trim it from display
  let cleanContent = content;
  if (isStreaming) {
    cleanContent = cleanContent.replace(/<cite[^>]*$/i, '');
  }

  // Parse text for <cite canonicalRef="...">...</cite> blocks
  const segments: Array<{ type: 'text' | 'cite'; text: string; ref?: string }> = [];
  const citeRegex = /<cite\s+canonicalRef="([^"]*)">(.*?)<\/cite>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = citeRegex.exec(cleanContent)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        text: cleanContent.substring(lastIndex, match.index),
      });
    }
    segments.push({
      type: 'cite',
      ref: match[1],
      text: match[2] || match[1],
    });
    lastIndex = citeRegex.lastIndex;
  }

  if (lastIndex < cleanContent.length) {
    segments.push({
      type: 'text',
      text: cleanContent.substring(lastIndex),
    });
  }

  return (
    <div style={{ lineHeight: 1.6, wordBreak: 'break-word' }}>
      {segments.map((seg, idx) => {
        if (seg.type === 'cite') {
          const matchedCitation = citations.find(
            (c) => c.canonicalReference.toLowerCase() === (seg.ref || '').toLowerCase()
          ) || {
            canonicalReference: seg.ref || seg.text,
            chunkText: seg.text,
            domain: 'gita' as const,
          };

          return (
            <button
              key={`cite-${idx}`}
              type="button"
              suppressHydrationWarning
              onClick={() => onCitationClick && onCitationClick(matchedCitation)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                margin: '0 0.25rem',
                padding: '0.15rem 0.45rem',
                background: 'rgba(212, 175, 55, 0.18)',
                border: '1px solid var(--gold-antique, #d4af37)',
                borderRadius: '4px',
                color: 'var(--gold-radiance, #ffd700)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                verticalAlign: 'baseline',
                transition: 'all 0.15s ease',
              }}
              title={`View source passage for ${seg.ref || seg.text}`}
            >
              📜 {seg.text}
            </button>
          );
        }

        return renderSafeMarkdown(seg.text, `txt-${idx}`);
      })}
    </div>
  );
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window === 'undefined') return headers;

  let token = localStorage.getItem('aigurukul_access_token');
  if (!token) {
    try {
      const guestEmail = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}@aigurukul.local`;
      const regRes = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: guestEmail,
          password: 'SacredSeekerPassword123!',
          displayName: 'Seeker',
          preferredPersona: 'krishna',
        }),
      });
      const regJson = await regRes.json();
      if (regJson.success && regJson.data?.tokens?.accessToken) {
        token = regJson.data.tokens.accessToken;
        localStorage.setItem('aigurukul_access_token', token!);
        if (regJson.data.user) {
          localStorage.setItem('aigurukul_user', JSON.stringify(regJson.data.user));
        }
      }
    } catch {
      // Degraded
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export default function WisdomChatPage() {
  const { user, loading: authLoading } = useAuth();

  const [personas, setPersonas] = useState<PersonaInfo[]>(DEFAULT_PERSONAS);
  const [selectedPersona, setSelectedPersona] = useState<WisdomPersona>('krishna');
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);

  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState('');
  const [activeCitations, setActiveCitations] = useState<MessageCitation[]>([]);
  const [inspectedCitation, setInspectedCitation] = useState<MessageCitation | null>(null);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // Always scroll window to the top when navigating to the Wisdom page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Only scroll the internal chat container when messages are present or streaming
  const scrollToBottom = (smooth = true) => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    if (messages.length > 0 || streamBuffer) {
      scrollToBottom(true);
    }
  }, [messages, streamBuffer]);

  // Load available personas from API if available
  useEffect(() => {
    async function loadPersonas() {
      try {
        const res = await fetch(`${API_BASE}/wisdom/personas`);
        const json = await res.json();
        if (json.success && json.data?.personas && json.data.personas.length > 0) {
          setPersonas(json.data.personas);
        }
      } catch (err) {
        // Fall back gracefully to DEFAULT_PERSONAS
      }
    }
    loadPersonas();
  }, []);

  // Load conversations from backend (only when authenticated)
  const loadConversations = async () => {
    if (!user) return;
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/wisdom/conversations`, {
        headers: authHeaders,
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 401) return;
        return;
      }
      const json = await res.json();
      if (json.success && json.data?.items) {
        setConversations(json.data.items);
        if (json.data.items.length > 0 && !activeConversationId) {
          loadConversationThread(json.data.items[0].id);
        }
      }
    } catch {
      // Graceful fallback
    }
  };

  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Load specific conversation thread from backend
  const loadConversationThread = async (convId: string) => {
    setActiveConversationId(convId);
    setStreamBuffer('');
    setMobileHistoryOpen(false);
    if (!user) return;
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/wisdom/conversations/${convId}`, {
        headers: authHeaders,
        credentials: 'include',
      });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data) {
        setMessages(json.data.messages || []);
        if (json.data.persona) {
          setSelectedPersona(json.data.persona);
        }
      }
    } catch {
      // Graceful fallback
    }
  };

  // Start new conversation thread cleanly
  const startNewDialogue = (persona: WisdomPersona, initialPrompt?: string) => {
    setSelectedPersona(persona);
    setActiveConversationId(null);
    setMessages([]);
    setStreamBuffer('');
    setActiveCitations([]);
    setMobileHistoryOpen(false);

    if (initialPrompt) {
      handleSendMessage(undefined, initialPrompt, persona);
    }
  };

  // Send message via real backend SSE streaming with RAG knowledge grounding
  const handleSendMessage = async (
    e?: React.FormEvent,
    customQuery?: string,
    overridePersona?: WisdomPersona
  ) => {
    if (e) e.preventDefault();
    const query = (customQuery || inputText).trim();
    if (!query || isStreaming) return;

    const persona = overridePersona || selectedPersona;
    setInputText('');

    // Append user message locally for immediate feedback
    const tempUserMsg: MessageDTO = {
      id: 'temp-' + Date.now(),
      conversationId: activeConversationId || 'pending',
      sender: 'user',
      content: query,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    // Prepare streaming state
    setIsStreaming(true);
    setStreamBuffer('');
    setActiveCitations([]);

    try {
      const authHeaders = await getAuthHeaders();
      let serverConvId = activeConversationId;

      // 1. Initialize server conversation thread if not already active
      if (!serverConvId) {
        const initRes = await fetch(`${API_BASE}/wisdom/conversations`, {
          method: 'POST',
          headers: authHeaders,
          credentials: 'include',
          body: JSON.stringify({
            persona,
            title: query.slice(0, 35) + '...',
          }),
        });
        const initJson = await initRes.json();
        if (initJson.success && initJson.data) {
          serverConvId = initJson.data.id;
          setActiveConversationId(serverConvId);
          setConversations((prev) => [initJson.data, ...prev]);
        } else {
          throw new Error(initJson.error?.message || 'Failed to initialize conversation');
        }
      }

      // 2. Stream AI completion and citations via Server-Sent Events
      const response = await fetch(`${API_BASE}/wisdom/conversations/${serverConvId}/stream`, {
        method: 'POST',
        headers: authHeaders,
        credentials: 'include',
        body: JSON.stringify({ content: query }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Streaming failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedText = '';
      const collectedCitations: MessageCitation[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const rawEvent of events) {
          if (!rawEvent.trim()) continue;

          const lines = rawEvent.split('\n');
          let eventType = 'message';
          let dataStr = '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.replace('event:', '').trim();
            } else if (line.startsWith('data:')) {
              dataStr = line.replace('data:', '').trim();
            }
          }

          if (!dataStr) continue;

          try {
            const parsed = JSON.parse(dataStr);
            if (eventType === 'token' && parsed.token) {
              accumulatedText += parsed.token;
              setStreamBuffer(accumulatedText);
            } else if (eventType === 'citation' && parsed.citation) {
              collectedCitations.push(parsed.citation);
              setActiveCitations([...collectedCitations]);
            } else if (eventType === 'done') {
              const assistantMsg: MessageDTO = {
                id: parsed.messageId || 'final-' + Date.now(),
                conversationId: serverConvId!,
                sender: 'assistant',
                content: parsed.fullContent || accumulatedText,
                citations: parsed.citations || collectedCitations,
                createdAt: new Date().toISOString(),
              };
              setMessages((prev) => [...prev, assistantMsg]);
              setStreamBuffer('');
              setIsStreaming(false);
              return;
            }
          } catch {
            // Ignore non-JSON heartbeat
          }
        }
      }

      // If stream ended without an explicit done event, finalize accumulated content
      if (accumulatedText) {
        const assistantMsg: MessageDTO = {
          id: 'final-' + Date.now(),
          conversationId: serverConvId!,
          sender: 'assistant',
          content: accumulatedText,
          citations: collectedCitations,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
      setStreamBuffer('');
      setIsStreaming(false);
    } catch (err: unknown) {
      console.error('Wisdom streaming error:', err);
      const errorMsg: MessageDTO = {
        id: 'error-' + Date.now(),
        conversationId: activeConversationId || 'local',
        sender: 'assistant',
        content:
          'Unable to establish a connection with the ancient wisdom service. Please verify that the API server is active on port 5000.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setStreamBuffer('');
      setIsStreaming(false);
    }
  };

  const currentPersonaInfo = personas.find((p) => p.id === selectedPersona) || personas[0];

  return (
    <div
      className="temple-container wisdom-page-container"
      suppressHydrationWarning
      style={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '1350px',
      }}
    >
      {/* Subpage Breadcrumb Bar */}
      <div className="wisdom-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', minWidth: 0 }}>
          <Link
            href="/"
            style={{
              color: 'var(--text-dust)',
              fontSize: '0.85rem',
              textDecoration: 'none',
              transition: 'color 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            ← Sanctum
          </Link>
          <span style={{ color: 'rgba(212, 175, 55, 0.3)' }}>/</span>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              margin: 0,
              display: 'inline-block',
            }}
            className="gold-gradient-text wisdom-header-title"
          >
            Vedic Wisdom Dialogue
          </h1>
          <span
            className="badge"
            style={{
              borderColor: 'rgba(123, 104, 238, 0.4)',
              color: '#c4b5fd',
              fontSize: '0.68rem',
              marginLeft: '0.2rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              lineHeight: 1.2,
            }}
          >
            Live SSE Stream
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flexShrink: 0 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-dust)', whiteSpace: 'nowrap' }}>
                Seeker: <strong style={{ color: 'var(--gold-radiance)' }}>{user.displayName}</strong>
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link
                href="/login"
                className="btn-outline-sacred"
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
              >
                Sign In to Save History
              </Link>
            </div>
          )}

          <button
            type="button"
            className="wisdom-mobile-history-toggle"
            suppressHydrationWarning
            onClick={() => setMobileHistoryOpen(!mobileHistoryOpen)}
            style={{
              background: mobileHistoryOpen ? 'rgba(212, 175, 55, 0.25)' : 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              color: 'var(--gold-radiance)',
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              alignItems: 'center',
              gap: '0.3rem',
              whiteSpace: 'nowrap',
            }}
          >
            📜 History {conversations.length > 0 && `(${conversations.length})`}
          </button>
        </div>
      </div>

      {/* Mobile-Only Horizontally Scrollable Persona Selector (< 1024px) */}
      <div
        className="wisdom-mobile-persona-bar"
        style={{
          gap: '0.45rem',
          overflowX: 'auto',
          padding: '0.45rem 0.15rem',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          flexShrink: 0,
        }}
      >
        {personas.map((p) => {
          const isSelected = selectedPersona === p.id;
          return (
            <button
              key={`mob-${p.id}`}
              type="button"
              suppressHydrationWarning
              onClick={() => startNewDialogue(p.id)}
              className="wisdom-persona-tab"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.7rem',
                borderRadius: '20px',
                border: isSelected
                  ? `1.5px solid ${p.color}`
                  : '1px solid rgba(212, 175, 55, 0.2)',
                background: isSelected
                  ? `linear-gradient(135deg, ${p.color}28 0%, rgba(13, 11, 8, 0.95) 100%)`
                  : 'rgba(255, 255, 255, 0.03)',
                color: isSelected ? 'var(--text-vellum)' : 'var(--text-dust)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                fontSize: 'clamp(0.78rem, 2vw, 0.84rem)',
                fontWeight: isSelected ? 700 : 500,
                boxShadow: isSelected ? `0 2px 10px ${p.color}35` : 'none',
                transition: 'all 0.18s ease',
              }}
              title={`${p.name} - ${p.domain}`}
            >
              <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>{p.avatarIcon}</span>
              <span style={{ color: isSelected ? p.color : 'inherit' }}>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Dialogue History Collapsible Panel (< 1024px) */}
      {mobileHistoryOpen && (
        <div
          className="wisdom-mobile-history-panel"
          style={{
            background: 'var(--surface-wood)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '8px',
            padding: '0.85rem',
            marginBottom: '0.5rem',
            maxHeight: '220px',
            overflowY: 'auto',
            flexShrink: 0,
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.6rem',
              paddingBottom: '0.35rem',
              borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--gold-radiance)',
              }}
            >
              📜 Past Inquiries
            </span>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setMobileHistoryOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dust)',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              ✕ Close
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {conversations.length === 0 ? (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dust)', fontStyle: 'italic', padding: '0.4rem 0' }}>
                No previous inquiries. Start a new dialogue above.
              </div>
            ) : (
              conversations.map((c) => {
                const pMeta = personas.find((p) => p.id === c.persona);
                const isCurrent = activeConversationId === c.id;
                return (
                  <button
                    key={`mob-hist-${c.id}`}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => {
                      loadConversationThread(c.id);
                      setMobileHistoryOpen(false);
                    }}
                    style={{
                      padding: '0.5rem 0.65rem',
                      borderRadius: '6px',
                      background: isCurrent
                        ? 'rgba(212, 175, 55, 0.16)'
                        : 'rgba(13, 11, 8, 0.5)',
                      border: isCurrent
                        ? '1px solid var(--gold-sacred)'
                        : '1px solid rgba(212, 175, 55, 0.12)',
                      color: 'var(--text-vellum)',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>
                      {pMeta?.avatarIcon || '☸'}
                    </span>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ fontWeight: 600, color: pMeta?.color || 'var(--gold-sacred)', marginRight: '0.35rem' }}>
                        {pMeta?.name?.split(' ')[0] || 'Sage'}:
                      </span>
                      <span style={{ color: isCurrent ? '#fff' : 'var(--text-vellum)' }}>{c.title}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Main Chat Workspace */}
      <div
        className="wisdom-workspace"
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '1.5rem',
          flex: 1,
          marginTop: '1rem',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Left Sidebar: Personas & Thread History */}
        <aside
          className="temple-card wisdom-desktop-sidebar"
          style={{
            flexDirection: 'column',
            gap: '1.25rem',
            padding: '1.25rem',
            overflowY: 'auto',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--gold-radiance)',
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>☸</span>
              <span>Select Wisdom Persona</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {personas.map((p) => {
                const isSelected = selectedPersona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => startNewDialogue(p.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.7rem 0.85rem',
                      borderRadius: '8px',
                      border: isSelected
                        ? `2px solid ${p.color}`
                        : '1px solid rgba(212, 175, 55, 0.15)',
                      background: isSelected
                        ? `linear-gradient(135deg, ${p.color}22 0%, rgba(13, 11, 8, 0.85) 100%)`
                        : 'rgba(255, 255, 255, 0.02)',
                      color: isSelected ? 'var(--text-vellum)' : 'var(--text-dust)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: isSelected ? `0 4px 16px ${p.color}25` : 'none',
                      transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        background: isSelected ? `${p.color}25` : 'rgba(212, 175, 55, 0.08)',
                        border: `1px solid ${isSelected ? p.color : 'rgba(212, 175, 55, 0.2)'}`,
                        flexShrink: 0,
                      }}
                    >
                      {p.avatarIcon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: isSelected ? p.color : 'var(--text-vellum)' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-dust)' }}>
                        {p.domain.split('&')[0]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(212, 175, 55, 0.1)' }} />

          {/* Previous Dialogues */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--gold-radiance)',
                marginBottom: '0.75rem',
              }}
            >
              Dialogue History
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', overflowY: 'auto' }}
            >
              {conversations.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dust)', fontStyle: 'italic' }}>
                  No previous inquiries. Start a new dialogue above.
                </div>
              ) : (
                conversations.map((c) => {
                  const pMeta = personas.find((p) => p.id === c.persona);
                  const isCurrent = activeConversationId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      suppressHydrationWarning
                      onClick={() => loadConversationThread(c.id)}
                      style={{
                        padding: '0.6rem 0.75rem',
                        borderRadius: '6px',
                        background: isCurrent
                          ? 'rgba(212, 175, 55, 0.16)'
                          : 'rgba(13, 11, 8, 0.4)',
                        border: isCurrent
                          ? '1px solid var(--gold-sacred)'
                          : '1px solid rgba(212, 175, 55, 0.12)',
                        color: 'var(--text-vellum)',
                        fontSize: '0.82rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        transition: 'all 0.15s ease',
                      }}
                      title={`${pMeta?.name || 'Sage'}: ${c.title}`}
                    >
                      <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>
                        {pMeta?.avatarIcon || '☸'}
                      </span>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <span style={{ fontWeight: 600, color: pMeta?.color || 'var(--gold-sacred)', marginRight: '0.35rem' }}>
                          {pMeta?.name?.split(' ')[0] || 'Sage'}:
                        </span>
                        <span style={{ color: isCurrent ? '#fff' : 'var(--text-vellum)' }}>{c.title}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* Right Main Column: Chat Thread & Input */}
        <main className="wisdom-chat-main">
          {/* Active Persona Banner */}
          {currentPersonaInfo && (
            <div
              className="wisdom-active-banner"
              style={{
                padding: '0.85rem 1.25rem',
                background: 'var(--surface-wood)',
                borderBottom: `2px solid ${currentPersonaInfo.color}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.5rem',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                <span className="wisdom-banner-avatar" style={{ fontSize: '1.4rem', flexShrink: 0, lineHeight: 1 }}>
                  {currentPersonaInfo.avatarIcon}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h2
                    className="wisdom-persona-name"
                    style={{
                      fontSize: 'clamp(0.88rem, 2.6vw, 1.05rem)',
                      margin: 0,
                      color: currentPersonaInfo.color,
                      lineHeight: 1.25,
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 700,
                    }}
                  >
                    {currentPersonaInfo.name}
                  </h2>
                  <div
                    className="wisdom-persona-subtitle"
                    style={{
                      fontSize: 'clamp(0.68rem, 2vw, 0.76rem)',
                      color: 'var(--text-dust)',
                      lineHeight: 1.3,
                      marginTop: '0.15rem',
                    }}
                  >
                    {currentPersonaInfo.title} • {currentPersonaInfo.domain}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, alignItems: 'center' }}>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => startNewDialogue(selectedPersona)}
                  className="btn-outline-sacred wisdom-new-inquiry-btn"
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: 'clamp(0.74rem, 2.2vw, 0.8rem)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  + New Inquiry
                </button>
              </div>
            </div>
          )}

          {/* Message Thread Scroll Container */}
          <div
            ref={chatScrollContainerRef}
            className="wisdom-chat-thread"
            style={{
              flex: 1,
              padding: '1.25rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              minHeight: 0,
            }}
          >
            {messages.length === 0 && !streamBuffer && (
              <div style={{ textAlign: 'center', margin: 'auto', maxWidth: '580px', width: '100%' }}>
                <div
                  className="wisdom-consult-avatar"
                  style={{
                    fontSize: 'clamp(2rem, 4.5vw, 2.35rem)',
                    marginBottom: '0.35rem',
                    lineHeight: 1,
                  }}
                >
                  {currentPersonaInfo?.avatarIcon || '🕉️'}
                </div>
                <h3
                  className="wisdom-consult-title"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(1.15rem, 2.8vw, 1.32rem)',
                    color: 'var(--gold-radiance)',
                    marginBottom: '0.45rem',
                    fontWeight: 700,
                  }}
                >
                  Consult {currentPersonaInfo?.name}
                </h3>
                <p
                  className="wisdom-consult-desc"
                  style={{
                    color: 'var(--text-dust)',
                    fontSize: 'clamp(0.85rem, 2vw, 0.92rem)',
                    marginBottom: '1.15rem',
                    lineHeight: 1.55,
                    maxWidth: '520px',
                    margin: '0 auto 1.15rem auto',
                  }}
                >
                  {currentPersonaInfo?.description}
                </p>

                <div style={{ textAlign: 'left', marginBottom: '0.65rem' }}>
                  <span
                    className="wisdom-suggested-label"
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: 'var(--gold-radiance)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Suggested Questions:
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                  {currentPersonaInfo?.sampleInquiries.map((inq) => (
                    <button
                      key={inq}
                      type="button"
                      suppressHydrationWarning
                      onClick={() => handleSendMessage(undefined, inq)}
                      className="wisdom-suggested-btn"
                      style={{
                        padding: '0.55rem 0.85rem',
                        background: 'rgba(13, 11, 8, 0.6)',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        borderRadius: '6px',
                        color: 'var(--text-vellum)',
                        fontSize: 'clamp(0.82rem, 1.9vw, 0.88rem)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        width: '100%',
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                        lineHeight: 1.45,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = 'var(--gold-radiance)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)')
                      }
                    >
                      💡 {inq}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Render Stored Messages */}
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className="wisdom-msg-bubble"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    minWidth: 0,
                  }}
                >
                  <div
                    className="wisdom-msg-sender"
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-dust)',
                      marginBottom: '0.25rem',
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {isUser ? 'Seeker' : currentPersonaInfo?.name || 'Guide'}
                  </div>
                  <div
                    className="wisdom-msg-text"
                    style={{
                      background: isUser ? 'rgba(212, 175, 55, 0.12)' : 'var(--surface-wood)',
                      border: isUser
                        ? '1px solid rgba(212, 175, 55, 0.3)'
                        : `1px solid rgba(212, 175, 55, 0.15)`,
                      borderLeft: isUser
                        ? '1px solid rgba(212, 175, 55, 0.3)'
                        : `3px solid ${currentPersonaInfo?.color || 'var(--gold-sacred)'}`,
                      padding: '0.85rem 1.15rem',
                      borderRadius: '8px',
                      color: 'var(--text-vellum)',
                      fontSize: 'clamp(0.88rem, 2vw, 0.94rem)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {isUser ? (
                      m.content
                    ) : (
                      <SafeMessageContent
                        content={m.content}
                        citations={m.citations}
                        onCitationClick={(c) => setInspectedCitation(c)}
                      />
                    )}
                  </div>

                  {/* Render Verified Source Citations */}
                  {m.citations && m.citations.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.4rem',
                        marginTop: '0.45rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      {m.citations.map((c, idx) => (
                        <button
                          key={idx}
                          type="button"
                          suppressHydrationWarning
                          onClick={() => setInspectedCitation(c)}
                          style={{
                            background: 'rgba(212, 175, 55, 0.15)',
                            border: '1px solid var(--gold-antique)',
                            color: 'var(--gold-radiance)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          📜 {c.canonicalReference}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Active Streaming Assistant Response */}
            {isStreaming && (
              <div
                className="wisdom-msg-bubble"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignSelf: 'flex-start',
                  minWidth: 0,
                }}
              >
                <div
                  className="wisdom-msg-sender"
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: currentPersonaInfo?.color || 'var(--gold-radiance)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {currentPersonaInfo?.name} (Chanting &amp; Streaming...)
                </div>
                <div
                  className="wisdom-msg-text"
                  style={{
                    background: 'var(--surface-wood)',
                    borderLeft: `3px solid ${currentPersonaInfo?.color || 'var(--gold-sacred)'}`,
                    padding: '0.85rem 1.15rem',
                    borderRadius: '8px',
                    color: 'var(--text-vellum)',
                    fontSize: 'clamp(0.88rem, 2vw, 0.94rem)',
                    lineHeight: 1.6,
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                  }}
                >
                  <SafeMessageContent
                    content={streamBuffer || '...'}
                    citations={activeCitations}
                    onCitationClick={(c) => setInspectedCitation(c)}
                    isStreaming={true}
                  />
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '14px',
                      background: 'var(--gold-radiance)',
                      marginLeft: '4px',
                      animation: 'blink 1s infinite',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="wisdom-input-container">
            <form
              onSubmit={(e) => handleSendMessage(e)}
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: '100%' }}
            >
              <input
                type="text"
                suppressHydrationWarning
                className="input-sacred wisdom-chat-input"
                placeholder={`Ask ${currentPersonaInfo?.name || 'Vedic Guide'} for guidance...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isStreaming}
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: '0.92rem',
                  padding: '0.65rem 0.9rem',
                }}
              />
              <button
                type="submit"
                suppressHydrationWarning
                className="btn-sacred wisdom-chat-send-btn"
                disabled={isStreaming || !inputText.trim()}
                style={{
                  padding: '0.65rem 1.35rem',
                  fontSize: '0.88rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {isStreaming ? 'Streaming...' : 'Seek'}
              </button>
            </form>
          </div>
        </main>
      </div>

      {/* Citation Inspector Modal */}
      {inspectedCitation && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
          onClick={() => setInspectedCitation(null)}
        >
          <div
            className="temple-card"
            style={{
              maxWidth: '550px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--surface-wood)',
              border: '1px solid var(--gold-sacred)',
              padding: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span className="badge" style={{ whiteSpace: 'nowrap', fontSize: '0.68rem' }}>Canonical Source Grounding</span>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setInspectedCitation(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dust)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                ✕ Close
              </button>
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.1rem, 2.5vw, 1.28rem)',
                color: 'var(--gold-radiance)',
                marginBottom: '0.75rem',
                wordBreak: 'break-word',
                lineHeight: 1.35,
              }}
            >
              {inspectedCitation.canonicalReference}
            </h3>
            <div
              style={{
                padding: '0.85rem 1rem',
                background: 'rgba(13, 11, 8, 0.6)',
                borderRadius: '6px',
                borderLeft: '3px solid var(--gold-sacred)',
                marginBottom: '1rem',
                fontStyle: 'italic',
                color: 'var(--text-vellum)',
                fontSize: 'clamp(0.88rem, 2vw, 0.94rem)',
                lineHeight: 1.55,
                wordBreak: 'break-word',
              }}
            >
              &ldquo;{inspectedCitation.chunkText}&rdquo;
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dust)', lineHeight: 1.5 }}>
              Verified canonical shastra reference cited by the wisdom persona to ground this answer
              in authentic Vedic tradition.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
