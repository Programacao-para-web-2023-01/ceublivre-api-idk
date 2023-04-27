import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { Bindings } from "../app";
import { Priority } from "../models";
import { HTTPException } from "hono/http-exception";

export const priorities = new Hono<{ Bindings: Bindings }>();

priorities.get("/", async c => {
  const result = Priority.array().parse(
    (await c.env.DB.prepare("SELECT * FROM Priority").all()).results
  );

  return c.json(result);
});

priorities.get(
  "/:id",
  zValidator("param", z.object({ id: z.string() })),
  async c => {
    const result = Priority.safeParse(
      await c.env.DB.prepare("SELECT * FROM Priority WHERE id = ?")
        .bind(c.req.valid("param").id)
        .first()
    );

    if (!result.success) return c.notFound();

    return c.json(result.data);
  }
);

priorities.post("/", zValidator("json", Priority), async c => {
  try {
    const result = Priority.parse(
      await c.env.DB.prepare(
        "INSERT INTO Priority (name) VALUES (?) RETURNING *"
      )
        .bind(c.req.valid("json").name)
        .first()
    );

    return c.json(result, 201);
  } catch (error) {
    // Todo: Handle error message
    throw new HTTPException(500, {
      res: new Response("Error creating a priority type", { status: 500 }),
    });
  }
});

priorities.put(
  "/:id",
  zValidator("param", z.object({ id: z.string() })),
  zValidator("json", Priority),
  async c => {
    try {
      const result = Priority.safeParse(
        await c.env.DB.prepare(
          "UPDATE Priority SET name = ? WHERE id = ? RETURNING *"
        )
          .bind(c.req.valid("json").name, c.req.valid("param").id)
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

priorities.delete(
  "/:id",
  zValidator("param", z.object({ id: z.string() })),
  async c => {
    const result = Priority.safeParse(
      await c.env.DB.prepare("DELETE FROM Priority WHERE id = ? RETURNING *")
        .bind(c.req.valid("param").id)
        .first()
    );

    if (!result.success) return c.notFound();

    return c.body(null, 204);
  }
);
