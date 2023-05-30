import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardActions, CardContent, Paper, TextField } from '@mui/material';
// import Image from '../imgs/lobby-back.jpg'

const paper = {
  backgroundImage: 'url(${../imgs/lobby-back.jpg})',
}

const card = {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#373b42',
  color: '#fff',
  margin: '0 30vw'
};

const Lobby = () => {

  const [ email, setEmail ] = useState("");
  const [ room, setRoom ] = useState("");

  const socket = useSocket();
  // console.log(socket);
  const navigate = useNavigate();

  const handleSubmitForm = useCallback((e) => {
    e.preventDefault();
    console.log({email,room});
    socket.emit("room:join", { email, room });
  }, [email,room,socket]);

  const handleJoinRoom = useCallback((data) => {
    const { email, room } = data;
    navigate(`room/${room}`);
  }, [navigate]);

  useEffect(()=> {
    socket.on('room:join', handleJoinRoom);
    return () => {
      socket.off('room:join', handleJoinRoom);
    }
  }, [socket, handleJoinRoom])

  return (
    <Paper sx={paper}>
        <h1>Lobby</h1>
          <Card sx={card}>
            <CardContent>
            <label htmlFor='email'>Email ID: </label>
            <TextField 
              type='email' 
              id='email' 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor='room'>Room Number: </label>
            <TextField
              type='text'
              id='room'
              value={room}
              onChange={(e) => setRoom(e.target.value)} 
            />
            </CardContent>
            <CardActions>
              <Button onClick={handleSubmitForm}>Join</Button>
            </CardActions>
          </Card>
    </Paper>
  )
}

export default Lobby;