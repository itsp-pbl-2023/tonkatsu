import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { LoginedHome } from "../components/LoginedHome";
import { NotLoginedHome } from "../components/NotLoginedHome";

const Home = () => {
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
};

export default Home;