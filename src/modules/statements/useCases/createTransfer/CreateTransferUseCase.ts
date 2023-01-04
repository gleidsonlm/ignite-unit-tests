import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferError } from "./CreateTransferError";
import { ICreateTransferDTO } from "./CreateTransferDTO";

@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    user_id,
    sender_id,
    type,
    amount,
    description,
  }: ICreateTransferDTO) {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new CreateTransferError.UserNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id,
    });

    if (balance < amount) {
      throw new CreateTransferError.InsufficientFunds();
    }

    const statementOperation = await this.statementsRepository.create({
      type,
      amount,
      description,
      sender_id,
      user_id,
    });

    return statementOperation;
  }
}
