import { Route, Routes } from 'react-router-dom';
import { SetupStatusPage } from './pages/SetupStatusPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<SetupStatusPage />} />
    </Routes>
  );
}

export default App;
