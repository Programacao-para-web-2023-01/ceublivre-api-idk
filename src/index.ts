import { Hono } from "hono";
import { Bindings } from "~/app";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", c => c.text(":)"));

export default app;
