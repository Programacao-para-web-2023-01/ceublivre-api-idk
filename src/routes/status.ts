import { Bindings } from "@/app";
import { ApiResponse } from "@/lib/api";
import { Status } from "@/models";
import { Hono } from "hono";

export const statusRouter = new Hono<{ Bindings: Bindings }>();

statusRouter.get("/", async c => {
  const statuses = Status.array().parse(
    (await c.env.DB.prepare("SELECT * FROM Status").all()).results
  );

  return ApiResponse.success({
    c,
    data: statuses,
  });
});
