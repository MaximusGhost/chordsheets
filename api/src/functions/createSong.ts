import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { randomUUID } from 'crypto';
import Busboy from 'busboy';
import { Readable } from 'stream';
import { createSongDocument } from '../shared/cosmos';
import { uploadPdf } from '../shared/blob';
import type { SongDocument } from '../shared/types';

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

    // Convert request body to stream and pipe to busboy
    const body = request.body;
    if (body) {
      const readable = Readable.from(body as AsyncIterable<Uint8Array>);
      readable.pipe(busboy);
    } else {
      reject(new Error('No request body'));
    }
  });
}

app.http('createSong', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'songs',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const { fields, file } = await parseMultipart(request);

      const title = fields.title;
      const artist = fields.artist;
      const tagsRaw = fields.tags;

      if (!title || !artist || !tagsRaw || !file) {
        return {
          status: 400,
          jsonBody: { error: 'title, artist, tags, and pdf file are required' },
        };
      }

      let tags: string[];
      try {
        tags = JSON.parse(tagsRaw);
        if (!Array.isArray(tags) || tags.length === 0) {
          throw new Error('Tags must be a non-empty array');
        }
      } catch {
        return {
          status: 400,
          jsonBody: { error: 'tags must be a valid JSON array with at least one entry' },
        };
      }

      if (file.mimeType !== 'application/pdf') {
        return {
          status: 400,
          jsonBody: { error: 'File must be a PDF' },
        };
      }

      const id = randomUUID();
      const pdfBlobName = `${id}.pdf`;
      const now = new Date().toISOString();

      // Upload PDF to blob storage
      const pdfUrl = await uploadPdf(pdfBlobName, file.buffer, file.mimeType);

      // Create document in Cosmos DB
      const doc: SongDocument = {
        id,
        title,
        artist,
        tags: tags.map((t) => t.toLowerCase().trim()),
        key: fields.key || undefined,
        notes: fields.notes || undefined,
        pdfBlobName,
        pdfUrl,
        dateAdded: now,
        dateModified: now,
      };

      await createSongDocument(doc);

      return {
        status: 201,
        jsonBody: { id, title, message: 'Song uploaded successfully' },
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error creating song:', errorMessage, err);
      return {
        status: 500,
        jsonBody: { error: 'Failed to upload song', detail: errorMessage },
      };
    }
  },
});
