import { useState, useEffect } from "react";
import styled from "styled-components";
import React from "react"
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export const StandbyGame = function() {

	const roomid = useSelector((state: any) => state.user.roomId);
  const isOwner = useSelector((state: any) => state.user.isOwner);
  const socketRef = React.useRef<WebSocket>();
  const [userNames, setUserNames] = useState(["hello", "user", "name"]);
	const navigate = useNavigate();

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
		var socket = new WebSocket("ws://localhost:8000/ws?roomid=" + roomid);
    socketRef.current = socket;

    // ソケットエラー
		socket.onerror = function() {
      setStatus(1);
		};

    // サーバーからのソケット受け取り
		socket.onmessage = function (event) {
			var msg = JSON.parse(event.data);
      switch(msg['command']) {
      case 'update_members':
        setUserNames(msg['command']['user_name'])
      }
      setStatus(2);
		};
  },[])

  const startGame = function() {
    // ゲームを開始するとき
  }

  const cancelGame = function() {
    // ゲームをキャンセルするとき
    localStorage.removeItem("isOwner");
  }

  const exitRoom = function() {
    // 部屋を抜けるとき
    var sendJson = {"command": "leave"};
    socketRef.current?.send(JSON.stringify(sendJson));
  }

	const backHome = function() {
		navigate("/");
	}

  // 部屋検索中
  if (status == 0) {
    return (
      <>
        <h3>部屋を検索中...</h3>
      </>
    );
  }

  // 部屋が見つからないとき
  if (status == 1) {
		return (
      <>
        <h3>部屋が見つかりませんでした</h3>
				<div>
          <StyledButton onClick={backHome}>戻る</StyledButton>
        </div>
      </>
    );
  }

  const userList = [];
  for (const userName of userNames) {
    userList.push(<StyledUser>{userName}</StyledUser>)
  }

  // オーナー
  if (localStorage.getItem("isOwner") == "true") {
    return (
      <>
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
        <div>
          {userList}
        </div>
      </>
    );
  }

  // オーナーじゃない
  return (
    <>
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
      <div>
        {userList}
      </div>
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
