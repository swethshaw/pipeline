import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, ControlButton, Background, MiniMap } from 'reactflow';
import { useStore } from '../store';
import { shallow } from 'zustand/shallow';
import { SubmitButton } from './submit';

import { InputNode }          from '../nodes/inputNode';
import { LLMNode }            from '../nodes/llmNode';
import { OutputNode }         from '../nodes/outputNode';
import { TextNode }           from '../nodes/textNode';
import {
  APINode, ConditionNode, DocumentLoaderNode, MergeNode,
  DelayNode, EmbedNode, FilterNode, TransformNode, WebhookNode, MemoryNode,
} from '../nodes/extensionNodes';

import 'reactflow/dist/style.css';

const NODE_TYPES = {
  customInput: InputNode,
  llm:         LLMNode,
  customOutput: OutputNode,
  text:        TextNode,
  api:         APINode,
  condition:   ConditionNode,
  document:    DocumentLoaderNode,
  merge:       MergeNode,
  delay:       DelayNode,
  embed:       EmbedNode,
  filter:      FilterNode,
  transform:   TransformNode,
  webhook:     WebhookNode,
  memory:      MemoryNode,
};

const GRID = 20;

const selector = (s) => ({
  nodes:         s.nodes,
  edges:         s.edges,
  getNodeID:     s.getNodeID,
  addNode:       s.addNode,
  onNodesChange: s.onNodesChange,
  onEdgesChange: s.onEdgesChange,
  onConnect:     s.onConnect,
  isLocked:      s.isLocked,
  toggleLock:    s.toggleLock,
  clearCanvas:   s.clearCanvas,
});

export const PipelineUI = () => {
  const wrapperRef               = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);

  const {
    nodes, edges, getNodeID, addNode,
    onNodesChange, onEdgesChange, onConnect,
    isLocked, toggleLock, clearCanvas,
  } = useStore(selector, shallow);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      if (isLocked || !rfInstance) return;

      const raw = e.dataTransfer.getData('application/reactflow');
      if (!raw) return;

      const { nodeType } = JSON.parse(raw);
      const position =
        typeof rfInstance.screenToFlowPosition === 'function'
          ? rfInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY })
          : (() => {
              const bounds = wrapperRef.current.getBoundingClientRect();
              return rfInstance.project({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
            })();

      const id = getNodeID(nodeType);
      addNode({ id, type: nodeType, position, data: { id, nodeType } });
    },
    [rfInstance, getNodeID, addNode, isLocked]
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="canvas-wrapper" ref={wrapperRef}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setRfInstance}
        nodeTypes={NODE_TYPES}
        proOptions={{ hideAttribution: true }}
        snapToGrid
        snapGrid={[GRID, GRID]}
        connectionLineType="smoothstep"
        fitView
        nodesDraggable={!isLocked}
        nodesConnectable={!isLocked}
        elementsSelectable={true}
      >
        <Background color="rgba(255,255,255,0.05)" gap={GRID} size={2} variant="dots" />

        <Controls showInteractive={false} style={{ bottom: 20, left: 20 }}>
          <ControlButton onClick={toggleLock} title={isLocked ? 'Unlock Canvas' : 'Lock Canvas'}>
            {isLocked ? '🔒' : '🔓'}
          </ControlButton>
          <ControlButton onClick={clearCanvas} title="Clear Canvas">
            🗑️
          </ControlButton>
        </Controls>

        <MiniMap
          nodeColor="rgba(99, 102, 241, 0.8)"
          maskColor="rgba(5, 7, 10, 0.7)"
          style={{
            borderRadius: 12,
            border:       '1px solid rgba(255,255,255,0.1)',
            background:   'rgba(13,17,23,0.8)',
            bottom:       '45px',
          }}
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div style={{
          position:      'absolute',
          top:           '50%',
          left:          '50%',
          transform:     'translate(-50%, -50%)',
          pointerEvents: 'none',
          textAlign:     'center',
          opacity:       0.5,
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
          <h2>Drag nodes here to build your pipeline</h2>
        </div>
      )}

      <SubmitButton />
    </div>
  );
};