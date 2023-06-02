import { Route, Routes } from 'react-router-dom';
import Lobby from './screens/Lobby';
import Room from './screens/Room';
import { AppBar, Typography } from '@mui/material';


function App() {
  return (
    <div className="App">
      <AppBar>
        <Typography variant='h4' align='center'>
          VIDEO CALLING WEBAPP
        </Typography>
      </AppBar>
      <Routes>
        <Route path='/' element={<Lobby />}></Route>
        <Route path='/room/:roomId' element={<Room />}></Route>
      </Routes>
    </div>
  );
}

export default App;
