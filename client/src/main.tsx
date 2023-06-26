import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App.tsx";
import "./index.css";
import { CookiesProvider } from "react-cookie";
<<<<<<< HEAD
=======
import { ChakraProvider } from "@chakra-ui/react";
>>>>>>> 87ba672c2809d46859ef0b9d473a372f1c8b6435

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <CookiesProvider>
      <Provider store={store}>
<<<<<<< HEAD
        <App />
=======
        <ChakraProvider>
          <App />
        </ChakraProvider>
>>>>>>> 87ba672c2809d46859ef0b9d473a372f1c8b6435
      </Provider>
    </CookiesProvider>
  </React.StrictMode>
);
