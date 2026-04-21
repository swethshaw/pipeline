import { useState } from 'react';
import { DraggableNode } from './draggableNode';
import { useStore } from '../store';

const NODE_GROUPS = [
  {
    label: 'Core',
    short: 'COR',
    nodes: [
      { type: 'customInput',  label: 'Input Source',   icon: '⚡', color: 'var(--c-input)'   },
      { type: 'llm',          label: 'LLM Engine',     icon: '🧠', color: 'var(--c-llm)'     },
      { type: 'customOutput', label: 'Output Sink',    icon: '📤', color: 'var(--c-output)'  },
      { type: 'text',         label: 'Text Template',  icon: '📝', color: 'var(--c-text)'    },
    ],
  },
  {
    label: 'Data Connectors',
    short: 'DAT',
    nodes: [
      { type: 'api',          label: 'API Request',    icon: '🌐', color: 'var(--c-api)'     },
      { type: 'document',     label: 'Document Loader',icon: '📄', color: 'var(--c-document)'},
      { type: 'webhook',      label: 'Webhook Listen', icon: '🪝', color: 'var(--c-webhook)'  },
      { type: 'embed',        label: 'Embeddings',     icon: '🧬', color: 'var(--c-embed)'    },
      { type: 'memory',       label: 'Memory Store',   icon: '🧩', color: 'var(--c-memory)'   },
    ],
  },
  {
    label: 'Logic & Flow',
    short: 'LOG',
    nodes: [
      { type: 'condition',    label: 'Condition Route',icon: '🔀', color: 'var(--c-condition)'},
      { type: 'filter',       label: 'Data Filter',    icon: '🔍', color: 'var(--c-filter)'   },
      { type: 'transform',    label: 'Data Transform', icon: '⚙️', color: 'var(--c-transform)'},
      { type: 'merge',        label: 'Merge Streams',  icon: '🔗', color: 'var(--c-merge)'    },
      { type: 'delay',        label: 'Delay Timer',    icon: '⏱️', color: 'var(--c-delay)'    },
    ],
  },
];

export const PipelineToolbar = () => {
  const isLocked = useStore((s) => s.isLocked);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="sidebar"
      style={{
        width: collapsed ? 80 : 280,
        minWidth: collapsed ? 80 : 280,
      }}
    >
      <div className="sidebar-header" style={{ padding: collapsed ? '20px 0' : '20px', justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && <span className="sidebar-title">Components</span>}
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <div
        className="sidebar-nodes"
        style={{
          opacity: isLocked ? 0.5 : 1,
          pointerEvents: isLocked ? 'none' : 'auto',
          padding: collapsed ? '8px 4px 20px' : '8px 12px 20px',
        }}
      >
        {NODE_GROUPS.map((group) => (
          <div key={group.label}>
            <div 
              className="sidebar-section-label" 
              style={{ 
                textAlign: collapsed ? 'center' : 'left',
                padding: collapsed ? '16px 0 8px' : '16px 20px 8px',
                fontSize: collapsed ? '0.6rem' : '0.7rem'
              }}
            >
              {collapsed ? group.short : group.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: collapsed ? 'center' : 'stretch' }}>
              {group.nodes.map((n) => (
                <DraggableNode key={n.type} {...n} accentColor={n.color} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
        {isLocked && !collapsed && (
          <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Canvas is locked. Unlock to drag nodes.
          </p>
        )}
      </div>
    </aside>
  );
};