import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { priorities } from "./routes/priorities";
import { tickets } from "./routes/tickets";
import { prettyJSON } from "hono/pretty-json";
import { Bindings } from "./app";
import { response } from "./routes/response";
import { apiResponse } from "./lib/api";

const app = new Hono<{ Bindings: Bindings }>({ strict: false });

app.use("*", prettyJSON({ space: 2 }));
app.use("*", (c, next) => {
  const jwtMiddleware = jwt({ secret: c.env.SECRET });
  return jwtMiddleware(c, next);
});

app.onError((error, c) => {
  return apiResponse.error({ c, error });
});

app.get("/", c => c.body("🫖", 418));
app.route("/priorities", priorities);
app.route("/tickets", tickets);
app.route("/response", response);

export default app;
