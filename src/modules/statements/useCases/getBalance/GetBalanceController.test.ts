import { randomUUID } from "crypto";
import { sign } from "jsonwebtoken";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { clearDatabaseTable } from "../../../../shared/helpers/cleardatabasetable";
import authConfig from "../../../../config/auth";
import { User } from "../../../users/entities/User";

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

describe("User Balance", () => {
  it("should be able to get user balance", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Jonh Doe",
      email: "john14@doe.com",
      password: "Password.42",
    });

    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "john14@doe.com",
      password: "Password.42",
    });

    await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${tokenResponse.body.token}`)
      .send({
        amount: 100.0,
        description: "Income",
      });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .set("Authorization", `Bearer ${tokenResponse.body.token}`)
      .send({
        amount: 100.0,
        description: "Expense",
      });

    const balance = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", `Bearer ${tokenResponse.body.token}`);

    expect(balance.body).toMatchObject({
      statement: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          amount: 100,
          description: "Income",
          type: "deposit",
          created_at: expect.any(String),
          updated_at: expect.any(String),
        }),
        expect.objectContaining({
          id: expect.any(String),
          amount: 100,
          description: "Expense",
          type: "withdraw",
          created_at: expect.any(String),
          updated_at: expect.any(String),
        }),
      ]),
      balance: 0,
    });
  });

  it("should not be able to create balance for user not found ", async () => {
    const invalidUser: User = {
      id: randomUUID(),
      name: "",
      email: "invalid@mail.com",
      password: "Password.42",
      statement: [],
      created_at: new Date(),
      updated_at: new Date(),
    };

    const { secret, expiresIn } = authConfig.jwt;
    const invalidToken = sign({ invalidUser }, secret, {
      subject: invalidUser.id,
      expiresIn,
    });

    const balance = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", `Bearer ${invalidToken}`)
      .expect(404);
    expect(balance.body.message).toEqual("User not found");
  });
});
