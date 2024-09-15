import { DocumentType } from '@typegoose/typegoose'
import { RiskClass } from '@models/Risk'
import { CategoryClass } from '@models/Category'

export type RiskDocumentType = DocumentType<RiskClass>
export type CategoryDocumentType = DocumentType<CategoryClass>

export type SupportedDocumentTypes = RiskDocumentType | CategoryDocumentType
export type RiskFilters = {
    includeResolved?: boolean
    nameFilter?: string
    descriptionFilter?: string
}
export type CategoryFilters = {
    nameFilter?: string
    descriptionFilter?: string
}

type DocumentRegexFilter = {
    $regex: string
    $options: string
}

export type CategoryDocumentFilters = {
    name?: DocumentRegexFilter
    description?: DocumentRegexFilter
}

export type RiskDocumentFilters = {
    name?: DocumentRegexFilter
    description?: DocumentRegexFilter
    resolved?: {
        $eq: boolean
    }
    [key: string]: unknown
}

export type PaginatedFilters = {
    limit?: number
    offset?: number
}