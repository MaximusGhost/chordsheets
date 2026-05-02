import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { getSongById } from '../shared/cosmos';
import { generateSasUrl } from '../shared/blob';

app.http('song', {
  methods: ['GET'],
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

      // Generate a fresh SAS URL for the PDF
      const pdfUrl = generateSasUrl(song.pdfBlobName);

      return {
        status: 200,
        jsonBody: { ...song, pdfUrl },
      };
    } catch (err) {
      console.error('Error fetching song:', err);
      return {
        status: 500,
        jsonBody: { error: 'Failed to fetch song' },
      };
    }
  },
});
