import { Bindings } from "@/app";
import { ApiResponse } from "@/lib/api";
import { Status } from "@/models";
import { Hono } from "hono";

export const statusRouter = new Hono<{ Bindings: Bindings }>();

// GET All statuses
statusRouter.get("/", async c => {
  const statuses = Status.array().parse(
    (await c.env.DB.prepare("SELECT * FROM Status").all()).results
  );

  return ApiResponse.success({
    c,
    data: statuses,
  });
});

// GET Status by id
statusRouter.get("/:id", async c => {
  const { id } = c.req.param();

  const status = Status.safeParse(
    await c.env.DB.prepare("SELECT * FROM Status WHERE id = ?").bind(id).first()
  );

  if (!status.success) {
    return ApiResponse.error({
      c,
      status: 404,
      error: new Error("Status não encontrado"),
    });
  }

  return ApiResponse.success({
    c,
    data: status.data,
  });
});
