import { FC } from "react";
import styled from "styled-components";

export type Explanation = {
  description: string;
  index: number;
}

type DescriptionProps = {
  explanations: Explanation[]
};

type CorrectUserProps = {
  correctUsers: string[]
};

export const DescriptionList: FC<DescriptionProps> = (props) => {
  const descriptionList = [];
  for (const content of props.explanations) {
    descriptionList.push(<StyledUser key={content.index}>{content.description}</StyledUser>);
  }

  return (
    <>
      <div>{descriptionList}</div>
    </>
  )
};

export const CorrectUserList: FC<CorrectUserProps> = (props) => {
  const correctUserList = [];
  for (const [index, correctUser] of props.correctUsers.entries()) {
    correctUserList.push(<StyledUser key={index}>{correctUser}</StyledUser>);
  }

  return (
    <>
      <h2>正解者</h2>
      <div>{correctUserList}</div>
    </>
  )
};

const StyledUser = styled.h2`
  padding: 0;
  margin: 0;
  font-weight: 500;
`;