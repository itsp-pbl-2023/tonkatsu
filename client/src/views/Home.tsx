import { useCookies } from "react-cookie";
import { LoginedHome } from "../components/LoginedHome";
import { NotLoginedHome } from "../components/NotLoginedHome";

const Home = () => {
<<<<<<< HEAD
  const [cookies, setCookie] = useCookies(["userID"]);
  return <>{cookies.userID ? <LoginedHome /> : <NotLoginedHome />}</>;
=======
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(["userID"]);

  const x = 1;
  // if (cookies.userID) {
  if (x) {
    return (
      <>
        <LoginedHome />
      </>
    );
  }

  return (
    <>
      <NotLoginedHome />
    </>
  );
>>>>>>> 87ba672c2809d46859ef0b9d473a372f1c8b6435
};

export default Home;
