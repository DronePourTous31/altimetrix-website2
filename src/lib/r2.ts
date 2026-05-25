import { AwsClient } from "aws4fetch";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY || "";
const R2_SECRET_KEY = process.env.R2_SECRET_KEY || "";
const R2_BUCKET = process.env.R2_BUCKET || "altimetrix-uploads";

const R2_ENDPOINT = R2_ACCOUNT_ID
  ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  : null;

export const R2_BUCKET_NAME = R2_BUCKET;

const r2Aws = R2_ACCESS_KEY && R2_SECRET_KEY
  ? new AwsClient({
      accessKeyId: R2_ACCESS_KEY,
      secretAccessKey: R2_SECRET_KEY,
      service: "s3",
      region: "auto",
    })
  : null;

export function r2Key(clientName: string, projectName: string, type: string, filename: string) {
  return `clients/${clientName}/${projectName}/PHOTOS/${type}/${filename}`;
}

export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  if (!r2Aws || !R2_ENDPOINT) {
    throw new Error("R2 non configuré : clés manquantes");
  }

  const url = `${R2_ENDPOINT}/${R2_BUCKET}/${key}`;

  const res = await r2Aws.fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`R2 upload failed (${res.status}): ${text}`);
  }
}