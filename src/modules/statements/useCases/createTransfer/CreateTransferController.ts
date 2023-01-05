import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

interface IResponse {
  id?: string | undefined;
  user_id?: string;
  sender_id?: string | null | undefined;
  type: OperationType;
  amount: number;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export class CreateTransferController {
  async execute(request: Request, response: Response) {
    const { id: sender_id } = request.user;
    const { amount, description } = request.body;
    const { user_id } = request.params;

    const type = OperationType.TRANSFER;

    const createTransferUseCase = container.resolve(CreateTransferUseCase);

    // credits the sender
    const transfer: IResponse = await createTransferUseCase.execute({
      user_id,
      sender_id,
      type,
      amount,
      description,
    });

    return response.status(201).json(transfer);
  }
}
