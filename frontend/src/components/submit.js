// submit.jsx
import { useState } from 'react';
import { useStore } from '../store';

const PipelineAlert = ({ result, onClose }) => {
  const dagOk = result.is_dag;

  return (
    <div
      className="alert-overlay"
      onClick={onClose}
      style={{
        position:       'fixed',
        inset:          0,
        background:     'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        zIndex:         9999,
      }}
    >
      <div
        className="alert-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background:   'var(--bg-surface)',
          border:       '1px solid var(--border-mid)',
          borderRadius: 16,
          padding:      32,
          minWidth:     400,
          boxShadow:    '0 24px 64px rgba(0,0,0,0.8)',
        }}
      >
        <h2 style={{ marginBottom: 20 }}>Pipeline Analysis</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 12 }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nodes</p>
            <h3 style={{ fontSize: '1.8rem' }}>{result.num_nodes ?? '—'}</h3>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 12 }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Edges</p>
            <h3 style={{ fontSize: '1.8rem' }}>{result.num_edges ?? '—'}</h3>
          </div>
        </div>

        <div style={{
          padding:      16,
          borderRadius: 12,
          background:   dagOk ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
          border:       `1px solid ${dagOk ? '#4ade80' : '#f87171'}`,
          marginBottom: 24,
        }}>
          <strong>DAG Status:</strong>{' '}
          {dagOk ? '✅ Valid (Acyclic)' : '❌ Invalid — Cycle Detected'}
        </div>

        <button
          onClick={onClose}
          style={{
            width:        '100%',
            padding:      14,
            background:   'var(--primary)',
            color:        '#fff',
            border:       'none',
            borderRadius: 8,
            cursor:       'pointer',
            fontWeight:   'bold',
          }}
        >
          Close Analysis
        </button>
      </div>
    </div>
  );
};

const ErrorAlert = ({ message, onClose }) => (
  <div
    className="alert-overlay"
    onClick={onClose}
    style={{
      position:       'fixed',
      inset:          0,
      background:     'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      zIndex:         9999,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background:   'var(--bg-surface)',
        border:       '1px solid rgba(248,113,113,0.4)',
        borderRadius: 16,
        padding:      32,
        minWidth:     360,
        maxWidth:     480,
        boxShadow:    '0 24px 64px rgba(0,0,0,0.8)',
      }}
    >
      <h2 style={{ marginBottom: 12, color: '#f87171' }}>⚠ Submission Failed</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.6 }}>
        {message}
      </p>
      <button
        onClick={onClose}
        style={{
          width:        '100%',
          padding:      14,
          background:   'rgba(248,113,113,0.15)',
          color:        '#f87171',
          border:       '1px solid rgba(248,113,113,0.4)',
          borderRadius: 8,
          cursor:       'pointer',
          fontWeight:   'bold',
        }}
      >
        Dismiss
      </button>
    </div>
  </div>
);

export const SubmitButton = () => {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);

  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/pipelines/parse', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nodes, edges }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Server responded ${res.status}: ${text}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Pipeline submission failed:', err);
      setError(
        err.message.includes('fetch')
          ? 'Could not reach the backend at localhost:8000. Is the server running?'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={loading || nodes.length === 0}
      >
        {loading ? (
          <>
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
            Analyzing…
          </>
        ) : (
          'Execute Pipeline'
        )}
      </button>

      {result && <PipelineAlert result={result} onClose={() => setResult(null)} />}
      {error   && <ErrorAlert   message={error}  onClose={() => setError(null)}  />}
    </>
  );
};