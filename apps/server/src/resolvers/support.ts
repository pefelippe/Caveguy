import type { Resolvers } from '@zapbots/graphql/server';

import { contactTeam, SupportError } from '../services/support';
import { badInput, requireViewer } from './guards';

export const supportResolvers: Resolvers = {
  Mutation: {
    contactTeam: async (_, args, context) => {
      const viewer = requireViewer(context);
      try {
        await contactTeam(viewer, args);
      } catch (error) {
        if (error instanceof SupportError) badInput(error.message);
        throw error;
      }
      return true;
    },
  },
};
