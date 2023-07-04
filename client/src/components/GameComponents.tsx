import { FC } from "react";
import styled from "styled-components";

type DescriptionProps = {
  contents: {
    description: string,
    index: number,
  }[];
};

type CorrectUserProps = {
  correctUsers: string[]
};

export const DescriptionList: FC<DescriptionProps> = (props) => {
  const descriptionList = [];
  for (const [index, content] of props.contents.entries()) {
    descriptionList.push(<StyledUser key={index}>{content.description}</StyledUser>);
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
      <div>{correctUserList}</div>
    </>
  )
};

const StyledUser = styled.h2`
  padding: 0;
  margin: 0;
  font-weight: 500;
`;