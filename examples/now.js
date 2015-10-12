import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType
} from 'graphql'
import CustomGraphQLDateType from '..'

let schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      now: {
        type: CustomGraphQLDateType,
        // Resolve fields with the custom date type to a valid Date object
        resolve: () => new Date()
      }
    }
  })
})

graphql(schema, '{ now }')
  .then(console.log)
  .catch(console.error)
