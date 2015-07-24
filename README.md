Custom Date Type for GraphQL
============================

This is a custom date type implementation for GraphQL. GraphQL does not contain
a native date type but it does allow you to specify custom scalar types that
serializes to strings, or other scalar types, but conforms to certain
standards.

This date type accepts and outputs this format: '2015-07-24T13:15:34.814Z'
which is commonly used in JSON since it is the default format used by
JavaScript when serializing dates to JSON.

## Usage

You need the npm `graphql` module and this type (not yet published though).
You can then create a small schema using the type. In this minimal example we
expose the query "now" that simply returns the current date and time.

The important part is that your resolve function needs to return a JavaScript
Date object.

```javascript
// examples/output.js

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql';
import CustomGraphQLDateType from '..';

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
});

graphql(schema, "{ now }")
  .then(console.log)
  .catch(console.error);
```

Running this prints the current date:

```shell
$ babel-node examples/output.js
{ data: { now: '2015-07-24T13:23:15.580Z' } }
```
