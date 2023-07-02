import React, { FC, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ErrorMessage } from "@hookform/error-message";
import { HStack, VStack } from "@chakra-ui/react";
import styled from "styled-components";
import { GameState } from "../views/Game";

type Props = {
  socketRef: React.MutableRefObject<WebSocket | undefined>;
  setGameState: (state: GameState) => void;
};

type Topic = {
  topic: string;
  question: string;
};

type ButtonProps = {
  isCorrect?: boolean;
};

type answerer = {
  user: string;
  answer: string;
  isCorrect: number;
};

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

  const [topic, setTopic] = useState(topics[rand()]);
  const [question, setQuestion] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [explanations, setExplanations] = useState([
    {
      description: "ここに質問が順次追加される↓",
      index: 0,
    },
  ]);
  const [answerers, setAnswerers] = useState<answerer[]>([
    { user: "ton", answer: "とんかつ", isCorrect: 0 },
    { user: "katsu", answer: "生姜焼き", isCorrect: 0 },
  ]);
  //const [errorMsg, setErrorMsg] = useState<string>("");

  // status:
  // 0: WebSocket 接続前
  // 1: WebSocket 接続失敗
  // 2: WebSocket 接続成功
  const [status, setStatus] = useState(0);

  // WebSocket
  useEffect(() => {
    if (flag == 0) {
      flag = 1;
      // ソケットエラー
      if (socketRef.current) {
        socketRef.current.onerror = function () {
          setStatus(1);
        };
      }

      // サーバーからのソケット受け取り
      if (socketRef.current) {
        console.log("socket connect");
        socketRef.current.onmessage = function (event) {
          var msg = JSON.parse(event.data);
          switch (msg["command"]) {
            case "game_description":
              setExplanations(explanations.concat(msg["content"]));
              break;
            case "game_questioner_recieve":
              const args: answerer = {
                ...msg["content"],
                isCorrect: false,
              };
              setAnswerers(answerers.concat(args));
              break;
          }
        };
        setStatus(2);
      }
    }
  }, []);

  // 質問をランダムで返す
  useEffect(() => {
    setTopic(topics[rand()]);
  }, []);

  const onSubmit: SubmitHandler<Topic> = (data) => {
    setQuestion(data.question);
    setIsSubmitted(true);
    var sendJson = {
      command: "game_questioner_question",
      content: {
        topic,
        question: data.question,
      },
    };
    socketRef.current?.send(JSON.stringify(sendJson));
    reset();
  };

  const judge = (flag: boolean, ans: answerer) => {
    let idx = 0;
    for (const [index, answerer] of answerers.entries()) {
      if (ans.user == answerer.user) idx = index;
    }
    const array = answerers;
    array[idx].isCorrect = flag ? 1 : 2;
    setAnswerers([...array]);
  };

  const next_explanation = () => {
    const correctUserList: string[] = [];
    for (const answerer of answerers) {
      if (answerer.isCorrect == 1) correctUserList.concat(answerer.user);
    }
    var sendJsonCheck = {
      command: "game_questioner_check",
      content: { correctUserList },
    };
    socketRef.current?.send(JSON.stringify(sendJsonCheck));
    var sendJsonNext = { command: "game_next_description" };
    socketRef.current?.send(JSON.stringify(sendJsonNext));
    setAnswerers([]);
  };

  const question_done = () => {
    var sendJson = { command: "game_questioner_done" };
    socketRef.current?.send(JSON.stringify(sendJson));
    props.setGameState(GameState.Result);
  };

  const backHome = function () {
    props.setGameState(GameState.Init);
    navigate("/");
  };

  // 接続中
  if (status == 0) {
    return (
      <>
        <StyledPage>
          <h3>接続中...</h3>
        </StyledPage>
      </>
    );
  }

  // 接続失敗
  if (status == 1) {
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
  }

  return (
    <>
      <StyledPage>
        {isSubmitted ? (
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
                        isCorrect={true}
                      >
                        o
                      </StyledQuizButton>
                      <StyledQuizButton
                        onClick={() => judge(false, answerer)}
                        isCorrect={false}
                      >
                        x
                      </StyledQuizButton>
                    </>
                  )}
                </HStack>
              ))}
            </VStack>
            <StyledHr />
            <HStack>
              <StyledButton onClick={next_explanation}>
                次の説明に移る
              </StyledButton>
              <StyledButton onClick={question_done}>
                この問題を終了する
              </StyledButton>
            </HStack>
          </StyledScreen>
        ) : (
          <StyledForm>
            <p>質問：{topic}</p>
            <form action="/" method="GET" onSubmit={handleSubmit(onSubmit)}>
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
        )}
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
