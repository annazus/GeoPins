import React, { useState, useContext } from "react";
import { withStyles } from "@material-ui/core";
import InputBase from "@material-ui/core/InputBase";
import IconButton from "@material-ui/core/IconButton";
import ClearIcon from "@material-ui/icons/Clear";
import SendIcon from "@material-ui/icons/Send";
import Divider from "@material-ui/core/Divider";
import { CREATE_COMMENT_MUTATION } from "../../graphql/mutations";
import Context from "../../Context";
import { useClient } from "../../Client";
const CreateComment = ({ classes }) => {
  const client = useClient();
  const [comment, setComment] = useState("");
  const { state } = useContext(Context);

  const { currentPin } = state;
  const handleSubmitComment = async e => {
    e.preventDefault();
    const variables = { pinId: currentPin._id, text: comment };
    await client.request(CREATE_COMMENT_MUTATION, variables);

    setComment("");
  };
  return (
    <>
      <form className={classes.form}>
        <IconButton disabled={!comment.trim()}>
          <ClearIcon
            className={classes.ClearIcon}
            onClick={() => {
              setComment("");
            }}
          />
        </IconButton>

        <InputBase
          className={classes.input}
          placeholder="Add Comment"
          multiline={true}
          value={comment}
          onChange={e => {
            setComment(e.target.value);
          }}
        />

        <IconButton
          className={classes.SendIcon}
          disabled={!comment.trim()}
          onClick={handleSubmitComment}
        >
          <SendIcon />
        </IconButton>
      </form>

      <Divider />
    </>
  );
};

const styles = theme => ({
  form: {
    display: "flex",
    alignItems: "center"
  },
  input: {
    marginLeft: 8,
    flex: 1
  },
  clearButton: {
    padding: 0,
    color: "red"
  },
  sendButton: {
    padding: 0,
    color: theme.palette.secondary.dark
  }
});

export default withStyles(styles)(CreateComment);
