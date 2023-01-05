import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { randomUUID } from "crypto";
import { app } from "../../../../app";
import { clearDatabaseTable } from "../../../../shared/helpers/cleardatabasetable";

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

describe("User Transfer", () => {
  it("should be able to create a transfer", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Jonh Doe",
      email: "john17@doe.com",
      password: "Password.42",
    });
    const senderTokenResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "john17@doe.com",
        password: "Password.42",
      });

    await request(app).post("/api/v1/users").send({
      name: "Jane Doe",
      email: "jane1@doe.com",
      password: "Password.42",
    });
    const recipientTokenResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "jane1@doe.com",
        password: "Password.42",
      });

    await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${senderTokenResponse.body.token}`)
      .send({
        amount: 100,
        description: "Income",
      });

    await request(app)
      .post(
        `/api/v1/statements/transfers/${recipientTokenResponse.body.user.id}`
      )
      .set("Authorization", `Bearer ${senderTokenResponse.body.token}`)
      .send({
        amount: 80,
        description: "Transfer",
      });

    const recipientBalance = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", `Bearer ${recipientTokenResponse.body.token}`)
      .expect(200);

    expect(recipientBalance.body).toMatchObject({
      statement: [
        {
          id: expect.any(String),
          sender_id: `${senderTokenResponse.body.user.id}`,
          amount: 80,
          description: "Transfer",
          type: "transfer",
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
      ],
      balance: 80,
    });
  });

  it("should not be able to create a transfer with insuficient funds", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Jonh Doe",
      email: "john17@doe.com",
      password: "Password.42",
    });
    const senderTokenResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "john17@doe.com",
        password: "Password.42",
      });

    await request(app).post("/api/v1/users").send({
      name: "Jane Doe",
      email: "jane1@doe.com",
      password: "Password.42",
    });
    const recipientTokenResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "jane1@doe.com",
        password: "Password.42",
      });

    const error = await request(app)
      .post(
        `/api/v1/statements/transfers/${recipientTokenResponse.body.user.id}`
      )
      .set("Authorization", `Bearer ${senderTokenResponse.body.token}`)
      .send({
        amount: 80,
        description: "Transfer",
      });

    expect(error.body.message).toEqual("Insufficient funds");
    expect(error.statusCode).toBe(400);
  });

  it("should not be able to create a transfer to inexistent user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Jonh Doe",
      email: "john17@doe.com",
      password: "Password.42",
    });
    const senderTokenResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "john17@doe.com",
        password: "Password.42",
      });
    const error = await request(app)
      .post(`/api/v1/statements/transfers/${randomUUID()}`)
      .set("Authorization", `Bearer ${senderTokenResponse.body.token}`)
      .send({
        amount: 80,
        description: "Transfer",
      });

    expect(error.body.message).toEqual("User not found");
    expect(error.statusCode).toBe(404);
  });
});
