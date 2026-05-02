import {
  BlobServiceClient,
  ContainerClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';

let containerClient: ContainerClient | null = null;

function getContainerClient(): ContainerClient {
  if (containerClient) return containerClient;

  const connectionString = process.env.BLOB_CONNECTION_STRING;
  const containerName = process.env.BLOB_CONTAINER || 'pdfs';

  if (!connectionString) {
    throw new Error('BLOB_CONNECTION_STRING must be set');
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  containerClient = blobServiceClient.getContainerClient(containerName);
  return containerClient;
}

export async function uploadPdf(blobName: string, buffer: Buffer, contentType: string): Promise<string> {
  const client = getContainerClient();
  const blockBlobClient = client.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType },
  });

  return blockBlobClient.url;
}

export async function deletePdf(blobName: string): Promise<void> {
  const client = getContainerClient();
  const blockBlobClient = client.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
}

export function generateSasUrl(blobName: string): string {
  const connectionString = process.env.BLOB_CONNECTION_STRING!;
  const containerName = process.env.BLOB_CONTAINER || 'pdfs';

  // Parse connection string to get account name and key
  const parts = connectionString.split(';').reduce((acc, part) => {
    const [key, ...vals] = part.split('=');
    acc[key] = vals.join('=');
    return acc;
  }, {} as Record<string, string>);

  const accountName = parts['AccountName'];
  const accountKey = parts['AccountKey'];

  if (!accountName || !accountKey) {
    // Fallback: return direct URL (works for dev storage / public containers)
    const client = getContainerClient();
    return client.getBlockBlobClient(blobName).url;
  }

  const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    sharedKeyCredential
  );

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse('r'),
      expiresOn: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
    sharedKeyCredential
  ).toString();

  const blobUrl = blobServiceClient
    .getContainerClient(containerName)
    .getBlockBlobClient(blobName).url;

  return `${blobUrl}?${sasToken}`;
}
