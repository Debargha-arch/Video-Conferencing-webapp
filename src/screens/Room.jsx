import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider';
import ReactPlayer from 'react-player';
import peer from '../services/peer';

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
    <div>
        <h1>Room</h1>
        <h4>{remoteSocketId ? "Connected" : "No one in room" }</h4>
        {
          remoteSocketId && <button onClick={handleCallUser}>CALL</button>
        }
        { myStream && <button onClick={sendStream}>Send Stream</button>}
        <>
        {
          myStream && 
          <>
            <ReactPlayer playing muted url={myStream}/>
            <h5>You</h5>
          </>
        }
        {
          remoteStream && 
          <>
            <ReactPlayer playing muted url={remoteStream}/>
            <h5>Guest</h5>
          </>
        }
        </>
    </div>
  )
}

export default Room;