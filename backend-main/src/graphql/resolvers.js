import { fetchHistory, fetchEstimationById, saveFavorite } from "../historyClient.js";

function toGraphQLEstimation(doc) {
  return {
    id: doc._id,
    surface: doc.input?.surface,
    pieces: doc.input?.pieces,
    codePostal: doc.input?.code_postal,
    prixEstime: doc.prixEstime,
    modelVersion: doc.modelVersion,
    createdAt: doc.createdAt,
  };
}

export const resolvers = {
  Query: {
    myEstimations: async (_parent, { limit }, { user }) => {
      const { status, body } = await fetchHistory(user.sub);
      if (status !== 200 || !Array.isArray(body)) {
        return [];
      }
      const list = typeof limit === "number" ? body.slice(0, limit) : body;
      return list.map(toGraphQLEstimation);
    },

    estimation: async (_parent, { id }, { user }) => {
      const { status, body } = await fetchEstimationById(id);
      if (status !== 200 || body.userId !== user.sub) {
        return null;
      }
      return toGraphQLEstimation(body);
    },
  },

  Mutation: {
    addFavorite: async (_parent, { estimationId }, { user }) => {
      const { status } = await saveFavorite({ userId: user.sub, estimationId });
      return status === 201;
    },
  },
};
