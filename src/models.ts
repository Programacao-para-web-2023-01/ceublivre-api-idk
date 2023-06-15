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
  id: z.number(modelError("id", "number")).optional(),
  message: z.string(modelError("message", "string")),
  userId: z.string(modelError("userId", "string")).optional(),
  statusId: z.number(modelError("statusId", "number")),
  categoryId: z.number(modelError("categoryId", "number")),
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
