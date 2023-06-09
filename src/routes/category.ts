import { Hono } from "hono";
import { Bindings } from "@/app";
import { Category } from "@/models";
import { ApiResponse } from "@/lib/api";

export const categoryRouter = new Hono<{ Bindings: Bindings }>();

// GET All categories
categoryRouter.get("/", async c => {
  const categories = Category.array().parse(
    (await c.env.DB.prepare("SELECT * FROM Category").all()).results
  );

  return ApiResponse.success({
    c,
    data: categories,
  });
});

// GET Category by id
categoryRouter.get("/:id", async c => {
  const { id } = c.req.param();

  const category = Category.safeParse(
    await c.env.DB.prepare("SELECT * FROM Category WHERE id = ?")
      .bind(id)
      .first()
  );

  if (!category.success) {
    return ApiResponse.error({
      c,
      status: 404,
      error: new Error("Categoria não encontrada"),
    });
  }

  return ApiResponse.success({
    c,
    data: category.data,
  });
});

// POST Create category
categoryRouter.post("/", async c => {
  const { name } = Category.parse(await c.req.json());

  const category = Category.parse(
    await c.env.DB.prepare("INSERT INTO Category (name) VALUES (?) RETURNING *")
      .bind(name)
      .first()
  );

  return ApiResponse.success({
    c,
    status: 201,
    message: "Categoria criada com sucesso",
    data: category,
  });
});

// PUT Update category by id
categoryRouter.put("/:id", async c => {
  const { id } = c.req.param();
  const { name } = Category.parse(await c.req.json());

  const category = Category.safeParse(
    await c.env.DB.prepare(
      "UPDATE Category SET name = ? WHERE id = ? RETURNING *"
    )
      .bind(name, id)
      .first()
  );

  if (!category.success) {
    return ApiResponse.error({
      c,
      status: 404,
      error: new Error("Categoria não encontrada"),
    });
  }

  return ApiResponse.success({
    c,
    message: "Categoria atualizada com sucesso",
    data: category.data,
  });
});

// DELETE Category by id
categoryRouter.delete("/:id", async c => {
  const { id } = c.req.param();

  const category = Category.safeParse(
    await c.env.DB.prepare("DELETE FROM Category WHERE id = ? RETURNING *")
      .bind(id)
      .first()
  );

  if (!category.success) {
    return ApiResponse.error({
      c,
      status: 404,
      error: new Error("Categoria não encontrada"),
    });
  }

  return c.body(null, 204);
});
