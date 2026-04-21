// outputNode.jsx
import { createNode } from './BaseNode';

export const OutputNode = createNode({
  title:     'Output Sink',
  icon:      '📤',
  accentVar: '--c-output',
  inputs:    [{ id: 'value', label: 'value' }],
  fields: (data, update, id) => (
    <>
      <div className="node-field">
        <label>Response Name</label>
        <input
          className="node-input nodrag"
          type="text"
          value={data.outputName ?? id}
          onChange={update('outputName')}
          placeholder="e.g. final_answer"
        />
      </div>
      <div className="node-field">
        <label>Format</label>
        <select
          className="node-select"
          value={data.outputType ?? 'Text'}
          onChange={update('outputType')}
        >
          <option value="Text">Text</option>
          <option value="JSON">JSON</option>
          <option value="Markdown">Markdown</option>
          <option value="HTML">HTML</option>
        </select>
      </div>
    </>
  ),
});