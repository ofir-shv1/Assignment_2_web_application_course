import request from "supertest";
import initApp from "../index";
import { Express } from "express";
import User from "../models/userModel";
import { userData, postsList } from "./utils";

let app: Express;

beforeAll(async () => {
  app = await initApp();
  await User.deleteMany();
});

afterAll((done) => {
  done();
});

describe("Test Auth Suite", () => {
  test("Test post a post without token fails", async () => {
    const postData = postsList[0];
    const response = await request(app).post("/posts").send(postData);
    expect(response.status).toBe(401);
  });

  test("Test post with malformed authorization header", async () => {
    const postData = postsList[0];
    const response = await request(app).post("/posts")
      .set("Authorization", "InvalidFormat")
      .send(postData);
    expect(response.status).toBe(401);
  });

  test("Register without required fields", async () => {
    const response = await request(app).post("/auth/register").send({ email: "test@test.com" });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All fields are required');
  });

  test("Test Registration", async () => {
    const email = userData.email;
    const username = userData.username;
    const password = userData.password;
    const response = await request(app).post("/auth/register").send(
      { email, username, password }
    );
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("accessToken");
    userData.accessToken = response.body.accessToken;
    expect(response.body).toHaveProperty("refreshToken");
    userData.refreshToken = response.body.refreshToken;
    userData._id = response.body.user._id;
  });

  test("Create a post with token succeeds", async () => {
    const postData = postsList[0];
    const response = await request(app)
      .post("/posts")
      .set("Authorization", "Bearer " + userData.accessToken)
      .send(postData);
    expect(response.status).toBe(201);
  });

  test("Create a post with compromised token fails", async () => {
    const postData = postsList[0];
    const compromisedToken = userData.accessToken + "a";
    const response = await request(app)
      .post("/posts")
      .set("Authorization", "Bearer " + compromisedToken)
      .send(postData);
    expect(response.status).toBe(403);
  });

  test("Test Login", async () => {
    const email = userData.email;
    const password = userData.password;
    const response = await request(app).post("/auth/login").send(
      { email, password }
    );
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
    userData.accessToken = response.body.accessToken;
    userData.refreshToken = response.body.refreshToken;
  });

  jest.setTimeout(10000);

  test("Test using token after expiration fails", async () => {
    // Sleep for 4 seconds to let the token expire (JWT_EXPIRATION=3)
    await new Promise((r) => setTimeout(r, 4000));
    const postData = postsList[0];
    const response = await request(app)
      .post("/posts")
      .set("Authorization", "Bearer " + userData.accessToken)
      .send(postData);
    expect(response.status).toBe(403);

    // Refresh the token
    const refreshResponse = await request(app).post("/auth/refresh").send(
      { refreshToken: userData.refreshToken }
    );
    console.log("Refresh response body:", refreshResponse.body);
    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body).toHaveProperty("accessToken");
    expect(refreshResponse.body).toHaveProperty("refreshToken");
    userData.accessToken = refreshResponse.body.accessToken;
    userData.refreshToken = refreshResponse.body.refreshToken;

    // Try to create post again
    const retryResponse = await request(app)
      .post("/posts")
      .set("Authorization", "Bearer " + userData.accessToken)
      .send(postData);
    expect(retryResponse.status).toBe(201);
  });

  test("Test double use of refresh token fails", async () => {
    // First, get a fresh user and token
    const randomId = Date.now();
    const freshUser = {
      email: `doubletest${randomId}@test.com`,
      username: `doubletest${randomId}`,
      password: "testpass"
    };
    
    const registerResponse = await request(app).post("/auth/register").send(freshUser);
    const originalRefreshToken = registerResponse.body.refreshToken;

    // Use the refresh token to get a new token
    const refreshResponse1 = await request(app).post("/auth/refresh").send(
      { refreshToken: originalRefreshToken }
    );
    expect(refreshResponse1.status).toBe(200);
    expect(refreshResponse1.body).toHaveProperty("accessToken");
    expect(refreshResponse1.body).toHaveProperty("refreshToken");

    // Try to use the same refresh token again (should fail because it was invalidated)
    const refreshResponse2 = await request(app).post("/auth/refresh").send(
      { refreshToken: originalRefreshToken }
    );
    expect(refreshResponse2.status).toBe(403);
    expect(refreshResponse2.body.message).toBe('Invalid refresh token');
  });

  test("Logout without refresh token", async () => {
    const response = await request(app).post("/auth/logout").send({});
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Refresh token required');
  });

  test("Logout successfully", async () => {
    const response = await request(app).post("/auth/logout")
      .send({ refreshToken: userData.refreshToken });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Logout successful');
  });

  test("Refresh with invalid token", async () => {
    const response = await request(app).post("/auth/refresh")
      .send({ refreshToken: "invalid-token-12345" });
    expect(response.status).toBe(403);
  });

  test("Login with incorrect password", async () => {
    const response = await request(app).post("/auth/login")
      .send({ email: userData.email, password: "wrongpassword" });
    expect(response.status).toBe(401);
  });

  test("Login with non-existent user", async () => {
    const response = await request(app).post("/auth/login")
      .send({ email: "nonexistent@test.com", password: "password" });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });
});
