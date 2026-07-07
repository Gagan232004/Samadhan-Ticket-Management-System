import { describe, it, expect, mock, beforeEach } from "bun:test";
import request from "supertest";
import express from "express";

// Mock the AI functions before importing the router
const mockGenerateText = mock().mockResolvedValue({ text: "Polished response" });
mock.module("ai", () => ({
  generateText: mockGenerateText
}));

const mockGoogle = mock().mockReturnValue("mock-gemini-model");
mock.module("@ai-sdk/google", () => ({
  google: mockGoogle
}));

// Mock authentication
let mockSession: any = {
  user: { id: "test_user_id", role: "admin", name: "Alice Agent" }
};

mock.module("./auth.js", () => ({
  auth: {
    api: {
      getSession: mock().mockImplementation(async () => mockSession)
    }
  }
}));

// Import router after mocking dependencies
import aiRoutes from "./ai.routes.js";

const app = express();
app.use(express.json());
app.use("/api/ai", aiRoutes);

describe("AI Routes", () => {
  beforeEach(() => {
    mockGenerateText.mockClear();
    mockGoogle.mockClear();
    mockSession = {
      user: { id: "test_user_id", role: "admin", name: "Alice Agent" }
    };
  });

  describe("POST /polish", () => {
    it("should return 401 if not authenticated", async () => {
      mockSession = null; // simulate logged out

      const response = await request(app)
        .post("/api/ai/polish")
        .send({ text: "Test text" });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Unauthorized" });
      expect(mockGenerateText).not.toHaveBeenCalled();
    });

    it("should return 400 if text is not provided", async () => {
      const response = await request(app)
        .post("/api/ai/polish")
        .send({}); // missing text

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Text is required" });
      expect(mockGenerateText).not.toHaveBeenCalled();
    });

    it("should return 400 if text is not a string", async () => {
      const response = await request(app)
        .post("/api/ai/polish")
        .send({ text: 12345 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Text is required" });
      expect(mockGenerateText).not.toHaveBeenCalled();
    });

    it("should polish text and include agent name and customer name in system prompt", async () => {
      const response = await request(app)
        .post("/api/ai/polish")
        .send({ text: "im sry but refund no", customerName: "Bob" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ polishedText: "Polished response" });

      expect(mockGoogle).toHaveBeenCalledWith("gemini-2.5-flash");
      expect(mockGenerateText).toHaveBeenCalled();

      // Check if generateText was called with expected arguments
      const callArg = mockGenerateText.mock.calls[0][0];
      expect(callArg.model).toBe("mock-gemini-model");
      expect(callArg.prompt).toBe("im sry but refund no");
      expect(callArg.system).toContain("Alice Agent");
      expect(callArg.system).toContain("Bob");
      expect(callArg.system).toContain("Best regards,");
    });

    it("should use a default customer name if not provided", async () => {
      const response = await request(app)
        .post("/api/ai/polish")
        .send({ text: "hello" });

      expect(response.status).toBe(200);
      const callArg = mockGenerateText.mock.calls[0][0];
      expect(callArg.system).toContain("Customer"); // Default fallback
    });

    it("should return 500 if AI service throws an error", async () => {
      mockGenerateText.mockRejectedValue(new Error("AI API failed"));

      const response = await request(app)
        .post("/api/ai/polish")
        .send({ text: "Test text" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Failed to polish text" });
    });
  });
});
