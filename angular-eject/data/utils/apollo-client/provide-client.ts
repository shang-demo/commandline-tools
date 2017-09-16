import { ApolloClient, createNetworkInterface } from 'apollo-client';

const client = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: 'SERVER_URL/graphql',
  }),
});

export function provideClient(): ApolloClient {
  return client;
}
