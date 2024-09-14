import run from './startup'


run().then(
    () => console.log('Done'),
    error => console.error('Failed to run:', error),
)
