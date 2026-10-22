import http from 'http';
import https from 'https';

export type FetchResult = {
  fullUrl: string;
  statusCode: number;
  location: string;
  body: string;
  error?: string;
};

export function fetchPage(origin: URL, path: string): Promise<FetchResult> {
  return new Promise((resolve) => {
    const fullUrl = `${origin.origin}${path}`;
    const isHttps = origin.protocol === 'https:';
    const client = isHttps ? https : http;
    const chunks: Buffer[] = [];

    const failed = (error: string) =>
      resolve({ fullUrl, statusCode: 0, location: '', body: '', error });

    const req = client.request(
      {
        hostname: origin.hostname,
        port: origin.port || (isHttps ? 443 : 80),
        path,
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'profound-book-club-smoke-test/1.0',
        },
      },
      (res) => {
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            fullUrl,
            statusCode: res.statusCode ?? 0,
            location: res.headers.location || '',
            body: Buffer.concat(chunks).toString('utf-8'),
          });
        });
      },
    );

    req.on('error', (err) => failed(err.message));
    req.on('timeout', () => {
      req.destroy();
      failed('Timeout');
    });
    req.end();
  });
}
