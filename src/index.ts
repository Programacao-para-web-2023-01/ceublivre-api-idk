import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { priorities } from "./routes/priorities";
import { tickets } from "./routes/tickets";
import { prettyJSON } from "hono/pretty-json";
import { Bindings } from "./app";
import { homepage } from "./routes/homepage";

const app = new Hono<{ Bindings: Bindings }>({ strict: false });

app.use("*", prettyJSON({ space: 2 }));
app.use("*", (c, next) => {
  const jwtMiddleware = jwt({ secret: c.env.SECRET });
  return jwtMiddleware(c, next);
});

app.get("/", c => c.html(homepage));
app.route("/priorities", priorities);
app.route("/tickets", tickets);

export default app;
