import DatabaseService from '@services/DatabaseService'
import { ContextType } from '@graphql/context'

export const RiskResolvers = {
    Query: {
        risks: async (_: any, __: any, { loaders }: ContextType) => {
            const risks = await DatabaseService.getRisks()
            return risks.map(risk => ({
                _id: risk._id.toString(),
                name: risk.name,
                description: risk.description,
                resolved: risk.resolved,
                category: loaders.categoryLoader.load(risk.categoryId.toString()),
                createdBy: risk.createdBy,
                createdAt: risk.createdAt.toISOString(),
                updatedAt: risk.updatedAt.toISOString(),
            }))
        },
    },
    Mutation: {},
}