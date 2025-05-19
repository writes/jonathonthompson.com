import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { typeDefs } from '@/lib/graphql/schema';
import { resolvers } from '@/lib/graphql/resolvers';
import { NextRequest } from 'next/server';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      throw new Error('Unauthorized');
    }

    return {
      riotApiKey: process.env.RIOT_API_DEVELOPMENT_KEY,
      user: session.user
    };
  }
});

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}