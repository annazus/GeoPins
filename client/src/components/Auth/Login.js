import React, { useContext } from "react";
import { GoogleLogin } from "react-google-login";
import { GraphQLClient } from "graphql-request";
import { withStyles } from "@material-ui/core/styles";
import Context from "../../Context";
import Typography from "@material-ui/core/Typography";
import { ME_QUERY } from "../../graphql/queries";
import { BASE_URL } from "../../Client";
const Login = ({ classes }) => {
  const { dispatch } = useContext(Context);
  const onSuccess = async googleUser => {
    try {
      const idToken = googleUser.getAuthResponse().id_token;

      const client = new GraphQLClient(BASE_URL, {
        headers: { authorization: idToken }
      });

      const { me } = await client.request(ME_QUERY);
      dispatch({ type: "LOGIN_USER", payload: me });
      dispatch({ type: "IS_LOGGED_IN", payload: googleUser.isSignedIn() });
    } catch (err) {
      onFailure(err);
    }
  };

  const onFailure = err => {
    dispatch({ type: "IS_LOGGED_IN", payload: false });

    console.log("error on logging in", err);
  };

  return (
    <div className={classes.root}>
      <Typography
        component="h1"
        variant="h3"
        gutterBottom
        style={{ color: "rgb(66,133,244" }}
      >
        Welcome
      </Typography>
      <GoogleLogin
        clientId="496384529794-mm197hkv9rv9tmmgr9n3hehh8c0fpdf5.apps.googleusercontent.com"
        onSuccess={onSuccess}
        onFailure={onFailure}
        buttonText="Login with Google"
        isSignedIn={true}
        theme="dark"
      />
    </div>
  );
};

const styles = {
  root: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center"
  }
};

export default withStyles(styles)(Login);
