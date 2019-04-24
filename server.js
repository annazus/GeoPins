const { ApolloServer } = require("apollo-server");
require("dotenv").config();
const mongoose = require("mongoose");
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");

const { findOrCreateUser } = require("./controllers/userController");
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, connection }) => {
    let authToken = null;
    let currentUser = null;
    try {
      if (connection) {
        return connection.context;
      }
      authToken = req.headers.authorization;
      if (authToken) {
        //find or create
        currentUser = await findOrCreateUser(authToken);
      }
    } catch (err) {
      console.error(`unable to authenticate user with token ${authToken}`);
    }

    return { currentUser };
  }
});

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(() => console.log("Db connected"))
  .catch(err => console.log("Database error", err));
server.listen().then(({ url }) => console.log(url));
