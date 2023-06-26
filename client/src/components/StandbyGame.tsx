import { useState, useEffect } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export const StandbyGame = function () {
  const roomid = useSelector((state: any) => state.user.roomId);
  const isOwner = useSelector((state: any) => state.user.isOwner);

  useEffect(() => {
    localStorage.setItem("isOwner", isOwner);
  }, [isOwner]);
  const navigate = useNavigate();

  // status:
  // 0: WebSocket 接続前
  // 1: WebSocket 接続失敗
  // 2: WebSocket 接続成功
  const [status, setStatus] = useState(0);

  // WebSocket
  useEffect(() => {
    var socket = new WebSocket("ws://localhost:8000/ws?roomid=" + roomid);
    socket.onerror = function () {
      console.log("hello");
      setStatus(1);
    };

    socket.onmessage = function (event) {
      console.log(event.data);
      var msg = JSON.parse(event.data);
      console.log(msg["command"]);
      1;
      setStatus(2);
    };
  }, []);

  const startGame = function () {
    // ゲームを開始するとき
  };

  const cancelGame = function () {
    localStorage.removeItem("isOwner");
    // ゲームをキャンセルするとき
  };

  const exitRoom = function () {
    // 部屋を抜けるとき
  };

  const backHome = function () {
    navigate("/");
  };

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

  if (localStorage.getItem("isOwner")) {
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
        </StyledPage>
      </>
    );
  }

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
      </StyledPage>
    </>
  );
};

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
  width: 330px;
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
