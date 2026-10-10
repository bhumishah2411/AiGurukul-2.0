import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KnowledgeGraphService } from './knowledge-graph.service.js';
import { KnowledgeGraphRepository } from '../repositories/knowledge-graph.repository.js';
import { NotFoundError, BadRequestError } from '@ai-gurukul/types';

describe('KnowledgeGraphService Unit Tests', () => {
  let mockRepo: KnowledgeGraphRepository;
  let service: KnowledgeGraphService;

  const mockNode1 = {
    slug: 'samkhya',
    name: 'Samkhya Darshana',
    entityType: 'tradition',
    summary: 'Dualistic realism.',
    description: 'Systematizing Purusha and Prakriti.',
    primarySources: ['Samkhya Karika'],
    tags: ['cosmology', 'dualism'],
    toDTO: () => ({
      id: 'n1',
      slug: 'samkhya',
      name: 'Samkhya Darshana',
      entityType: 'tradition' as const,
      summary: 'Dualistic realism.',
      description: 'Systematizing Purusha and Prakriti.',
      primarySources: ['Samkhya Karika'],
      tags: ['cosmology', 'dualism'],
    }),
  };

  const mockNode2 = {
    slug: 'ayurveda',
    name: 'Ayurveda',
    entityType: 'tradition',
    summary: 'Medicine and longevity.',
    description: 'Holistic health based on doshas.',
    primarySources: ['Charaka Samhita'],
    tags: ['medicine', 'doshas'],
    toDTO: () => ({
      id: 'n2',
      slug: 'ayurveda',
      name: 'Ayurveda',
      entityType: 'tradition' as const,
      summary: 'Medicine and longevity.',
      description: 'Holistic health based on doshas.',
      primarySources: ['Charaka Samhita'],
      tags: ['medicine', 'doshas'],
    }),
  };

  const mockNode3 = {
    slug: 'prakriti',
    name: 'Prakriti',
    entityType: 'concept',
    summary: 'Primordial matter.',
    description: 'Dynamic material matrix.',
    primarySources: ['Samkhya Karika 3'],
    tags: ['nature', 'matter'],
    toDTO: () => ({
      id: 'n3',
      slug: 'prakriti',
      name: 'Prakriti',
      entityType: 'concept' as const,
      summary: 'Primordial matter.',
      description: 'Dynamic material matrix.',
      primarySources: ['Samkhya Karika 3'],
      tags: ['nature', 'matter'],
    }),
  };

  const mockEdge1 = {
    sourceSlug: 'samkhya',
    targetSlug: 'prakriti',
    relationship: 'expounds' as const,
    weight: 10,
    toDTO: () => ({
      id: 'e1',
      sourceSlug: 'samkhya',
      targetSlug: 'prakriti',
      relationship: 'expounds' as const,
      weight: 10,
    }),
  };

  const mockEdge2 = {
    sourceSlug: 'prakriti',
    targetSlug: 'ayurveda',
    relationship: 'influences' as const,
    weight: 9,
    toDTO: () => ({
      id: 'e2',
      sourceSlug: 'prakriti',
      targetSlug: 'ayurveda',
      relationship: 'influences' as const,
      weight: 9,
    }),
  };

  beforeEach(() => {
    mockRepo = {
      ensureSeeded: vi.fn().mockResolvedValue({ nodesSeeded: 0, edgesSeeded: 0 }),
      getAllNodes: vi.fn().mockResolvedValue([mockNode1, mockNode2, mockNode3]),
      getAllEdges: vi.fn().mockResolvedValue([mockEdge1, mockEdge2]),
      getStatistics: vi.fn().mockResolvedValue({
        totalNodes: 3,
        totalEdges: 2,
        entityTypeCounts: { concept: 1, tradition: 2, text: 0, author: 0, practice: 0 },
        relationshipCounts: {
          expounds: 1,
          influences: 1,
          authored_by: 0,
          affiliated_with: 0,
          critiques: 0,
          part_of: 0,
          related_to: 0,
        },
      }),
      findNodeBySlug: vi.fn().mockImplementation(async (slug: string) => {
        if (slug === 'samkhya') return mockNode1;
        if (slug === 'ayurveda') return mockNode2;
        if (slug === 'prakriti') return mockNode3;
        return null;
      }),
      getEdgesForNode: vi.fn().mockResolvedValue({
        outgoing: [mockEdge1],
        incoming: [],
      }),
      findNeighbors: vi.fn().mockResolvedValue([mockNode3]),
      searchNodes: vi.fn().mockResolvedValue([mockNode1]),
    } as unknown as KnowledgeGraphRepository;

    service = new KnowledgeGraphService(mockRepo);
  });

  it('getOverview returns complete nodes, edges, and statistics', async () => {
    const overview = await service.getOverview();
    expect(overview.nodes).toHaveLength(3);
    expect(overview.edges).toHaveLength(2);
    expect(overview.statistics.totalNodes).toBe(3);
    expect(overview.statistics.entityTypeCounts.tradition).toBe(2);
  });

  it('getNodeDetails returns node with incoming, outgoing edges, and neighbors', async () => {
    const details = await service.getNodeDetails('samkhya');
    expect(details.node.slug).toBe('samkhya');
    expect(details.outgoingEdges).toHaveLength(1);
    expect(details.neighborNodes).toHaveLength(1);
    expect(details.neighborNodes[0].slug).toBe('prakriti');
  });

  it('getNodeDetails throws NotFoundError for nonexistent node', async () => {
    await expect(service.getNodeDetails('nonexistent')).rejects.toThrow(NotFoundError);
  });

  it('search returns matching node DTOs', async () => {
    const results = await service.search('Samkhya');
    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe('samkhya');
  });

  it('findShortestPath throws BadRequestError when source equals target', async () => {
    await expect(service.findShortestPath('samkhya', 'samkhya')).rejects.toThrow(
      BadRequestError
    );
  });

  it('findShortestPath throws NotFoundError when node does not exist', async () => {
    await expect(service.findShortestPath('samkhya', 'unknown')).rejects.toThrow(
      NotFoundError
    );
  });

  it('findShortestPath correctly computes multi-hop shortest path via BFS', async () => {
    const result = await service.findShortestPath('samkhya', 'ayurveda', 4);
    expect(result.found).toBe(true);
    expect(result.source).toBe('samkhya');
    expect(result.target).toBe('ayurveda');
    expect(result.length).toBe(2);
    expect(result.nodePath.map((n) => n.slug)).toEqual(['samkhya', 'prakriti', 'ayurveda']);
    expect(result.edgePath).toHaveLength(2);
  });
});
