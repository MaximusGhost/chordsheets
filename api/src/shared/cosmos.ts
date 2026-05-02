import { CosmosClient, Container } from '@azure/cosmos';
import type { SongDocument } from './types';

let container: Container | null = null;

function getContainer(): Container {
  if (container) return container;

  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;
  const databaseId = process.env.COSMOS_DATABASE || 'chordsheets';
  const containerId = process.env.COSMOS_CONTAINER || 'songs';

  if (!endpoint || !key) {
    throw new Error('COSMOS_ENDPOINT and COSMOS_KEY must be set');
  }

  const client = new CosmosClient({ endpoint, key });
  container = client.database(databaseId).container(containerId);
  return container;
}

export async function getSongById(id: string): Promise<SongDocument | null> {
  try {
    const { resource } = await getContainer().item(id, id).read<SongDocument>();
    return resource || null;
  } catch (err: unknown) {
    const cosmosErr = err as { code?: number };
    if (cosmosErr.code === 404) return null;
    throw err;
  }
}

export async function querySongs(params: {
  q?: string;
  tag?: string;
  sort?: string;
  order?: string;
  limit?: number;
  offset?: number;
}): Promise<{ songs: SongDocument[]; total: number }> {
  const conditions: string[] = [];
  const parameters: { name: string; value: string }[] = [];

  if (params.q) {
    const searchLower = params.q.toLowerCase();
    conditions.push(
      '(CONTAINS(LOWER(s.title), @q) OR CONTAINS(LOWER(s.artist), @q) OR ARRAY_CONTAINS(s.tags, @q))'
    );
    parameters.push({ name: '@q', value: searchLower });
  }

  if (params.tag) {
    conditions.push('ARRAY_CONTAINS(s.tags, @tag)');
    parameters.push({ name: '@tag', value: params.tag.toLowerCase() });
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `SELECT VALUE COUNT(1) FROM songs s ${whereClause}`;
  const { resources: countResult } = await getContainer().items
    .query({ query: countQuery, parameters })
    .fetchAll();
  const total = countResult[0] || 0;

  // Sort
  const sortField = params.sort === 'artist' ? 's.artist' : params.sort === 'dateAdded' ? 's.dateAdded' : 's.title';
  const sortOrder = params.order === 'desc' ? 'DESC' : 'ASC';

  const limit = params.limit || 50;
  const offset = params.offset || 0;

  const dataQuery = `SELECT * FROM songs s ${whereClause} ORDER BY ${sortField} ${sortOrder} OFFSET ${offset} LIMIT ${limit}`;
  const { resources: songs } = await getContainer().items
    .query<SongDocument>({ query: dataQuery, parameters })
    .fetchAll();

  return { songs, total };
}

export async function createSongDocument(doc: SongDocument): Promise<SongDocument> {
  const { resource } = await getContainer().items.create(doc);
  return resource as SongDocument;
}

export async function updateSongDocument(id: string, updates: Partial<SongDocument>): Promise<SongDocument> {
  const existing = await getSongById(id);
  if (!existing) throw new Error('Song not found');

  const updated = { ...existing, ...updates, dateModified: new Date().toISOString() };
  const { resource } = await getContainer().item(id, id).replace(updated);
  return resource as SongDocument;
}

export async function deleteSongDocument(id: string): Promise<void> {
  await getContainer().item(id, id).delete();
}

export async function getAllTags(): Promise<{ name: string; count: number }[]> {
  const { resources: songs } = await getContainer().items
    .query<SongDocument>('SELECT s.tags FROM songs s')
    .fetchAll();

  const tagCounts = new Map<string, number>();
  for (const song of songs) {
    for (const tag of song.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  return Array.from(tagCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
