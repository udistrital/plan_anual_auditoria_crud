import { Test, TestingModule } from '@nestjs/testing';
import { EstadoAuditoriaPadreController } from './auditoria-padre-estado.controller';

describe('EstadoAuditoriaPadreController', () => {
  let controller: EstadoAuditoriaPadreController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadoAuditoriaPadreController],
    }).compile();

    controller = module.get<EstadoAuditoriaPadreController>(
      EstadoAuditoriaPadreController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
