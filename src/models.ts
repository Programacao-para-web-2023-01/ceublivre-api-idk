import { z } from "zod";

export const Status = z.object({
  id: z.number().optional(),
  name: z.string(),
});

export const Priority = z.object({
  id: z.number().optional(),
  name: z.string({
    required_error: "O campo name é obrigatório",
    invalid_type_error: "O tipo do campo name deve ser string",
  }),
});

export const Ticket = z.object({
  id: z.number().optional(),
  message: z.string(),
  userId: z.number(),
  statusId: z.number().optional(),
  priorityId: z.number().optional(),
  createdAt: z.coerce.date().optional(),
  closedAt: z.coerce.date().optional(),
});

export const Image = z.object({
  id: z.number().optional(),
  ticketId: z.number(),
  key: z.string().optional(),
});

export const Reply = z.object({
  id: z.number().optional(),
  userId: z.number(),
  ticketId: z.number(),
  message: z.string(),
  createdAt: z.coerce.date().optional(),
});
