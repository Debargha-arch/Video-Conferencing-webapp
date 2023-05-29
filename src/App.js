import './App.css';
import { Route, Routes } from 'react-router-dom';
import Lobby from './screens/Lobby';
import Room from './screens/Room';


function App() {
  return (
    <div className="App">
      VIDEO CALLING WEBAPP
      <Routes>
        <Route path='/' element={<Lobby />}></Route>
        <Route path='/room/:roomId' element={<Room />}></Route>
      </Routes>
    </div>
  );
}

export default App;
