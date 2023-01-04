import request from "supertest";
import jwt from "jsonwebtoken";
import { hash } from "bcryptjs";
import { Connection, createConnection, getRepository } from "typeorm";

import { app } from "../../../../app";
import { User } from "../../entities/User";
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

describe("User Session", () => {
  it("should be able to authenticate an user", async () => {
    const usersRepository = getRepository(User);
    const user = usersRepository.create({
      name: "John Doe",
      email: "john@doe.com",
      password: await hash("Password.42", 8),
    });
    await usersRepository.save(user);

    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "john@doe.com",
      password: "Password.42",
    });

    expect(tokenResponse.body).toEqual(
      expect.objectContaining({
        user: {
          id: expect.any(String),
          name: "John Doe",
          email: "john@doe.com",
        },
        token: expect.any(String),
      })
    );

    expect(() => {
      jwt.verify(tokenResponse.body.token, `${process.env.JWT_SECRET}`);
    });
  });

  it("should not be able to authenticate with wrong password", async () => {
    const usersRepository = getRepository(User);
    const user = usersRepository.create({
      name: "John Doe",
      email: "john1@doe.com",
      password: await hash("Password.42", 8),
    });
    await usersRepository.save(user);

    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "john1@doe.com",
      password: "Password42",
    });

    expect(tokenResponse.status).toEqual(401);
    expect(tokenResponse.body.message).toEqual("Incorrect email or password");
  });

  it("should not be able to authenticate with unregistered email", async () => {
    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "john2@doe.com",
      password: "Password42",
    });

    expect(tokenResponse.status).toEqual(401);
    expect(tokenResponse.body.message).toEqual("Incorrect email or password");
  });
});
