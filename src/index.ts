import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { categoryRouter } from "@/routes/category";
import { ticketRouter } from "@/routes/ticket";
import { prettyJSON } from "hono/pretty-json";
import { Bindings } from "@/app";
import { ApiResponse } from "@/lib/api";
import { statusRouter } from "@/routes/status";
import { JwtPayload } from "@/models";

const app = new Hono<{ Bindings: Bindings }>({ strict: false });

app.use("*", prettyJSON({ space: 2 }));
app.use("*", (c, next) => {
  const jwtMiddleware = jwt({ secret: c.env.SECRET });
  return jwtMiddleware(c, next);
});
app.use("*", async (c, next) => {
  const payload = JwtPayload.parse(c.get("jwtPayload"));
  payload.id = `${payload.role}|${payload.email}`;

  c.set("jwtPayload", payload);

  await next();
});

app.onError((error, c) => {
  console.error(error);
  return ApiResponse.error({ c, error });
});

app.get("/", c => c.body("🍵", 418));
app.route("/status", statusRouter);
app.route("/category", categoryRouter);
app.route("/ticket", ticketRouter);

export default app;
