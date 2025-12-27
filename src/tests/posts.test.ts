import request from "supertest";
import initApp from "../index";
import Post from "../models/postModel";
import { Express } from "express";
import { getLoggedInUser, UserData, PostData, getPostsList } from "./utils";

let app: Express;
let loginUser: UserData;
let postId = "";
let postsList: PostData[];

beforeAll(async () => {
  app = await initApp();
  await Post.deleteMany();
  loginUser = await getLoggedInUser(app);
  postsList = getPostsList(loginUser._id);
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
        .send({ title: post.title, content: post.content });
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
    const updatedTitle = "Updated First Post";
    const updatedContent = "This is updated content";
    const response = await request(app)
      .put("/posts/" + postId)
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send({ title: updatedTitle, content: updatedContent });
    expect(response.status).toBe(200);
    expect(response.body.title).toBe(updatedTitle);
    expect(response.body.content).toBe(updatedContent);
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
      content: "This post will be deleted"
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

  test("Update post - unauthorized (different user)", async () => {
    // Create a new user
    const randomId = Date.now();
    const newUser = {
      email: `otheruser${randomId}@test.com`,
      username: `otheruser${randomId}`,
      password: "testpass"
    };
    const registerResponse = await request(app).post("/auth/register").send(newUser);
    const otherUserToken = registerResponse.body.accessToken;

    // Create a post with the other user
    const postData = { title: "Other User Post", content: "Content from other user" };
    const createResponse = await request(app)
      .post("/posts")
      .set("Authorization", "Bearer " + otherUserToken)
      .send(postData);
    const otherPostId = createResponse.body._id;

    // Try to update the post with the original user (should fail)
    const updateResponse = await request(app)
      .put("/posts/" + otherPostId)
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send({ title: "Hacked", content: "Hacked content" });
    expect(updateResponse.status).toBe(403);
    expect(updateResponse.body.message).toBe('Not authorized to update this post');
  });

  test("Delete post - unauthorized (different user)", async () => {
    // Create a new user
    const randomId = Date.now();
    const newUser = {
      email: `otheruser2${randomId}@test.com`,
      username: `otheruser2${randomId}`,
      password: "testpass"
    };
    const registerResponse = await request(app).post("/auth/register").send(newUser);
    const otherUserToken = registerResponse.body.accessToken;

    // Create a post with the other user
    const postData = { title: "Other User Post 2", content: "Content from other user 2" };
    const createResponse = await request(app)
      .post("/posts")
      .set("Authorization", "Bearer " + otherUserToken)
      .send(postData);
    const otherPostId = createResponse.body._id;

    // Try to delete the post with the original user (should fail)
    const deleteResponse = await request(app)
      .delete("/posts/" + otherPostId)
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(deleteResponse.status).toBe(403);
    expect(deleteResponse.body.message).toBe('Not authorized to delete this post');
  });
});
