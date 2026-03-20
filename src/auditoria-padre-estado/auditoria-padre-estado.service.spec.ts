import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EstadoAuditoriaPadreService } from './auditoria-padre-estado.service';
import { AuditoriaPadreEstado } from './schema/auditoria-padre-estado.schema';
import { AuditoriaPadre } from '../auditoria-padre/schemas/auditoria-padre.schema';

describe('EstadoAuditoriaPadreService', () => {
  let service: EstadoAuditoriaPadreService;
  let auditoriaPadreEstadoModel: Model<AuditoriaPadreEstado>;
  let auditoriaPadreModel: Model<AuditoriaPadre>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstadoAuditoriaPadreService,
        {
          provide: getModelToken(AuditoriaPadreEstado.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            updateMany: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: getModelToken(AuditoriaPadre.name),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EstadoAuditoriaPadreService>(
      EstadoAuditoriaPadreService,
    );
    auditoriaPadreEstadoModel = module.get<Model<AuditoriaPadreEstado>>(
      getModelToken(AuditoriaPadreEstado.name),
    );
    auditoriaPadreModel = module.get<Model<AuditoriaPadre>>(
      getModelToken(AuditoriaPadre.name),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(auditoriaPadreEstadoModel).toBeDefined();
    expect(auditoriaPadreModel).toBeDefined();
  });
});
