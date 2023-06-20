import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { useDispatch } from "react-redux";
import { becomeOwner, createRoom } from "../app/user/userSlice";
import styled from "styled-components";

type RoomId = {
  id: string;
};

export const LoginedHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string>("");

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<RoomId>({
    mode: "onChange",
  });

  const joinButton: SubmitHandler<RoomId> = (data) => {
    if (data.id.length != 6) {
      setErrorMsg("6桁で入力してください");
    } else {
      console.log(data.id);
      dispatch(createRoom(data.id));
      roomSuccess();
    }
    reset();
  };

  const createButton = () => {
    const xmlHttpRequest = new XMLHttpRequest();
    let url = "http://localhost:8000/room";
    xmlHttpRequest.open("POST", url);
    xmlHttpRequest.send();

    xmlHttpRequest.onreadystatechange = () => {
      if (xmlHttpRequest.readyState == 4) {
        if (xmlHttpRequest.status == 201) {
          const jsonObj = JSON.parse(xmlHttpRequest.responseText);
          dispatch(createRoom(jsonObj.roomId));
          dispatch(becomeOwner());
        }
      }
      roomSuccess();
    };
  };

  const roomSuccess = () => {
    navigate("/standby");
  };

  return (
    <>
      <StyledForm>
        <form onSubmit={handleSubmit(joinButton)}>
          <div>
            <StyledInput
              type="text"
              placeholder="6桁の部屋ID"
              {...register("id", {
                required: "部屋IDを入力してください",
                maxLength: {
                  value: 6,
                  message: "6桁で入力してください",
                },
                pattern: {
                  value: /^[0-9-]+$/i,
                  message: "部屋IDの形式が不正です",
                },
              })}
            />
          </div>
          <StyledErrorMessage>
            <ErrorMessage
              errors={errors}
              name="id"
              render={({ message }) => <span>{message}</span>}
            />
          </StyledErrorMessage>
          <StyledButton type="submit">部屋IDで参加</StyledButton>
          <StyledErrorMessage>{errorMsg}</StyledErrorMessage>
        </form>
        <div>
          <StyledButton onClick={createButton}>部屋を作成</StyledButton>
        </div>
      </StyledForm>
    </>
  );
};

const StyledForm = styled.div`
  border-radius: 20px;
  position: relative;
  z-index: 1;
  background: #ffffff;
  max-width: 360px;
  margin: 0 auto 100px;
  padding: 45px;
  text-align: center;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24);
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

const StyledInput = styled.input`
  border-radius: 100px;
  border: 1px solid #535bf2;
  padding: 8px 16px;
  margin: 10px;
  width: 80%;
  height: 20px;
  font-size: 1em;
`;

const StyledErrorMessage = styled.div`
  color: red;
  font-size: 14px;
`;

// Reduxで部屋作成者かを判断
// submithandlerの仕様
// POST,GET
// リロードするとオーナー情報が初期化される