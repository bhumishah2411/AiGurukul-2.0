import { KnowledgeGraphRepository } from '../repositories/knowledge-graph.repository.js';
import {
  GraphOverviewDTO,
  NodeDetailDTO,
  KnowledgeNodeDTO,
  KnowledgeEdgeDTO,
  GraphPathResultDTO,
  GraphEntityType,
  NotFoundError,
  BadRequestError,
} from '@ai-gurukul/types';

export class KnowledgeGraphService {
  constructor(private readonly repository: KnowledgeGraphRepository) {}

  public async getOverview(
    typeFilter?: GraphEntityType,
    limit: number = 100
  ): Promise<GraphOverviewDTO> {
    await this.repository.ensureSeeded();

    const [nodeDocs, edgeDocs, statistics] = await Promise.all([
      this.repository.getAllNodes(typeFilter, limit),
      this.repository.getAllEdges(),
      this.repository.getStatistics(),
    ]);

    const nodes: KnowledgeNodeDTO[] = nodeDocs.map((doc) => doc.toDTO());
    const edges: KnowledgeEdgeDTO[] = edgeDocs.map((doc) => doc.toDTO());

    return {
      nodes,
      edges,
      statistics,
    };
  }

  public async getNodeDetails(slug: string): Promise<NodeDetailDTO> {
    await this.repository.ensureSeeded();

    const cleanSlug = slug.trim().toLowerCase();
    const nodeDoc = await this.repository.findNodeBySlug(cleanSlug);

    if (!nodeDoc) {
      throw new NotFoundError(`Knowledge graph node '${cleanSlug}' was not found.`);
    }

    const [{ outgoing, incoming }, neighborDocs] = await Promise.all([
      this.repository.getEdgesForNode(cleanSlug),
      this.repository.findNeighbors(cleanSlug),
    ]);

    return {
      node: nodeDoc.toDTO(),
      outgoingEdges: outgoing.map((e) => e.toDTO()),
      incomingEdges: incoming.map((e) => e.toDTO()),
      neighborNodes: neighborDocs.map((n) => n.toDTO()),
    };
  }

  public async search(
    query?: string,
    type?: GraphEntityType,
    tag?: string,
    limit: number = 20
  ): Promise<KnowledgeNodeDTO[]> {
    await this.repository.ensureSeeded();

    const nodeDocs = await this.repository.searchNodes(query, type, tag, limit);
    return nodeDocs.map((doc) => doc.toDTO());
  }

  public async findShortestPath(
    sourceSlug: string,
    targetSlug: string,
    maxDepth: number = 4
  ): Promise<GraphPathResultDTO> {
    await this.repository.ensureSeeded();

    const src = sourceSlug.trim().toLowerCase();
    const dst = targetSlug.trim().toLowerCase();

    if (src === dst) {
      throw new BadRequestError('Source and target node must be distinct.');
    }

    const [sourceDoc, targetDoc, allEdgeDocs] = await Promise.all([
      this.repository.findNodeBySlug(src),
      this.repository.findNodeBySlug(dst),
      this.repository.getAllEdges(1000),
    ]);

    if (!sourceDoc) {
      throw new NotFoundError(`Source node '${src}' not found in knowledge graph.`);
    }
    if (!targetDoc) {
      throw new NotFoundError(`Target node '${dst}' not found in knowledge graph.`);
    }

    // Build bidirectional adjacency list for semantic exploration
    const adjList = new Map<string, Array<{ neighbor: string; edge: KnowledgeEdgeDTO }>>();

    for (const e of allEdgeDocs) {
      const edgeDTO = e.toDTO();
      const s = edgeDTO.sourceSlug;
      const t = edgeDTO.targetSlug;

      if (!adjList.has(s)) adjList.set(s, []);
      if (!adjList.has(t)) adjList.set(t, []);

      adjList.get(s)!.push({ neighbor: t, edge: edgeDTO });
      adjList.get(t)!.push({ neighbor: s, edge: edgeDTO });
    }

    // Breadth-First Search (BFS)
    const queue: Array<{
      current: string;
      slugPath: string[];
      edgePath: KnowledgeEdgeDTO[];
    }> = [
      {
        current: src,
        slugPath: [src],
        edgePath: [],
      },
    ];

    const visited = new Set<string>([src]);
    let foundResult: { slugPath: string[]; edgePath: KnowledgeEdgeDTO[] } | null = null;

    while (queue.length > 0) {
      const { current, slugPath, edgePath } = queue.shift()!;

      if (current === dst) {
        foundResult = { slugPath, edgePath };
        break;
      }

      if (slugPath.length > maxDepth) {
        continue;
      }

      const neighbors = adjList.get(current) || [];
      for (const { neighbor, edge } of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({
            current: neighbor,
            slugPath: [...slugPath, neighbor],
            edgePath: [...edgePath, edge],
          });
        }
      }
    }

    if (!foundResult) {
      return {
        found: false,
        source: src,
        target: dst,
        length: 0,
        nodePath: [],
        edgePath: [],
      };
    }

    // Resolve full Node DTOs for the path
    const nodeDocsMap = new Map<string, KnowledgeNodeDTO>();
    const nodePromises = foundResult.slugPath.map(async (s) => {
      const doc = await this.repository.findNodeBySlug(s);
      if (doc) {
        nodeDocsMap.set(s, doc.toDTO());
      }
    });
    await Promise.all(nodePromises);

    const orderedNodePath: KnowledgeNodeDTO[] = foundResult.slugPath
      .map((s) => nodeDocsMap.get(s))
      .filter((n): n is KnowledgeNodeDTO => Boolean(n));

    return {
      found: true,
      source: src,
      target: dst,
      length: foundResult.edgePath.length,
      nodePath: orderedNodePath,
      edgePath: foundResult.edgePath,
    };
  }
}
