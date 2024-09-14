import { getModelForClass, prop } from '@typegoose/typegoose'

export class CategoryClass {
    @prop({ required: true })
    name: string

    @prop({ required: true })
    description: string

    @prop({ required: true })
    createdBy: string

    @prop({ required: true })
    createdAt: Date

    @prop({ required: true })
    updatedAt: Date
}

export const CategoryModel = getModelForClass(CategoryClass, {
    schemaOptions: { collection: 'categories' },
})