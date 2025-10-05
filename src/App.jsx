import { BrowserRouter as Router } from 'react-router-dom';
import HomePage from '@/components/pages/HomePage';

function App({ initialState }) {
  const activeNode = initialState?.activeNode;

  return (
    <Router>
      <HomePage activeNode={activeNode} />
    </Router>
  );
}

export default App;
