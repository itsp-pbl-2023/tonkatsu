import { FC, useState } from "react";
import styled from "styled-components";

type Props = {
    isOwner: boolean;
}


export const StandbyGame: FC<Props> = props => {

  const xhr = new XMLHttpRequest();
  xhr.open('GET', "http://localhost:8000");
  xhr.responseType = 'json';
  xhr.send();

  xhr.onload = function() {
    if (xhr.status == 200) {
      let responceObj = xhr.response;
    }
  }

  // WebSocket
  var socket = new WebSocket("wss://localhost:8000");

  socket.onmessage = function (event) {
    console.log(event.data);
    var msg = JSON.parse(event.data);
  }

  const roomID = "TestRoom";

  const startGame = function() {
    // ゲームを開始するとき
  }

  const cancelGame = function() {
    // ゲームをキャンセルするとき
  }

  const exitRoom = function() {
    // 部屋を抜けるとき
  }

  if (props.isOwner) {
    return (
      <>
        <h2>部屋 ID</h2>
        <h1>{roomID}</h1>
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
      <h1>{roomID}</h1>
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
