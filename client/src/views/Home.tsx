import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Home = () => {
  const navigate = useNavigate();

  const handleClickLogin = () => {
    navigate("/login");
  };

  const handleClickRegister = () => {
    navigate("/account");
  };

  return (
    <>
      <h1>ホーム</h1>
      <div>
        <StyledButton onClick={handleClickLogin}>ログイン</StyledButton>
      </div>
      <div>
        <StyledButton onClick={handleClickRegister}>新規登録</StyledButton>
      </div>
    </>
  );
};

export default Home;

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