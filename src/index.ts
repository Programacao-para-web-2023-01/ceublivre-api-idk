import { Hono } from "hono";
import { priorities } from "~/routes/priorities";
import { tickets } from "./routes/tickets";

const app = new Hono({ strict: false });

app.get("/", (c) => c.text(":)"));
app.route("/priorities", priorities);
app.route("/tickets", tickets);

export default app;
