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
  height: {
    sm: '27vh',
    md: '38vh'
  },
  margin: {
    sm: '20vh 20vw',
    md: '10vh 35vw'
  }
};

const cardContent = {
  display: 'flex',
  flexDirection: 'column',
};
const labToTexSpac = {
  margin: '1.5vh 0 1vh 0',
  // margin: {
  //   sm: '1vh 0',
  //   md: '4vh 0'
  // }
};

const textField = {
  backgroundColor: '#fff',
  width: {
    sm: '40vw',
    md: '20vw'
  }
};

const button = {
  // display: 'flex',
  // justifyContent: 'flex-end',
  marginLeft: '24vw'
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
            <CardContent sx={cardContent}>
            <div style={labToTexSpac}>
            <Typography variant='body1'>Email ID :</Typography>
            <TextField 
              type='email' 
              id='email' 
              value={email} 
              sx={textField}
              onChange={(e) => setEmail(e.target.value)}
            />
            </div>
            <div style={labToTexSpac}>
            <Typography variant='body1'>Room Number :</Typography>
            <TextField
              type='text'
              id='room'
              value={room}
              sx={textField}
              onChange={(e) => setRoom(e.target.value)}
            />
            </div>
            </CardContent>
            <CardActions>
              <Button variant='contained' sx={button} onClick={handleSubmitForm}>Join</Button>
            </CardActions>
          </Card>
    </Paper>
  )
}

export default Lobby;