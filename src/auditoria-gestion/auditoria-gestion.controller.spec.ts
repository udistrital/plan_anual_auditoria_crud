import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaGestionController } from './auditoria-gestion.controller';
import { AuditoriaGestionService } from './auditoria-gestion.service';

describe('AuditoriaGestionController', () => {
  let controller: AuditoriaGestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditoriaGestionController],
      providers: [AuditoriaGestionService],
    }).compile();

    controller = module.get<AuditoriaGestionController>(AuditoriaGestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
