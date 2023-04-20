import { Hono } from "hono";
import { priorities } from "./routes/priorities";
import { tickets } from "./routes/tickets";
import { prettyJSON } from "hono/pretty-json";
import { homepage } from "homepage";

const app = new Hono({ strict: false });

app.use("*", prettyJSON({ space: 4 }));
app.get("/", (c) => c.html(homepage));
app.route("/priorities", priorities);
app.route("/tickets", tickets);

export default app;