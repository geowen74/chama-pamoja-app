import Contributions from './Contributions';
import { Link } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';

export default function App() {
  return (
    <div className="App">
      <Contributions />
    </div>
  );
}
