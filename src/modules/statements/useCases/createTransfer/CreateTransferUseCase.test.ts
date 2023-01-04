import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateTransferUseCase } from "./CreateTransferUseCase";
import { ICreateTransferDTO } from "./CreateTransferDTO";

describe("User Statement", () => {
  it("should be able to create a transfer", async () => {
    const usersRepository = new InMemoryUsersRepository();
    const createUserUseCase = new CreateUserUseCase(usersRepository);
    const senderUserResponse = await createUserUseCase.execute({
      name: "Jonh Doe",
      email: "john16@doe.com",
      password: "Password.42",
    });
    const recipientUserResponse = await createUserUseCase.execute({
      name: "Jane Doe",
      email: "jane@doe.com",
      password: "Password.42",
    });

    const statementsRepository = new InMemoryStatementsRepository();
    const createTransferUseCase = new CreateTransferUseCase(
      usersRepository,
      statementsRepository
    );
    enum OperationType {
      DEPOSIT = "deposit",
      WITHDRAW = "withdraw",
      TRANSFER = "transfer",
    }

    const transferDTO: ICreateTransferDTO = {
      user_id: `${recipientUserResponse.id}`,
      sender_id: `${senderUserResponse.id}`,
      description: "Transfer Deposit",
      amount: 9000,
      type: OperationType.TRANSFER,
    };
    const withdrawDTO: ICreateTransferDTO = {
      user_id: `${recipientUserResponse.id}`,
      sender_id: `${senderUserResponse.id}`,
      description: "Transfer Deposit",
      amount: 9000,
      type: OperationType.TRANSFER,
    };
    const transferDeposit = await createTransferUseCase.execute(transferDTO);
    const transferWithdraw = await createTransferUseCase.execute(withdrawDTO);

    expect(transferDeposit).toBeInstanceOf(Statement);
    expect(transferWithdraw).toBeInstanceOf(Statement);
  });

  it("should not be able to create a transfer when insuficiente funds", async () => {
    throw new Error("Not Implemented");
  });

  it("should not be able to create a transfer when user not found", async () => {
    throw new Error("Not Implemented");
  });
});
