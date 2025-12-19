import request from "supertest";
import { Express } from "express";

export type UserData = {
    email: string;
    username: string;
    password: string;
    _id: string;
    accessToken: string;
    refreshToken: string;
};

export const userData = {
    email: "test@test.com",
    username: "testuser",
    password: "testpass",
    _id: "",
    accessToken: "",
    refreshToken: ""
};

export const getLoggedInUser = async (app: Express): Promise<UserData> => {
    const email = userData.email;
    const username = userData.username;
    const password = userData.password;
    let response = await request(app).post("/auth/register").send(
        { email, username, password }
    );
    if (response.status !== 201) {
        response = await request(app).post("/auth/login").send(
            { email, password });
    }
    const loggedUser = {
        _id: response.body.user?.id || response.body.id,
        accessToken: response.body.accessToken,
        refreshToken: response.body.refreshToken,
        email,
        username,
        password
    };
    return loggedUser;
};

export type PostData = { title: string; content: string; sender: string; _id?: string };

export const postsList: PostData[] = [
    { title: "First Post", content: "This is the first post content", sender: "testuser" },
    { title: "Second Post", content: "This is the second post content", sender: "testuser" },
    { title: "Third Post", content: "This is the third post content", sender: "testuser" },
];

export type CommentData = { postId: string; content: string; sender: string; _id?: string };

export const commentsList: CommentData[] = [
    { postId: "", content: "This is my first comment", sender: "testuser" },
    { postId: "", content: "This is my second comment", sender: "testuser" },
    { postId: "", content: "This is my third comment", sender: "testuser" },
];
