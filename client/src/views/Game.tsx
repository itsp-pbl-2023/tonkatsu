import React, { useState } from "react";
import { useEffect } from "react";
import { StandbyGame } from "../components/StandbyGame";
import { useSelector } from "react-redux";
import Questioner from "./Questioner";

export const GameState = {
  Init: 0,
  Standby: 1,
  Questioner: 2,
  Answerer: 3,
  Result: 4
}

export type GameState = typeof GameState[keyof typeof GameState];

export const Game = function() {

  const roomid = useSelector((state: any) => state.user.roomId);
  const [gameState, setGameState] = useState<GameState>(GameState.Init);

  const socketRef = React.useRef<WebSocket>();
  var flag = 0;

  // WebSocket
  useEffect(() => {
    if (gameState == GameState.Init && flag == 0) {
      flag = 1;
      setGameState(GameState.Standby);
      var socket = new WebSocket("ws://localhost:8000/ws?roomid=" + roomid);
      socketRef.current = socket;
      console.log('SocketRef OK');
    }
  },[])

  switch (gameState) {
  case GameState.Standby:
    return (
      <>
        <StandbyGame socketRef={socketRef} setGameState={setGameState} />
      </>
    );
  case GameState.Questioner:
  case GameState.Answerer:
  case GameState.Result:
  default:
    break;
  }

  return (<></>);
};