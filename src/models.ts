import { z } from "zod";
import { modelError } from "@/lib/model-error";

export const Status = z.object({
  id: z.number(modelError("id", "number")).optional(),
  name: z.string(modelError("name", "string")),
});

export const Category = z.object({
  id: z.number(modelError("id", "number")).optional(),
  name: z.string(modelError("name", "string")),
});

export const Ticket = z.object({
  id: z.number(modelError("id", "number")).optional(),
  message: z.string(modelError("message", "string")),
  userId: z.number(modelError("userId", "number")),
  statusId: z.number(modelError("statusId", "number")).optional(),
  categoryId: z.number(modelError("categoryId", "number")).optional(),
  createdAt: z.coerce.date(modelError("createdAt", "date")).optional(),
  closedAt: z.coerce.date(modelError("closedAt", "date")).optional(),
});

export const Image = z.object({
  id: z.number(modelError("id", "number")).optional(),
  ticketId: z.number(modelError("ticketId", "number")),
  key: z.string(modelError("key", "string")).optional(),
});

export const Reply = z.object({
  id: z.number(modelError("id", "number")).optional(),
  userId: z.number(modelError("userId", "number")),
  ticketId: z.number(modelError("ticketId", "number")),
  message: z.string(modelError("message", "string")),
  createdAt: z.coerce.date(modelError("createdAt", "date")).optional(),
});
