import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, HStack, VStack } from "@chakra-ui/react";
import { GameState } from "../views/Game";
import styled from "styled-components";

type Props = {
  socketRef: React.MutableRefObject<WebSocket | undefined>;
  setGameState: (state: GameState) => void;
};

type Userscore = {
  rank?: number;
  userName: string;
  score: number;
};

type Topic = {
  questioner: string;
  question: string;
};

export const Result: FC<Props> = (props) => {
  const navigate = useNavigate();
  const socketRef = props.socketRef;
  var flag = 0;

  const [isLast, setIsLast] = useState(false);
  const [topic, setTopic] = useState<Topic>({
    questioner: "tonkatsu",
    question: "とんかつ",
  });
  const [gameResults, setGameResults] = useState<Userscore[]>([
    {
      userName: "a",
      score: 0,
    },
    {
      userName: "ton",
      score: 3,
    },
    {
      userName: "b",
      score: 4,
    },
    {
      userName: "katsu",
      score: 2,
    },
    {
      userName: "c",
      score: 3,
    },
  ]);

  // status:
  // 0: WebSocket 接続前
  // 1: WebSocket 接続失敗
  // 2: WebSocket 接続成功
  const [status, setStatus] = useState(0);

  // WebSocket
  useEffect(() => {
    if (flag == 0) {
      flag = 1;

      // ソートして順位付けできるかの確認用
      const array = rank_array(gameResults);
      setGameResults(array);

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
            case "game_show_result":
              const objTopic: Topic = {
                questioner: msg["content"]["questioner"],
                question: msg["content"]["question"],
              };
              setTopic(objTopic);
              setGameResults(rank_array(msg["content"]["result"]));
              break;
            case "game_show_all_result":
              setIsLast(true);
              setGameResults(rank_array(msg["content"]["result"]));
              break;
            case "role":
              if (msg["content"]["isQuestioner"])
                props.setGameState(GameState.Questioner);
              else props.setGameState(GameState.Answerer);
              break;
          }
        };
        setStatus(2);
      }
    }
  }, []);

  const rank_array = (array: Userscore[]) => {
    const rankedArray: Userscore[] = [];
    const sortedArray = array.sort((a: Userscore, b: Userscore) => {
      return b.score - a.score;
    });
    var curscore = -1;
    var curindex = 0;
    for (const user of sortedArray) {
      if (curscore != user.score) {
        curscore = user.score;
        curindex += 1;
      }
      const rankedUser: Userscore = {
        ...user,
        rank: curindex,
      };
      rankedArray.push(rankedUser);
    }
    return rankedArray;
  };

  const next_question = () => {
    var sendJson = { command: "game_next_game" };
    socketRef.current?.send(JSON.stringify(sendJson));
  };

  const finish_game = () => {
    var sendJson = { command: "game_finish_game" };
    socketRef.current?.send(JSON.stringify(sendJson));
    backHome();
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
        <StyledScreen>
          {isLast ? (
            <h2>最終順位</h2>
          ) : (
            <VStack>
              <h2>順位</h2>
              <h2>
                {topic.questioner}さんの回答 : {topic.question}
              </h2>
            </VStack>
          )}
          <VStack alignItems="left" py="20px" px="150px" spacing="20px">
            {gameResults.map((gameResult, i) => (
              <HStack key={i}>
                <Box width="50px">{gameResult.rank}位</Box>
                <Box width="200px">{gameResult.userName}</Box>
                <Box width="50px">{gameResult.score}pt</Box>
              </HStack>
            ))}
          </VStack>
          <StyledHr />
          {isLast ? (
            <StyledButton onClick={finish_game}>ゲームを終了する</StyledButton>
          ) : (
            <StyledButton onClick={next_question}>次の問題に移る</StyledButton>
          )}
        </StyledScreen>
      </StyledPage>
    </>
  );
};

export default Result;

const StyledPage = styled.div`
  padding: 50px 0px;
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

const StyledHr = styled.hr`
  border-color: #646cff;
  width: auto;
`;
