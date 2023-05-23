import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import styled from "styled-components";

type RoomId = {
  id: number;
}

export const LoginedHome = () => {
  const navigate = useNavigate();

  const [errorMsg, setErrorMsg] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RoomId>({
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<RoomId> = (data) => {
    console.log(data.id);
    const xmlHttpRequest = new XMLHttpRequest();
    let url = 'http://localhost:8000/room/:id';
    xmlHttpRequest.open('POST', url);
    let jsonData = JSON.stringify(data);
    xmlHttpRequest.send(jsonData);

    xmlHttpRequest.onreadystatechange = () => {
      if (xmlHttpRequest.readyState == 4) {
        if (xmlHttpRequest.status == 200) {
            roomSuccess();
        } else { // if (xmlHttpRequest.status == 401) {
            roomError();
        }
      }
    }

    reset();
  }

  const roomSuccess = () => {
    navigate("/");
  };

  const roomError = () => {
    setErrorMsg("部屋が見つかりません");
  };

  return (
    <>
      <StyledForm>
        <form action={"/"} method="GET" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <StyledInput 
              id = "userID"
              type = "text"
              placeholder = "部屋ID"
              {...register('id', { 
                required: '部屋IDを入力してください', 
                pattern: {
                    value:
                        /^[A-Za-z0-9-]+$/i,
                message: '部屋IDの形式が不正です',
                }, 
              })}
            />
          </div>
          <StyledErrorMessage>
            <ErrorMessage errors={errors} name="id" render={({message}) => <span>{message}</span>} />
          </StyledErrorMessage>
          <StyledButton type="submit">部屋IDで参加</StyledButton>
          <StyledErrorMessage>{errorMsg}</StyledErrorMessage>
        </form>
        <div>
          <StyledButton>部屋を作成</StyledButton>
        </div>
      </StyledForm>
    </>
  );
};

const StyledForm = styled.div`
  border-radius: 20px;
  position: relative;
  z-index: 1;
  background: #FFFFFF;
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