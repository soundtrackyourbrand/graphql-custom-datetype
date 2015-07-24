import {
  GraphQLScalarType,
  GraphQLError
} from 'graphql';

export default new GraphQLScalarType({
  name: 'DateTime',
  coerce: value => {
    if (!value instanceof Date) {
      // Should we always return null instead of errors like the built in types?
      throw new GraphQLError("Field error!", value)
    }
    if (isNaN(value.getTime())) {
      throw new GraphQLError("Field error!", value)
    }
    return value.toJSON()
  },
  coerceLiteral(ast) {
    // Should we import Kind somehow and use Kind.STRING instead of "StringValue"?
    if (ast.kind !== "StringValue") {
      // How do we create sane error messages?
      throw new GraphQLError("Query error!", ast)
    }
    let result = new Date(ast.value);
    if (isNaN(result.getTime())) {
      throw new GraphQLError("Query error!", ast)
    }
    return result
  }
});
