import { FC, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";

type Props = {
  isLogin: boolean;
}

type AccountData = {
  userName: string;
  password: string;
};

export const LoginForm: FC<Props> = props => {
  const navigate = useNavigate();

  const [errorMsg, setErrorMsg] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AccountData>({
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<AccountData> = (data) => {
    console.log(data.userName);
    console.log(data.password);
    const xmlHttpRequest = new XMLHttpRequest();
    let url;
    if (props.isLogin) {
      url = 'http://localhost:8000/login';
    } else {
      url = 'http://localhost:8000/account';
    }
    xmlHttpRequest.open('POST', url);
    let jsonData = JSON.stringify(data);
    xmlHttpRequest.send(jsonData);

    xmlHttpRequest.onreadystatechange = () => {
      if (xmlHttpRequest.readyState == 4) {
        if (xmlHttpRequest.status == 200) {
            console.log(xmlHttpRequest)
            loginSuccess();
        } else { // if (xmlHttpRequest.status == 401) {
            loginErrorMsg();
        }
      }
    }

    reset();
  }

  const loginSuccess = () => {
    navigate("/");
  }

  const loginErrorMsg = () => {
    if (!props.isLogin) { 
      setErrorMsg("このユーザIDは既に使われてます");
    } else {
      setErrorMsg("ユーザIDまたはパスワードが違います");
    }
  }

  return (
    <>
      <StyledForm>
        {props.isLogin
          ? <h2>ログイン</h2>
          : <h2>新規登録</h2>
        }
        <form action={props.isLogin ? "/" : "/account"} method="GET" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <div>
              <StyledInput 
                id = "userID"
                type = "text"
                placeholder = "userID"
                {...register('userName', { 
                  required: 'ユーザーIDを入力してください', 
                  maxLength: {
                      value: 20,
                      message: '20文字以内で入力してください'
                  },
                  pattern: {
                      value:
                          /^[A-Za-z0-9-]+$/i,
                  message: 'ユーザーIDの形式が不正です',
                  }, 
                })}
              />
            </div>
            <StyledErrorMessage>
              <ErrorMessage errors={errors} name="userName" render={({message}) => <span>{message}</span>} />
            </StyledErrorMessage>
            <div>
              <StyledInput
                id = "password"
                type = "password"
                placeholder = "password"
                role = "password"
                {...register('password', { 
                  required: 'パスワードを入力してください', 
                  maxLength: {
                      value: 20,
                      message: '20文字以内で入力してください',
                  },
                  pattern: {
                      value:
                          /^[A-Za-z0-9]+$/i,
                  message: 'パスワードの形式が不正です',
                  }, 
                })} 
              />
            </div>
            <StyledErrorMessage>
              <ErrorMessage errors={errors} name="password" render={({message}) => <span>{message}</span>} />
            </StyledErrorMessage>
            <StyledButton
              type = "submit"
              >{props.isLogin ? "ログイン" : "新規登録"}</StyledButton>
            <StyledErrorMessage>{errorMsg}</StyledErrorMessage>
          </div>
        </form>
        {props.isLogin
            ? <StyledMessage>新規登録は<Link to={`/account/`}>こちら</Link></StyledMessage>
            : <StyledMessage>ログインは<Link to={`/Login/`}>こちら</Link></StyledMessage>
        }
      </StyledForm>
    </>
  );
};

export default LoginForm;

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

const StyledInput = styled.input`
  border-radius: 100px;
  border: 1px solid #535bf2;
  padding: 8px 16px;
  margin: 10px;
  width: 80%;
  height: 20px;
  font-size: 1em;
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

const StyledMessage = styled.p`
  margin: 15px 0 0;
  color: #b3b3b3;
`;

const StyledErrorMessage = styled.div`
  color: red;
  font-size: 14px;
`;
