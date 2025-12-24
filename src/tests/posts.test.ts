import request from "supertest";
import initApp from "../index";
import Post from "../models/postModel";
import { Express } from "express";
import { getLoggedInUser, UserData, PostData, postsList } from "./utils";

let app: Express;
let loginUser: UserData;
let postId = "";

beforeAll(async () => {
  app = await initApp();
  await Post.deleteMany();
  loginUser = await getLoggedInUser(app);
});

afterAll((done) => {
  done();
});

describe("Posts Test Suite", () => {
  test("Initial empty posts", async () => {
    const response = await request(app).get("/posts")
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("Create Post", async () => {
    for (const post of postsList) {
      const response = await request(app).post("/posts")
        .set("Authorization", "Bearer " + loginUser.accessToken)
        .send(post);
      expect(response.status).toBe(201);
      expect(response.body.title).toBe(post.title);
      expect(response.body.content).toBe(post.content);
    }
  });

  test("Get All Posts", async () => {
    const response = await request(app).get("/posts")
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(postsList.length);
  });

  test("Get Posts by Sender", async () => {
    const response = await request(app).get(
      "/posts?sender=" + postsList[0].sender
    ).set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);
    expect(response.body[0].title).toBe(postsList[0].title);
    postId = response.body[0]._id;
  });

  test("Get Post by ID", async () => {
    const response = await request(app).get("/posts/" + postId)
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(200);
    expect(response.body.title).toBe(postsList[0].title);
    expect(response.body.content).toBe(postsList[0].content);
    expect(response.body._id).toBe(postId);
  });

  test("Update Post", async () => {
    postsList[0].title = "Updated First Post";
    postsList[0].content = "This is updated content";
    const response = await request(app)
      .put("/posts/" + postId)
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send(postsList[0]);
    expect(response.status).toBe(200);
    expect(response.body.title).toBe(postsList[0].title);
    expect(response.body.content).toBe(postsList[0].content);
    expect(response.body._id).toBe(postId);
  });

  test("Get non-existent post", async () => {
    const response = await request(app)
      .get("/posts/000000000000000000000000")
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Post not found');
  });

  test("Get post with invalid ID format", async () => {
    const response = await request(app)
      .get("/posts/invalid-id")
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(500);
  });

  test("Update post with invalid ID format", async () => {
    const response = await request(app)
      .put("/posts/invalid-id")
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send({ title: "updated" });
    expect(response.status).toBe(500);
  });

  test("Update non-existent post", async () => {
    const response = await request(app)
      .put("/posts/000000000000000000000000")
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send({ title: "updated", content: "updated content" });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Post not found');
  });

  test("Create post with invalid data", async () => {
    const response = await request(app)
      .post("/posts")
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send({ invalidField: "test" });
    expect(response.status).toBe(400);
  });

  test("Delete Post", async () => {
    // Create a new post to delete
    const postToDelete = {
      title: "Post to Delete",
      content: "This post will be deleted",
      sender: loginUser.username
    };
    const createResponse = await request(app)
      .post("/posts")
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send(postToDelete);
    expect(createResponse.status).toBe(201);
    const deletePostId = createResponse.body._id;

    // Delete the post
    const deleteResponse = await request(app)
      .delete("/posts/" + deletePostId)
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe('Post deleted successfully');

    // Verify post is deleted
    const getResponse = await request(app)
      .get("/posts/" + deletePostId)
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(getResponse.status).toBe(404);
  });

  test("Delete non-existent post", async () => {
    const response = await request(app)
      .delete("/posts/000000000000000000000000")
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Post not found');
  });

  test("Delete post with invalid ID format", async () => {
    const response = await request(app)
      .delete("/posts/invalid-id")
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(500);
  });
});
