export const typeDefs = `#graphql
  type Estimation {
    id: ID!
    surface: Float!
    pieces: Int!
    codePostal: String!
    prixEstime: Float!
    modelVersion: String
    createdAt: String!
  }

  type Query {
    myEstimations(limit: Int): [Estimation!]!
    estimation(id: ID!): Estimation
  }

  type Mutation {
    addFavorite(estimationId: ID!): Boolean!
  }
`;
