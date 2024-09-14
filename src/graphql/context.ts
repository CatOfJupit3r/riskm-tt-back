import categoryLoader from '@graphql/loaders/categoryLoader'
import riskLoader from '@graphql/loaders/riskLoader'

export interface ContextType {
    loaders: {
        riskLoader: typeof riskLoader
        categoryLoader: typeof categoryLoader
    }
}


const context: ContextType = {
    loaders: {
        riskLoader,
        categoryLoader,
    },
}

export default context