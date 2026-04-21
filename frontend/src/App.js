import './index.css';
import { PipelineToolbar } from './components/toolbar';
import { PipelineUI } from './components/ui';

function App() {
  return (
    <div className="app-shell">
      <PipelineToolbar />
      <PipelineUI />
    </div>
  );
}

export default App;