import '../shared/init';
import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import Busboy from 'busboy';
import { Readable } from 'stream';
import { getSongById, updateSongDocument } from '../shared/cosmos';
import { uploadPdf, deletePdf } from '../shared/blob';

interface ParsedForm {
  fields: Record<string, string>;
  file: { buffer: Buffer; filename: string; mimeType: string } | null;
}

async function parseMultipart(request: HttpRequest): Promise<ParsedForm> {
  return new Promise((resolve, reject) => {
    const fields: Record<string, string> = {};
    let file: ParsedForm['file'] = null;

    const contentType = request.headers.get('content-type') || '';
    const busboy = Busboy({ headers: { 'content-type': contentType } });

    busboy.on('field', (name: string, val: string) => {
      fields[name] = val;
    });

    busboy.on('file', (_name: string, stream: Readable, info: { filename: string; mimeType: string }) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => {
        file = {
          buffer: Buffer.concat(chunks),
          filename: info.filename,
          mimeType: info.mimeType,
        };
      });
    });

    busboy.on('finish', () => resolve({ fields, file }));
    busboy.on('error', reject);

    const body = request.body;
    if (body) {
      const readable = Readable.from(body as AsyncIterable<Uint8Array>);
      readable.pipe(busboy);
    } else {
      reject(new Error('No request body'));
    }
  });
}

app.http('updateSong', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'songs/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const id = request.params.id;
      if (!id) {
        return { status: 400, jsonBody: { error: 'Song ID is required' } };
      }

      const existing = await getSongById(id);
      if (!existing) {
        return { status: 404, jsonBody: { error: 'Song not found' } };
      }

      const { fields, file } = await parseMultipart(request);

      const updates: Record<string, unknown> = {};
      if (fields.title) updates.title = fields.title;
      if (fields.artist) updates.artist = fields.artist;
      if (fields.tags) {
        try {
          const tags = JSON.parse(fields.tags);
          if (Array.isArray(tags)) {
            updates.tags = tags.map((t: string) => t.toLowerCase().trim());
          }
        } catch {
          return { status: 400, jsonBody: { error: 'Invalid tags format' } };
        }
      }
      if (fields.key !== undefined) updates.key = fields.key || undefined;
      if (fields.notes !== undefined) updates.notes = fields.notes || undefined;

      // Replace PDF if a new one was uploaded
      if (file) {
        if (file.mimeType !== 'application/pdf') {
          return { status: 400, jsonBody: { error: 'File must be a PDF' } };
        }
        // Delete old blob
        await deletePdf(existing.pdfBlobName);
        // Upload new blob with same name
        const pdfUrl = await uploadPdf(existing.pdfBlobName, file.buffer, file.mimeType);
        updates.pdfUrl = pdfUrl;
      }

      await updateSongDocument(id, updates);

      return {
        status: 200,
        jsonBody: { id, message: 'Song updated successfully' },
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error updating song:', errorMessage, err);
      return {
        status: 500,
        jsonBody: { error: 'Failed to update song', detail: errorMessage },
      };
    }
  },
});
