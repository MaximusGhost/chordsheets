import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { querySongs } from '../shared/cosmos';

app.http('songs', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'songs',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const url = new URL(request.url);
      const q = url.searchParams.get('q') || undefined;
      const tag = url.searchParams.get('tag') || undefined;
      const sort = url.searchParams.get('sort') || 'title';
      const order = url.searchParams.get('order') || 'asc';
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      const offset = parseInt(url.searchParams.get('offset') || '0', 10);

      const { songs, total } = await querySongs({ q, tag, sort, order, limit, offset });

      const summaries = songs.map((s) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        tags: s.tags,
        key: s.key,
        dateAdded: s.dateAdded,
      }));

      return {
        status: 200,
        jsonBody: { songs: summaries, total, limit, offset },
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error fetching songs:', errorMessage, err);
      return {
        status: 500,
        jsonBody: { error: 'Failed to fetch songs', detail: errorMessage },
      };
    }
  },
});
