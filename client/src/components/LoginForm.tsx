import { FC, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { Link, useNavigate } from "react-router-dom";

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
    const hash = "hash";
    // const hash = TODO: HASH
    const Http = new XMLHttpRequest();
    let url;
    if (props.isLogin) {
      url = 'http://localhost:8000/login';
    } else {
      url = 'http://localhost:8000/account';
    }
    Http.open('POST', url);
    const sendData: AccountData = {
        userName: data.userName,
        password: hash
    }
    let loginInfo = JSON.stringify(sendData);
    console.log(loginInfo);
    Http.send(loginInfo);

    Http.onreadystatechange = (e) => {
      console.log(Http.responseText)
    }

    if (data.userName === "user" && data.password === "password") {
      loginSuccess();
    } else {
      loginErrorMsg();
    }
    reset();
  }

  const loginSuccess = () => {
    navigate("/");
  }

  const loginErrorMsg = () => {
    setErrorMsg("NG");
  }

  return (
    <>
      <div>
        <form action={props.isLogin ? "/" : "/account"} method="GET" onSubmit={handleSubmit(onSubmit)}>
          {props.isLogin
            ? <h1>login</h1>
            : <h1>register</h1>
          }
          <hr />
          <div>
            <p>{errorMsg}</p>
            <div>
              <label htmlFor="userID">userID</label>
              <hr />
              <input 
                id = "userID"
                type="text"
                placeholder = "userID"
                {...register('userName', { 
                  required: 'ユーザーIDを入力してください。', 
                  maxLength: {
                      value: 20,
                      message: '20文字以内で入力してください。'
                  },
                  pattern: {
                      value:
                          /^[A-Za-z0-9-]+$/i,
                  message: 'ユーザーIDの形式が不正です。',
                  }, 
                })}
              />
            </div>
            <ErrorMessage errors={errors} name="userName" render={({message}) => <span>{message}</span>} />
            <div>
              <label htmlFor="password">password</label>
              <hr />
              <input
                id = "password"
                type = "password"
                placeholder = "password"
                role = "password"
                {...register('password', { 
                  required: 'パスワードを入力してください。', 
                  maxLength: {
                      value: 20,
                      message: '20文字以内で入力してください',
                  },
                  pattern: {
                      value:
                          /^[A-Za-z0-9]+$/i,
                  message: 'パスワードの形式が不正です。',
                  }, 
                })} 
              />
            </div>
            <ErrorMessage errors={errors} name="password" render={({message}) => <span>{message}</span>} />
            <button
              type = "submit"
              >login</button>
          </div>
        </form>
        {props.isLogin
            ? <div>新規登録は<Link to={`/account/`}>こちら</Link></div>
            : <div>ログインは<Link to={`/Login/`}>こちら</Link></div>
        }
      </div>
    </>
  );
};

export default LoginForm;