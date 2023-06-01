import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { Bindings } from "../app";
import { HTTPException } from "hono/http-exception";
import { Ticket } from "../models";
import { apiResponse } from "@/lib/api";

export const tickets = new Hono<{ Bindings: Bindings }>();

// GET All
tickets.get("/", async c => {
  const result = Ticket.array().parse(
    (await c.env.DB.prepare("SELECT * FROM Ticket").all()).results
  );

  return apiResponse.success({
    c,
    data: result,
  });
});

// GET Ticket
tickets.get("/priority/:priorityName", async c => {
  const { priorityName } = await c.req.param();

  const result = Ticket.array().parse(
    (
      await c.env.DB.prepare(
        "SELECT * FROM Ticket INNER JOIN Priority ON Ticket.priorityId = Priority.id WHERE Priority.name = ?;"
      )
        .bind(priorityName)
        .all()
    ).results
  );

  return apiResponse.success({
    c,
    data: result,
  });
});

// GET Status
tickets.get("/status/:statusName", async c => {
  const { statusName } = await c.req.param();

  const result = Ticket.array().parse(
    (
      await c.env.DB.prepare(
        "SELECT * FROM Ticket INNER JOIN Status ON Ticket.statusId = Status.id WHERE Status.name = ?;"
      )
        .bind(statusName)
        .all()
    ).results
  );

  return apiResponse.success({
    c,
    data: result,
  });
});

// GET Id
tickets.get("/:id", async c => {
  const { id } = await c.req.param();

  const result = Ticket.safeParse(
    await c.env.DB.prepare("SELECT * FROM Ticket WHERE id = ?").bind(id).first()
  );

  if (!result.success) return c.notFound();

  return apiResponse.success({
    c,
    data: result,
  });
});

// CREATE
tickets.post("/", async c => {
  const { message, userId, priorityId } = Ticket.parse(await c.req.json());

  const result = Ticket.parse(
    await c.env.DB.prepare(
      "INSERT INTO Ticket (message, userId, priorityId) VALUES (?, ?, ?) RETURNING *"
    )
      .bind(message, userId, priorityId)
      .first()
  );

  return apiResponse.success({
    c,
    status: 201,
    message: "Ticket criado com sucesso",
    data: result,
  });
});

// EDIT
tickets.put(
  "/:id",
  zValidator("param", z.object({ id: z.string() })),
  zValidator("json", Ticket),
  async c => {
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
