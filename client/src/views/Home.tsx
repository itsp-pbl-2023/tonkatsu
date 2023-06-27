import { useCookies } from "react-cookie";
import { LoginedHome } from "../components/LoginedHome";
import { NotLoginedHome } from "../components/NotLoginedHome";

const Home = () => {
  const [cookies, setCookie] = useCookies(["userID"]);
  return <>{cookies.userID ? <LoginedHome /> : <NotLoginedHome />}</>;
};

export default Home;
