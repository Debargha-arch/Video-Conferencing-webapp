import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardActions, CardContent, Paper, TextField, Typography } from '@mui/material';
import Image from '../imgs/lobby-back.jpg'

const paper = {
  background: `url(${Image})`,
  height: '94vh',
  width: '100vw'
}

const card = {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#373b42',
  color: '#fff',
  margin: '10vh 35vw'
};

const cardContent = {
  display: 'flex',
  flexDirection: 'column',
};

const textField = {
  backgroundColor: '#fff'
}

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
            <CardContent sx={cardContent}>
            <Typography>Email ID :</Typography>
            <TextField 
              type='email' 
              id='email' 
              value={email} 
              sx={textField}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Typography>Room Number :</Typography>
            <TextField
              type='text'
              id='room'
              value={room}
              sx={textField}
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