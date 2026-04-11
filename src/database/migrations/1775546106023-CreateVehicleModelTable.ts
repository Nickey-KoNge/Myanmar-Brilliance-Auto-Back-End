import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateVehicleModelTable1775546106023 implements MigrationInterface {
  name = 'CreateVehicleModelTable1775546106023';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'vehicle_models',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid', // UUID
          },
          {
            name: 'vehicle_model_name',
            type: 'varchar',
            length: '100', // varchar(100)
          },
          {
            name: 'vehicle_brand_id',
            type: 'uuid', // FK reference
          },
          {
            name: 'body_type',
            type: 'varchar',
            length: '50', // varchar(50)
          },
          {
            name: 'fuel_type',
            type: 'varchar',
            length: '50', // varchar(50)
          },
          {
            name: 'transmission',
            type: 'varchar',
            length: '50', // varchar(50)
          },
          {
            name: 'engine_capacity',
            type: 'varchar',
            length: '20', // varchar(20)
          },
          {
            name: 'year_of_release',
            type: 'date', // DATE()
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20', // varchar(20)
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()', // DATE()
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()', // DATE()
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('vehicle_models');
  }
}
