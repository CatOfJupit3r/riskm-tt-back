import DatabaseService from '@services/DatabaseService'
import { ContextType } from '@graphql/context'
import { PaginatedFilters, RiskDocumentType, RiskFilters } from '@models/DatabaseModels'
import { BadRequest } from '@models/Exceptions'
import { Types } from 'mongoose'


export const RiskResolvers = {
    Query: {
        risks: async (_: never, args: RiskFilters & PaginatedFilters, { loaders }: ContextType) => {
            if (args.limit && args.limit < 0) {
                throw BadRequest('Limit must be greater than 0')
            }
            if (args.offset && args.offset < 0) {
                throw BadRequest('Offset must be greater than 0')
            }
            const risks = await DatabaseService.getRisks({
                includeResolved: args?.includeResolved,
                nameFilter: args?.nameFilter,
                descriptionFilter: args?.descriptionFilter,
                limit: args?.limit,
                offset: args?.offset,
            })
            const count = await DatabaseService.countRisks({
                includeResolved: args?.includeResolved,
                nameFilter: args?.nameFilter,
                descriptionFilter: args?.descriptionFilter,
            })

            const filtered = await Promise.all(risks.map(async risk => ({
                ...risk.toJSON(),
                _id: risk._id.toString(),
                category: risk.categoryId && await loaders.categoryLoader.load(risk.categoryId.toString()),
                createdAt: risk.createdAt.toISOString(),
                updatedAt: risk.updatedAt.toISOString(),
            })))

            return {
                filtered: filtered ?? [],
                count: count ?? 0,
            }
        },
    },
    Mutation: {
        createRisk: async (_: never, args: {
            name: string,
            description: string,
            categoryId: string
        }, { user, loaders }: ContextType) => {
            if (!args.name || args.name.length === 0) {
                throw BadRequest('Risk name is required')
            }
            if (!args.description || args.description.length === 0) {
                throw BadRequest('Risk description is required')
            }
            if (!args.categoryId || !(Types.ObjectId.isValid(args.categoryId))) {
                throw BadRequest('Valid category id is required')
            }
            if (!user || !user.name) {
                throw BadRequest('To create a risk, you must be logged in!')
            }
            const risk = await DatabaseService.createRisk(
                args.name,
                args.description,
                args.categoryId,
                user.name as string ?? 'Unknown',
            )

            return {
                ...risk.toJSON(),
                _id: risk._id.toString(),
                category: risk.categoryId ? await loaders.categoryLoader.load(risk.categoryId.toString()) : null,
                createdAt: risk.createdAt.toISOString(),
                updatedAt: risk.updatedAt.toISOString(),
            }
        },
        updateRisk: async (_: never, args: {
            _id: string,
            name: string,
            description: string,
            categoryId: string
        }, { loaders }: ContextType) => {
            if (!args || !args._id || !(Types.ObjectId.isValid(args._id))) {
                throw BadRequest('Valid risk id is required')
            }
            if (!args.name && !args.description && !args.categoryId) {
                throw BadRequest('At least one field must be updated')
            }
            if (args.categoryId && !(Types.ObjectId.isValid(args.categoryId))) {
                throw BadRequest('Valid category id is required')
            }
            let risk: RiskDocumentType | null = null
            try {
                risk = await DatabaseService.updateRisk(
                    args._id,
                    args.name,
                    args.description,
                    args.categoryId,
                )
            } catch (e) {
                if (e instanceof Error) {
                    throw BadRequest(e.message)
                }
                throw BadRequest('Error updating risk')
            }
            if (!risk) {
                throw BadRequest('Risk not found')
            }
            return {
                ...risk.toJSON(),
                _id: risk._id.toString(),
                category: risk.categoryId && await loaders.categoryLoader.load(risk.categoryId.toString()),
                createdAt: risk.createdAt.toISOString(),
                updatedAt: risk.updatedAt.toISOString(),
            }
        },
        removeRisk: async (_: never, args: { _id: string }, { loaders }: ContextType) => {
            if (!args || !args._id || !(Types.ObjectId.isValid(args._id))) {
                throw BadRequest('Valid risk id is required')
            }
            const deleted = await DatabaseService.removeRisk(args._id)
            return deleted === null ? null : {
                ...deleted.toJSON(),
                _id: deleted._id.toString(),
                category: deleted.categoryId ? await loaders.categoryLoader.load(deleted.categoryId.toString()) : null,
                createdAt: deleted.createdAt.toISOString(),
                updatedAt: deleted.updatedAt.toISOString(),
            }
        },
        changeRiskStatus: async (_: never, args: { _id: string, resolved: boolean }, { loaders }: ContextType) => {
            if (!args || !args._id || !(Types.ObjectId.isValid(args._id))) {
                throw BadRequest('Valid risk id is required')
            }
            const risk = await DatabaseService.changeRiskStatus(args._id, args.resolved)
            if (!risk) {
                throw BadRequest('Risk not found')
            }
            return {
                ...risk.toJSON(),
                _id: risk._id.toString(),
                category: risk.categoryId && await loaders.categoryLoader.load(risk.categoryId.toString()),
                createdAt: risk.createdAt.toISOString(),
                updatedAt: risk.updatedAt.toISOString(),
            }
        },
    },
}