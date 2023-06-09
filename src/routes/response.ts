import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { Bindings } from "../app";
import { Reply } from "../models";
import { HTTPException } from "hono/http-exception";

export const response = new Hono<{ Bindings: Bindings }>();

// CREATE
response.post("/", zValidator("json", Reply), async c => {
  const result = Reply.parse(
    await c.env.DB.prepare(
      "INSERT INTO Response (userId, ticketId, message) VALUES (?) RETURNING *"
    )
      .bind(
        c.req.valid("json").userId,
        c.req.valid("json").ticketId,
        c.req.valid("json").message
      )
      .first()
  );

  return c.json(result, 201);
});

// DELETE
response.delete(
  "/:id",
  zValidator("param", z.object({ id: z.string() })),
  async c => {
    const result = Reply.safeParse(
      await c.env.DB.prepare("DELETE FROM Response WHERE id = ? RETUNING *")
        .bind(c.req.valid("param").id)
        .first()
    );

    if (!result.success) return c.notFound();

    return c.body(null, 204);
  }
);