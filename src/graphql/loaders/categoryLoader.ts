import DataLoader from 'dataloader'

import DatabaseService from '@services/DatabaseService'
import { CategoryClass } from '@models/Category'

const batchCategories = async (ids: readonly string[]) => {
    return DatabaseService.getCategoriesById(ids)
}

export default new DataLoader<string, CategoryClass>(batchCategories)