import request from 'supertest';
import { describe, it } from '@jest/globals';
import { hash } from 'bcryptjs';
import { Connection, createConnection, getRepository } from 'typeorm';

import { app } from '../../../../app';
import { User } from '../../entities/User';
import { clearDatabaseTable } from '../../../../shared/helpers/cleardatabasetable';
import { decode } from 'jsonwebtoken';

describe('User Profile', () => {

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

  it('should be able to return user profile', async () => {
    const usersRepository = getRepository(User);
    const user = usersRepository.create({
      name: 'John Doe',
      email: 'john10@doe.com',
      password: await hash('Password.42', 8),      
    });
    usersRepository.save(user);

    const tokenResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'john10@doe.com',
        password: 'Password.42',
      });

    const profileResponse = await request(app)
      .get('/api/v1/profile')
      .set('Authorization', `Bearer ${tokenResponse.body.token}`)
      .expect(200);

    expect(profileResponse.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.stringMatching(`${tokenResponse.body.user.name}`),
        email: expect.stringMatching(`${tokenResponse.body.user.email}`),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      }),
    );
  });

  it('should not be able to return profile with invalid auth token',
    async () => {
      expect(async () => {
        await request(app)
          .get('/api/v1/profile')
          .set('Authorization', 'Bearer invalid');  
      }).rejects;
    },
  );
});