// textNode.jsx
import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { BaseNode } from './BaseNode';

const VAR_REGEX = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;

const MIN_WIDTH  = 240;
const MIN_HEIGHT = 60;
const PAD_W      = 32;
const PAD_H      = 16;

export const TextNode = ({ id, data }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);

  const [text, setText]     = useState(data?.text ?? '{{ input }}');
  const [variables, setVars] = useState([]);
  const [nodeSize, setSize]  = useState({ width: MIN_WIDTH, height: MIN_HEIGHT });
  const mirrorRef = useRef(null);

  // ── Extract {{ variables }} ──────────────────────────────────────
  useEffect(() => {
    const matches = [...text.matchAll(VAR_REGEX)].map((m) => m[1]);
    const unique  = [...new Set(matches)];
    setVars(unique.map((v) => ({ id: v, label: v })));
  }, [text]);

  // ── Auto-resize: measure text in mirror div ──────────────────────
  useEffect(() => {
    const mirror = mirrorRef.current;
    if (!mirror) return;

    // Step 1: measure height at MIN_WIDTH
    mirror.style.width      = `${MIN_WIDTH - PAD_W}px`;
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.textContent      = text + '\n'; // trailing \n prevents last-line collapse

    const measuredH = Math.max(MIN_HEIGHT, mirror.scrollHeight + PAD_H);

    // Step 2: measure natural line width (capped at 480)
    mirror.style.width      = 'max-content';
    mirror.style.whiteSpace = 'pre';
    const lineW = Math.min(480, Math.max(MIN_WIDTH, mirror.scrollWidth + PAD_W));

    setSize({ width: lineW, height: measuredH });
  }, [text]);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    updateNodeField(id, 'text', val);
  };

  return (
    <BaseNode
      id={id}
      title="Text Template"
      icon="📝"
      accentVar="--c-text"
      inputs={variables}
      outputs={[{ id: 'output', label: 'output' }]}
      style={{ width: nodeSize.width, transition: 'width 0.15s ease' }}
    >
      <div
        ref={mirrorRef}
        aria-hidden
        style={{
          position:      'absolute',
          visibility:    'hidden',
          pointerEvents: 'none',
          font:          '0.78rem / 1.5 "IBM Plex Mono", monospace',
          padding:       '7px 10px',
          top:           0,
          left:          0,
          zIndex:        -1,
        }}
      />

      <div className="node-field">
        <label>Prompt / Template</label>
        <textarea
          className="node-textarea nodrag"
          value={text}
          onChange={handleChange}
          style={{
            height:     nodeSize.height,
            minWidth:   MIN_WIDTH - PAD_W,
            width:      '100%',
            transition: 'height 0.12s ease',
          }}
          placeholder="Enter text. Use {{ varName }} to add input handles."
          spellCheck={false}
        />
      </div>

      {variables.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {variables.map((v) => (
            <span
              key={v.id}
              style={{
                fontSize:   '0.65rem',
                fontWeight:  600,
                padding:    '2px 7px',
                borderRadius: '4px',
                background: 'rgba(251,146,60,0.12)',
                border:     '1px solid rgba(251,146,60,0.3)',
                color:      'var(--c-text)',
                fontFamily: 'IBM Plex Mono, monospace',
              }}
            >
              {`{{${v.id}}}`}
            </span>
          ))}
        </div>
      )}
    </BaseNode>
  );
};