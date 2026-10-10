'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api';
import {
  KnowledgeNodeDTO,
  KnowledgeEdgeDTO,
  GraphOverviewDTO,
  GraphPathResultDTO,
  GraphEntityType,
} from '@ai-gurukul/types';

// Color palette mapping by entity type
const TYPE_CONFIG: Record<
  GraphEntityType,
  { label: string; color: string; bg: string; icon: string }
> = {
  concept: {
    label: 'Concepts',
    color: '#7B68EE',
    bg: 'rgba(123, 104, 238, 0.15)',
    icon: '💡',
  },
  text: {
    label: 'Canonical Texts',
    color: '#D4AF37',
    bg: 'rgba(212, 175, 55, 0.15)',
    icon: '📜',
  },
  tradition: {
    label: 'Schools (Darshanas)',
    color: '#C46B3A',
    bg: 'rgba(196, 107, 58, 0.15)',
    icon: '🏛️',
  },
  author: {
    label: 'Sages & Preceptors',
    color: '#E57373',
    bg: 'rgba(229, 115, 115, 0.15)',
    icon: '🧘',
  },
  practice: {
    label: 'Practices & Disciplines',
    color: '#3A9B8C',
    bg: 'rgba(58, 155, 140, 0.15)',
    icon: '🌿',
  },
};

interface PositionedNode extends KnowledgeNodeDTO {
  x: number;
  y: number;
}

export default function KnowledgeGraphPage() {
  const [nodes, setNodes] = useState<KnowledgeNodeDTO[]>([]);
  const [edges, setEdges] = useState<KnowledgeEdgeDTO[]>([]);
  const [statistics, setStatistics] = useState<GraphOverviewDTO['statistics'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters & Selection
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeNode, setActiveNode] = useState<KnowledgeNodeDTO | null>(null);

  // Path Finder State
  const [pathSource, setPathSource] = useState<string>('samkhya');
  const [pathTarget, setPathTarget] = useState<string>('ayurveda');
  const [pathResult, setPathResult] = useState<GraphPathResultDTO | null>(null);
  const [pathLoading, setPathLoading] = useState<boolean>(false);

  // Canvas Viewport Controls
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const fetchGraphData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient<GraphOverviewDTO>('/graph/overview');
      if (res.success && res.data) {
        setNodes(res.data.nodes);
        setEdges(res.data.edges);
        setStatistics(res.data.statistics);
      } else {
        setErrorMsg(res.error?.message || 'Failed to load Vedic Knowledge Graph');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to graph service');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  // Compute organic coordinates centered around traditions
  const positionedNodes = useMemo<PositionedNode[]>(() => {
    if (nodes.length === 0) return [];

    const width = 1200;
    const height = 800;
    const centerX = width / 2;
    const centerY = height / 2;

    // Categorized radial layout with organic clustering
    const typeAngles: Record<GraphEntityType, { start: number; end: number; radius: number }> = {
      tradition: { start: 0, end: Math.PI * 2, radius: 180 },
      text: { start: 0, end: Math.PI * 2, radius: 290 },
      concept: { start: 0, end: Math.PI * 2, radius: 390 },
      practice: { start: 0, end: Math.PI * 2, radius: 460 },
      author: { start: 0, end: Math.PI * 2, radius: 320 },
    };

    // Group nodes by type
    const grouped: Record<GraphEntityType, KnowledgeNodeDTO[]> = {
      tradition: [],
      text: [],
      concept: [],
      practice: [],
      author: [],
    };

    nodes.forEach((n) => {
      grouped[n.entityType]?.push(n);
    });

    const result: PositionedNode[] = [];

    (Object.keys(grouped) as GraphEntityType[]).forEach((type) => {
      const list = grouped[type];
      const cfg = typeAngles[type];
      const count = list.length;
      if (count === 0) return;

      const angleStep = (2 * Math.PI) / count;

      list.forEach((node, idx) => {
        // slight jitter for organic feeling
        const angle = idx * angleStep + (type === 'author' ? 0.35 : 0);
        const r = cfg.radius + (idx % 2 === 0 ? 20 : -15);
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);

        result.push({
          ...node,
          x: Math.round(x),
          y: Math.round(y),
        });
      });
    });

    return result;
  }, [nodes]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, PositionedNode>();
    positionedNodes.forEach((n) => map.set(n.slug, n));
    return map;
  }, [positionedNodes]);

  // Nodes filtered by search and type
  const visibleSlugs = useMemo(() => {
    const set = new Set<string>();
    const query = searchQuery.trim().toLowerCase();

    positionedNodes.forEach((n) => {
      const matchesType = selectedType === 'all' || n.entityType === selectedType;
      const matchesSearch =
        !query ||
        n.name.toLowerCase().includes(query) ||
        (n.sanskritName && n.sanskritName.includes(query)) ||
        n.tags.some((t) => t.toLowerCase().includes(query)) ||
        n.summary.toLowerCase().includes(query);

      if (matchesType && matchesSearch) {
        set.add(n.slug);
      }
    });

    return set;
  }, [positionedNodes, searchQuery, selectedType]);

  // Highlighted path slugs from Path Finder
  const pathSlugSet = useMemo(() => {
    if (!pathResult || !pathResult.found) return new Set<string>();
    return new Set(pathResult.nodePath.map((n) => n.slug));
  }, [pathResult]);

  // Edges on the discovered path
  const pathEdgeKeySet = useMemo(() => {
    if (!pathResult || !pathResult.found) return new Set<string>();
    const set = new Set<string>();
    pathResult.edgePath.forEach((e) => {
      set.add(`${e.sourceSlug}->${e.targetSlug}`);
      set.add(`${e.targetSlug}->${e.sourceSlug}`);
    });
    return set;
  }, [pathResult]);

  // Active neighborhood (1-hop connected nodes)
  const activeNeighborhoodSlugs = useMemo(() => {
    if (!activeNode) return null;
    const set = new Set<string>([activeNode.slug]);
    edges.forEach((e) => {
      if (e.sourceSlug === activeNode.slug) set.add(e.targetSlug);
      if (e.targetSlug === activeNode.slug) set.add(e.sourceSlug);
    });
    return set;
  }, [activeNode, edges]);

  // Active node's direct edges
  const activeNodeEdges = useMemo(() => {
    if (!activeNode) return { outgoing: [], incoming: [] };
    return {
      outgoing: edges.filter((e) => e.sourceSlug === activeNode.slug),
      incoming: edges.filter((e) => e.targetSlug === activeNode.slug),
    };
  }, [activeNode, edges]);

  // Path finder trigger
  const handleFindPath = async () => {
    if (!pathSource || !pathTarget || pathSource === pathTarget) return;

    setPathLoading(true);
    try {
      const res = await apiClient<GraphPathResultDTO>(
        `/graph/path?source=${encodeURIComponent(pathSource)}&target=${encodeURIComponent(pathTarget)}`
      );
      if (res.success && res.data) {
        setPathResult(res.data);
      } else {
        setPathResult(null);
      }
    } catch {
      setPathResult(null);
    } finally {
      setPathLoading(false);
    }
  };

  const clearPath = () => {
    setPathResult(null);
  };

  if (loading) {
    return (
      <div className="temple-container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <span style={{ fontSize: '3rem' }}>🕸️</span>
        <h2
          style={{ fontFamily: 'var(--font-serif)', marginTop: '1rem' }}
          className="gold-gradient-text"
        >
          Unfolding Vedic Knowledge Graph...
        </h2>
        <p style={{ color: 'var(--text-dust)', marginTop: '0.5rem' }}>
          Mapping ontologies, texts, traditions, and semantic bridges
        </p>
      </div>
    );
  }

  return (
    <div className="temple-container" style={{ padding: '2rem 1.5rem 5rem', maxWidth: '1360px' }}>
      {/* Breadcrumb Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
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
          <span style={{ color: 'var(--gold-radiance)', fontSize: '0.9rem', fontWeight: 600 }}>
            Vedic Knowledge Graph &amp; Ontology
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span
            className="badge"
            style={{
              borderColor: 'rgba(212, 175, 55, 0.4)',
              color: 'var(--gold-radiance)',
              fontSize: '0.75rem',
            }}
          >
            🕸️ 32 Nodes • 56 Edges
          </span>
          <span
            className="badge"
            style={{
              borderColor: 'rgba(94, 234, 212, 0.4)',
              color: '#5eead4',
              fontSize: '0.75rem',
            }}
          >
            BFS Pathfinder Active
          </span>
        </div>
      </div>

      {/* Header Section */}
      <section style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}
        >
          <span
            className="badge"
            style={{ borderColor: 'var(--gold-sacred)', color: 'var(--gold-radiance)' }}
          >
            🕸️ Semantic Ontology &amp; Shastric RAG
          </span>
          <span className="badge">Phase 4B Active</span>
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
          The Vedic Knowledge Graph
        </h1>
        <p
          style={{
            color: 'var(--text-dust)',
            maxWidth: '780px',
            margin: '0 auto',
            fontSize: '1.05rem',
            lineHeight: '1.7',
          }}
        >
          Explore the interconnected matrix of classical Indian philosophy. Navigate doctrines,
          canonical texts, philosophical traditions (*Darshanas*), and sages connected through
          authoritative semantic relationships.
        </p>
      </section>

      {/* Error Banner */}
      {errorMsg && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '6px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            marginBottom: '1.5rem',
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Statistics Bar */}
      {statistics && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div className="temple-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--gold-radiance)' }}>
              {statistics.totalNodes}
            </div>
            <div
              style={{ fontSize: '0.8rem', color: 'var(--text-dust)', textTransform: 'uppercase' }}
            >
              Philosophical Nodes
            </div>
          </div>
          <div className="temple-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#4fd1c5' }}>
              {statistics.totalEdges}
            </div>
            <div
              style={{ fontSize: '0.8rem', color: 'var(--text-dust)', textTransform: 'uppercase' }}
            >
              Semantic Edges
            </div>
          </div>
          <div className="temple-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#C46B3A' }}>
              {statistics.entityTypeCounts.tradition || 0}
            </div>
            <div
              style={{ fontSize: '0.8rem', color: 'var(--text-dust)', textTransform: 'uppercase' }}
            >
              Darshanas (Schools)
            </div>
          </div>
          <div className="temple-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#7B68EE' }}>
              {statistics.entityTypeCounts.concept || 0}
            </div>
            <div
              style={{ fontSize: '0.8rem', color: 'var(--text-dust)', textTransform: 'uppercase' }}
            >
              Doctrines (Tattvas)
            </div>
          </div>
          <div className="temple-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#D4AF37' }}>
              {statistics.entityTypeCounts.text || 0}
            </div>
            <div
              style={{ fontSize: '0.8rem', color: 'var(--text-dust)', textTransform: 'uppercase' }}
            >
              Canonical Texts
            </div>
          </div>
        </div>
      )}

      {/* Interactive Path Finder Toolbar */}
      <div
        className="temple-card"
        style={{
          padding: '1.25rem 1.75rem',
          marginBottom: '2rem',
          background: 'rgba(22, 19, 14, 0.9)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🧭</span>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--gold-radiance)', fontSize: '0.95rem' }}>
                Semantic Path Finder (Breadth-First Traversal)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dust)' }}>
                Discover the exact conceptual lineage connecting any two Vedic entities
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              value={pathSource}
              onChange={(e) => setPathSource(e.target.value)}
              className="form-input"
              style={{
                width: '180px',
                padding: '0.5rem 0.75rem',
                fontSize: '0.85rem',
                background: 'var(--surface-stone)',
                color: 'var(--text-vellum)',
                borderColor: 'rgba(212, 175, 55, 0.3)',
              }}
            >
              {positionedNodes.map((n) => (
                <option key={n.slug} value={n.slug}>
                  {n.name}
                </option>
              ))}
            </select>

            <span style={{ color: 'var(--gold-radiance)', fontWeight: 700 }}>→</span>

            <select
              value={pathTarget}
              onChange={(e) => setPathTarget(e.target.value)}
              className="form-input"
              style={{
                width: '180px',
                padding: '0.5rem 0.75rem',
                fontSize: '0.85rem',
                background: 'var(--surface-stone)',
                color: 'var(--text-vellum)',
                borderColor: 'rgba(212, 175, 55, 0.3)',
              }}
            >
              {positionedNodes.map((n) => (
                <option key={n.slug} value={n.slug}>
                  {n.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleFindPath}
              disabled={pathLoading || pathSource === pathTarget}
              className="btn-sacred"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
            >
              {pathLoading ? 'Tracing...' : 'Trace Connection'}
            </button>

            {pathResult && (
              <button
                onClick={clearPath}
                className="btn-outline-sacred"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Path Result Banner */}
        {pathResult && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1rem',
              borderRadius: '6px',
              background: pathResult.found ? 'rgba(58, 155, 140, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${pathResult.found ? 'rgba(58, 155, 140, 0.35)' : 'rgba(239, 68, 68, 0.3)'}`,
            }}
          >
            {pathResult.found ? (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span style={{ color: '#4fd1c5', fontWeight: 600, fontSize: '0.9rem' }}>
                    ✨ Semantic Connection Discovered ({pathResult.length} hops):
                  </span>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}
                >
                  {pathResult.nodePath.map((n, i) => (
                    <React.Fragment key={n.slug}>
                      <button
                        onClick={() => setActiveNode(n)}
                        style={{
                          background: 'rgba(13, 11, 8, 0.8)',
                          border: `1px solid ${TYPE_CONFIG[n.entityType]?.color || 'var(--gold-sacred)'}`,
                          color: TYPE_CONFIG[n.entityType]?.color || 'var(--text-vellum)',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}
                      >
                        {n.name}
                      </button>
                      {i < pathResult.nodePath.length - 1 && (
                        <span style={{ color: 'var(--text-dust)', fontSize: '0.8rem' }}>
                          —[{pathResult.edgePath[i]?.relationship.toUpperCase()}]—&gt;
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ color: '#fca5a5', fontSize: '0.85rem' }}>
                No direct semantic path found within 4 hops between {pathSource} and {pathTarget}.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
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
        {/* Type Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedType('all')}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '20px',
              border: `1px solid ${selectedType === 'all' ? 'var(--gold-radiance)' : 'rgba(212, 175, 55, 0.2)'}`,
              background: selectedType === 'all' ? 'var(--gold-radiance)' : 'rgba(13, 11, 8, 0.6)',
              color: selectedType === 'all' ? '#0D0B08' : 'var(--text-vellum)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            All Entities ({nodes.length})
          </button>
          {(Object.keys(TYPE_CONFIG) as GraphEntityType[]).map((t) => {
            const isSelected = selectedType === t;
            const cfg = TYPE_CONFIG[t];
            return (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '20px',
                  border: `1px solid ${isSelected ? cfg.color : 'rgba(212, 175, 55, 0.2)'}`,
                  background: isSelected ? cfg.color : 'rgba(13, 11, 8, 0.6)',
                  color: isSelected ? '#0D0B08' : 'var(--text-vellum)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>{cfg.icon}</span> {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            placeholder="Search concepts, texts, sages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              borderColor: 'rgba(212, 175, 55, 0.3)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-dust)',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Graph Visualization & Drawer Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: activeNode ? '1fr 380px' : '1fr',
          gap: '1.5rem',
        }}
      >
        {/* Visual SVG Canvas Card */}
        <div
          className="temple-card"
          style={{
            position: 'relative',
            padding: 0,
            overflow: 'hidden',
            background: 'radial-gradient(circle at center, #1A1610 0%, #0D0B08 85%)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            minHeight: '700px',
          }}
        >
          {/* Canvas Controls Overlay */}
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}
          >
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.15, 2.0))}
              title="Zoom In"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                background: 'rgba(13, 11, 8, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: 'var(--gold-radiance)',
                fontSize: '1.1rem',
                cursor: 'pointer',
              }}
            >
              +
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.15, 0.6))}
              title="Zoom Out"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                background: 'rgba(13, 11, 8, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: 'var(--gold-radiance)',
                fontSize: '1.1rem',
                cursor: 'pointer',
              }}
            >
              -
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              title="Reset View"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                background: 'rgba(13, 11, 8, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: 'var(--gold-radiance)',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              ⟲
            </button>
          </div>

          {/* SVG Graph View */}
          <svg
            width="100%"
            height="700"
            viewBox="0 0 1200 800"
            style={{
              cursor: 'grab',
              userSelect: 'none',
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: 'center center',
              transition: 'transform 0.25s ease-out',
            }}
          >
            <defs>
              {/* Arrow Marker Definitions */}
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="22"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="rgba(212, 175, 55, 0.4)" />
              </marker>
              <marker
                id="arrowhead-active"
                markerWidth="10"
                markerHeight="7"
                refX="24"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#F2D675" />
              </marker>
              <marker
                id="arrowhead-path"
                markerWidth="10"
                markerHeight="7"
                refX="24"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#4fd1c5" />
              </marker>
            </defs>

            {/* Connecting Edges */}
            <g className="edges-layer">
              {edges.map((e) => {
                const sNode = nodeMap.get(e.sourceSlug);
                const tNode = nodeMap.get(e.targetSlug);
                if (!sNode || !tNode) return null;

                const isPathEdge = pathEdgeKeySet.has(`${e.sourceSlug}->${e.targetSlug}`);
                const isSelectedEdge =
                  activeNode &&
                  (e.sourceSlug === activeNode.slug || e.targetSlug === activeNode.slug);

                let strokeColor = 'rgba(212, 175, 55, 0.15)';
                let strokeWidth = 1.2;
                let markerId = 'url(#arrowhead)';

                if (isPathEdge) {
                  strokeColor = '#4fd1c5';
                  strokeWidth = 3;
                  markerId = 'url(#arrowhead-path)';
                } else if (isSelectedEdge) {
                  strokeColor = '#F2D675';
                  strokeWidth = 2.2;
                  markerId = 'url(#arrowhead-active)';
                }

                // If a node is selected and this edge is unrelated, dim it
                const isDimmed =
                  activeNeighborhoodSlugs &&
                  !activeNeighborhoodSlugs.has(e.sourceSlug) &&
                  !activeNeighborhoodSlugs.has(e.targetSlug) &&
                  !isPathEdge;

                return (
                  <g
                    key={`${e.sourceSlug}-${e.targetSlug}-${e.relationship}`}
                    opacity={isDimmed ? 0.08 : 1}
                  >
                    <line
                      x1={sNode.x}
                      y1={sNode.y}
                      x2={tNode.x}
                      y2={tNode.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={e.relationship === 'critiques' ? '4,4' : undefined}
                      markerEnd={markerId}
                    />
                  </g>
                );
              })}
            </g>

            {/* Nodes Layer */}
            <g className="nodes-layer">
              {positionedNodes.map((node) => {
                const isVisible = visibleSlugs.has(node.slug);
                const isSelected = activeNode?.slug === node.slug;
                const isNeighbor = activeNeighborhoodSlugs?.has(node.slug);
                const isPathNode = pathSlugSet.has(node.slug);

                const cfg = TYPE_CONFIG[node.entityType] || TYPE_CONFIG.concept;
                const baseRadius =
                  node.entityType === 'tradition' ? 24 : node.entityType === 'text' ? 22 : 18;

                // Opacity dimming when another node is selected
                let opacity = 1;
                if (!isVisible) {
                  opacity = 0.15;
                } else if (activeNeighborhoodSlugs && !isNeighbor && !isPathNode) {
                  opacity = 0.25;
                }

                return (
                  <g
                    key={node.slug}
                    transform={`translate(${node.x}, ${node.y})`}
                    opacity={opacity}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}
                    onClick={() => setActiveNode(node)}
                  >
                    {/* Outer Glow Halo for active or path node */}
                    {(isSelected || isPathNode) && (
                      <circle
                        r={baseRadius + 10}
                        fill="none"
                        stroke={isPathNode ? '#4fd1c5' : 'var(--gold-radiance)'}
                        strokeWidth="2.5"
                        strokeDasharray="3,3"
                        opacity={0.8}
                      >
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from="0"
                          to="360"
                          dur="12s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Main Node Circle */}
                    <circle
                      r={baseRadius}
                      fill={isSelected ? cfg.color : '#16130E'}
                      stroke={cfg.color}
                      strokeWidth={isSelected ? 3 : 2}
                      filter="drop-shadow(0 2px 8px rgba(0,0,0,0.7))"
                    />

                    {/* Node Emoji Icon */}
                    <text
                      textAnchor="middle"
                      dy="5"
                      fontSize={baseRadius > 20 ? 14 : 11}
                      style={{ pointerEvents: 'none' }}
                    >
                      {cfg.icon}
                    </text>

                    {/* Label (Name) */}
                    <text
                      textAnchor="middle"
                      dy={baseRadius + 14}
                      fill={isSelected ? '#F2D675' : 'var(--text-vellum)'}
                      fontSize={11}
                      fontWeight={isSelected ? 700 : 500}
                      fontFamily="var(--font-sans)"
                      style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                    >
                      {node.name}
                    </text>

                    {/* Sanskrit Label Subtitle */}
                    {node.sanskritName && (
                      <text
                        textAnchor="middle"
                        dy={baseRadius + 26}
                        fill="rgba(212, 175, 55, 0.7)"
                        fontSize={9.5}
                        fontFamily="var(--font-serif)"
                        style={{ pointerEvents: 'none' }}
                      >
                        {node.sanskritName}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Bottom Left Legend */}
          <div
            style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              background: 'rgba(13, 11, 8, 0.85)',
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              fontSize: '0.75rem',
            }}
          >
            {(Object.keys(TYPE_CONFIG) as GraphEntityType[]).map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span
                  style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    background: TYPE_CONFIG[t].color,
                  }}
                />
                <span style={{ color: 'var(--text-dust)' }}>{TYPE_CONFIG[t].label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Slide-out Sanctum Detail Drawer */}
        {activeNode && (
          <div
            className="temple-card"
            style={{
              background: 'var(--surface-stone)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '700px',
              overflowY: 'auto',
            }}
          >
            {/* Drawer Top Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem',
              }}
            >
              <div>
                <span
                  className="badge"
                  style={{
                    borderColor: TYPE_CONFIG[activeNode.entityType]?.color || 'var(--gold-sacred)',
                    color: TYPE_CONFIG[activeNode.entityType]?.color || 'var(--gold-radiance)',
                    marginBottom: '0.35rem',
                  }}
                >
                  {TYPE_CONFIG[activeNode.entityType]?.icon}{' '}
                  {TYPE_CONFIG[activeNode.entityType]?.label}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.45rem',
                    margin: '0.35rem 0 0',
                    color: 'var(--text-vellum)',
                  }}
                >
                  {activeNode.name}
                </h3>
                {activeNode.sanskritName && (
                  <div
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.1rem',
                      color: 'var(--gold-radiance)',
                      marginTop: '0.2rem',
                    }}
                  >
                    {activeNode.sanskritName}
                  </div>
                )}
              </div>
              <button
                onClick={() => setActiveNode(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dust)',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '0.2rem',
                }}
              >
                ✕
              </button>
            </div>

            {/* Era Badge if present */}
            {activeNode.era && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dust)', marginBottom: '1rem' }}>
                ⏳ <strong>Historical Era:</strong> {activeNode.era}
              </div>
            )}

            {/* Summary */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--gold-radiance)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  marginBottom: '0.3rem',
                }}
              >
                Shastric Summary
              </div>
              <p
                style={{
                  color: 'var(--text-vellum)',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  margin: 0,
                }}
              >
                {activeNode.summary}
              </p>
            </div>

            {/* Deep Description */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--gold-radiance)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  marginBottom: '0.3rem',
                }}
              >
                Philosophical Exposition
              </div>
              <p
                style={{
                  color: 'var(--text-dust)',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  margin: 0,
                }}
              >
                {activeNode.description}
              </p>
            </div>

            {/* Primary Sources */}
            {activeNode.primarySources && activeNode.primarySources.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--gold-radiance)',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    marginBottom: '0.4rem',
                  }}
                >
                  Primary Canonical Citations
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {activeNode.primarySources.map((src) => (
                    <span
                      key={src}
                      style={{
                        background: 'rgba(13, 11, 8, 0.6)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: 'var(--gold-radiance)',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                      }}
                    >
                      📖 {src}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Semantic Relationships */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--gold-radiance)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem',
                }}
              >
                Connected Relationships
              </div>

              {/* Outgoing */}
              {activeNodeEdges.outgoing.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-dust)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Outgoing Connections:
                  </div>
                  {activeNodeEdges.outgoing.map((e) => {
                    const targetNode = nodeMap.get(e.targetSlug);
                    return (
                      <div
                        key={e.targetSlug + e.relationship}
                        onClick={() => targetNode && setActiveNode(targetNode)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.35rem 0.6rem',
                          background: 'rgba(13, 11, 8, 0.4)',
                          borderRadius: '4px',
                          marginBottom: '0.3rem',
                          cursor: 'pointer',
                          border: '1px solid rgba(212, 175, 55, 0.1)',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-vellum)' }}>
                          {targetNode?.name || e.targetSlug}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--gold-radiance)',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                          }}
                        >
                          {e.relationship} →
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Incoming */}
              {activeNodeEdges.incoming.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-dust)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Incoming Connections:
                  </div>
                  {activeNodeEdges.incoming.map((e) => {
                    const sourceNode = nodeMap.get(e.sourceSlug);
                    return (
                      <div
                        key={e.sourceSlug + e.relationship}
                        onClick={() => sourceNode && setActiveNode(sourceNode)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.35rem 0.6rem',
                          background: 'rgba(13, 11, 8, 0.4)',
                          borderRadius: '4px',
                          marginBottom: '0.3rem',
                          cursor: 'pointer',
                          border: '1px solid rgba(212, 175, 55, 0.1)',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-vellum)' }}>
                          {sourceNode?.name || e.sourceSlug}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: '#4fd1c5',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                          }}
                        >
                          ← {e.relationship}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions in Drawer */}
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(212, 175, 55, 0.2)',
              }}
            >
              <button
                onClick={() => {
                  setPathSource(activeNode.slug);
                }}
                className="btn-outline-sacred"
                style={{
                  width: '100%',
                  padding: '0.45rem',
                  fontSize: '0.8rem',
                  marginBottom: '0.5rem',
                }}
              >
                Set as Path Origin [From]
              </button>
              <button
                onClick={() => {
                  setPathTarget(activeNode.slug);
                }}
                className="btn-outline-sacred"
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem' }}
              >
                Set as Path Destination [To]
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
