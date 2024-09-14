import { DocumentType } from '@typegoose/typegoose'
import mongoose, { Types } from 'mongoose'
import { RiskClass, RiskModel } from '@models/Risk'
import { CategoryClass, CategoryModel } from '@models/Category'
import testMocks from '@mocks/test.json'
import prodMocks from '@mocks/prod.json'

type SupportedDocumentTypes = DocumentType<RiskClass> | DocumentType<CategoryClass>

const UnixToDate = (unix: string): Date => {
    return new Date(parseInt(unix))
}

class DatabaseService {
    public connect = async (): Promise<void> => {
        await mongoose.connect('mongodb://localhost:27017/prod')
    }

    private saveDocument = async (document: SupportedDocumentTypes) => {
        await document.save({
            validateBeforeSave: true,
        })
    }


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
        // 1. clears the database
        // 2. import `@mocks/test` and save each document
        // 3. return the number of documents

        // 1. clears the database
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
        return this.addMocks(testMocks)
    }

    public addProdMocks = async () => {
        return this.addMocks(prodMocks)
    }
}

export default new DatabaseService()