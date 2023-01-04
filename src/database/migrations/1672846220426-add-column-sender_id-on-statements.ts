import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class addColumnSenderIdOnStatements1672846220426
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // create column sender_id in statements table
    await queryRunner.addColumn(
      "statements",
      new TableColumn({
        name: "sender_id",
        type: "uuid",
        isNullable: true,
        default: null,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("statements", "sender_id");
  }
}
