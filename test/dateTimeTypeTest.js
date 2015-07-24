import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLError
} from 'graphql';

import { describe, it } from 'mocha';
import { expect } from 'chai';

var CustomDateTimeType = new GraphQLScalarType({
  name: 'DateTime',
  coerce: value => {
    if (!value instanceof Date) throw new GraphQLError("Field error!", value)
    if (isNaN(value.getTime())) throw new GraphQLError("Field error!", value)
    return value.toJSON()
  },
  coerceLiteral(ast) {
    console.log("coerceLiteral", ast)
    if (ast.kind !== "StringValue") throw new GraphQLError("Query error!", ast.loc)
    let d = new Date(ast.value);
    if (isNaN(d.getTime())) throw new GraphQLError("Query error!", ast.loc)
    return d
  }
});

describe('Type System: Custom scalar', () => {
  it('coerses dates', () => {
    let aDateStr = '2015-07-24T10:56:42.744Z'
    let aDateObj = new Date(aDateStr)

    expect(
      CustomDateTimeType.coerce(aDateObj)
    ).to.equal(aDateStr);
  });

  it('stringifies dates', async () => {
    let now = new Date()

    let schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          now: {
            type: CustomDateTimeType,
            resolve: () => now
          }
        }
      })
    });

    return expect(
      await graphql(schema, `{ now }`)
    ).to.deep.equal({
        data: {
          now: now.toJSON()
        }
      });
  });

  it('handles null', async () => {
    let now = null

    let schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          now: {
            type: CustomDateTimeType,
            resolve: () => now
          }
        }
      })
    });

    return expect(
      await graphql(schema, `{ now }`)
    ).to.deep.equal({
        data: {
          now: null
        }
      });
  });

  it.skip('fails when now is not a date', async () => {
    let now = "asdasdasda"

    let schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          now: {
            type: CustomDateTimeType,
            resolve: () => now
          }
        }
      })
    });

    return expect(
      await graphql(schema, `{ now }`)
    ).to.deep.equal({});
  });

  describe('dates as input', () => {
    let schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          nextDay: {
            type: CustomDateTimeType,
            args: {
              date: {
                type: CustomDateTimeType
              }
            },
            resolve: (_, {date}) => {
              console.log("Input (should be a proper date object):", date, typeof date);
              return new Date(date.getTime() + 24 * 3600 * 1000)
            }
          }
        }
      })
    });

    it('handles dates as input', async () => {
      let someday = '2015-07-24T10:56:42.744Z';
      let nextDay = '2015-07-25T10:56:42.744Z';

      return expect(
        await graphql(schema, `{ nextDay(date: "${someday}") }`)
      ).to.deep.equal({
          data: {
            nextDay: nextDay
          }
        });
    });

    it('chokes on invalid dates as input', async () => {
      let invalidDate = 'apa';

      return expect(
        await graphql(schema, `{ nextDay(date: "${invalidDate}") }`)
      ).to.deep.equal({
          errors: {
            nextDay: "???"
          }
        });
    });

  })

});
