import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider';
import ReactPlayer from 'react-player';
import peer from '../services/peer';
import { Box, Button, Card, IconButton, Paper, Typography } from '@mui/material';
import CallIcon from '@mui/icons-material/Call';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';

const head = {
  backgroundColor: '#33171d',
  // height: {
  //   sm: '97vh',
  //   md: '97vh'
  // }
  height: '94vh',
};

const paper = {
  display: 'flex',
  flexDirection: {
    xs: 'column',
    md: 'row',
  },
  justifyContent: 'space-evenly',
  backgroundColor: 'inherit',
  marginTop: '4vh',
  marginLeft: {
    xs: '9vw',
    xl: '0px'
  },
  height: '55vh'
};

const card = {
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: '#373c47',
  padding: '1rem 0 0 0',
  borderRadius: '20px',
  height: {
    xs: '25vh',
    xl: '40vh'
  },
  width: {
    xs: '80vw',
    xl: '27vw'
  }
};
const box = {
  marginTop: '2vh',
  display: 'flex',
  justifyContent: 'center',
}

const typography = {
  color: '#fff',
  marginTop: {
    xs: '9.5vh',
    sm: '5vh',
    md: '5vh',
    lg: '5vh',
    xl: '6vh'
  },
};
const typography2 = {
  color: '#fff',
  marginTop: {
    xs: '3vh',
    sm: '5vh',
    md: '5vh',
    lg: '5vh',
    xl: '3vh'
  },
};

const callButton = {
  backgroundColor: 'red',
  color: '#fff',
  ":hover": {
    backgroundColor: "#de474c",
  },
  margin: '10px'
};
const acceptButton = {
  marginLeft: '20px',
  padding: '0'
}

const reactPlayer = {
  height: '20vh'
};

const Room = () => {

  const [ remoteSocketId, setRemoteSocketId ] = useState(null);
  const [ myStream, setMyStream ] = useState();
  const [ remoteStream, setRemoteStream ] = useState();
  const [ isAudioOn, setIsAudioOn ] = useState(true);
  const [ isVideoOn, setIsVideoOn ] = useState(true);

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

  const handleMuteAudio = useCallback(() => {
    console.log(`Audio: ${myStream.audio}`);
    myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    setIsAudioOn(!isAudioOn);
  }, [myStream, isAudioOn])

  const handleMuteVideo = useCallback(() => {
    console.log(`Video: ${myStream.video}`);
    myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    setIsVideoOn(!isVideoOn)
  }, [myStream, isVideoOn])

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
        <Typography variant='body1' sx={typography2} align='center'>{remoteSocketId ? "Connected" : "No one in room" }</Typography>
        <Box sx={box}>
        {
          remoteSocketId && 
          <IconButton sx={callButton} size='large' onClick={handleCallUser}>
            <CallIcon fontSize='inherit'/>
          </IconButton>
        }
        { myStream && <Button variant='contained' style={acceptButton} onClick={sendStream}>Accept</Button>}
        </Box>
        <Paper sx={paper}>
        {
          myStream && 
          <Card sx={card}>
            <ReactPlayer playing url={myStream} style={reactPlayer} height={'95%'} width={'100%'} />
            {/* <Typography sx={typography}>You</Typography> */}
          </Card>
        }
        {
          remoteStream && 
          <Card sx={card}>
            <ReactPlayer playing muted url={remoteStream} sx={reactPlayer} height={'95%'} width={'100%'} />
            {/* <Typography sx={typography}>Guest</Typography> */}
          </Card>
        }
        </Paper>
        <Box sx={box}>
          <IconButton sx={callButton} onClick={handleMuteAudio}>
          {
            isAudioOn ? <MicIcon /> : <MicOffIcon />
          }
          </IconButton>
          <IconButton sx={callButton} onClick={handleMuteVideo}>
          {
            isVideoOn ? <VideocamOutlinedIcon /> :  <VideocamOffOutlinedIcon />
          }
          </IconButton>
        </Box>
    </div>
  )
}

export default Room;