import { Test, TestingModule } from '@nestjs/testing';
import { ProgramaEstadoController } from './programa-estado.controller';


describe('ProgramaEstadoController', () => {
  let controller: ProgramaEstadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgramaEstadoController],
    }).compile();

    controller = module.get<ProgramaEstadoController>(
      ProgramaEstadoController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
