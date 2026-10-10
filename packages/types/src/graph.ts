export type GraphEntityType = 'concept' | 'text' | 'tradition' | 'author' | 'practice';

export type GraphRelationshipType =
  | 'expounds'
  | 'authored_by'
  | 'affiliated_with'
  | 'critiques'
  | 'influences'
  | 'part_of'
  | 'related_to';

export interface KnowledgeNodeDTO {
  id: string;
  slug: string;
  name: string;
  sanskritName?: string;
  entityType: GraphEntityType;
  summary: string;
  description: string;
  era?: string;
  primarySources: string[];
  tags: string[];
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface KnowledgeEdgeDTO {
  id: string;
  sourceSlug: string;
  targetSlug: string;
  relationship: GraphRelationshipType;
  description?: string;
  sourceReference?: string;
  weight: number;
}

export interface GraphOverviewDTO {
  nodes: KnowledgeNodeDTO[];
  edges: KnowledgeEdgeDTO[];
  statistics: {
    totalNodes: number;
    totalEdges: number;
    entityTypeCounts: Record<GraphEntityType, number>;
    relationshipCounts: Record<GraphRelationshipType, number>;
  };
}

export interface NodeDetailDTO {
  node: KnowledgeNodeDTO;
  outgoingEdges: KnowledgeEdgeDTO[];
  incomingEdges: KnowledgeEdgeDTO[];
  neighborNodes: KnowledgeNodeDTO[];
}

export interface GraphPathResultDTO {
  found: boolean;
  source: string;
  target: string;
  length: number;
  nodePath: KnowledgeNodeDTO[];
  edgePath: KnowledgeEdgeDTO[];
}
