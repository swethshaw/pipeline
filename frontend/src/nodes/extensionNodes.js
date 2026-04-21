// extensionNodes.jsx
import { createNode } from './BaseNode';

// ── 1. API Request ───────────────────────────────────────────────────
export const APINode = createNode({
  title:     'API Request',
  icon:      '🌐',
  accentVar: '--c-api',
  inputs:    [{ id: 'payload', label: 'payload' }],
  outputs:   [{ id: 'response', label: 'response' }, { id: 'error', label: 'error' }],
  fields: (data, update) => (
    <>
      <div className="node-field">
        <label>Endpoint URL</label>
        <input className="node-input nodrag" type="text"
          value={data.url ?? ''} placeholder="https://api.example.com/v1/..."
          onChange={update('url')} />
      </div>
      <div className="node-field">
        <label>Method</label>
        <select className="node-select" value={data.method ?? 'GET'} onChange={update('method')}>
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
      </div>
    </>
  ),
});

// ── 2. Condition Router ──────────────────────────────────────────────
export const ConditionNode = createNode({
  title:     'Condition Router',
  icon:      '🔀',
  accentVar: '--c-condition',
  inputs:    [{ id: 'input', label: 'input' }],
  outputs:   [{ id: 'true', label: 'true ✓' }, { id: 'false', label: 'false ✗' }],
  fields: (data, update) => (
    <div className="node-field">
      <label>Condition Expression</label>
      <input className="node-input nodrag" type="text"
        value={data.condition ?? ''} placeholder="e.g. value > 100"
        onChange={update('condition')} />
    </div>
  ),
});

// ── 3. Document Loader ───────────────────────────────────────────────
export const DocumentLoaderNode = createNode({
  title:     'PDF Loader',
  icon:      '📄',
  accentVar: '--c-document',
  outputs:   [{ id: 'chunks', label: 'text chunks' }],
  fields: (data, update) => (
    <>
      <div className="node-field">
        <label>File Path / URL</label>
        <input className="node-input nodrag" type="text"
          value={data.path ?? ''} placeholder="/docs/report.pdf"
          onChange={update('path')} />
      </div>
      <div className="node-field">
        <label>Chunk Size</label>
        {/* type="number" → coerce() will parseInt → stored as number */}
        <input className="node-input nodrag" type="number"
          value={data.chunkSize ?? 512} min={128} max={4096}
          onChange={update('chunkSize')} />
      </div>
    </>
  ),
});

// ── 4. Merge / Combine ───────────────────────────────────────────────
export const MergeNode = createNode({
  title:     'Merge Data',
  icon:      '🔗',
  accentVar: '--c-merge',
  inputs:    [{ id: 'a', label: 'input A' }, { id: 'b', label: 'input B' }],
  outputs:   [{ id: 'merged', label: 'merged' }],
  fields: (data, update) => (
    <div className="node-field">
      <label>Strategy</label>
      <select className="node-select" value={data.strategy ?? 'concat'} onChange={update('strategy')}>
        <option value="concat">Concatenate</option>
        <option value="json_merge">JSON Deep Merge</option>
        <option value="zip">Zip / Interleave</option>
      </select>
    </div>
  ),
});

// ── 5. Delay / Timer ────────────────────────────────────────────────
export const DelayNode = createNode({
  title:     'Delay Timer',
  icon:      '⏱️',
  accentVar: '--c-delay',
  inputs:    [{ id: 'trigger', label: 'trigger' }],
  outputs:   [{ id: 'done', label: 'done' }],
  fields: (data, update) => (
    <div className="node-field">
      <label>Wait (ms)</label>
      <input className="node-input nodrag" type="number"
        value={data.delay ?? 1000} min={0} step={100}
        onChange={update('delay')} />
    </div>
  ),
});

// ── 6. Embeddings ────────────────────────────────────────────────────
export const EmbedNode = createNode({
  title:     'Embeddings',
  icon:      '🧬',
  accentVar: '--c-embed',
  inputs:    [{ id: 'text', label: 'text' }],
  outputs:   [{ id: 'vector', label: 'vector' }],
  fields: (data, update) => (
    <div className="node-field">
      <label>Embedding Model</label>
      <select className="node-select"
        value={data.model ?? 'text-embedding-3-small'}
        onChange={update('model')}
      >
        <option value="text-embedding-3-small">text-embedding-3-small</option>
        <option value="text-embedding-3-large">text-embedding-3-large</option>
        <option value="ada-002">ada-002</option>
      </select>
    </div>
  ),
});

// ── 7. Filter ────────────────────────────────────────────────────────
export const FilterNode = createNode({
  title:     'Filter',
  icon:      '🔍',
  accentVar: '--c-filter',
  inputs:    [{ id: 'list', label: 'list' }],
  outputs:   [{ id: 'passed', label: 'passed' }, { id: 'rejected', label: 'rejected' }],
  fields: (data, update) => (
    <div className="node-field">
      <label>Filter Expression</label>
      <input className="node-input nodrag" type="text"
        value={data.expr ?? ''} placeholder="item.score >= 0.8"
        onChange={update('expr')} />
    </div>
  ),
});

// ── 8. Transform ─────────────────────────────────────────────────────
export const TransformNode = createNode({
  title:     'Transform',
  icon:      '⚙️',
  accentVar: '--c-transform',
  inputs:    [{ id: 'input', label: 'input' }],
  outputs:   [{ id: 'output', label: 'output' }],
  fields: (data, update) => (
    <div className="node-field">
      <label>Operation</label>
      <select className="node-select" value={data.op ?? 'uppercase'} onChange={update('op')}>
        <option value="uppercase">Uppercase</option>
        <option value="lowercase">Lowercase</option>
        <option value="trim">Trim Whitespace</option>
        <option value="json_parse">JSON Parse</option>
        <option value="json_stringify">JSON Stringify</option>
      </select>
    </div>
  ),
});

// ── 9. Webhook ───────────────────────────────────────────────────────
export const WebhookNode = createNode({
  title:     'Webhook',
  icon:      '🪝',
  accentVar: '--c-webhook',
  outputs:   [{ id: 'payload', label: 'payload' }, { id: 'headers', label: 'headers' }],
  fields: (data, update) => (
    <>
      <div className="node-field">
        <label>Listen Path</label>
        <input className="node-input nodrag" type="text"
          value={data.path ?? '/webhook'} placeholder="/my-event"
          onChange={update('path')} />
      </div>
      <div className="node-field">
        <label>Auth Token (optional)</label>
        <input className="node-input nodrag" type="password"
          value={data.token ?? ''} placeholder="••••••••"
          onChange={update('token')} />
      </div>
    </>
  ),
});

// ── 10. Memory Store ─────────────────────────────────────────────────
export const MemoryNode = createNode({
  title:     'Memory Store',
  icon:      '🧩',
  accentVar: '--c-memory',
  inputs:    [{ id: 'write', label: 'write' }],
  outputs:   [{ id: 'read', label: 'read' }],
  fields: (data, update) => (
    <>
      <div className="node-field">
        <label>Memory Key</label>
        <input className="node-input nodrag" type="text"
          value={data.key ?? 'session_memory'} placeholder="session_memory"
          onChange={update('key')} />
      </div>
      <div className="node-field">
        <label>Window Size (msgs)</label>
        <input className="node-input nodrag" type="number"
          value={data.window ?? 10} min={1} max={100}
          onChange={update('window')} />
      </div>
    </>
  ),
});