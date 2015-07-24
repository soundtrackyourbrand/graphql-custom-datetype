import {
  GraphQLScalarType,
  GraphQLError
} from 'graphql';

export CustomDateTimeType = new GraphQLScalarType({
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
