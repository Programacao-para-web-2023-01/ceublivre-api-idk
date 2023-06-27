import { z } from "zod";
import { modelError } from "@/lib/model-error";

// Database

export const Status = z.object({
  id: z.number(modelError("id", "number")).optional(),
  name: z.string(modelError("name", "string")),
});

export const Category = z.object({
  id: z.number(modelError("id", "number")).optional(),
  name: z.string(modelError("name", "string")),
});

export const Ticket = z.object({
  // Database

  id: z.number(modelError("id", "number")).optional(),
  message: z.string(modelError("message", "string")),
  imageFileId: z.string(modelError("imageFileId", "string")).optional(),
  userId: z.string(modelError("userId", "string")).optional(),
  statusId: z.coerce.number(modelError("statusId", "number")),
  categoryId: z.coerce.number(modelError("categoryId", "number")),
  createdAt: z.coerce.date(modelError("createdAt", "date")).optional(),
  closedAt: z.coerce.date(modelError("closedAt", "date")).optional(),

  // App

  image: z.instanceof(File).optional(),
});

export const Reply = z.object({
  id: z.number(modelError("id", "number")).optional(),
  userId: z.string(modelError("userId", "string")).optional(),
  ticketId: z.number(modelError("ticketId", "number")).optional(),
  message: z.string(modelError("message", "string")),
  createdAt: z.coerce.date(modelError("createdAt", "date")).optional(),
});

// App

export const JwtPayload = z.object({
  id: z.string(modelError("id", "string")).optional(),
  email: z
    .string(modelError("email", "number"))
    .email("Formato de e-mail inválido"),
  role: z.string(modelError("role", "string")).default("user"),
});

// Bucket

export const B2AuthorizeAccount = z.object({
  absoluteMinimumPartSize: z.number(
    modelError("absoluteMinimumPartSize", "number")
  ),
  accountId: z.string(modelError("accountId", "string")),
  allowed: z.object({
    bucketId: z.string(modelError("bucketId", "string")),
    bucketName: z.string(modelError("bucketName", "string")),
    capabilities: z.string(modelError("capabilities", "string")).array(),
    namePrefix: z.string(modelError("namePrefix", "string")).nullable(),
  }),
  apiUrl: z.string(modelError("apiUrl", "string")),
  authorizationToken: z.string(modelError("authorizationToken", "string")),
  downloadUrl: z.string(modelError("downloadUrl", "string")),
  recommendedPartSize: z.coerce.string(
    modelError("recommendedPartSize", "string")
  ),
  s3ApiUrl: z.string(modelError("s3ApiUrl", "string")),
});

export const B2GetUploadUrl = z.object({
  bucketId: z.string(modelError("bucketId", "string")),
  uploadUrl: z.string(modelError("uploadUrl", "string")),
  authorizationToken: z.string(modelError("authorizationToken", "string")),
});

export const B2UploadFile = z.object({
  acountId: z.coerce.string(modelError("acountId", "string")).optional(),
  action: z.coerce.string(modelError("action", "string")).optional(),
  bucketId: z.coerce.string(modelError("bucketId", "string")).optional(),
  contentLength: z.coerce
    .string(modelError("contentLength", "string"))
    .optional(),
  contentSha1: z.coerce.string(modelError("contentSha1", "string")).optional(),
  contentMd5: z.coerce.string(modelError("contentMd5", "string")).optional(),
  contentType: z.coerce.string(modelError("contentType", "string")).optional(),
  fileId: z.coerce.string(modelError("fileId", "string")).optional(),
  fileInfo: z.coerce.string(modelError("fileInfo", "string")).optional(),
  fileName: z.coerce.string(modelError("fileName", "string")).optional(),
  fileRetention: z.coerce
    .string(modelError("fileRetention", "string"))
    .optional(),
  legalHold: z.coerce.string(modelError("legalHold", "string")).optional(),
  replicationStatus: z.coerce
    .string(modelError("replicationStatus", "string"))
    .optional(),
  serverSideEncryption: z.object({
    algorithm: z.coerce.string(modelError("algorithm", "string")).optional(),
    mode: z.coerce.string(modelError("mode", "string")).optional(),
  }),
  uploadTimestamp: z.coerce
    .number(modelError("uploadTimestamp", "number"))
    .optional(),
});
