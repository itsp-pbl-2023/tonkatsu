import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

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