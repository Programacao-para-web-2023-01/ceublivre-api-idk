import { Hono } from "hono";
import { priorities } from "~/routes/priorities";

const app = new Hono();

app.get("/", c => c.text(":)"));

app.route("/priorities", priorities);

export default app;
