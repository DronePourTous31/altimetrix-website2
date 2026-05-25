import { Client as MinioClient } from "minio";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY || "";
const R2_SECRET_KEY = process.env.R2_SECRET_KEY || "";
const R2_BUCKET = process.env.R2_BUCKET || "altimetrix-uploads";

const r2Client = R2_ACCESS_KEY && R2_SECRET_KEY && R2_ACCOUNT_ID
  ? new MinioClient({
      endPoint: `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      useSSL: true,
      accessKey: R2_ACCESS_KEY,
      secretKey: R2_SECRET_KEY,
      region: "auto",
      pathStyle: true,
    })
  : null;

export const R2_BUCKET_NAME = R2_BUCKET;

export function r2Key(clientName: string, projectName: string, type: string, filename: string) {
  return `clients/${clientName}/${projectName}/PHOTOS/${type}/${filename}`;
}

export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  if (!r2Client) {
    throw new Error("R2 non configuré : clés manquantes");
  }

  const presignedUrl = await r2Client.presignedPutObject(
    R2_BUCKET_NAME,
    key,
    3600,
  );

  const res = await fetch(presignedUrl, {
    method: "PUT",
    body: new Uint8Array(buffer),
    headers: { "Content-Type": contentType },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`R2 upload failed (${res.status}): ${text}`);
  }
}