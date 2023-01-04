import { randomUUID } from 'crypto';
import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { Statement } from '../../entities/Statement';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { ICreateStatementDTO } from '../createStatement/ICreateStatementDTO';

import { GetBalanceUseCase } from './GetBalanceUseCase';

describe('User Balance', () => {
  it('should be able to create user balance', async () => {
    const usersRepository = new InMemoryUsersRepository;
    const createUserUseCase = new CreateUserUseCase(usersRepository);
    const userResponse = await createUserUseCase.execute({
      name: 'Jonh Doe',
      email: 'john13@doe.com',
      password: 'Password.42',
    });
        
    const statementsRepository = new InMemoryStatementsRepository;
    const createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
    enum OperationType {
      DEPOSIT = 'deposit',
      WITHDRAW = 'withdraw',
    }
    const depositDTO:ICreateStatementDTO = {
      user_id: `${userResponse.id}`,
      description: 'income',
      amount: 100,
      type: OperationType.DEPOSIT,
    };
    await createStatementUseCase.execute(depositDTO);

    const getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);
    const balance = await getBalanceUseCase.execute({
      user_id: `${userResponse.id}`,
    });
        
    expect(balance).toMatchObject({
      statement: expect.arrayContaining(
        [expect.any(Statement)],
      ),
      balance: 100,
    });
  });  

  it('should not be able to create balance for user not found ', async () => {
    const usersRepository = new InMemoryUsersRepository;        
    const statementsRepository = new InMemoryStatementsRepository;        
    const getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);

    try {
      await getBalanceUseCase.execute({
        user_id: `${randomUUID}`,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error).toMatchObject({
        message: 'User not found',
        statusCode: 404,
      });
    }
  });
});