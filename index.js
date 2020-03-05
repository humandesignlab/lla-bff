require('dotenv').config();
const app = require('./src/app');
const { ApolloServer, gql } = require('apollo-server-express');
const { Prompts, sequelize} = require('./models');
const fetch = require('node-fetch')

const typeDefs = gql`
	type Prompt {
		title: String!
		id: ID!
	}
	type ValidFor {
		startDateTime: String
		endDateTime: String
	}
	
	type TaxExemption {
		certificateNumber: String
		issuingJurisdiction: String
		reason: String
		validFor: ValidFor
	}
	
	type RelatedParty {
		id: String
		href: String
		name: String
		role: String
		referredType: String
	}
	
	type TotalAmount {
		unit: String
		value: Int
	}
	
	type PaymentMethod {
		id: String
		href: String
		name: String
	}
	
	type PaymentPlan {
		numberOfPayments: Int
		paymentFrequency: String
		priority: Int
		status: String
		planType: String
		validFor: ValidFor
		totalAmount: TotalAmount
		paymentMethod: PaymentMethod
	}
	
	type Amount {
		unit: String
		value: Float
	}
	
	type AccountBalance {
		balanceType: String
		validFor: ValidFor
		amount: Amount
	}
	
	type FinancialAccount {
		id: String
		href: String
		name: String
		referredType: String
		accountBalance: AccountBalance
	}
	
	type DefaultPaymentMethod {
		id: String
		href: String
		name: String
	}
	
	type CreditLimit {
		unit: String
		value: Int
	}
	
	type Characteristic {
		city: String
		country: String
		postCode: String
		street1: String
	}
	
	type ContactMedium {
		mediumType: String
		preferred: Boolean
		validFor: ValidFor
		characteristic: Characteristic
	}
	
	type Contact {
		contactName: String
		contactType: String
		partyRoleType: String
		relatedParty: RelatedParty
		validFor: ValidFor
		contactMedium: [ContactMedium]
	}
	
	type Format {
		id: String
		href: String
		name: String
	}
	
	type PresentationMedia {
		href: String
		id: String
		name: String
	}
	
	type CycleSpecification {
		id: String
		href: String
		name: String
		dateShift: Int
		frequency: String
	}
	
	type BillStructure {
		format: Format
		presentationMedia: [PresentationMedia]
		cycleSpecification: CycleSpecification
	}
	
	type Account {
		id: String
		href: String
		description: String
		name: String
		type: String
	}
	
	type AccountRelationship {
		relationshipType: String
		validFor: ValidFor
		account: Account
	}
	
	type FirstLevel {
		id: String
		href: String
		accountType: String
		description: String
		lastModified: String
		name: String
		paymentStatus: String
		state: String
		type: String
		taxExemption: [TaxExemption]
		relatedParty: [RelatedParty]
		paymentPlan: [PaymentPlan]
		financialAccount: FinancialAccount
		defaultPaymentMethod: DefaultPaymentMethod
		creditLimit: CreditLimit
		contact: [Contact]
		billStructure: BillStructure
		accountRelationship: [AccountRelationship]
		accountBalance: [AccountBalance]
	}
	
	
  type Query {
		prompt: Prompt
		billingAccount: FirstLevel
		partyAccount: FirstLevel
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
		partyAccount: (id) => {
			return fetch(`${process.env.ACCOUNT_MANAGENEMT_API_URL}PA/partyAccount/555`).then(res => res.json())
			.catch(err => {
				console.log('There has been a problem with your fetch operation: ' + err.message);
				throw err;
			});
		},
		billingAccount: () => {
			return fetch(`${process.env.ACCOUNT_MANAGENEMT_API_URL}PA/billingAccount/555`).then(res => res.json());
		}
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.applyMiddleware({ app });

app.listen({ port: 3000 }, () =>
  console.log(`🚀 Server ready at http://localhost:3000${server.graphqlPath}`));
