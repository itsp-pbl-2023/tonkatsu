// import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./views/Home";
import Account from "./views/Account";
import Login from "./views/Login";
<<<<<<< HEAD
=======
import Questioner from "./views/Questioner";
>>>>>>> 87ba672c2809d46859ef0b9d473a372f1c8b6435
import "./App.css";
import { StandbyGame } from "./components/StandbyGame";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={`/`} element={<Home />} />
        <Route path={`/account/`} element={<Account />} />
        <Route path={`/login/`} element={<Login />} />
        <Route path={`/standby/`} element={<StandbyGame />} />
<<<<<<< HEAD
=======
        <Route path={`/questioner/`} element={<Questioner />} />
>>>>>>> 87ba672c2809d46859ef0b9d473a372f1c8b6435
      </Routes>
    </BrowserRouter>
  );
};

export default App;
