require('babel/register')({
  optional: ['runtime', 'es7.asyncFunctions']
})

var chai = require('chai')

var chaiSubset = require('chai-subset')
chai.use(chaiSubset)
