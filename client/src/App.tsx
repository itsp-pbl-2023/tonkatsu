// import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./views/Home";
import Account from "./views/Account";
import Login from "./views/Login";
import "./App.css";
import { Game } from "./views/Game";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={`/`} element={<Home />} />
        <Route path={`/account/`} element={<Account />} />
        <Route path={`/login/`} element={<Login />} />
        <Route path={`/game`} element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
