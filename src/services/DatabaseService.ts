import mongoose, { Types } from 'mongoose'
import { RiskClass, RiskModel } from '@models/Risk'
import { CategoryClass, CategoryModel } from '@models/Category'
import { HYDRATION_MODE, MONGO_URL } from '../configs'
import {
    CategoryDocumentFilters,
    CategoryDocumentType,
    CategoryFilters,
    PaginatedFilters,
    RiskDocumentFilters,
    RiskDocumentType,
    RiskFilters,
    SupportedDocumentTypes,
} from '@models/DatabaseModels'

const UnixToDate = (unix: string): Date => {
    return new Date(parseInt(unix))
}

class DatabaseService {
    public init = async (): Promise<void> => {
        await mongoose.connect(MONGO_URL)
        await this.hydrateDB()
    }

    private hydrateDB = async () => {
        console.log('Hydrating database')
        console.log('Hydration mode: ', HYDRATION_MODE)
        switch (HYDRATION_MODE) {
            case 'TEST':
                await this.addTestMocks()
                console.log('Test mocks added')
                break
            case 'PRODUCTION':
                await this.addProdMocks()
                console.log('Prod mocks added')
                break
            case 'DEVELOPMENT':
                if (await RiskModel.countDocuments() === 0 || await CategoryModel.countDocuments() === 0) {
                    console.log('No documents found in collection. Adding development mocks')
                    await this.addTestMocks()
                    console.log('Development mocks added')
                }
                break
            default:
                break
        }
    }

    private saveDocument = async (document: SupportedDocumentTypes) => {
        await document.save({
            validateBeforeSave: true,
        })
    }

    private buildRiskFilter = (filters: {
        includeResolved?: boolean
        nameFilter?: string
        descriptionFilter?: string
    }): RiskDocumentFilters => {
        const filter: RiskDocumentFilters = {}
        if (filters.includeResolved === false) {
            filter.resolved = {
                $eq: false,
            }
        }
        if (filters.nameFilter) {
            filter.name = { $regex: filters.nameFilter, $options: 'i' }
        }
        if (filters.descriptionFilter) {
            filter.description = { $regex: filters.descriptionFilter, $options: 'i' }
        }
        return filter
    }

    public getRisks = async (filters: RiskFilters & PaginatedFilters) => {
        const filter = this.buildRiskFilter(filters)

        return RiskModel.find(filter)
            .skip(filters.offset || 0)
            .limit(filters.limit || 250)
    }

    public countRisks = async (filters: RiskFilters) => {
        const filter = this.buildRiskFilter(filters)
        return RiskModel.countDocuments(filter)
    }

    private buildCategoryFilter = (filters: CategoryFilters): CategoryDocumentFilters => {
        const filter: CategoryDocumentFilters = {}
        if (filters.nameFilter) {
            filter.name = { $regex: filters.nameFilter, $options: 'i' }
        }
        if (filters.descriptionFilter) {
            filter.description = { $regex: filters.descriptionFilter, $options: 'i' }
        }
        return filter
    }

    public getCategories = async (
        filters: CategoryFilters & PaginatedFilters,
    ) => {
        const filter = this.buildCategoryFilter(filters)

        return CategoryModel.find(filter)
            .skip(filters.offset || 0)
            .limit(filters.limit || 250)
    }

    public countCategories = async (filters: CategoryFilters) => {
        const filter = this.buildCategoryFilter(filters)
        return CategoryModel.countDocuments(filter)
    }

    public getCategoriesById = async (ids: readonly string[]): Promise<(CategoryClass | Error)[]> => {
        const categories = await CategoryModel.find({ _id: { $in: ids } })
        const categoryMap = new Map<string, CategoryClass>()
        for (const category of categories) {
            categoryMap.set(category._id.toString(), category)
        }
        return ids.map(id => categoryMap.get(id.toString()) || new Error(`Category with id ${id} not found`))
    }

    public getRisksById = async (ids: readonly string[]): Promise<(RiskClass | Error)[]> => {
        const risks = await RiskModel.find({ _id: { $in: ids } })
        const riskMap = new Map<string, RiskClass>()
        for (const risk of risks) {
            riskMap.set(risk._id.toString(), risk)
        }
        return ids.map(id => riskMap.get(id.toString()) || new Error(`Risk with id ${id} not found`))
    }

    public createRisk = async (
        name: string,
        description: string,
        categoryId: string,
        createdBy: string,
    ): Promise<RiskDocumentType> => {
        if (
            !Types.ObjectId.isValid(categoryId) ||
            !(await CategoryModel.findById(categoryId))
        ) {
            throw new Error('Invalid category id')
        }
        const risk = new RiskModel({
            name,
            description,
            categoryId: new Types.ObjectId(categoryId),
            createdBy,
            resolved: false,
            updatedAt: new Date(),
            createdAt: new Date(),
        })

        await this.saveDocument(risk)
        return risk
    }

    public removeRisk = async (
        id: string,
    ): Promise<RiskDocumentType | null> => {
        return RiskModel.findByIdAndDelete(id)
    }

    public changeRiskStatus = async (
        id: string,
        resolved: boolean,
    ): Promise<RiskDocumentType | null> => {
        return RiskModel.findByIdAndUpdate(id, {
            resolved,
            updatedAt: new Date(),
        }, { new: true })
    }

    public updateRisk = async (
        id: string,
        name: string,
        description: string,
        categoryId: string,
    ): Promise<RiskDocumentType | null> => {
        const changes: Record<string, string> = {}
        if (name) {
            changes['name'] = name
        }
        if (description) {
            changes['description'] = description
        }
        if (categoryId) {
            if (
                !Types.ObjectId.isValid(categoryId) ||
                !(await CategoryModel
                    .findById(categoryId))
            ) {
                throw new Error('Invalid category id')
            }
            changes['categoryId'] = categoryId
        }
        if (Object.keys(changes).length !== 0) {
            return RiskModel.findByIdAndUpdate(id, {
                ...changes,
                updatedAt: new Date(),
            }, { new: true })
        }
        return null
    }

    public createCategory = async (
        name: string,
        description: string,
        createdBy: string,
    ): Promise<CategoryDocumentType> => {
        const category = new CategoryModel({
            name,
            description,
            createdBy,
            updatedAt: new Date(),
            createdAt: new Date(),
        })

        await this.saveDocument(category)
        return category
    }

    public removeCategory = async (
        id: string,
    ): Promise<CategoryDocumentType | null> => {
        const removed = await CategoryModel.findByIdAndDelete(id)
        if (removed === null) {
            return null
        }
        await RiskModel.updateMany({ categoryId: removed._id }, { categoryId: null })
        return removed
    }

    public updateCategory = async (
        id: string,
        name: string,
        description: string,
    ): Promise<CategoryDocumentType | null> => {
        return CategoryModel.findByIdAndUpdate(id, {
            name,
            description,
            updatedAt: new Date(),
        }, { new: true })
    }

    /*

    Hydration functions

     */

    private addMocks = async (
        mocks:
            {
                categories: {
                    _id: number
                    name: string
                    description: string

                    createdBy: string
                    createdAt: string
                    updatedAt: string
                }[]
                risks: {
                    _id: number
                    name: string
                    description: string
                    categoryId: number
                    resolved: boolean

                    createdBy: string
                    createdAt: string
                    updatedAt: string
                }[]
            },
    ) => {
        // 1. clears the database.
        // can be commented out, but on multiple runs, it will create duplicates
        await RiskModel.deleteMany({})
        await CategoryModel.deleteMany({})

        // 2. import `@mocks/test` and save each document
        // ...
        const categoryIdMapping = new Map<number, Types.ObjectId>()
        for (const category of mocks.categories) {
            const categoryDocument = new CategoryModel({
                name: category.name,
                description: category.description,
                createdBy: category.createdBy,
                createdAt: UnixToDate(category.createdAt),
                updatedAt: UnixToDate(category.updatedAt),
            })

            await this.saveDocument(categoryDocument)
            categoryIdMapping.set(category._id, categoryDocument._id)
        }
        for (const risk of mocks.risks) {
            const riskDocument = new RiskModel({
                name: risk.name,
                description: risk.description,
                categoryId: categoryIdMapping.get(risk.categoryId),
                resolved: risk.resolved,
                createdBy: risk.createdBy,
                createdAt: UnixToDate(risk.createdAt),
                updatedAt: UnixToDate(risk.updatedAt),
            })

            await this.saveDocument(riskDocument)
        }

        // 3. return the number of documents

        return {
            categories: mocks.categories.length,
            risks: mocks.risks.length,
        }
    }

    public addTestMocks = async () => {
        const mocks = await import ('@mocks/test.json')
        return this.addMocks(mocks)
    }

    public addProdMocks = async () => {
        const prodMocks = await import ('@mocks/prod.json')
        return this.addMocks(prodMocks)
    }
}

export default new DatabaseService()