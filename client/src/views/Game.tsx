import React, { useState } from "react";
import { useEffect } from "react";
import { StandbyGame } from "../components/StandbyGame";
import { Questioner } from "../components/Questioner";
import { Result } from "../components/Result";
import { AllResult } from "../components/AllResult";
import { Answerer } from "../components/Answerer";
import { useSelector } from "react-redux";

export const GameState = {
  Init: 0,
  Standby: 1,
  Questioner: 2,
  Answerer: 3,
  Result: 4,
  AllResult: 5,
};

export type GameState = (typeof GameState)[keyof typeof GameState];

export type ResultJson = {
  command: string; 
  content: {
    result: {
      userName: string;
      score: number;
    }[]; 
    question: string; 
    questioner: string
  }
};

export type AllResultJson = {
  command: string; 
  content: {
    result: {
      userName: string;
      score: number;
    }[];
  }
};

export const Game = function () {
  const roomid = useSelector((state: any) => state.user.roomId);
  const [gameState, setGameState] = useState<GameState>(GameState.Init);
  const [result, setResult] = useState<ResultJson>({
    command: "", 
  content: {
    result: [], 
    question: "", 
    questioner: ""
  }
  });
  const [allResult, setAllResult] = useState<AllResultJson>({
    command: "", 
  content: {
    result: [],
  }
  });

  const socketRef = React.useRef<WebSocket>();
  var flag = 0;

  // WebSocket
  useEffect(() => {
    if (gameState == GameState.Init && flag == 0) {
      flag = 1;
      setGameState(GameState.Standby);
      var socket = new WebSocket("ws://localhost:8000/ws?roomid=" + roomid);
      socketRef.current = socket;
      console.log("SocketRef OK");
    }
  }, []);

  const moveResult = (json: ResultJson) => {
    setResult(json);
    setGameState(GameState.Result);
  }

  const moveAllResult = (json: AllResultJson) => {
    setAllResult(json);
    setGameState(GameState.AllResult);
  }

  switch (gameState) {
    case GameState.Standby:
      return (
        <>
          <StandbyGame socketRef={socketRef} setGameState={setGameState} />
        </>
      );
    case GameState.Questioner:
      return (
        <>
          <Questioner socketRef={socketRef} setGameState={setGameState} moveResult={moveResult}/>
        </>
      );
    case GameState.Answerer:
      return (
        <>
          <Answerer socketRef={socketRef} setGameState={setGameState} moveResult={moveResult} />
        </>
      );
    case GameState.Result:
      return (
        <>
          <Result socketRef={socketRef} setGameState={setGameState} result={result} moveAllResult={moveAllResult}/>
        </>
      );
    case GameState.AllResult:
      return (
        <>
          <AllResult setGameState={setGameState} result={allResult}/>
        </>
      );
    default:
      break;
  }

  return <></>;
};
