import { randomUUID } from 'crypto';
import { sign } from 'jsonwebtoken';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { app } from '../../../../app';
import { clearDatabaseTable } from '../../../../shared/helpers/cleardatabasetable';
import authConfig from '../../../../config/auth';
import { User } from '../../../users/entities/User';
import { Statement } from '../../entities/Statement';

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

describe('User Balance', () => {
  it('should be able to get user statement by ID', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Jonh Doe',
        email: 'john14@doe.com',
        password: 'Password.42',    
      });

    const tokenResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'john14@doe.com',
        password: 'Password.42',
      });
        
    const statementResponse = await request(app)
      .post('/api/v1/statements/deposit')
      .set('Authorization', `Bearer ${tokenResponse.body.token}`)
      .send({
        amount: 100.00,
        description: 'Income',
      });

    const statement = await request(app)
      .get(`/api/v1/statements/${statementResponse.body.id}`)
      .set('Authorization', `Bearer ${tokenResponse.body.token}`);

    expect(statement.body).toMatchObject({
      id: `${statementResponse.body.id}`,
      user_id: `${tokenResponse.body.user.id}`,
      description: 'Income',
      amount: '100.00',
      type: 'deposit',
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
    expect(statement.status).toBe(200);
  });  

  it('should not be able to get noexistent statement', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Jonh Doe',
        email: 'john14@doe.com',
        password: 'Password.42',    
      });
    const tokenResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'john14@doe.com',
        password: 'Password.42',
      });

    const statement = await request(app)
      .get(`/api/v1/statements/${tokenResponse.body.user.id}`)
      .set('Authorization', `Bearer ${tokenResponse.body.token}`)            
      .expect(404);
    expect(statement.body.message).toEqual('Statement not found');
  });

  it('should not be able to get statement from nonexistent user', async () => {
    const invalidUser:User = {
      id: randomUUID(),
      name: '',
      email: 'invalid@mail.com',
      password: 'Password.42',
      statement: [],
      created_at: new Date(),
      updated_at: new Date(),
    };

    const { secret, expiresIn } = authConfig.jwt;
    const invalidToken = sign({ invalidUser }, secret, {
      subject: invalidUser.id,
      expiresIn,
    });

    const statement = await request(app)
      .get(`/api/v1/statements/${randomUUID}`)
      .set('Authorization', `Bearer ${invalidToken}`)            
      .expect(404);
    expect(statement.body.message).toEqual('User not found');
  });
});