import crypto from "crypto";

const R2_ACCOUNT_ID = () => process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY = () => process.env.R2_ACCESS_KEY || "";
const R2_SECRET_KEY = () => process.env.R2_SECRET_KEY || "";
const R2_BUCKET = () => process.env.R2_BUCKET || "altimetrix-uploads";

export function r2Key(clientName: string, projectName: string, type: string, filename: string) {
  return `clients/${clientName}/${projectName}/PHOTOS/${type}/${filename}`;
}

function hmacSha256(key: string | Buffer, message: string): Buffer {
  return crypto.createHmac("sha256", key).update(message, "utf8").digest();
}

function getSignatureKey(key: string, dateStamp: string, region: string): Buffer {
  const kDate = hmacSha256(`AWS4${key}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, "s3");
  return hmacSha256(kService, "aws4_request");
}

export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  const accountId = R2_ACCOUNT_ID();
  const accessKey = R2_ACCESS_KEY();
  const secretKey = R2_SECRET_KEY();
  const bucket = R2_BUCKET();

  if (!accountId || !accessKey || !secretKey) {
    throw new Error("R2 non configuré : clés manquantes");
  }

  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  const region = "auto";
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]/g, "").slice(0, 15) + "Z";
  const dateStamp = amzDate.slice(0, 8);

  const canonicalUri = `/${bucket}/${key}`;
  const payloadHash = crypto.createHash("sha256").update(buffer).digest("hex");

  const canonicalHeaders = [
    `content-type:${contentType}`,
    `host:${accountId}.r2.cloudflarestorage.com`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
  ].join("\n") + "\n";
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    crypto.createHash("sha256").update(canonicalRequest, "utf8").digest("hex"),
  ].join("\n");

  const signingKey = getSignatureKey(secretKey, dateStamp, region);
  const signature = hmacSha256(signingKey, stringToSign).toString("hex");

  const authorization = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`${endpoint}${canonicalUri}`, {
    method: "PUT",
    body: new Uint8Array(buffer),
    headers: {
      "Content-Type": contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization: authorization,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`R2 upload failed (${res.status}): ${text}`);
  }
}

export async function deleteR2Prefix(prefix: string): Promise<{ deleted: number }> {
  const accountId = R2_ACCOUNT_ID();
  const accessKey = R2_ACCESS_KEY();
  const secretKey = R2_SECRET_KEY();
  const bucket = R2_BUCKET();

  if (!accountId || !accessKey || !secretKey) {
    throw new Error("R2 non configuré : clés manquantes");
  }

  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  const region = "auto";
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]/g, "").slice(0, 15) + "Z";
  const dateStamp = amzDate.slice(0, 8);

  // 1. List objects
  const listCanonicalUri = `/${bucket}?prefix=${encodeURIComponent(prefix)}&list-type=2`;
  const listPayloadHash = crypto.createHash("sha256").update("").digest("hex");
  const listCanonicalHeaders = [
    `host:${accountId}.r2.cloudflarestorage.com`,
    `x-amz-content-sha256:${listPayloadHash}`,
    `x-amz-date:${amzDate}`,
  ].join("\n") + "\n";
  const listSignedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const listRequest = ["GET", listCanonicalUri, "", listCanonicalHeaders, listSignedHeaders, listPayloadHash].join("\n");
  const listCredentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const listStringToSign = ["AWS4-HMAC-SHA256", amzDate, listCredentialScope, crypto.createHash("sha256").update(listRequest, "utf8").digest("hex")].join("\n");
  const listSigningKey = getSignatureKey(secretKey, dateStamp, region);
  const listSignature = hmacSha256(listSigningKey, listStringToSign).toString("hex");
  const listAuthorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${listCredentialScope}, SignedHeaders=${listSignedHeaders}, Signature=${listSignature}`;

  const listRes = await fetch(`${endpoint}${listCanonicalUri}`, {
    headers: {
      "x-amz-content-sha256": listPayloadHash,
      "x-amz-date": amzDate,
      Authorization: listAuthorization,
    },
  });

  if (!listRes.ok) {
    throw new Error(`R2 list failed (${listRes.status})`);
  }

  const xmlText = await listRes.text();
  const keys: string[] = [];
  const keyRegex = /<Key>([^<]+)<\/Key>/g;
  let match;
  while ((match = keyRegex.exec(xmlText)) !== null) {
    keys.push(match[1]);
  }

  if (keys.length === 0) return { deleted: 0 };

  // 2. Delete objects in batches
  const batchSize = 1000;
  let deleted = 0;
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    const deleteBody = `<?xml version="1.0" encoding="UTF-8"?><Delete><Quiet>true</Quiet>${batch.map(k => `<Object><Key>${k}</Key></Object>`).join("")}</Delete>`;
    const bodyBuffer = Buffer.from(deleteBody, "utf-8");
    const delPayloadHash = crypto.createHash("sha256").update(bodyBuffer).digest("hex");

    const delCanonicalUri = `/${bucket}?delete`;
    const delCanonicalHeaders = [
      `content-length:${bodyBuffer.length}`,
      `content-type:application/xml`,
      `host:${accountId}.r2.cloudflarestorage.com`,
      `x-amz-content-sha256:${delPayloadHash}`,
      `x-amz-date:${amzDate}`,
    ].join("\n") + "\n";
    const delSignedHeaders = "content-length;content-type;host;x-amz-content-sha256;x-amz-date";
    const delRequest = ["POST", delCanonicalUri, "", delCanonicalHeaders, delSignedHeaders, delPayloadHash].join("\n");
    const delCredentialScope = `${dateStamp}/${region}/s3/aws4_request`;
    const delStringToSign = ["AWS4-HMAC-SHA256", amzDate, delCredentialScope, crypto.createHash("sha256").update(delRequest, "utf8").digest("hex")].join("\n");
    const delSigningKey = getSignatureKey(secretKey, dateStamp, region);
    const delSignature = hmacSha256(delSigningKey, delStringToSign).toString("hex");
    const delAuthorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${delCredentialScope}, SignedHeaders=${delSignedHeaders}, Signature=${delSignature}`;

    const delRes = await fetch(`${endpoint}${delCanonicalUri}`, {
      method: "POST",
      body: bodyBuffer,
      headers: {
        "Content-Type": "application/xml",
        "Content-Length": String(bodyBuffer.length),
        "x-amz-content-sha256": delPayloadHash,
        "x-amz-date": amzDate,
        Authorization: delAuthorization,
      },
    });

    if (!delRes.ok) {
      throw new Error(`R2 delete batch failed (${delRes.status}): ${await delRes.text()}`);
    }
    deleted += batch.length;
  }

  return { deleted };
}

const R2_ALTIMETRIX_ACCOUNT_ID = "a68384fa11156d1e49c1922e63345cf3";
const R2_ALTIMETRIX_ACCESS_KEY = "b0cbc9a556e0b9fdb369992b24d61490";
const R2_ALTIMETRIX_SECRET_KEY = "49cd23aa1c9424c95535e5a32df9b78ac4a124fbc72848688d1e83b3f82aaacf";
const R2_ALTIMETRIX_BUCKET = "altimetrix";

async function r2DeletePrefix(
  accountId: string,
  accessKey: string,
  secretKey: string,
  bucket: string,
  prefix: string,
): Promise<{ deleted: number }> {
  const region = "auto";
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]/g, "").slice(0, 15) + "Z";
  const dateStamp = amzDate.slice(0, 8);
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

  // 1. List objects
  const listCanonicalUri = `/${bucket}?prefix=${encodeURIComponent(prefix)}&list-type=2`;
  const listPayloadHash = crypto.createHash("sha256").update("").digest("hex");
  const listCanonicalHeaders = [
    `host:${accountId}.r2.cloudflarestorage.com`,
    `x-amz-content-sha256:${listPayloadHash}`,
    `x-amz-date:${amzDate}`,
  ].join("\n") + "\n";
  const listSignedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const listRequest = ["GET", listCanonicalUri, "", listCanonicalHeaders, listSignedHeaders, listPayloadHash].join("\n");
  const listCredentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const listStringToSign = ["AWS4-HMAC-SHA256", amzDate, listCredentialScope, crypto.createHash("sha256").update(listRequest, "utf8").digest("hex")].join("\n");
  const listSigningKey = getSignatureKey(secretKey, dateStamp, region);
  const listSignature = hmacSha256(listSigningKey, listStringToSign).toString("hex");
  const listAuthorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${listCredentialScope}, SignedHeaders=${listSignedHeaders}, Signature=${listSignature}`;

  const listRes = await fetch(`${endpoint}${listCanonicalUri}`, {
    headers: {
      "x-amz-content-sha256": listPayloadHash,
      "x-amz-date": amzDate,
      Authorization: listAuthorization,
    },
  });

  if (!listRes.ok) {
    throw new Error(`R2 list failed (${listRes.status})`);
  }

  const xmlText = await listRes.text();
  const keys: string[] = [];
  const keyRegex = /<Key>([^<]+)<\/Key>/g;
  let match;
  while ((match = keyRegex.exec(xmlText)) !== null) keys.push(match[1]);

  if (keys.length === 0) return { deleted: 0 };

  // 2. Delete objects in batches
  const batchSize = 1000;
  let deleted = 0;
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    const deleteBody = `<?xml version="1.0" encoding="UTF-8"?><Delete><Quiet>true</Quiet>${batch.map(k => `<Object><Key>${k}</Key></Object>`).join("")}</Delete>`;
    const bodyBuffer = Buffer.from(deleteBody, "utf-8");
    const delPayloadHash = crypto.createHash("sha256").update(bodyBuffer).digest("hex");

    const delCanonicalUri = `/${bucket}?delete`;
    const delCanonicalHeaders = [
      `content-length:${bodyBuffer.length}`,
      `content-type:application/xml`,
      `host:${accountId}.r2.cloudflarestorage.com`,
      `x-amz-content-sha256:${delPayloadHash}`,
      `x-amz-date:${amzDate}`,
    ].join("\n") + "\n";
    const delSignedHeaders = "content-length;content-type;host;x-amz-content-sha256;x-amz-date";
    const delRequest = ["POST", delCanonicalUri, "", delCanonicalHeaders, delSignedHeaders, delPayloadHash].join("\n");
    const delCredentialScope = `${dateStamp}/${region}/s3/aws4_request`;
    const delStringToSign = ["AWS4-HMAC-SHA256", amzDate, delCredentialScope, crypto.createHash("sha256").update(delRequest, "utf8").digest("hex")].join("\n");
    const delSigningKey = getSignatureKey(secretKey, dateStamp, region);
    const delSignature = hmacSha256(delSigningKey, delStringToSign).toString("hex");
    const delAuthorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${delCredentialScope}, SignedHeaders=${delSignedHeaders}, Signature=${delSignature}`;

    const delRes = await fetch(`${endpoint}${delCanonicalUri}`, {
      method: "POST",
      body: bodyBuffer,
      headers: {
        "Content-Type": "application/xml",
        "Content-Length": String(bodyBuffer.length),
        "x-amz-content-sha256": delPayloadHash,
        "x-amz-date": amzDate,
        Authorization: delAuthorization,
      },
    });

    if (!delRes.ok) {
      throw new Error(`R2 delete batch failed (${delRes.status}): ${await delRes.text()}`);
    }
    deleted += batch.length;
  }

  return { deleted };
}

export async function deleteR2AltimetrixPrefix(prefix: string): Promise<{ deleted: number }> {
  return r2DeletePrefix(
    R2_ALTIMETRIX_ACCOUNT_ID,
    R2_ALTIMETRIX_ACCESS_KEY,
    R2_ALTIMETRIX_SECRET_KEY,
    R2_ALTIMETRIX_BUCKET,
    prefix,
  );
}

export async function getUploadUrl(key: string): Promise<string> {
  const accountId = R2_ACCOUNT_ID();
  const accessKey = R2_ACCESS_KEY();
  const secretKey = R2_SECRET_KEY();
  const bucket = R2_BUCKET();

  if (!accountId || !accessKey || !secretKey) {
    throw new Error("R2 non configuré : clés manquantes");
  }

  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  const region = "auto";
  const now = new Date();
  const expires = 3600;
  const expiresDate = new Date(now.getTime() + expires * 1000);
  const amzDate = now.toISOString().replace(/[:-]/g, "").slice(0, 15) + "Z";
  const dateStamp = amzDate.slice(0, 8);

  const canonicalUri = `/${bucket}/${key}`;
  const signedHeaders = "host";
  const credential = `${accessKey}/${dateStamp}/${region}/s3/aws4_request`;

  const canonicalQuerystring = [
    `X-Amz-Algorithm=AWS4-HMAC-SHA256`,
    `X-Amz-Credential=${encodeURIComponent(credential)}`,
    `X-Amz-Date=${amzDate}`,
    `X-Amz-Expires=${expires}`,
    `X-Amz-SignedHeaders=${signedHeaders}`,
  ].join("&");

  const canonicalHeaders = `host:${accountId}.r2.cloudflarestorage.com\n`;
  const payloadHash = "UNSIGNED-PAYLOAD";

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQuerystring,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    `${dateStamp}/${region}/s3/aws4_request`,
    crypto.createHash("sha256").update(canonicalRequest, "utf8").digest("hex"),
  ].join("\n");

  const signingKey = getSignatureKey(secretKey, dateStamp, region);
  const signature = hmacSha256(signingKey, stringToSign).toString("hex");

  return `${endpoint}${canonicalUri}?${canonicalQuerystring}&X-Amz-Signature=${signature}`;
}
