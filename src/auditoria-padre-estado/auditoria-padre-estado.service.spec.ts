import { Test, TestingModule } from '@nestjs/testing';
import { EstadoAuditoriaPadreService } from './auditoria-padre-estado.service';

describe('EstadoAuditoriaPadreService', () => {
  let service: EstadoAuditoriaPadreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstadoAuditoriaPadreService],
    }).compile();

    service = module.get<EstadoAuditoriaPadreService>(EstadoAuditoriaPadreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
