import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { getAllTags } from '../shared/cosmos';

app.http('tags', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'tags',
  handler: async (_request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const tags = await getAllTags();
      return {
        status: 200,
        jsonBody: { tags },
      };
    } catch (err) {
      console.error('Error fetching tags:', err);
      return {
        status: 500,
        jsonBody: { error: 'Failed to fetch tags' },
      };
    }
  },
});
