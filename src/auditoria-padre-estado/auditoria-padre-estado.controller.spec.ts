import { Test, TestingModule } from '@nestjs/testing';
import { EstadoAuditoriaPadreController } from './auditoria-padre-estado.controller';
import { EstadoAuditoriaPadreService } from './auditoria-padre-estado.service';

describe('EstadoAuditoriaPadreController', () => {
  let controller: EstadoAuditoriaPadreController;
  let service: EstadoAuditoriaPadreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadoAuditoriaPadreController],
      providers: [
        {
          provide: EstadoAuditoriaPadreService,
          useValue: {
            post: jest.fn(),
            getAll: jest.fn(),
            getById: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EstadoAuditoriaPadreController>(
      EstadoAuditoriaPadreController,
    );
    service = module.get<EstadoAuditoriaPadreService>(
      EstadoAuditoriaPadreService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
