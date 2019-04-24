import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import Context from "./Context";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { state } = useContext(Context);
  return (
    <Route
      {...rest}
      render={props =>
        !state.isAuth ? <Redirect to="/login" /> : <Component {...props} />
      }
    />
  );
};

export default ProtectedRoute;
