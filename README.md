Custom Date Type for GraphQL
============================

This is a custom date type implementation for GraphQL. GraphQL does not contain
a native date type but it does allow you to specify [custom scalar types](https://facebook.github.io/graphql/#sec-Scalars)
that serializes to strings, or other scalar types, but conforms to certain
standards.

This date type accepts and outputs this format: '2015-07-24T13:15:34.814Z'
which is commonly used in JSON since it is the default format used by
JavaScript when serializing dates to JSON.

[![npm version](https://badge.fury.io/js/graphql-custom-datetype.svg)](https://badge.fury.io/js/graphql-custom-datetype)
[![Build Status](https://travis-ci.org/soundtrackyourbrand/graphql-custom-datetype.svg?branch=master)](https://travis-ci.org/soundtrackyourbrand/graphql-custom-datetype)

## Usage

To use this type you in your GraphQL schema you simply install this module with
`npm install --save graphql-custom-datetype` and use it. In the minimal example
below we expose the query `now` that simply returns the current date and time.

The important part is that your resolve function needs to return a JavaScript
Date object.

```javascript
// examples/now.js

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
$ babel-node examples/now.js
{ data: { now: '2015-07-24T13:23:15.580Z' } }
```
