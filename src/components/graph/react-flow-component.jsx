import PropTypes from "prop-types"
import { useState } from "react"
import { Canvas, Node, Icon, Label } from "reaflow"

import GraphInfoPanel from "@/components/graph/graph-info-panel"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const randomColorGenerator = () => {
  const colors = [
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#f59e42", // orange
    "#fbbf24", // yellow
    "#6366f1", // indigo
    "#0ea5e9", // sky blue
    "#a21caf", // violet
    "#f472b6", // pink
    "#eab308", // gold
    "#64748b", // slate
    "#facc15", // amber
    "#14b8a6", // teal
    "#38bdf8", // light blue
    "#c026d3", // fuchsia
    "#d946ef", // magenta
    "#fcd34d", // light yellow
    "#a3e635", // lime
    "#f472b6", // rose
    "#e879f9", // light violet
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Transform graph data to Reagraph format
 * @param {object} _graphData - Raw graph data
 * @returns {object} Reagraph nodes and edges
 */
const _transformToReagraphFormat = (_graphData) => {
  if (!_graphData || !_graphData.nodes || !_graphData.edges) {
    return { nodes: [], edges: [] }
  }

  // Create name to ID mapping for edges
  const nameToIdMap = new Map()
  _graphData.nodes.forEach((node) => {
    nameToIdMap.set(node.name, node.id)
  })

  // Transform nodes for Reagraph
  const nodes = _graphData.nodes.map((node) => {
    const isStart =
      node.name.includes("__start__") ||
      node.name.toLowerCase().includes("start")
    const isEnd =
      node.name.includes("__end__") || node.name.toLowerCase().includes("end")

    // Determine node color based on type
    let fill = "#6b7280" // default gray
    if (isStart) {
      fill = "#4CAF50" // green
    } else if (isEnd) {
      fill = "#F44336" // red
    } else {
      fill = randomColorGenerator()
    }

    // change name
    let { name } = node
    let url = ""
    if (isStart) {
      name = "Start"
      url = "https://img.icons8.com/ios-glyphs/30/rocket.png"
    } else if (isEnd) {
      name = "End"
      url = "https://img.icons8.com/comic/100/finish-flag.png"
    } else {
      url = "https://img.icons8.com/glyph-neue/50/bard--v2.png"
    }

    // check tools
    if (name.toLowerCase().includes("tool")) {
      url = "https://img.icons8.com/ios/50/open-end-wrench.png"
    }

    return {
      id: node.id,
      text: name,
      data: node,
      icon: {
        url: url,
        height: 25,
        width: 25,
      },
      fill: fill,
    }
  })

  // Transform edges for Reagraph
  const edges = _graphData.edges.map((edge) => {
    const sourceId = nameToIdMap.get(edge.source) || edge.source
    const targetId = nameToIdMap.get(edge.target) || edge.target

    return {
      id: edge.id,
      from: sourceId,
      to: targetId,
      label: `${edge.source} → ${edge.target}`,
    }
  })

  return { nodes, edges }
}

const getNodeTypeLabel = (node = {}) => {
  const nodeName = node.name || ""

  if (nodeName.includes("__start__")) {
    return "Start node"
  }

  if (nodeName.includes("__end__")) {
    return "End node"
  }

  if (node.mode === "agent") {
    return "Agent node"
  }

  if (node.action || nodeName.toLowerCase().includes("tool")) {
    return "Tool node"
  }

  return "Graph node"
}

const getConnectedNodes = (selectedNode, allNodes, edges) => {
  if (!selectedNode) {
    return []
  }

  const nodeById = new Map(allNodes.map((node) => [node.id, node]))

  return edges
    .filter(
      (edge) => edge.from === selectedNode.id || edge.to === selectedNode.id
    )
    .map((edge) => {
      const connectedNodeId =
        edge.from === selectedNode.id ? edge.to : edge.from

      return nodeById.get(connectedNodeId)
    })
    .filter(Boolean)
}

const NodeInspector = ({ selectedNode, connectedNodes }) => {
  const selectedNodeData = selectedNode?.data

  return (
    <Card className="border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="text-lg">Node Details</CardTitle>
        <CardDescription>
          Inspect the selected node and its graph connections.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {selectedNodeData ? (
          <>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Selected Node
              </p>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                {selectedNode.text}
              </h3>
            </div>

            <div className="grid gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/80">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Type
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-50">
                  {getNodeTypeLabel(selectedNodeData)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/80">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Node ID
                </p>
                <p className="mt-2 break-all font-mono text-xs text-slate-700 dark:text-slate-200">
                  {selectedNodeData.id}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/80">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Connected Nodes
              </p>
              {connectedNodes.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {connectedNodes.map((node) => (
                    <li
                      key={node.id}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      {node.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  No connected nodes found.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
            Select a node to inspect its details.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * ReagraphComponent - Lightweight graph visualization using Reagraph
 * @param {object} props - Component props
 * @param {object} props.graphData - Graph data to visualize
 * @param {object} props.graphInfo - Graph metadata information
 * @returns {object} Reagraph canvas component
 */
const ReFlowComponent = ({ graphData, graphInfo }) => {
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const { nodes, edges } = _transformToReagraphFormat(graphData)
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) || null
  const connectedNodes = getConnectedNodes(selectedNode, nodes, edges)

  if (nodes.length === 0) {
    return (
      <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
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
    <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-h-[32rem] rounded-xl border border-slate-200/80 bg-white/70 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
        <div
          aria-label="Network graph"
          role="img"
          className="h-full w-full rounded-lg border border-slate-200/80 dark:border-slate-800"
        >
          <Canvas
            readonly
            nodes={nodes}
            edges={edges}
            fit
            panType="drag"
            node={(node) => {
              return (
                <Node
                  icon={<Icon />}
                  onClick={(_, nodeProperties) =>
                    setSelectedNodeId(nodeProperties.id)
                  }
                  style={{
                    stroke: node.properties.fill,
                    fill: node.properties.fill,
                    strokeWidth: 1,
                  }}
                  label={<Label style={{ fill: "White" }} />}
                />
              )
            }}
          />
        </div>
      </div>

      <div className="sr-only">
        {nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            onClick={() => setSelectedNodeId(node.id)}
            aria-label={`Open details for ${node.text}`}
          >
            Open details for {node.text}
          </button>
        ))}
      </div>

      <aside
        aria-label="Graph sidebar"
        className="space-y-4 xl:sticky xl:top-0 xl:max-h-[calc(100vh-12rem)] xl:overflow-auto"
      >
        <NodeInspector
          selectedNode={selectedNode}
          connectedNodes={connectedNodes}
        />
        <GraphInfoPanel graphInfo={graphInfo || {}} />
      </aside>
    </div>
  )
}

NodeInspector.propTypes = {
  selectedNode: PropTypes.shape({
    text: PropTypes.string,
    data: PropTypes.object,
  }),
  connectedNodes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string,
    })
  ).isRequired,
}

NodeInspector.defaultProps = {
  selectedNode: null,
}

ReFlowComponent.propTypes = {
  graphData: PropTypes.object.isRequired,
  graphInfo: PropTypes.object,
}

ReFlowComponent.defaultProps = {
  graphInfo: {},
}

export default ReFlowComponent
