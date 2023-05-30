import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider';
import ReactPlayer from 'react-player';
import peer from '../services/peer';
import { Button, Card, IconButton, Paper, Typography } from '@mui/material';
import CallIcon from '@mui/icons-material/Call';

const head = {
  backgroundColor: '#000',
  height: '97vh'
};

const paper = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
  backgroundColor: 'inherit',
  marginTop: '8vh'
};

const card = {
  backgroundColor: '#373c47'
};

const typography = {
  color: '#fff'
};

const callButton = {
  backgroundColor: 'red',
  color: '#fff',
  ":hover": {
    backgroundColor: "#de474c",
  }
};

const Room = () => {

  const [ remoteSocketId, setRemoteSocketId ] = useState(null);
  const [ myStream, setMyStream ] = useState();
  const [ remoteStream, setRemoteStream ] = useState();

  const socket = useSocket();

  const handleUserJoined = useCallback(({email, id}) => {
    console.log(`Email: ${email} joined the room`);
    setRemoteSocketId(id);
  }, [])

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", {to: remoteSocketId, offer});
    setMyStream(stream);
  }, [remoteSocketId, socket])

  const handleIncomingCall = useCallback(async ({from, offer}) => {
    console.log(`Incoming call from`, from, offer);
    setRemoteSocketId(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    const ans = await peer.getAnswer(offer);
    socket.emit("call:accepted", {to: from, ans });
  }, [socket])
  
  const sendStream = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(({from, ans}) => {
    peer.setLocalDescription(ans);
    sendStream();
  }, [sendStream])

  const handleNegoNeeded = useCallback( async () => {
      const offer = await peer.getOffer();
      socket.emit('peer:nego:needed',{ offer, to: remoteSocketId });
  }, [remoteSocketId, socket])

  useEffect(() => {
    peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
    }
  }, [handleNegoNeeded])

  const handleNegoNeededIncoming = useCallback( async ({from, offer}) => {
    const ans = await peer.getAnswer(offer);
    socket.emit('peer:nego:done', {to: from, ans});
  }, [socket])

  const handleNegoFinal = useCallback( async ({ans}) => {
    await peer.setLocalDescription(ans);
  }, [])

  useEffect(() => {
    peer.peer.addEventListener("track", async event => {
      const remoteStream = event.streams;
      setRemoteStream(remoteStream[0]);
    })
  }, [])

  useEffect(() => {
    socket.on('user:joined', handleUserJoined);
    socket.on('incoming:call', handleIncomingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('peer:nego:needed', handleNegoNeededIncoming);
    socket.on('peer:nego:final', handleNegoFinal);

    return () => {
        socket.off('user:joined', handleUserJoined);
        socket.off('incoming:call', handleIncomingCall);
        socket.off('call:accepted', handleCallAccepted);
        socket.off('peer:nego:needed', handleNegoNeededIncoming);
        socket.off('peer:nego:final', handleNegoFinal);
    }
  },[socket, 
    handleUserJoined, 
    handleIncomingCall, 
    handleCallAccepted,
    handleNegoNeededIncoming,
    handleNegoFinal
  ]);

  return (
    <div style={head}>
        <Typography variant='h4' sx={typography}>Room</Typography>
        <Typography variant='body1' sx={typography}>{remoteSocketId ? "Connected" : "No one in room" }</Typography>
        {
          remoteSocketId && 
          <IconButton sx={callButton} size='large' onClick={handleCallUser}>
            <CallIcon fontSize='inherit'/>
          </IconButton>
        }
        { myStream && <Button variant='contained' onClick={sendStream}>Accept</Button>}
        <Paper sx={paper}>
        {
          myStream && 
          <Card sx={card}>
            <ReactPlayer playing muted url={myStream}/>
            <Typography sx={typography}>You</Typography>
          </Card>
        }
        {
          remoteStream && 
          <Card sx={card}>
            <ReactPlayer playing muted url={remoteStream}/>
            <Typography sx={typography}>Guest</Typography>
          </Card>
        }
        </Paper>
    </div>
  )
}

export default Room;