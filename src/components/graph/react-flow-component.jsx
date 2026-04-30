import PropTypes from "prop-types"
import { useMemo, useState, useCallback, useEffect } from "react"
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import GraphInfoPanel from "@/components/graph/graph-info-panel"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getLayoutedElements } from "./layout-utils"
import CustomNode from "./custom-node"
import CustomEdge from "./custom-edge"

const COLOR_PALETTE = [
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#f59e42", // orange
  "#6366f1", // indigo
  "#0ea5e9", // sky
  "#14b8a6", // teal
  "#f472b6", // pink
  "#eab308", // yellow
]

const nodeTypes = {
  custom: CustomNode,
}

const edgeTypes = {
  custom: CustomEdge,
}

const getNodeDisplayName = (node) => {
  const name = node.name || ""
  if (name.includes("__start__")) return "Start"
  if (name.includes("__end__")) return "End"
  return name
}

const getNodeColor = (node, index) => {
  const name = (node.name || "").toLowerCase()
  if (name.includes("__start__")) return "#22c55e"
  if (name.includes("__end__")) return "#ef4444"
  if (name.includes("tool") || node.action) return "#a855f7"
  return COLOR_PALETTE[index % COLOR_PALETTE.length]
}

const getNodeTypeLabel = (node = {}) => {
  const name = node.name || ""
  if (name.includes("__start__")) return "Start node"
  if (name.includes("__end__")) return "End node"
  if (node.mode === "agent") return "Agent node"
  if (node.action || (node.name || "").toLowerCase().includes("tool")) {
    return "Tool node"
  }
  return "Graph node"
}

const transformGraphData = (graphData, direction = 'TB') => {
  if (!graphData?.nodes?.length) return { initialNodes: [], initialEdges: [] }

  const nameToIdMap = new Map()
  graphData.nodes.forEach((node) => nameToIdMap.set(node.name, node.id))

  const initialNodes = graphData.nodes.map((node, index) => ({
    id: node.id,
    type: 'custom',
    position: { x: 0, y: 0 },
    data: {
      ...node,
      label: getNodeDisplayName(node),
      _color: getNodeColor(node, index),
      _typeLabel: getNodeTypeLabel(node),
    },
  }))

  const initialEdges = (graphData.edges || []).map((edge) => ({
    id: edge.id,
    source: nameToIdMap.get(edge.source) || edge.source,
    target: nameToIdMap.get(edge.target) || edge.target,
    type: 'custom',
    animated: true,
    data: { label: edge.condition || '' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#64748b',
    },
    style: { stroke: '#64748b', strokeWidth: 2 },
  }))

  return getLayoutedElements(initialNodes, initialEdges, direction)
}

const getConnectedNodes = (selectedNodeId, nodes, edges) => {
  if (!selectedNodeId) return []

  const connectedNodeIds = new Set()

  edges.forEach((edge) => {
    if (edge.source === selectedNodeId) connectedNodeIds.add(edge.target)
    if (edge.target === selectedNodeId) connectedNodeIds.add(edge.source)
  })

  return nodes.filter((node) => connectedNodeIds.has(node.id))
}

const NodeInspector = ({ selectedNode, connectedNodes }) => {
  const nodeData = selectedNode?.data

  return (
    <Card className="border-slate-200/80 bg-white/60 backdrop-blur-xl shadow-2xl dark:border-white/10 dark:bg-[#0f111a]/80 ring-1 ring-black/5 dark:ring-white/5 transition-all">
      <CardHeader className="space-y-1 pb-4 border-b border-slate-100 dark:border-white/5">
        <CardTitle className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          Node Details
        </CardTitle>
        <CardDescription className="text-[13px] text-slate-500 dark:text-slate-400">
          Inspect the selected node and its network associations.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {nodeData ? (
          <>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#3b82f6] drop-shadow-sm">
                Active Node
              </p>
              <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {nodeData.label}
              </h3>
            </div>

            <div className="grid gap-3">
              <div className="rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-[#161925]/50 shadow-inner">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Type Identifier
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-200">
                  {nodeData._typeLabel}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-[#161925]/50 shadow-inner">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  System Reference ID
                </p>
                <p className="mt-1 break-all font-mono text-[11px] text-slate-600 dark:text-slate-300">
                  {selectedNode.id}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-[#161925]/50 shadow-inner">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Data Flow Connections
              </p>
              {connectedNodes.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {connectedNodes.map((node) => (
                    <li
                      key={node.id}
                      className="rounded-full border border-slate-200/60 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm transition-transform hover:scale-105 dark:border-white/10 dark:bg-[#1a1d27] dark:text-slate-200 hover:shadow-md cursor-default"
                    >
                      {node.data?.label}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3 flex items-center justify-center py-4 rounded-lg border border-dashed border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-white/5">
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-500">
                    ISOLATED NODE
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center dark:border-white/10 dark:bg-[#161925]/30">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 mb-3 flex items-center justify-center">
              <span className="w-4 h-4 rounded-full bg-blue-500/20 animate-pulse" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Select a node</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Click any element on the canvas to inspect its runtime properties.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


NodeInspector.propTypes = {
  selectedNode: PropTypes.shape({
    id: PropTypes.string,
    data: PropTypes.object,
  }),
  connectedNodes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      data: PropTypes.object,
    })
  ).isRequired,
}

NodeInspector.defaultProps = {
  selectedNode: null,
}

const ReFlowComponent = ({ graphData, graphInfo }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [layoutDir, setLayoutDir] = useState('TB')

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = transformGraphData(graphData, layoutDir)
    setNodes(layoutedNodes)
    setEdges(layoutedEdges)
  }, [graphData, layoutDir, setNodes, setEdges])

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  )

  const connectedNodes = useMemo(
    () => getConnectedNodes(selectedNodeId, nodes, edges),
    [edges, nodes, selectedNodeId]
  )

  const onNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node.id)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  if (!graphData?.nodes?.length) {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed bg-slate-50 px-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
          No graph data available yet.
        </div>
        <div className="space-y-4">
          <NodeInspector selectedNode={null} connectedNodes={[]} />
          <GraphInfoPanel graphInfo={graphInfo || {}} />
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div
        aria-label="Network graph"
        className="rounded-xl border border-slate-200/80 bg-slate-50 p-0 shadow-sm dark:border-slate-800 dark:bg-slate-950/50 overflow-hidden"
      >
        <div className="h-[clamp(18rem,52dvh,26rem)] sm:h-[clamp(22rem,58dvh,32rem)] lg:h-[calc(100dvh-18rem)] lg:min-h-[28rem] lg:max-h-[48rem]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="bg-[#fafafa] dark:bg-[#0a0c10] min-h-[400px]"
            minZoom={0.2}
          >
            <Panel position="top-right" className="bg-white/80 dark:bg-[#0f111a]/80 backdrop-blur-md p-1.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/50 dark:border-white/5 flex gap-1 z-50 mt-4 mr-4">
              <button 
                onClick={() => setLayoutDir('TB')}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 ${layoutDir === 'TB' ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 bg-transparent'}`}
              >
                Top-Down
              </button>
              <button 
                onClick={() => setLayoutDir('LR')}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 ${layoutDir === 'LR' ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 bg-transparent'}`}
              >
                Left-Right
              </button>
            </Panel>
            <Controls className="fill-slate-700 dark:fill-slate-300 border-none shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-xl overflow-hidden *:border-none *:bg-white/90 *:dark:bg-[#0f111a]/90 *:backdrop-blur-md *:hover:bg-slate-100 *:dark:hover:bg-white/10" position="bottom-left" />
            
            {/* High-end dot background with lower opacity for a cleaner look */}
            <Background gap={24} size={1.5} color="#cbd5e1" className="opacity-50 dark:opacity-20" />
          </ReactFlow>
        </div>
      </div>
      <div className="space-y-4">
        <NodeInspector selectedNode={selectedNode} connectedNodes={connectedNodes} />
        <GraphInfoPanel graphInfo={graphInfo || {}} />
      </div>
    </div>
  )
}

ReFlowComponent.propTypes = {
  graphData: PropTypes.object,
  graphInfo: PropTypes.object,
}

export default ReFlowComponent