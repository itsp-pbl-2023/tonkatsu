import React, { FC, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ErrorMessage } from "@hookform/error-message";
import { HStack, VStack } from "@chakra-ui/react";
import styled from "styled-components";
import { GameState, ResultJson } from "../views/Game";
import { Explanation, DescriptionList, CorrectUserList } from "./GameComponents";
import { useSelector } from "react-redux";

type Props = {
  socketRef: React.MutableRefObject<WebSocket | undefined>;
  setGameState: (state: GameState) => void;
  moveResult: (json: ResultJson) => void;
};

type Topic = {
  topic: string;
  question: string;
};

type ButtonProps = {
  isCorrect?: boolean;
};

type Answerer = {
  user: string;
  answer: string;
  isCorrect: number;
};

const QuestionerState = {
  SubmittingQuestion: 0,
  JudgingAnswer: 1,
  Result: 2,
  Wait: 3,
  Error: 4
};

type QuestionerState = (typeof QuestionerState)[keyof typeof QuestionerState];

export const Questioner: FC<Props> = (props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Topic>({
    mode: "onChange",
  });

  const topics: string[] = [
    "好きな食べ物は？",
    "好きな本は？",
    "好きな動物は？",
    "好きなアーティストは？",
    "好きなポケモンは？",
  ];

  const rand = (): number => {
    return Math.floor(Math.random() * topics.length);
  };

  const navigate = useNavigate();
  const socketRef = props.socketRef;
  var flag = 0;

  const joinNum = useSelector((state: any) => state.user.joinNum);
  const allAnswererNum = joinNum - 1;
  console.log(allAnswererNum);
  const [answererNum, setAnswererNum] = useState<number>(allAnswererNum);

  const [topic, setTopic] = useState(topics[rand()]);
  const [question, setQuestion] = useState("");
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [answerers, setAnswerers] = useState<Answerer[]>(() => []);
  const [correctUserList, setCorrectUserList] = useState<string[]>([]);

  const [status, setStatus] = useState<QuestionerState>(QuestionerState.SubmittingQuestion);

  // WebSocket
  useEffect(() => {
    if (flag == 0) {
      flag = 1;
      // ソケットエラー
      if (socketRef.current) {
        socketRef.current.onerror = function () {
          setStatus(QuestionerState.Error);
        };
      }

      // サーバーからのソケット受け取り
      if (socketRef.current) {
        console.log("socket connect");
        socketRef.current.onmessage = function (event) {
          var msg = JSON.parse(event.data);
          switch (msg["command"]) {
            case "game_description":
              setAnswerers(() => []);
              setExplanations((explanations) => explanations.concat(msg["content"]));
              setStatus(QuestionerState.JudgingAnswer);
              break;
            case "game_questioner_recieve":
              const args: Answerer = {
                ...msg["content"],
                isCorrect: 0,
              };
              setAnswerers((answerers) => answerers.concat(args));
              break;
            case "game_answerer_checked":
              setCorrectUserList(msg["content"]["correctUserList"]);
              setStatus(QuestionerState.Result);
              break;
            case "game_show_result":
              props.moveResult(msg);
              break;
          }
        };
      }
    }
  }, []);

  // 質問をランダムで返す
  useEffect(() => {
    setTopic(topics[rand()]);
  }, []);

  const onSubmit: SubmitHandler<Topic> = (data) => {
    setQuestion(data.question);
    var sendJson = {
      command: "game_questioner_question",
      content: {
        topic: data.topic,
        question: data.question,
      },
    };
    socketRef.current?.send(JSON.stringify(sendJson));
    setStatus(QuestionerState.Wait);
    reset();
  };

  const judge = (flag: boolean, ans: Answerer) => {
    let idx = 0;
    let judgedCnt = 0;
    for (const [index, answerer] of answerers.entries()) {
      if (ans.user == answerer.user) idx = index;
      if (answerer.isCorrect != 0) judgedCnt++;
    }
    const array = answerers;
    array[idx].isCorrect = flag ? 1 : 2;
    judgedCnt++;
    setAnswerers([...array]);
    console.log(answererNum);

    // 全員の解答の正誤判定が終わったら
    if (judgedCnt == answerers.length) {
      const correctUserList: string[] = [];
      let correctCount = 0;
      for (const answerer of answerers) {
        if (answerer.isCorrect == 1) {
          correctUserList.push(answerer.user);
          correctCount++;
        }
      }
      console.log(correctCount, answererNum);
      setAnswererNum((answererNum) => answererNum - correctCount);
      var sendJsonCheck = {
        command: "game_questioner_check",
        content: { correctUserList },
      };
      socketRef.current?.send(JSON.stringify(sendJsonCheck));
    }
  };

  const next_explanation = () => {
    var sendJsonNext = { command: "game_next_description" };
    socketRef.current?.send(JSON.stringify(sendJsonNext));
  };

  const question_done = () => {
    var sendJson = { command: "game_questioner_done" };
    socketRef.current?.send(JSON.stringify(sendJson));
  };

  const backHome = function () {
    props.setGameState(GameState.Init);
    navigate("/");
  };

  switch (status) {

    case QuestionerState.SubmittingQuestion:
      return (
        <>
          <StyledPage>
            <StyledForm>
              <p>質問：{topic}</p>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <div>
                    <StyledInput
                      id="question"
                      type="text"
                      {...register("question", {
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
                      name="question"
                      render={({ message }) => <span>{message}</span>}
                    />
                  </StyledErrorMessage>
                  <StyledButton type="submit">送信</StyledButton>
                </div>
              </form>
            </StyledForm>
          </StyledPage>
        </>
      );
    
    case QuestionerState.JudgingAnswer:
      return (
        <>
          <StyledPage>
            <StyledScreen>
              <VStack>
                <p>質問：{topic}</p>
                <p>送信したお題：{question}</p>
                <p>
                  {explanations.map((explanation, i) => (
                    <p key={i}>
                      {explanation.index}番目の説明 : {explanation.description}
                    </p>
                  ))}
                </p>
              </VStack>
              <VStack alignItems="left" p="20px" spacing="20px">
                {answerers.map((answerer, i) => (
                  <HStack key={i}>
                    <p>{answerer.user}:</p>
                    {answerer.isCorrect != 0 ? (
                      <>
                        <StyledAnswer>
                          {answerer.isCorrect == 1 ? "正解！" : "不正解..."}
                        </StyledAnswer>
                      </>
                    ) : (
                      <>
                        <StyledAnswer>{answerer.answer}</StyledAnswer>
                        <StyledQuizButton
                          onClick={() => judge(true, answerer)}
                          color="#98FB98"
                        >
                          o
                        </StyledQuizButton>
                        <StyledQuizButton
                          onClick={() => judge(false, answerer)}
                          color="#FA8072"
                        >
                          x
                        </StyledQuizButton>
                      </>
                    )}
                  </HStack>
                ))}
              </VStack>
            </StyledScreen>
          </StyledPage>
        </>
      );
  
    case QuestionerState.Result:
      return (
        <>
          <StyledPage>
            <CorrectUserList correctUsers={correctUserList}></CorrectUserList>
            <StyledHr />
            <HStack>
              { answererNum > 0 ? (
                <StyledButton onClick={next_explanation}>
                  次の説明に移る
                </StyledButton>
              ):(<></>) }
              <StyledButton onClick={question_done}>
                この問題を終了する
              </StyledButton>
            </HStack>
          </StyledPage>
        </>
      );

    // chatGPT の回答待ち  
    case QuestionerState.Wait:
      return (
        <>
          <StyledPage>
            <h3>待機中...</h3>
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
  background-color: ${(props) => (props.color ? props.color : "white")};
`;

const StyledHr = styled.hr`
  border-color: #646cff;
  width: auto;
`;
