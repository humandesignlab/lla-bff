const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { Prompts, sequelize} = require('../models');

const typeDefs = gql`
	type Prompt {
		title: String!
		id: ID!
	}
  type Query {
    prompt: Prompt
  }
`

const resolvers = {
  Query: {
    prompt: async (_, args) => {
			const prompt = await Prompts.findOne({
				order: sequelize.random()
			});
			return prompt;
		}
  },
}

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`));
