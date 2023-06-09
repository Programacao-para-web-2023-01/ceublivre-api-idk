import { Hono } from "hono";
import { Bindings } from "@/app";
import { Ticket } from "@/models";
import { ApiResponse } from "@/lib/api";
import { mail } from "@/lib/mail";

export const ticketRouter = new Hono<{ Bindings: Bindings }>();

// GET All tickets
ticketRouter.get("/", async c => {
  // const { status, category } = c.req.query();

  const tickets = Ticket.array().parse(
    (await c.env.DB.prepare("SELECT * FROM Ticket").all()).results
  );

  return ApiResponse.success({
    c,
    data: tickets,
  });
});

// // GET Ticket
// ticketRouter.get("/priority/:priorityName", async c => {
//   const { priorityName } = await c.req.param();

//   const result = Ticket.array().parse(
//     (
//       await c.env.DB.prepare(
//         "SELECT * FROM Ticket INNER JOIN Priority ON Ticket.priorityId = Priority.id WHERE Priority.name = ?;"
//       )
//         .bind(priorityName)
//         .all()
//     ).results
//   );

//   return apiResponse.success({
//     c,
//     data: result,
//   });
// });

// // GET Status
// ticketRouter.get("/status/:statusName", async c => {
//   const { statusName } = await c.req.param();

//   const result = Ticket.array().parse(
//     (
//       await c.env.DB.prepare(
//         "SELECT * FROM Ticket INNER JOIN Status ON Ticket.statusId = Status.id WHERE Status.name = ?;"
//       )
//         .bind(statusName)
//         .all()
//     ).results
//   );

//   return apiResponse.success({
//     c,
//     data: result,
//   });
// });

// GET Ticket by id
ticketRouter.get("/:id", async c => {
  const { id } = c.req.param();

  const ticket = Ticket.safeParse(
    await c.env.DB.prepare("SELECT * FROM Ticket WHERE id = ?").bind(id).first()
  );

  if (!ticket.success) {
    return ApiResponse.error({
      c,
      status: 404,
      error: new Error("Ticket não encontrado"),
    });
  }

  return ApiResponse.success({
    c,
    data: ticket,
  });
});

// POST Create ticket
ticketRouter.post("/", async c => {
  const { message, userId, categoryId } = Ticket.parse(await c.req.json());

  const ticket = Ticket.parse(
    await c.env.DB.prepare(
      "INSERT INTO Ticket (message, userId, categoryId) VALUES (?, ?, ?) RETURNING *"
    )
      .bind(message, userId, categoryId)
      .first()
  );

  return ApiResponse.success({
    c,
    status: 201,
    data: ticket,
  });
});

// PUT Update ticket by id
ticketRouter.put("/:id", async c => {
  const { id } = c.req.param();

  const { message, statusId, categoryId } = Ticket.parse(await c.req.json());

  const ticket = Ticket.safeParse(
    await c.env.DB.prepare("SELECT * FROM Ticket WHERE id = ?").bind(id).first()
  );

  if (!ticket.success) {
    return ApiResponse.error({
      c,
      status: 404,
      error: new Error("Ticket não encontrado"),
    });
  }

  const updatedTicket = Ticket.safeParse(
    await c.env.DB.prepare(
      "UPDATE Ticket SET message = ?, statusId = ?, categoryId = ? WHERE id = ? RETURNING *"
    )
      .bind(message, statusId, categoryId, id)
      .first()
  );

  if (!updatedTicket.success) {
    return ApiResponse.error({
      c,
      status: 404,
      error: new Error("Ticket não encontrado"),
    });
  }

  // Send e-mail
  if (ticket.data.categoryId !== updatedTicket.data.categoryId) {
    await mail({
      c,
      to: [{ email: "teste@teste.com", name: "teste" }],
      subject: "teste",
      text: "teste",
    });
  }

  return ApiResponse.success({
    c,
    status: 201,
    message: "Ticket atualizado com sucesso",
    data: updatedTicket.data,
  });
});

// DELETE Ticket by id
ticketRouter.delete("/:id", async c => {
  const { id } = c.req.param();

  const ticket = Ticket.safeParse(
    await c.env.DB.prepare("DELETE FROM Ticket WHERE id = ? RETURNING *")
      .bind(id)
      .first()
  );

  if (!ticket.success) {
    return ApiResponse.error({
      c,
      status: 404,
      error: new Error("Ticket não encontrado"),
    });
  }

  return c.body(null, 204);
});
