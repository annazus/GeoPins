import { createContext } from "react";

const AppContext = createContext({
  currentUser: null,
  isAuth: false,
  draft: null,
  pins: [],
  currentPin: null
});

export default AppContext;
