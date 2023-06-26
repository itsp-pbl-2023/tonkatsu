import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App.tsx";
import "./index.css";
import { CookiesProvider } from "react-cookie";
import { ChakraProvider } from "@chakra-ui/react";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <CookiesProvider>
      <Provider store={store}>
        <ChakraProvider>
          <App />
        </ChakraProvider>
      </Provider>
    </CookiesProvider>
  </React.StrictMode>
);
