import { randomUUID } from 'crypto';
import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { Statement } from '../../entities/Statement';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';

describe('Get Statement Operation', () => {
  it('should be able to get statement operation', async () => {
    const usersRepository = new InMemoryUsersRepository;
    const statementsRepository = new InMemoryStatementsRepository;

    const createUserUseCase = new CreateUserUseCase(usersRepository);
    const userResponse = await createUserUseCase.execute({
      name: 'Jonh Doe',
      email: 'john15@doe.com',
      password: 'Password.42',
    });

    const createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
    enum OperationType {
      DEPOSIT = 'deposit',
      WITHDRAW = 'withdraw',
    }
    const statementResponse = await createStatementUseCase.execute({
      user_id: `${userResponse.id}`,
      description: 'income',
      amount: 100,
      type: OperationType.DEPOSIT,
    });
        
    const getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository);
    const statement = await getStatementOperationUseCase.execute({
      user_id: `${userResponse.id}`,
      statement_id: `${statementResponse.id}`,
    });

    expect(statement).toBeInstanceOf(Statement);
  });

  it('should not be able to get nonexistent statement', async () => {
    const usersRepository = new InMemoryUsersRepository;
    const statementsRepository = new InMemoryStatementsRepository;

    const createUserUseCase = new CreateUserUseCase(usersRepository);
    const userResponse = await createUserUseCase.execute({
      name: 'Jonh Doe',
      email: 'john15@doe.com',
      password: 'Password.42',
    });
        
    try {
      const getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository);  
      await getStatementOperationUseCase.execute({
        user_id: `${userResponse.id}`,
        statement_id: `${randomUUID}`,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error).toMatchObject({
        message: 'Statement not found',
        statusCode: 404,
      });
    }
  });

  it('should not be able to get statement from nonexistent user ', async () => {
    const usersRepository = new InMemoryUsersRepository;
    const statementsRepository = new InMemoryStatementsRepository;

    const createUserUseCase = new CreateUserUseCase(usersRepository);
    const userResponse = await createUserUseCase.execute({
      name: 'Jonh Doe',
      email: 'john15@doe.com',
      password: 'Password.42',
    });

    const createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
    enum OperationType {
      DEPOSIT = 'deposit',
      WITHDRAW = 'withdraw',
    }
    const statementResponse = await createStatementUseCase.execute({
      user_id: `${userResponse.id}`,
      description: 'income',
      amount: 100,
      type: OperationType.DEPOSIT,
    });
        
    try {
      const getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository);
      await getStatementOperationUseCase.execute({
        user_id: `${randomUUID}`,
        statement_id: `${statementResponse.id}`,
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