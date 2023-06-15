import { Hono } from "hono";
import { Bindings } from "@/app";
import { JwtPayload, Reply, Ticket } from "@/models";
import { ApiResponse } from "@/lib/api";
import { mail } from "@/lib/mail";

export const ticketRouter = new Hono<{ Bindings: Bindings }>();

// GET All tickets with optional filter
ticketRouter.get("/", async c => {
  const { status, category } = c.req.query();

  const query = {
    select: `
      SELECT Ticket.*
      FROM Ticket
      INNER JOIN Status
        ON Ticket.statusId = Status.id
      INNER JOIN Category
        ON Ticket.categoryId = Category.id
    `,
    where: [
      status !== undefined ? "Status.id = ?" : undefined,
      category !== undefined ? "Category.id = ?" : undefined,
    ].filter(x => x !== undefined),
    bind: [status, category].filter(x => x !== undefined),
  };

  const whereClause = query.where.length
    ? ` WHERE ${query.where.join(" AND ")}`
    : "";
  const rawQuery = query.select + whereClause;

  const tickets = Ticket.array().parse(
    (
      await c.env.DB.prepare(rawQuery)
        .bind(...query.bind)
        .all()
    ).results
  );

  return ApiResponse.success({
    c,
    data: tickets,
  });
});

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
    data: ticket.data,
  });
});

// POST Create ticket
ticketRouter.post("/", async c => {
  const { message, categoryId } = Ticket.parse(await c.req.json());

  const { id } = JwtPayload.parse(c.get("jwtPayload"));

  const ticket = Ticket.parse(
    await c.env.DB.prepare(
      "INSERT INTO Ticket (message, userId, categoryId) VALUES (?, ?, ?) RETURNING *"
    )
      .bind(message, id, categoryId)
      .first()
  );

  // Send e-mail
  // await mail({
  //   c,
  //   to: [{ email: "email@example.com", name: "Example" }],
  //   subject: "Novo ticket",
  //   text: "Ticket criado com sucesso",
  // });

  return ApiResponse.success({
    c,
    status: 201,
    message: "Ticket criado com sucesso",
    data: ticket,
  });
});

// GET Closes the ticket
ticketRouter.get("/:id/close", async c => {
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

  const updatedTicket = Ticket.safeParse(
    await c.env.DB.prepare(
      "UPDATE Ticket SET statusId = 3 WHERE id = ? RETURNING *"
    )
      .bind(id)
      .first()
  );

  if (!updatedTicket.success) {
    throw new Error("Ocorreu um erro ao atualizar o status do ticket");
  }

  // Send e-mail
  // await mail({
  //   c,
  //   to: [{ email: "email@example.com", name: "Example" }],
  //   subject: "Atualização do ticket",
  //   text: "O status do seu ticket foi alterado para: Resolvido",
  // });

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

// Replies

// GET All replies by ticket id
ticketRouter.get("/:ticketId/reply", async c => {
  const { ticketId } = c.req.param();

  const ticket = Ticket.safeParse(
    await c.env.DB.prepare("SELECT * FROM Ticket WHERE Ticket.id = ?")
      .bind(ticketId)
      .first()
  );

  if (!ticket.success) {
    return ApiResponse.error({
      c,
      status: 404,
      error: new Error("Ticket não encontrado"),
    });
  }

  const replies = Reply.array().parse(
    (
      await c.env.DB.prepare(
        "SELECT Reply.* FROM Reply INNER JOIN Ticket ON Reply.ticketId = Ticket.id WHERE Ticket.id = ?"
      )
        .bind(ticketId)
        .all()
    ).results
  );

  return ApiResponse.success({
    c,
    data: replies,
  });
});

// POST Create reply by ticket id
ticketRouter.post("/:ticketId/reply", async c => {
  const { ticketId } = c.req.param();
  const { message } = Reply.parse(await c.req.json());

  const { id } = JwtPayload.parse(c.get("jwtPayload"));

  const ticket = Ticket.safeParse(
    await c.env.DB.prepare("SELECT * FROM Ticket WHERE Ticket.id = ?")
      .bind(ticketId)
      .first()
  );

  if (!ticket.success) {
    return ApiResponse.error({
      c,
      status: 404,
      error: new Error("Ticket não encontrado"),
    });
  }

  if (ticket.data.statusId === 3) {
    throw new Error(
      "Não é possível responder um ticket com status de resolvido"
    );
  }

  const reply = Reply.parse(
    await c.env.DB.prepare(
      "INSERT INTO Reply (ticketId, message, userId) VALUES (?, ?, ?) RETURNING *"
    )
      .bind(ticketId, message, id)
      .first()
  );

  if (ticket.data.statusId === 1) {
    const updatedTicket = Ticket.safeParse(
      await c.env.DB.prepare(
        "UPDATE Ticket SET statusId = 2 WHERE id = ? RETURNING *"
      )
        .bind()
        .first()
    );

    if (!updatedTicket.success) {
      throw new Error("Ocorreu um erro ao atualizar o status do ticket");
    }

    // Send e-mail
    // await mail({
    //   c,
    //   to: [{ email: "email@example.com", name: "Example" }],
    //   subject: "Atualização do ticket",
    //   text: "O status do seu ticket foi alterado para: Em progresso",
    // });
  }

  return ApiResponse.success({
    c,
    status: 201,
    message: "Resposta criada com sucesso",
    data: reply,
  });
});
