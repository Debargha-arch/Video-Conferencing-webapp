import './App.css';
import { Route, Routes } from 'react-router-dom';
import LobbyScreen from './Screens/LobbyScreen';


function App() {
  return (
    <div className="App">
      VIDEO CALLING WEBAPP
      <Routes>
        <Route path='/' element={<LobbyScreen />}></Route>
      </Routes>
    </div>
  );
}

export default App;
