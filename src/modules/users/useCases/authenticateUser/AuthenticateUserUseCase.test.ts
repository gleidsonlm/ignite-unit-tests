import jwt from 'jsonwebtoken';
import { describe , it } from '@jest/globals';

import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';

describe('User Session', () => {
  it('should be able to create a token', async () => {
    const usersRepository = new InMemoryUsersRepository
    const createUserUseCase = new CreateUserUseCase(usersRepository);
    const authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);

    const user = await createUserUseCase.execute({
      name: 'John Doe',
      email: 'john4@doe.com',
      password: 'Password.42'
    });

    const userAuth = await authenticateUserUseCase.execute({
      email: 'john4@doe.com',
      password: 'Password.42'
    })
    
    expect(userAuth).toEqual(
      expect.objectContaining({
          user: {
            id: expect.any(String),
            name: 'John Doe',
            email: 'john4@doe.com'
          },
          token: expect.any(String),
        }
      ))
      expect(() => {
      jwt.verify(
        userAuth.token,
      `${process.env.JWT_SECRET}`
      )
    })
  })

  it('should not be able to create a token with incorrect password', async () => {
    const usersRepository = new InMemoryUsersRepository
    const createUserUseCase = new CreateUserUseCase(usersRepository);
    const authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);

    const user = await createUserUseCase.execute({
      name: 'John Doe',
      email: 'john5@doe.com',
      password: 'Password.42'
    });

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'john5@doe.com',
        password: 'Incorrect'
      })
    }).rejects
  })

  it('should not be able to create a token without valid email user', async () => {
    const usersRepository = new InMemoryUsersRepository
    const createUserUseCase = new CreateUserUseCase(usersRepository);
    const authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);

    const user = await createUserUseCase.execute({
      name: 'John Doe',
      email: 'john6@doe.com',
      password: 'Password.42'
    });

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'incorrect@doe.com',
        password: 'Password.42'
      })
    }).rejects
  })
})