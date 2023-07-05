import { FC, useState, useEffect } from "react";
import styled from "styled-components";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setJoinNum } from "../app/user/userSlice";
import { GameState } from "../views/Game";

type Props = {
  socketRef: React.MutableRefObject<WebSocket | undefined>;
  setGameState: (state: GameState) => void;
};

export const StandbyGame: FC<Props> = (props) => {
  const roomid = useSelector((state: any) => state.user.roomId);
  const isOwner = useSelector((state: any) => state.user.isOwner);
  const dispatch = useDispatch();
  console.log(isOwner);
  const socketRef = props.socketRef;
  const [userNames, setUserNames] = useState([]);
  const navigate = useNavigate();
  var flag = 0;

  // status:
  // 0: WebSocket 接続前
  // 1: WebSocket 接続失敗
  // 2: WebSocket 接続成功
  const [status, setStatus] = useState(0);

  useEffect(() => {
    localStorage.setItem("isOwner", isOwner);
  }, [isOwner]);

  // WebSocket
  useEffect(() => {
    if (flag == 0) {
      flag = 1;
      // ソケットエラー
      if (socketRef.current) {
        socketRef.current.onerror = function () {
          setStatus(1);
        };
      }

      // サーバーからのソケット受け取り
      if (socketRef.current) {
        console.log("socket connect");
        socketRef.current.onmessage = function (event) {
          var msg = JSON.parse(event.data);
          switch (msg["command"]) {
            case "update_members":
              console.log(msg["content"]["user_name"]);
              setUserNames(msg["content"]["user_name"]);
              break;
            case "role":
              if (isOwner)
                dispatch(setJoinNum(userNames.length));
              if (msg["content"]["isQuestioner"])
                props.setGameState(GameState.Questioner);
              else
                props.setGameState(GameState.Answerer);
              break;
          }
          setStatus(2);
        };
      }
    }
  }, []);

  const startGame = function () {
    // ゲームを開始するとき
    var sendJson = { command: "start_game" };
    socketRef.current?.send(JSON.stringify(sendJson));
  };

  const cancelGame = function () {
    // ゲームをキャンセルするとき
    localStorage.removeItem("isOwner");
    props.setGameState(GameState.Init);
    navigate("/");
  };

  const exitRoom = function () {
    // 部屋を抜けるとき
    var sendJson = { command: "leave" };
    socketRef.current?.send(JSON.stringify(sendJson));
    socketRef.current?.close();
    props.setGameState(GameState.Init);
    navigate("/");
  };

  const backHome = function () {
    navigate("/");
  };

  // 部屋検索中
  if (status == 0) {
    return (
      <>
        <StyledPage>
          {" "}
          <h3>部屋を検索中...</h3>
        </StyledPage>
      </>
    );
  }

  // 部屋が見つからないとき
  if (status == 1) {
    return (
      <>
        <StyledPage>
          <h3>部屋が見つかりませんでした</h3>
          <div>
            <StyledButton onClick={backHome}>戻る</StyledButton>
          </div>
        </StyledPage>
      </>
    );
  }

  const userList = [];
  for (const [idx, userName] of userNames.entries()) {
    userList.push(<StyledUser key={idx}>{userName}</StyledUser>);
  }

  // オーナー
  if (isOwner) {
    return (
      <>
        <StyledPage>
          <h2>部屋 ID</h2>
          <h1>{roomid}</h1>
          <div>
            <StyledButton onClick={startGame}>ゲームを始める</StyledButton>
          </div>
          <div>
            <StyledButton onClick={cancelGame}>ゲームをキャンセル</StyledButton>
          </div>
          <StyledHr></StyledHr>
          <h2>参加者</h2>
          <div>{userList}</div>
        </StyledPage>
      </>
    );
  }

  // オーナーじゃない
  return (
    <>
      <StyledPage>
        <h2>部屋 ID</h2>
        <h1>{roomid}</h1>
        <div>
          <StyledButton onClick={startGame}>ゲームを始める</StyledButton>
        </div>
        <div>
          <StyledButton onClick={exitRoom}>部屋を抜ける</StyledButton>
        </div>
        <StyledHr></StyledHr>
        <h2>参加者</h2>
        <div>{userList}</div>
      </StyledPage>
    </>
  );
};

const StyledHr = styled.hr`
  border-color: #646cff;
  margin-top: 40px;
  width: 360px;
`;

const StyledUser = styled.h2`
  padding: 0;
  margin: 0;
  font-weight: 500;
`;
const StyledPage = styled.div`
  padding: 100px 0px;
`;

const StyledButton = styled.button`
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  margin: 1em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  width: 300px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: border-color 0.25s;
  &:hover {
    border-color: #646cff;
  }
  &:focus,
  &:focus-visible {
    outline: 4px auto -webkit-focus-ring-color;
  }
`;
