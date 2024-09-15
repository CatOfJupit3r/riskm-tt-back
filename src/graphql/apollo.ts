import { ApolloServer, AuthenticationError } from 'apollo-server'
import { loadSchemaSync } from '@graphql-tools/load'
import { join } from 'node:path'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { RiskResolvers } from '@graphql/resolvers/riskResolvers'
import { CategoryResolvers } from '@graphql/resolvers/categoryResolvers'
import context from '@graphql/context'
import { merge } from 'lodash'

const typeDefs = loadSchemaSync(join(__dirname, 'schema.graphql'), {
    loaders: [new GraphQLFileLoader()],
})
const resolvers = merge({}, RiskResolvers, CategoryResolvers)

export const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        if (req.headers?.authorization) {
            context.user.name = req.headers.authorization
        } else {
            throw new AuthenticationError('Unauthorized')
        }
        return context
    },
})
