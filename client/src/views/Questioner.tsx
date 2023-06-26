import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { Link, useNavigate } from "react-router-dom";
import { HStack, VStack } from "@chakra-ui/react";
import styled from "styled-components";

type Question = {
  question: string;
  answer: string;
};

type ButtonProps = {
  isCorrect?: boolean;
};

const Questioner = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Question>({
    mode: "onChange",
  });

  const questions: string[] = ["好きな食べ物は？"];

  const rand = (): number => {
    return Math.floor(Math.random() * questions.length);
  };

  const players: string[] = ["ton", "katsu", "hoge", "huga"];
  const answers: string[] = ["とんかつ", "生姜焼き", "トンテキ", "みそきん"];

  const [question, setQuestion] = useState(questions[rand()]);
  const [answer, setAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnswered, setIsAnswered] = useState(
    new Array(players.length).fill(false)
  );
  //const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    setQuestion(question);
  }, []);

  const onSubmit: SubmitHandler<Question> = (data) => {
    data.question = question;
    console.log(data.question);
    console.log(data.answer);
    setAnswer(data.answer);
    setIsSubmitted(true);
    const xmlHttpRequest = new XMLHttpRequest();
    let url = "http://localhost:8000/";
    xmlHttpRequest.open("POST", url);
    let jsonData = JSON.stringify(data);
    xmlHttpRequest.send(jsonData);

    xmlHttpRequest.onreadystatechange = () => {
      if (xmlHttpRequest.readyState == 4) {
        if (xmlHttpRequest.status == 200) {
          console.log(xmlHttpRequest);
          submitSuccess();
        } else {
          // if (xmlHttpRequest.status == 401) {
          submitFailed();
        }
      }
    };

    reset();
  };

  const submitSuccess = () => {};

  const submitFailed = () => {};

  const judge = (flag: boolean, playerId: number) => {
    if (flag == true) {
      isAnswered[playerId] = true;
      setIsAnswered([...isAnswered]);
    }
  };

  return (
    <>
      {isSubmitted ? (
        <StyledScreen>
          <VStack>
            <p>質問：{question}</p>
            <p>送信した回答：{answer}</p>
          </VStack>
          <VStack alignItems="left" p="20px" spacing="40px">
            {players.map((player, i) => (
              <HStack key={i}>
                <p>{player}:</p>
                {isAnswered[i] ? (
                  <>
                    <StyledAnswer>正解！</StyledAnswer>
                  </>
                ) : (
                  <>
                    <StyledAnswer>{answers[i]}</StyledAnswer>
                    <StyledQuizButton
                      onClick={() => judge(true, i)}
                      isCorrect={true}
                    >
                      o
                    </StyledQuizButton>
                    <StyledQuizButton
                      onClick={() => judge(false, i)}
                      isCorrect={false}
                    >
                      x
                    </StyledQuizButton>
                  </>
                )}
              </HStack>
            ))}
          </VStack>
        </StyledScreen>
      ) : (
        <StyledForm>
          <p>質問：{question}</p>
          <form action="/" method="GET" onSubmit={handleSubmit(onSubmit)}>
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
              <StyledButton type="submit">送信</StyledButton>
            </div>
          </form>
        </StyledForm>
      )}
    </>
  );
};

export default Questioner;

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
