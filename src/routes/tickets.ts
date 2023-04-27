import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { Bindings } from "../app";
import { HTTPException } from "hono/http-exception";
import { Ticket } from "../models";

export const tickets = new Hono<{ Bindings: Bindings }>();

// GET ALL
tickets.get("/", async c => {
  const result = Ticket.array().parse(
    (await c.env.DB.prepare("SELECT * FROM Ticket").all()).results
  );

  return c.json(result);
});

// GET ID
tickets.get(
  "/:id",
  zValidator("param", z.object({ id: z.string() })),
  async c => {
    const result = Ticket.safeParse(
      await c.env.DB.prepare("SELECT * FROM Ticket WHERE id = ?")
        .bind(c.req.valid("param").id)
        .first()
    );

    if (!result.success) return c.notFound();

    return c.json(result.data);
  }
);

// CREATE
tickets.post("/", zValidator("json", Ticket), async c => {
  try {
    const result = Ticket.parse(
      await c.env.DB.prepare(
        "INSERT INTO Ticket (message, userId, priorityId) VALUES (?, ?, ?) RETURNING *"
      )
        .bind(
          c.req.valid("json").message,
          c.req.valid("json").userId,
          c.req.valid("json").priorityId
        )
        .first()
    );

    return c.json(result, 201);
  } catch (error) {
    // Todo: Handle error message
    throw new HTTPException(500, {
      res: new Response("Error creating a ticket", { status: 500 }),
    });
  }
});

// EDIT
tickets.put(
  "/:id",
  zValidator("param", z.object({ id: z.string() })),
  zValidator("json", Ticket),
  async c => {
    try {
      const result = Ticket.safeParse(
        await c.env.DB.prepare(
          "UPDATE Ticket SET message = ?, statusId = ?, priorityId = ? WHERE id = ? RETURNING *"
        )
          .bind(
            c.req.valid("json").message,
            c.req.valid("json").statusId,
            c.req.valid("json").priorityId,
            //c.req.valid("json").closedAt,
            c.req.valid("param").id
          )
          .first()
      );

      if (!result.success) return c.notFound();

      return c.json(result.data, 201);
    } catch (error) {
      // Todo: Handle error message
      throw new HTTPException(500, {
        res: new Response("Error updating an existing priority", {
          status: 500,
        }),
      });
    }
  }
);

// DELETE
tickets.delete(
  "/:id",
  zValidator("param", z.object({ id: z.string() })),
  async c => {
    const result = Ticket.safeParse(
      await c.env.DB.prepare("DELETE FROM Ticket WHERE id = ? RETURNING *")
        .bind(c.req.valid("param").id)
        .first()
    );

    if (!result.success) return c.notFound();

    return c.body(null, 204);
  }
);
