import { getModelForClass, prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

export class RiskClass {
    @prop({ required: true })
    name: string

    @prop({ required: true })
    description: string

    @prop({ required: true })
    categoryId: Types.ObjectId

    @prop({ required: true })
    resolved: boolean

    @prop({ required: true })
    createdBy: string

    @prop({ required: true })
    createdAt: Date

    @prop({ required: true })
    updatedAt: Date
}

export const RiskModel = getModelForClass(RiskClass, {
    schemaOptions: { collection: 'risks' },
})