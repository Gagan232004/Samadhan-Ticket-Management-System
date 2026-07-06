import { describe, it, expect, mock, beforeEach } from "bun:test";
import request from "supertest";
import express from "express";

// Mock the dependencies before they are imported by the routes
mock.module("./auth.js", () => ({
  auth: {
    api: {
      getSession: mock().mockResolvedValue({
        user: { id: "admin_id", role: "admin", name: "Admin" }
      })
    }
  }
}));

const mockPrisma = {
  user: {
    findFirst: mock()
  },
  ticket: {
    update: mock(),
    findUnique: mock()
  },
  ticketReply: {
    create: mock()
  }
};

mock.module("./db.js", () => ({
  prisma: mockPrisma
}));

// Now import the router which will use the mocked modules
import ticketRoutes from "./ticket.routes.js";

const app = express();
app.use(express.json());
app.use("/api/tickets", ticketRoutes);

describe("Ticket Routes - Assignment Feature", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockPrisma.user.findFirst.mockClear();
    mockPrisma.ticket.update.mockClear();
  });

  it("should return 400 if assignedToId is provided but points to an invalid or deleted user", async () => {
    // Simulate prisma.user.findFirst finding no user
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const response = await request(app)
      .patch("/api/tickets/123")
      .send({ assignedToId: "invalid_user" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid user ID provided for assignment." });
    
    // Ensure we checked the user properly
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: "invalid_user", deletedAt: null }
    });
    
    // Ensure it NEVER called update
    expect(mockPrisma.ticket.update).not.toHaveBeenCalled();
  });

  it("should update the ticket and return the populated assignedTo object if assignedToId is valid", async () => {
    // Simulate valid user found
    mockPrisma.user.findFirst.mockResolvedValue({
      id: "valid_agent",
      name: "Gagan",
      email: "gagan@example.com"
    });

    // Simulate ticket updated successfully
    const mockUpdatedTicket = {
      id: "123",
      assignedToId: "valid_agent",
      assignedTo: {
        name: "Gagan",
        email: "gagan@example.com"
      }
    };
    mockPrisma.ticket.update.mockResolvedValue(mockUpdatedTicket);

    const response = await request(app)
      .patch("/api/tickets/123")
      .send({ assignedToId: "valid_agent" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUpdatedTicket);

    // Verify Prisma update was called with the correct include argument
    expect(mockPrisma.ticket.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "123" },
        data: expect.objectContaining({ assignedToId: "valid_agent" }),
        include: {
          assignedTo: {
            select: { name: true, email: true }
          }
        }
      })
    );
  });
});

describe("Ticket Routes - Replies Feature", () => {
  beforeEach(() => {
    mockPrisma.ticket.findUnique.mockClear();
    mockPrisma.ticket.update.mockClear();
    mockPrisma.ticketReply.create.mockClear();
  });

  it("should return 400 if reply body is missing", async () => {
    const response = await request(app)
      .post("/api/tickets/123/replies")
      .send({ senderType: "AGENT" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Reply body is required" });
  });

  it("should return 404 if ticket is not found", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/tickets/123/replies")
      .send({ body: "This is a reply", senderType: "AGENT" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Ticket not found" });
    
    expect(mockPrisma.ticket.findUnique).toHaveBeenCalledWith({
      where: { id: "123" }
    });
  });

  it("should create a reply and update the ticket's updatedAt timestamp", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValue({ id: "123" });
    
    const mockReply = {
      id: "reply_1",
      body: "This is a reply",
      ticketId: "123",
      userId: "admin_id",
      senderType: "AGENT",
      user: { id: "admin_id", name: "Admin" }
    };
    
    mockPrisma.ticketReply.create.mockResolvedValue(mockReply);
    mockPrisma.ticket.update.mockResolvedValue({ id: "123" });

    const response = await request(app)
      .post("/api/tickets/123/replies")
      .send({ body: "This is a reply", senderType: "AGENT" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockReply);

    // Verify reply creation
    expect(mockPrisma.ticketReply.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          body: "This is a reply",
          ticketId: "123",
          userId: "admin_id",
          senderType: "AGENT"
        }
      })
    );

    // Verify ticket updatedAt was updated
    expect(mockPrisma.ticket.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "123" },
        data: expect.objectContaining({ updatedAt: expect.any(Date) })
      })
    );
  });
});
