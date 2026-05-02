import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { getSongById, deleteSongDocument } from '../shared/cosmos';
import { deletePdf } from '../shared/blob';

app.http('deleteSong', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'songs/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const id = request.params.id;
      if (!id) {
        return { status: 400, jsonBody: { error: 'Song ID is required' } };
      }

      const song = await getSongById(id);
      if (!song) {
        return { status: 404, jsonBody: { error: 'Song not found' } };
      }

      // Delete PDF from blob storage
      await deletePdf(song.pdfBlobName);

      // Delete document from Cosmos DB
      await deleteSongDocument(id);

      return {
        status: 200,
        jsonBody: { message: 'Song deleted successfully' },
      };
    } catch (err) {
      console.error('Error deleting song:', err);
      return {
        status: 500,
        jsonBody: { error: 'Failed to delete song' },
      };
    }
  },
});
