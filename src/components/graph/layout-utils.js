import dagre from 'dagre';
import { Position } from '@xyflow/react';

export const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Add more spacing to accommodate LangGraph-style rectangular cards
  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, edgesep: 40, ranksep: 100 });

  nodes.forEach((node) => {
    // Width and height matches the new CustomNode sizes
    dagreGraph.setNode(node.id, { width: 280, height: 110 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // Dynamically set handle positions based on layout direction
    const targetPosition = isHorizontal ? Position.Left : Position.Top;
    const sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    return {
      ...node,
      targetPosition,
      sourcePosition,
      position: {
        x: nodeWithPosition.x - 280 / 2,
        y: nodeWithPosition.y - 110 / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};
