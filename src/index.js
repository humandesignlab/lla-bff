require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { ApolloServer, gql } = require('apollo-server-express');
const { Prompts, sequelize} = require('../models');
const fetch = require('node-fetch')
const flowId = require('./auth/flowId');
const typeDefs = gql`
	type Prompt {
		title: String!
		id: ID!
	}
	type Fetch {
		id: String
		href: String
	}
  type Query {
		prompt: Prompt
		partyAccount: Fetch
  }
`

const resolvers = {
  Query: {
    prompt: async (_, args) => {
			const prompt = await Prompts.findOne({
				order: sequelize.random()
			});
			return prompt;
		},
		partyAccount: () => {
			return fetch(`${process.env.ACCOUNT_MANAGENEMT_API_URL}PA/partyAccount/555`).then(res => res.json())
		}	
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(flowId);
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`));
