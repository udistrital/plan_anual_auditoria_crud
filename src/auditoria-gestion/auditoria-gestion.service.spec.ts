import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaGestionService } from './auditoria-gestion.service';

describe('AuditoriaGestionService', () => {
  let service: AuditoriaGestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditoriaGestionService],
    }).compile();

    service = module.get<AuditoriaGestionService>(AuditoriaGestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
