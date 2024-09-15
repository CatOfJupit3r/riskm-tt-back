import categoryLoader from '@graphql/loaders/categoryLoader'
import riskLoader from '@graphql/loaders/riskLoader'


const context = {
    loaders: {
        riskLoader,
        categoryLoader,
    },
    user: {
        name: null as string | null,
    }
}

export type ContextType = typeof context

export default context