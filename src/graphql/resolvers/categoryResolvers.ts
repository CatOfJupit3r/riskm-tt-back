import DatabaseService from '@services/DatabaseService'
import { CategoryDocumentType, CategoryFilters, PaginatedFilters } from '@models/DatabaseModels'
import { ContextType } from '@graphql/context'
import { BadRequest } from '@models/Exceptions'
import { Types } from 'mongoose'

export const CategoryResolvers = {
    Query: {
        categories: async (
            _: never,
            args: CategoryFilters & PaginatedFilters,
        ) => {
            const categories = await DatabaseService.getCategories(args)
            const count = await DatabaseService.countCategories(args)

            return {
                filtered: categories.map(category => ({
                    ...category.toJSON(),
                    _id: category._id.toString(),
                    createdAt: category.createdAt.toISOString(),
                    updatedAt: category.updatedAt.toISOString(),
                })) ?? [],
                count: count ?? 0,
            }
        },
    },
    Mutation: {
        createCategory: async (_: never, args: {
            name: string
            description: string
        }, { user }: ContextType) => {
            if (!args.name || args.name.length === 0) {
                throw new Error('Category name is required')
            }
            if (!args.description || args.description.length === 0) {
                throw new Error('Category description is required')
            }
            if (!user || !user.name) {
                throw new Error('To create a category, you must be logged in!')
            }
            let category: CategoryDocumentType
            try {
                category = await DatabaseService.createCategory(
                    args.name,
                    args.description,
                    user.name ?? 'Unknown',
                )
            } catch (e) {
                if (e instanceof Error) {
                    throw BadRequest(e.message)
                } else {
                    throw BadRequest('An error occurred while creating the category')
                }
            }
            return {
                ...category.toJSON(),
                _id: category._id.toString(),
                createdAt: category.createdAt.toISOString(),
                updatedAt: category.updatedAt.toISOString(),
            }
        },
        removeCategory: async (_: never, args: {
            _id: string
        }, { loaders }: ContextType) => {
            if (!args || !args._id || !(Types.ObjectId.isValid(args._id))) {
                throw new Error('Valid category id is required')
            }
            let deleted: CategoryDocumentType | null = null
            try {
                deleted = await DatabaseService.removeCategory(args._id)
                loaders.categoryLoader.clear(args._id)
            } catch (e) {
                if (e instanceof Error) {
                    throw BadRequest(e.message)
                } else {
                    throw BadRequest('An error occurred while removing the category')
                }
            }
            return deleted === null ? null : {
                ...deleted.toJSON(),
                _id: deleted._id.toString(),
                createdAt: deleted.createdAt.toISOString(),
                updatedAt: deleted.updatedAt.toISOString(),
            }
        },
        updateCategory: async (_: never, args: {
            _id: string
            name: string
            description: string
        }) => {
            if (!args || !args._id || !(Types.ObjectId.isValid(args._id))) {
                throw new Error('Valid category id is required')
            }
            if (!args.name || args.name.length === 0) {
                throw new Error('Category name is required')
            }
            if (!args.description || args.description.length === 0) {
                throw new Error('Category description is required')
            }
            let category: CategoryDocumentType | null = null
            try {
                category = await DatabaseService.updateCategory(
                    args._id,
                    args.name,
                    args.description,
                )
            } catch (e) {
                if (e instanceof Error) {
                    throw BadRequest(e.message)
                } else {
                    throw BadRequest('An error occurred while updating the category')
                }
            }
            if (!category) {
                throw new Error('Category not found')
            }
            return {
                ...category.toJSON(),
                _id: category._id.toString(),
                createdAt: category.createdAt.toISOString(),
                updatedAt: category.updatedAt.toISOString(),
            }
        },
    },
}