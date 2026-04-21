// BaseNode.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';

export const BaseNode = ({
  id,
  title,
  icon,
  accentVar = '--primary',
  inputs    = [],
  outputs   = [],
  children,
  style     = {},
}) => {
  const deleteNode = useStore((s) => s.deleteNode);
  const accent     = `var(${accentVar})`;

  const pct = (i, total) => ({ top: `${((i + 1) * 100) / (total + 1)}%` });

  return (
    <div className="custom-node" style={{ '--node-accent': accent, ...style }}>

      {/* ── Input Handles (Left) ── */}
      {inputs.map((h, i) => (
        <React.Fragment key={`in-${h.id}`}>
          <Handle
            type="target"
            position={Position.Left}
            id={`${id}-${h.id}`}
            style={pct(i, inputs.length)}
          />
          {h.label && (
            <span className="handle-label input-label" style={pct(i, inputs.length)}>
              {h.label}
            </span>
          )}
        </React.Fragment>
      ))}

      {/* ── Header ── */}
      <div className="node-header">
        <div className="node-title">
          {icon && <span style={{ marginRight: '6px' }}>{icon}</span>}
          {title}
        </div>
        <button
          className="node-delete-btn"
          onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
          title="Remove Node"
        >
          ✕
        </button>
      </div>

      {/* ── Body ── */}
      <div className="node-content">{children}</div>

      {/* ── Output Handles (Right) ── */}
      {outputs.map((h, i) => (
        <React.Fragment key={`out-${h.id}`}>
          <Handle
            type="source"
            position={Position.Right}
            id={`${id}-${h.id}`}
            style={pct(i, outputs.length)}
          />
          {h.label && (
            <span className="handle-label output-label" style={pct(i, outputs.length)}>
              {h.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const coerce = (e) => {
  const { type, value, checked } = e.target;
  if (type === 'checkbox') return checked;
  if (type === 'number' || type === 'range') {
    const n = parseFloat(value);
    return Number.isNaN(n) ? value : n;
  }
  return value;
};

// ── createNode factory ───────────────────────────────────────────────
export function createNode({
  title,
  icon,
  accentVar,
  inputs    = [],
  outputs   = [],
  fields,
  staticBody,
}) {
  const Component = ({ id, data }) => {
    const updateNodeField = useStore((s) => s.updateNodeField);
    const update = (key) => (e) => updateNodeField(id, key, coerce(e));
    const allInputs = [...inputs, ...(data?._dynamicHandles ?? [])];

    return (
      <BaseNode
        id={id}
        title={title}
        icon={icon}
        accentVar={accentVar}
        inputs={allInputs}
        outputs={outputs}
      >
        {fields ? fields(data ?? {}, update, id) : (staticBody ?? null)}
      </BaseNode>
    );
  };

  Component.displayName = title?.replace(/\s+/g, '') ?? 'Node';
  return Component;
}