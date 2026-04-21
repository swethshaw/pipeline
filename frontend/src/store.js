import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges, MarkerType } from 'reactflow';

export const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  nodeIDs: {},
  isLocked: false,

  toggleLock: () => set((s) => ({ isLocked: !s.isLocked })),

  clearCanvas: () => set({ nodes: [], edges: [], nodeIDs: {} }),

  getNodeID: (type) => {
    const ids = { ...get().nodeIDs };
    ids[type] = (ids[type] ?? 0) + 1;
    set({ nodeIDs: ids });
    return `${type}-${ids[type]}`;
  },

  addNode: (node) => set({ nodes: [...get().nodes, node] }),

  deleteNode: (nodeId) =>
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }),

  onNodesChange: (changes) => {
    const { isLocked, nodes } = get();
    if (isLocked) {
      const filtered = changes.filter((c) => c.type === 'select');
      if (filtered.length === 0) return;
      set({ nodes: applyNodeChanges(filtered, nodes) });
      return;
    }
    set({ nodes: applyNodeChanges(changes, nodes) });
  },

  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),

  onConnect: (connection) =>
    set({
      edges: addEdge(
        {
          ...connection,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#818cf8', strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#818cf8' },
        },
        get().edges
      ),
    }),

  updateNodeField: (nodeId, fieldName, fieldValue) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, [fieldName]: fieldValue } } : n
      ),
    }),
}));