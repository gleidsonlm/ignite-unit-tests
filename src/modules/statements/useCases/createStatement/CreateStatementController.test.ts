import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { sign } from "jsonwebtoken";
import { randomUUID } from "crypto";
import { clearDatabaseTable } from "../../../../shared/helpers/cleardatabasetable";
import { app } from "../../../../app";
import { User } from "../../../users/entities/User";
import authConfig from "../../../../config/auth";

let connection: Connection;
beforeAll(async () => {
  connection = await createConnection();
  await connection.runMigrations();
});

afterEach(async () => {
  await clearDatabaseTable();
});

afterAll(async () => {
  await connection.close();
});

describe("User Statement", () => {
  it("should be able to create a deposit", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Jonh Doe",
      email: "john12@doe.com",
      password: "Password.42",
    });

    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "john12@doe.com",
      password: "Password.42",
    });

    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${tokenResponse.body.token}`)
      .send({
        amount: 100,
        description: "Income",
      })
      .expect(201);

    expect(deposit.body).toMatchObject({
      id: expect.any(String),
      user_id: expect.stringMatching(`${tokenResponse.body.user.id}`),
      description: expect.stringMatching("Income"),
      amount: 100,
      type: expect.stringMatching("deposit"),
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });

  it("should be able to create a withdraw", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Jonh Doe",
      email: "john12@doe.com",
      password: "Password.42",
    });

    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "john12@doe.com",
      password: "Password.42",
    });

    await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${tokenResponse.body.token}`)
      .send({
        amount: 100.0,
        description: "Income",
      });

    const withdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .set("Authorization", `Bearer ${tokenResponse.body.token}`)
      .send({
        amount: 100.0,
        description: "Expense",
      })
      .expect(201);

    expect(withdraw.body).toMatchObject({
      id: expect.any(String),
      user_id: expect.stringMatching(`${tokenResponse.body.user.id}`),
      description: expect.stringMatching("Expense"),
      amount: 100,
      type: expect.stringMatching("withdraw"),
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });

  it("should not be able to withdraw from insuficent funds", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Jonh Doe",
      email: "john12@doe.com",
      password: "Password.42",
    });

    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "john12@doe.com",
      password: "Password.42",
    });

    await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${tokenResponse.body.token}`)
      .send({
        amount: 100.0,
        description: "Income",
      });

    const withdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .set("Authorization", `Bearer ${tokenResponse.body.token}`)
      .send({
        amount: 110.0,
        description: "Expense",
      })
      .expect(400);
    expect(withdraw.body.message).toMatch("Insufficient funds");
  });

  it("should not be able to create statement when user not found", async () => {
    const user: User = {
      id: randomUUID(),
      name: "",
      email: "invalid@mail.com",
      password: "",
      statement: [],
      created_at: new Date(),
      updated_at: new Date(),
    };
    const { secret, expiresIn } = authConfig.jwt;
    const invalidToken = sign({ user }, secret, {
      subject: user.id,
      expiresIn,
    });

    const withdraw = await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${invalidToken}`)
      .send({
        amount: 100.0,
        description: "Income",
      })
      .expect(404);
    expect(withdraw.body.message).toEqual("User not found");
  });
});
