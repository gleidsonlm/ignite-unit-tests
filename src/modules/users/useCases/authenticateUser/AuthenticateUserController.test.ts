import request from 'supertest';
import { Connection, createConnection, getRepository } from 'typeorm';
import jwt from 'jsonwebtoken';
import { hash } from 'bcryptjs';

import { app } from '../../../../app';
import { User } from '../../entities/User';

let connection: Connection
beforeAll(async () => {
  connection = await createConnection();
  await connection.runMigrations();

  const usersRepository = getRepository(User)
  const user = usersRepository.create({
    name: 'John Doe',
    email: 'john@doe.com',
    password: await hash('Password.42', 8)      
  })
  await usersRepository.save(user)
});

afterAll(async () => {
  await connection.dropDatabase()
  await connection.close();
});

describe('User Session', () => {
  it('should be able to authenticate an user', async () => {
    const tokenResponse = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: 'john@doe.com',
      password: 'Password.42'
    })
    
    expect(tokenResponse.body).toEqual(
      expect.objectContaining({
          user: {
            id: expect.any(String),
            name: 'John Doe',
            email: 'john@doe.com'
          },
          token: expect.any(String),
        }
      ))     

    expect(() => {
      jwt.verify(
        tokenResponse.body.token,
      `${process.env.JWT_SECRET}`
      )
    })
  })

  it('should not be able to authenticate with wrong password',
    async () => {
      const tokenResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: 'john@doe.com',
        password: 'Password42'
      })

      expect(tokenResponse.status).toEqual(401)
      expect(tokenResponse.body.message)
      .toEqual('Incorrect email or password')
    }
  )

  it('should not be able to authenticate with unregistered email',
    async () => {
      const tokenResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: 'john@doe.com',
        password: 'Password42'
      })

      expect(tokenResponse.status).toEqual(401)
      expect(tokenResponse.body.message)
      .toEqual('Incorrect email or password')      
    }    
  )
})