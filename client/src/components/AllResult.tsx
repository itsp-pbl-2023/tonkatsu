import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, HStack, VStack } from "@chakra-ui/react";
import { GameState, AllResultJson } from "../views/Game";
import styled from "styled-components";

type Props = {
  setGameState: (state: GameState) => void;
  result: AllResultJson;
};

type Userscore = {
  rank?: number;
  userName: string;
  score: number;
};

export const AllResult: FC<Props> = (props) => {
  const navigate = useNavigate();
  const [gameResults, setGameResults] = useState<Userscore[]>([]);

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

  useEffect(() => {
    setGameResults(rank_array(props.result["content"]["result"]));
  }, []);

  const backHome = function () {
    props.setGameState(GameState.Init);
    navigate("/");
  };

  return (
    <>
      <StyledPage>
        <StyledScreen>
          <VStack>
            <h2>最終順位</h2>
          </VStack>
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
          <StyledButton onClick={backHome}>終了</StyledButton>
        </StyledScreen>
      </StyledPage>
    </>
  );
};

export default AllResult;

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
