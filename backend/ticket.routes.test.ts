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
    update: mock()
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
