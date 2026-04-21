// inputNode.jsx
import { createNode } from './BaseNode';

export const InputNode = createNode({
  title:     'Input Source',
  icon:      '⚡',
  accentVar: '--c-input',
  outputs:   [{ id: 'value', label: 'value' }],
  fields: (data, update, id) => (
    <>
      <div className="node-field">
        <label>Variable Name</label>
        <input
          className="node-input nodrag"
          type="text"
          value={data.inputName ?? id}
          onChange={update('inputName')}
          placeholder="e.g. user_query"
        />
      </div>
      <div className="node-field">
        <label>Data Type</label>
        <select
          className="node-select"
          value={data.inputType ?? 'Text'}
          onChange={update('inputType')}
        >
          <option value="Text">Text</option>
          <option value="File">File</option>
          <option value="JSON">JSON</option>
          <option value="Number">Number</option>
        </select>
      </div>
    </>
  ),
});