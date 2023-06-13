import { useState, useEffect } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";

export const StandbyGame = function() {

	const roomid = "test"
	const isOwner = false;
	const navigate = useNavigate();

	// status:
	// 0: WebSocket 接続前
	// 1: WebSocket 接続失敗
  // 2: WebSocket 接続成功
	const [status, setStatus] = useState(0);

  // WebSocket
  useEffect(() => {
		var socket = new WebSocket("ws://localhost:8000/ws?roomid=" + roomid);
		socket.onerror = function() {
			console.log("hello");
      setStatus(1);
		}

		socket.onmessage = function (event) {
			console.log(event.data);
			var msg = JSON.parse(event.data);
      console.log(msg['command']);1
      setStatus(2);
		}
  },[])

  const startGame = function() {
    // ゲームを開始するとき
  }

  const cancelGame = function() {
    // ゲームをキャンセルするとき
  }

  const exitRoom = function() {
    // 部屋を抜けるとき
  }

	const backHome = function() {
		navigate("/");
	}

  if (status == 0) {
    return (
      <>
        <h3>部屋を検索中...</h3>
      </>
    );
  }

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

  if (isOwner) {
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
      </>
    );
  }

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
    </>
  );
};

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
