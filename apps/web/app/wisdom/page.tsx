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

export default function WisdomChatPage() {
  const { user, loading: authLoading } = useAuth();

  const [personas, setPersonas] = useState<PersonaInfo[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<WisdomPersona>('krishna');
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);

  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState('');
  const [activeCitations, setActiveCitations] = useState<MessageCitation[]>([]);
  const [inspectedCitation, setInspectedCitation] = useState<MessageCitation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamBuffer]);

  // Load available personas
  useEffect(() => {
    async function loadPersonas() {
      try {
        const res = await fetch(`${API_BASE}/wisdom/personas`);
        const json = await res.json();
        if (json.success && json.data?.personas) {
          setPersonas(json.data.personas);
        }
      } catch (err) {
        console.error('Failed to load personas', err);
      }
    }
    loadPersonas();
  }, []);

  // Load user's conversations when authenticated
  useEffect(() => {
    if (!user) return;

    async function loadConversations() {
      try {
        const res = await fetch(`${API_BASE}/wisdom/conversations`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (json.success && json.data?.items) {
          setConversations(json.data.items);
          if (json.data.items.length > 0 && !activeConversationId) {
            loadConversationThread(json.data.items[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load conversations', err);
      }
    }
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Load specific conversation thread
  const loadConversationThread = async (convId: string) => {
    setActiveConversationId(convId);
    setStreamBuffer('');
    try {
      const res = await fetch(`${API_BASE}/wisdom/conversations/${convId}`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success && json.data) {
        setMessages(json.data.messages || []);
        setSelectedPersona(json.data.persona);
      }
    } catch (err) {
      console.error('Failed to load thread', err);
    }
  };

  // Start new conversation
  const startNewDialogue = async (persona: WisdomPersona, initialPrompt?: string) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/wisdom/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          persona,
          initialMessage: initialPrompt,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setConversations((prev) => [json.data, ...prev]);
        setActiveConversationId(json.data.id);
        setSelectedPersona(persona);
        setMessages(json.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to start dialogue', err);
    }
  };

  // Send message via SSE streaming
  const handleSendMessage = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = (customQuery || inputText).trim();
    if (!query || isStreaming) return;

    setInputText('');

    // Ensure we have an active conversation
    let convId = activeConversationId;
    if (!convId) {
      if (!user) return;
      try {
        const initRes = await fetch(`${API_BASE}/wisdom/conversations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            persona: selectedPersona,
            title: query.slice(0, 35) + '...',
          }),
        });
        const initJson = await initRes.json();
        if (initJson.success && initJson.data) {
          convId = initJson.data.id;
          setActiveConversationId(convId);
          setConversations((prev) => [initJson.data, ...prev]);
        }
      } catch (err) {
        console.error('Error initiating conversation', err);
        return;
      }
    }

    if (!convId) return;

    // Append user message locally
    const tempUserMsg: MessageDTO = {
      id: 'temp-' + Date.now(),
      conversationId: convId,
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
      const response = await fetch(`${API_BASE}/wisdom/conversations/${convId}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: query }),
      });

      if (!response.body) {
        throw new Error('No readable stream available in response');
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
        buffer = events.pop() || ''; // Keep partial event in buffer

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
            if (eventType === 'token') {
              accumulatedText += parsed.token;
              setStreamBuffer(accumulatedText);
            } else if (eventType === 'citation') {
              collectedCitations.push(parsed.citation);
              setActiveCitations([...collectedCitations]);
            } else if (eventType === 'done') {
              // Finalize message
              const assistantMsg: MessageDTO = {
                id: parsed.messageId || 'final-' + Date.now(),
                conversationId: convId,
                sender: 'assistant',
                content: parsed.fullContent || accumulatedText,
                citations: parsed.citations || collectedCitations,
                createdAt: new Date().toISOString(),
              };
              setMessages((prev) => [...prev, assistantMsg]);
              setStreamBuffer('');
              setIsStreaming(false);
            }
          } catch {
            // Ignore non-JSON heartbeat
          }
        }
      }
    } catch (err) {
      console.error('Stream processing failed', err);
      setIsStreaming(false);
    }
  };

  const currentPersonaInfo = personas.find((p) => p.id === selectedPersona) || personas[0];

  return (
    <div
      className="temple-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 4rem)',
        padding: '1.5rem',
        maxWidth: '1350px',
      }}
    >
      {/* Subpage Breadcrumb Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.25rem',
              margin: 0,
              display: 'inline-block',
            }}
            className="gold-gradient-text"
          >
            Vedic Wisdom Dialogue
          </h1>
          <span
            className="badge"
            style={{
              borderColor: 'rgba(123, 104, 238, 0.4)',
              color: '#c4b5fd',
              fontSize: '0.7rem',
              marginLeft: '0.25rem',
            }}
          >
            Live SSE Stream
          </span>
        </div>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dust)' }}>
              Seeker: <strong style={{ color: 'var(--gold-radiance)' }}>{user.displayName}</strong>
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              href="/login"
              className="btn-outline-sacred"
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
            >
              Sign In to Save History
            </Link>
          </div>
        )}
      </div>

      {/* Main Chat Workspace */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '1.5rem',
          flex: 1,
          marginTop: '1rem',
          overflow: 'hidden',
        }}
      >
        {/* Left Sidebar: Personas & Thread History */}
        <aside
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            background: 'var(--surface-stone)',
            borderRadius: '8px',
            padding: '1.25rem',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            overflowY: 'auto',
          }}
        >
          <div>
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
              Select Wisdom Persona
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {personas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => startNewDialogue(p.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border:
                      selectedPersona === p.id
                        ? `2px solid ${p.color}`
                        : '1px solid rgba(212, 175, 55, 0.1)',
                    background:
                      selectedPersona === p.id ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                    color: selectedPersona === p.id ? 'var(--text-vellum)' : 'var(--text-dust)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{p.avatarIcon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: p.color }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dust)' }}>
                      {p.domain.split('&')[0]}
                    </div>
                  </div>
                </button>
              ))}
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
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => loadConversationThread(c.id)}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '5px',
                      background:
                        activeConversationId === c.id
                          ? 'rgba(212, 175, 55, 0.15)'
                          : 'rgba(13, 11, 8, 0.4)',
                      border:
                        activeConversationId === c.id
                          ? '1px solid var(--gold-sacred)'
                          : '1px solid transparent',
                      color: 'var(--text-vellum)',
                      fontSize: '0.85rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    💬 {c.title}
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Right Main Column: Chat Thread & Input */}
        <main
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--surface-stone)',
            borderRadius: '8px',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            overflow: 'hidden',
          }}
        >
          {/* Active Persona Banner */}
          {currentPersonaInfo && (
            <div
              style={{
                padding: '0.85rem 1.25rem',
                background: 'var(--surface-wood)',
                borderBottom: `2px solid ${currentPersonaInfo.color}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{currentPersonaInfo.avatarIcon}</span>
                <div>
                  <h2 style={{ fontSize: '1.1rem', margin: 0, color: currentPersonaInfo.color }}>
                    {currentPersonaInfo.name}
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dust)' }}>
                    {currentPersonaInfo.title} • {currentPersonaInfo.domain}
                  </div>
                </div>
              </div>
              <button
                onClick={() => startNewDialogue(selectedPersona)}
                className="btn-outline-sacred"
                style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
              >
                + New Inquiry
              </button>
            </div>
          )}

          {/* Message Thread Scroll Container */}
          <div
            style={{
              flex: 1,
              padding: '1.5rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {messages.length === 0 && !streamBuffer && (
              <div style={{ textAlign: 'center', margin: 'auto', maxWidth: '580px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                  {currentPersonaInfo?.avatarIcon || '🕉️'}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.5rem',
                    color: 'var(--gold-radiance)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Consult {currentPersonaInfo?.name}
                </h3>
                <p
                  style={{ color: 'var(--text-dust)', fontSize: '0.95rem', marginBottom: '1.5rem' }}
                >
                  {currentPersonaInfo?.description}
                </p>

                <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--gold-radiance)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Suggested Questions:
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {currentPersonaInfo?.sampleInquiries.map((inq) => (
                    <button
                      key={inq}
                      onClick={() => handleSendMessage(undefined, inq)}
                      style={{
                        padding: '0.65rem 1rem',
                        background: 'rgba(13, 11, 8, 0.6)',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        borderRadius: '6px',
                        color: 'var(--text-vellum)',
                        fontSize: '0.85rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
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
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-dust)',
                      marginBottom: '0.25rem',
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {isUser ? 'Seeker' : currentPersonaInfo?.name || 'Guide'}
                  </div>
                  <div
                    style={{
                      background: isUser ? 'rgba(212, 175, 55, 0.12)' : 'var(--surface-wood)',
                      border: isUser
                        ? '1px solid rgba(212, 175, 55, 0.3)'
                        : `1px solid rgba(212, 175, 55, 0.15)`,
                      borderLeft: isUser
                        ? '1px solid rgba(212, 175, 55, 0.3)'
                        : `3px solid ${currentPersonaInfo?.color || 'var(--gold-sacred)'}`,
                      padding: '1rem 1.25rem',
                      borderRadius: '8px',
                      color: 'var(--text-vellum)',
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {m.content}
                  </div>

                  {/* Render Verified Source Citations */}
                  {m.citations && m.citations.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '0.5rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      {m.citations.map((c, idx) => (
                        <button
                          key={idx}
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
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignSelf: 'flex-start',
                  maxWidth: '80%',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: currentPersonaInfo?.color || 'var(--gold-radiance)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {currentPersonaInfo?.name} (Chanting &amp; Streaming...)
                </div>
                <div
                  style={{
                    background: 'var(--surface-wood)',
                    borderLeft: `3px solid ${currentPersonaInfo?.color || 'var(--gold-sacred)'}`,
                    padding: '1rem 1.25rem',
                    borderRadius: '8px',
                    color: 'var(--text-vellum)',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {streamBuffer || '...'}
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

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'var(--surface-stone)',
              borderTop: '1px solid rgba(212, 175, 55, 0.15)',
            }}
          >
            <form
              onSubmit={(e) => handleSendMessage(e)}
              style={{ display: 'flex', gap: '0.75rem' }}
            >
              <input
                type="text"
                className="input-sacred"
                placeholder={`Ask ${currentPersonaInfo?.name || 'Vedic Guide'} for guidance...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isStreaming}
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className="btn-sacred"
                disabled={isStreaming || !inputText.trim()}
                style={{ padding: '0.75rem 1.5rem' }}
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
            padding: '1.5rem',
          }}
          onClick={() => setInspectedCitation(null)}
        >
          <div
            className="temple-card"
            style={{
              maxWidth: '550px',
              width: '100%',
              background: 'var(--surface-wood)',
              border: '1px solid var(--gold-sacred)',
              padding: '2rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className="badge">Canonical Source Grounding</span>
              <button
                onClick={() => setInspectedCitation(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dust)',
                  cursor: 'pointer',
                }}
              >
                ✕ Close
              </button>
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.4rem',
                color: 'var(--gold-radiance)',
                marginBottom: '0.75rem',
              }}
            >
              {inspectedCitation.canonicalReference}
            </h3>
            <div
              style={{
                padding: '1rem',
                background: 'rgba(13, 11, 8, 0.6)',
                borderRadius: '6px',
                borderLeft: '3px solid var(--gold-sacred)',
                marginBottom: '1rem',
                fontStyle: 'italic',
                color: 'var(--text-vellum)',
                fontSize: '0.95rem',
              }}
            >
              &ldquo;{inspectedCitation.chunkText}&rdquo;
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dust)' }}>
              Verified canonical shastra reference cited by the wisdom persona to ground this answer
              in authentic Vedic tradition.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
