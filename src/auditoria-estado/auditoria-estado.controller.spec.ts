import { Test, TestingModule } from '@nestjs/testing';
import { EstadoAuditoriaController } from './auditoria-estado.controller';
describe('AuditorEstadoController', () => {
  let controller: EstadoAuditoriaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadoAuditoriaController],
    }).compile();

    controller = module.get<EstadoAuditoriaController>(
      EstadoAuditoriaController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
