import DatabaseService from '@services/DatabaseService'
import DataLoader from 'dataloader'

const riskLoader = new DataLoader(async (keys: readonly string[]) => {
    return DatabaseService.getRisksById(keys)
})

export default riskLoader