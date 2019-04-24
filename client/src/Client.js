import { useState, useEffect } from "react";
import { GraphQLClient } from "graphql-request";

export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "<insert product url></insert>"
    : "http://localhost:4000/graphql";
export const useClient = () => {
  useEffect(() => {
    const token = window.gapi.auth2
      .getAuthInstance()
      .currentUser.get()
      .getAuthResponse().id_token;

    setIdToken(token);
  }, []);
  const [idToken, setIdToken] = useState("");

  return new GraphQLClient(BASE_URL, {
    headers: { authorization: idToken }
  });
};
