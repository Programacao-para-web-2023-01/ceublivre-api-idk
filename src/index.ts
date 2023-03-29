import { Hono } from "hono";
import { Bindings } from "~/app";
import { priorities } from "~/routes/priorities";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", c => c.text(":)"));

app.route("/priorities", priorities);

export default app;
