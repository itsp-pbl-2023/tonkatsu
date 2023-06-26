import { useNavigate } from "react-router-dom";
import styled from "styled-components";

export const NotLoginedHome = () => {
  const navigate = useNavigate();

  const handleClickLogin = () => {
    navigate("/login");
  };

  const handleClickRegister = () => {
    navigate("/account");
  };

  return (
    <>
      <StyledPage>
        <StyledForm>
          <div>
            <StyledButton onClick={handleClickLogin}>ログイン</StyledButton>
          </div>
          <div>
            <StyledButton onClick={handleClickRegister}>新規登録</StyledButton>
          </div>
        </StyledForm>
      </StyledPage>
    </>
  );
};

const StyledPage = styled.div`
  padding: 100px 0px;
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
