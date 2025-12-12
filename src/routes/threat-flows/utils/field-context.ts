import type { FlowNode, Edge, DataField } from '../flow-types'

/**
 * Upstream field with source node info
 */
export type UpstreamField = DataField & {
  sourceNodeId: string
  sourceNodeTitle: string
  fullPath: string // e.g., "email_trigger.email.from"
}

/**
 * Find all nodes that are upstream of the given node
 */
function findUpstreamNodes(
  nodeId: string,
  nodes: FlowNode[],
  edges: Edge[],
  visited = new Set<string>()
): FlowNode[] {
  if (visited.has(nodeId)) return []
  visited.add(nodeId)

  const upstreamNodes: FlowNode[] = []

  // Find edges that point to this node
  const incomingEdges = edges.filter((e) => e.to === nodeId)

  for (const edge of incomingEdges) {
    const sourceNode = nodes.find((n) => n.id === edge.from)
    if (sourceNode) {
      upstreamNodes.push(sourceNode)
      // Recursively find upstream of the source
      const furtherUpstream = findUpstreamNodes(sourceNode.id, nodes, edges, visited)
      upstreamNodes.push(...furtherUpstream)
    }
  }

  return upstreamNodes
}

/**
 * Create a slug from a node title for use in field paths
 */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

/**
 * Resolve all fields available from upstream nodes
 * Only includes fields that are selected (selected !== false)
 */
export function resolveUpstreamFields(
  nodeId: string,
  nodes: FlowNode[],
  edges: Edge[]
): UpstreamField[] {
  const upstreamNodes = findUpstreamNodes(nodeId, nodes, edges)
  const fields: UpstreamField[] = []

  for (const node of upstreamNodes) {
    if (!node.outputSchema?.fields) continue

    const nodeSlug = slugify(node.title)

    for (const field of node.outputSchema.fields) {
      // Only include fields that are selected
      if (field.selected === false) continue

      fields.push({
        ...field,
        sourceNodeId: node.id,
        sourceNodeTitle: node.title,
        fullPath: `${nodeSlug}.${field.path}`,
      })
    }
  }

  return fields
}

/**
 * Group upstream fields by source node
 */
export function groupFieldsByNode(
  fields: UpstreamField[]
): Map<string, { nodeTitle: string; fields: UpstreamField[] }> {
  const grouped = new Map<string, { nodeTitle: string; fields: UpstreamField[] }>()

  for (const field of fields) {
    const existing = grouped.get(field.sourceNodeId)
    if (existing) {
      existing.fields.push(field)
    } else {
      grouped.set(field.sourceNodeId, {
        nodeTitle: field.sourceNodeTitle,
        fields: [field],
      })
    }
  }

  return grouped
}

/**
 * Find direct upstream nodes (immediate predecessors only)
 */
export function findDirectUpstreamNodes(
  nodeId: string,
  nodes: FlowNode[],
  edges: Edge[]
): FlowNode[] {
  const incomingEdges = edges.filter((e) => e.to === nodeId)
  return incomingEdges
    .map((e) => nodes.find((n) => n.id === e.from))
    .filter((n): n is FlowNode => n !== undefined)
}
