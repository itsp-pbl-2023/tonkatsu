import { Link, useNavigate } from "react-router-dom";

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
        <button onClick={handleClickLogin}>ログイン</button>
      </div>
      <div>
        <button onClick={handleClickRegister}>新規登録</button>
      </div>
    </>
  );
};

export default Home;