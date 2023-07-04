import React, { FC, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ErrorMessage } from "@hookform/error-message";
import styled from "styled-components";
import { GameState, ResultJson } from "../views/Game";
import { DescriptionList, CorrectUserList } from "./GameComponents";
import { useCookies } from "react-cookie";

const AnswerState = {
  WaitQuestionerAnswer: 0,
  SubmittingAnswer: 1,
  WaitJudge: 2,
  Result: 3,
  Error: 4
};

type AnswerState = (typeof AnswerState)[keyof typeof AnswerState];

type Props = {
  socketRef: React.MutableRefObject<WebSocket | undefined>;
  setGameState: (state: GameState) => void;
  moveResult: (json: ResultJson) => void;
};

type Topic = {
  answer: string;
};

type ButtonProps = {
  isCorrect?: boolean;
};

type answerer = {
  user: string;
  answer: string;
  isCorrect: number;
};

export const Answerer: FC<Props> = (props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Topic>({
    mode: "onChange",
  });

  const navigate = useNavigate();
  const socketRef = props.socketRef;
  var flag = 0;
  const [status, setStatus] = useState<AnswerState>(AnswerState.WaitQuestionerAnswer);
  const [explanations, setExplanations] = useState([
    {
      description: "ここに質問が順次追加される↓",
      index: 0,
    },
    {
      description: "ここに質問が順次追加される↓",
      index: 1,
    },
  ]);
  const [answer, setAnswer] = useState("");
  const [userid] = useCookies(["userID"]);
  const [correctUserList, setCorrectUserList] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);

  // WebSocket
  useEffect(() => {
    if (flag == 0) {
      flag = 1;

      // ソケットエラー
      if (socketRef.current) {
        socketRef.current.onerror = function () {
          setStatus(AnswerState.Error);
        };
      }

      // サーバーからのソケット受け取り
      if (socketRef.current) {
        socketRef.current.onmessage = function (event) {
          var msg = JSON.parse(event.data);
          switch (msg["command"]) {
            case "game_description":
              if (isCorrect) {
                props.setGameState(GameState.Questioner);
                break;
              }
              setExplanations(explanations.concat(msg["content"]));
              setStatus(AnswerState.SubmittingAnswer);
              break;
            case "game_answerer_checked":
              setCorrectUserList(msg["content"]["correctUserList"]);
              for (const correctUser of correctUserList) {
                if (correctUser === userid)
                  setIsCorrect(true);
              }
              setStatus(AnswerState.Result);
              break;
            case "game_show_result":
              props.moveResult(msg);
              break;
          }
        };
      }
    }
  }, []);

  const onSubmit: SubmitHandler<Topic> = (data) => {
    setAnswer(data.answer);
    var sendJson = {
      command: "game_answerer_answer",
      content: {
        answer: data.answer
      },
    };
    socketRef.current?.send(JSON.stringify(sendJson));
    setStatus(AnswerState.WaitJudge);
    reset();
  };

  const backHome = function () {
    props.setGameState(GameState.Init);
    navigate("/");
  };

  switch (status) {

  // 出題者の回答待ち  
  case AnswerState.WaitQuestionerAnswer:
    return (
      <>
        <StyledPage>
          <h3>待機中...</h3>
        </StyledPage>
      </>
    );

  // 解答を入力するとき
  case AnswerState.SubmittingAnswer:
    return (
      <>
        <StyledPage>
          <DescriptionList contents={explanations}></DescriptionList>
          <StyledForm>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div>
                <div>
                  <StyledInput
                    id="answer"
                    type="text"
                    {...register("answer", {
                      required: "解答を入力してください",
                      maxLength: {
                        value: 30,
                        message: "30文字以内で入力してください",
                      },
                      pattern: {
                        value: /^[A-Za-z0-9ぁ-んーァ-ヶーｱ-ﾝﾞﾟ一-龠]+$/i,
                        message: "入力の形式が不正です",
                      },
                    })}
                  />
                </div>
                <StyledErrorMessage>
                  <ErrorMessage
                    errors={errors}
                    name="answer"
                    render={({ message }) => <span>{message}</span>}
                  />
                </StyledErrorMessage>
                <StyledButton>送信</StyledButton>
              </div>
            </form>
          </StyledForm>
        </StyledPage>
      </>
    );
  
  case AnswerState.WaitJudge:
    return (
      <>
        <StyledPage>
          <DescriptionList contents={explanations}></DescriptionList>
          <p>あなたの解答</p>
          <h2>{answer}</h2>
        </StyledPage>
      </>
    );
  
  case AnswerState.Result:
    return (
      <>
        <StyledPage>
          <h2>正解者</h2>
          <CorrectUserList correctUsers={correctUserList}></CorrectUserList>
          <p>あなたは...</p>
          <h2>{isCorrect ? ("正解!") : ("違うよ!")}</h2>
        </StyledPage>
      </>
    );

  default:
    break;
  }

  // エラー
  return (
    <>
      <StyledPage>
        <h3>接続に失敗しました</h3>
        <div>
          <StyledButton onClick={backHome}>戻る</StyledButton>
        </div>
      </StyledPage>
    </>
  );
};

const StyledPage = styled.div`
  padding: 50px 0px;
`;

const StyledForm = styled.div`
  border-radius: 20px;
  position: relative;
  z-index: 1;
  background: #ffffff;
  width: 500px;
  margin: 0 auto 100px;
  padding: 45px;
  text-align: center;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24);
`;

const StyledScreen = styled.div`
  border-radius: 20px;
  position: relative;
  z-index: 1;
  background: #ffffff;
  width: 700px;
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
  height: 40px;
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

const StyledErrorMessage = styled.div`
  color: red;
  font-size: 14px;
`;

const StyledAnswer = styled.div`
  width: 60%;
  display: inline-block;
  position: relative; 
  margin: 5px 0 0 30px;
  padding: 17px 13px;
  border-radius: 12px;
  background: #d7ebfe;
  &:after {
    content: "";
    display: inline-block;
    position: absolute;
    top: 18px; 
    left: -24px;
    border: 12px solid transparent;
    border-right: 12px solid #d7ebfe;
  }
  &:p {
  margin: 0;
  padding: 0;
`;

const StyledQuizButton = styled.button<ButtonProps>`
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  color: #fff;
  text-decoration: none;
  text-align: center;
  margin: 10px 0;
  background-color: ${({ isCorrect }) => (isCorrect ? "	#98FB98" : "#FA8072")};
`;

const StyledHr = styled.hr`
  border-color: #646cff;
  width: auto;
`;
