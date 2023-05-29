import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider';
import ReactPlayer from 'react-player';
import peer from '../services/peer';

const Room = () => {

  const [ remoteSocketId, setRemoteSocketId ] = useState(null);
  const [ myStream, setMyStream ] = useState();

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
    
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    const ans = await peer.getAnswer(offer);
    socket.emit("call:accepted", {to: from, ans });
  }, [socket])
  
  const handleCallAccepted = useCallback(({from, ans}) => {
    peer.setLocalDescription(ans);
  }, [])

  useEffect(() => {
    socket.on('user:joined', handleUserJoined);
    socket.on('incoming:call', handleIncomingCall);
    socket.on('call:accepted', handleCallAccepted);
    return () => {
        socket.off('user:joined', handleUserJoined);
        socket.off('incoming:call', handleIncomingCall);
        socket.off('call:accepted', handleCallAccepted);
    }
  },[socket, handleUserJoined, handleIncomingCall, handleCallAccepted]);

  return (
    <div>
        <h1>Room</h1>
        <h4>{remoteSocketId ? "Connected" : "No one in room" }</h4>
        {
          remoteSocketId && <button onClick={handleCallUser}>CALL</button>
        }
        {
          myStream && 
          <>
            <ReactPlayer playing muted url={myStream}/>
            <h5>You</h5>
          </>
        }
    </div>
  )
}

export default Room;