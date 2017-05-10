import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType
} from 'graphql'
import { describe, it } from 'mocha'
import { expect } from 'chai'

import CustomGraphQLDateType from '../datetype.js'

describe('GraphQL date type', () => {
  it('coerses date object to string', () => {
    let aDateStr = '2015-07-24T10:56:42.744Z'
    let aDateObj = new Date(aDateStr)

    expect(
      CustomGraphQLDateType.serialize(aDateObj)
    ).to.equal(aDateStr)
  })

  it('stringifies dates', async () => {
    let now = new Date()

    let schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          now: {
            type: CustomGraphQLDateType,
            resolve: () => now
          }
        }
      })
    })

    return expect(
      await graphql(schema, `{ now }`)
    ).to.deep.equal({
      data: {
        now: now.toJSON()
      }
    })
  })

  it('handles null', async () => {
    let now = null

    let schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          now: {
            type: CustomGraphQLDateType,
            resolve: () => now
          }
        }
      })
    })

    return expect(
      await graphql(schema, `{ now }`)
    ).to.deep.equal({
      data: {
        now: null
      }
    })
  })

  it('fails when now is not a date', async () => {
    let now = 'invalid date'

    let schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          now: {
            type: CustomGraphQLDateType,
            resolve: () => now
          }
        }
      })
    })

    return expect(
      await graphql(schema, `{ now }`)
    ).to.containSubset({
      errors: [{
        message: 'Field error: value is not an instance of Date'
      }]
    })
  })

  describe('dates as input', () => {
    let schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          nextDay: {
            type: CustomGraphQLDateType,
            args: {
              date: {
                type: CustomGraphQLDateType
              }
            },
            resolve: (_, {date}) => {
              return new Date(date.getTime() + 24 * 3600 * 1000)
            }
          }
        }
      })
    })

    it('handles dates as input', async () => {
      let someday = '2015-07-24T10:56:42.744Z'
      let nextDay = '2015-07-25T10:56:42.744Z'

      return expect(
        await graphql(schema, `{ nextDay(date: "${someday}") }`)
      ).to.deep.equal({
        data: {
          nextDay: nextDay
        }
      })
    })

    it('does not accept alternative date formats', async () => {
      let someday = 'Fri Jul 24 2015 12:56:42 GMT+0200 (CEST)'

      return expect(
        await graphql(schema, `{ nextDay(date: "${someday}") }`)
      ).to.containSubset({
        errors: [{
          locations: [],
          message: 'Query error: Invalid date format, only accepts: YYYY-MM-DDTHH:MM:SS.SSSZ: ' + someday
        }]
      })
    })

    it('chokes on invalid dates as input', async () => {
      let invalidDate = 'invalid data'

      return expect(
        await graphql(schema, `{ nextDay(date: "${invalidDate}") }`)
      ).to.containSubset({
        errors: [{
          locations: [],
          message: 'Query error: Invalid date: ' + invalidDate
        }]
      })
    })
  })

  describe('dates as variable', () => {
    let schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          nextDay: {
            type: CustomGraphQLDateType,
            args: {
              date: {
                type: CustomGraphQLDateType
              }
            },
            resolve: (_, {date}) => {
              return new Date(date.getTime() + 24 * 3600 * 1000)
            }
          }
        }
      })
    })

    it('handles dates as variable', async () => {
      let someday = '2015-07-24T10:56:42.744Z'
      let nextDay = '2015-07-25T10:56:42.744Z'

      return expect(
        await graphql(schema,
          `query ($date: DateTime!) { nextDay(date: $date) }`,
          null, null, { date: someday })
      ).to.deep.equal({
        data: {
          nextDay: nextDay
        }
      })
    })

    it('does not accept alternative date formats as variable', async () => {
      let someday = 'Fri Jul 24 2015 12:56:42 GMT+0200 (CEST)'

      let result = await graphql(schema,
        `query ($date: DateTime!) { nextDay(date: $date) }`,
        null, null, { date: someday })

      expect(result).to.have.deep.property(
        'errors[0].message',
        'Invalid date format, only accepts: YYYY-MM-DDTHH:MM:SS.SSSZ: ' + someday
      )
    })

    it('chokes on invalid dates as variable', async () => {
      let invalidDate = 'invalid data'

      let result = await graphql(schema,
        `query ($date: DateTime!) { nextDay(date: $date) }`,
        null, null, { date: invalidDate })

      expect(result).to.have.deep.property(
        'errors[0].message',
        'Invalid date: ' + invalidDate
      )
    })
  })
})
