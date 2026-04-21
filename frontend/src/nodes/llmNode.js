// llmNode.jsx
import { useStore } from '../store';
import { BaseNode } from './BaseNode';

export const LLMNode = ({ id, data }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);

  const set = (key, coerce) => (e) => updateNodeField(id, key, coerce(e.target.value));

  const temp      = data?.temperature ?? 0.7;
  const maxTokens = data?.maxTokens   ?? 1024;

  return (
    <BaseNode
      id={id}
      title="LLM Engine"
      icon="🧠"
      accentVar="--c-llm"
      inputs={[
        { id: 'system', label: 'system' },
        { id: 'prompt', label: 'prompt' },
      ]}
      outputs={[{ id: 'response', label: 'response' }]}
    >
      {/* ── Model ── */}
      <div className="node-field">
        <label>Model</label>
        <select
          className="node-select"
          value={data?.model ?? 'gpt-4o'}
          onChange={set('model', String)}
        >
          <optgroup label="OpenAI">
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-4o-mini">GPT-4o Mini</option>
            <option value="o3-mini">o3-mini</option>
          </optgroup>
          <optgroup label="Anthropic">
            <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
            <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
            <option value="claude-opus-4-20250514">Claude Opus 4</option>
          </optgroup>
          <optgroup label="Google">
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
          </optgroup>
        </select>
      </div>

      {/* ── Temperature ── */}
      <div className="node-field">
        <label style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Temperature</span>
          <span style={{ color: 'var(--text-accent)', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>
            {Number(temp).toFixed(1)}
          </span>
        </label>
        <input
          className="nodrag"
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={temp}
          onChange={set('temperature', parseFloat)}
          style={{ width: '100%', cursor: 'ew-resize', accentColor: 'var(--c-llm)' }}
        />
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          fontSize:       '0.68rem',
          color:          'var(--text-muted)',
          marginTop:      '2px',
          fontFamily:     'IBM Plex Mono, monospace',
        }}>
          <span>precise</span>
          <span>creative</span>
        </div>
      </div>

      {/* ── Max Tokens ── */}
      <div className="node-field">
        <label>Max Tokens</label>
        <input
          className="node-input nodrag"
          type="number"
          min={1}
          max={128000}
          step={256}
          value={maxTokens}
          onChange={set('maxTokens', parseInt)}
          placeholder="1024"
        />
      </div>
    </BaseNode>
  );
};