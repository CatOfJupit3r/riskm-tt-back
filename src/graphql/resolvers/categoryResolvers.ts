import DatabaseService from '@services/DatabaseService'

export const CategoryResolvers = {
    Query: {
        categories: async () => {
            const categories = await DatabaseService.getCategories()
            return categories.map(category => ({
                _id: category._id.toString(),
                name: category.name,
                description: category.description,
                createdBy: category.createdBy,
                createdAt: category.createdAt.toISOString(),
                updatedAt: category.updatedAt.toISOString(),
            }))
        },
    },
    Mutation: {},
}