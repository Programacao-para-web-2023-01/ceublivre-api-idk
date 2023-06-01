import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { Bindings } from "../app";
import { Priority } from "../models";
import { apiResponse } from "@/lib/api";

export const priorities = new Hono<{ Bindings: Bindings }>();

priorities.get("/", async c => {
  const result = Priority.array().parse(
    (await c.env.DB.prepare("SELECT * FROM Priority").all()).results
  );

  return apiResponse.success({
    c,
    data: result,
  });
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

    return apiResponse.success({
      c,
      data: result.data,
    });
  }
);

priorities.post("/", async c => {
  const { name } = Priority.parse(await c.req.json());

  const result = Priority.parse(
    await c.env.DB.prepare("INSERT INTO Priority (name) VALUES (?) RETURNING *")
      .bind(name)
      .first()
  );

  return apiResponse.success({
    c,
    status: 201,
    message: "Priority criada com sucesso",
    data: result,
  });
});

priorities.put("/:id", async c => {
  const { id } = await c.req.param();
  const { name } = Priority.parse(await c.req.json());

  const result = Priority.safeParse(
    await c.env.DB.prepare(
      "UPDATE Priority SET name = ? WHERE id = ? RETURNING *"
    )
      .bind(name, id)
      .first()
  );

  if (!result.success) return c.notFound();

  return apiResponse.success({
    c,
    status: 200,
    message: "Priority atualizada com sucesso",
    data: result.data,
  });
});

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
