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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error fetching tags:', errorMessage, err);
      return {
        status: 500,
        jsonBody: { error: 'Failed to fetch tags', detail: errorMessage },
      };
    }
  },
});
