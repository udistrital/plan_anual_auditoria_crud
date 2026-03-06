import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaPadreService } from './auditoria-padre.service';
import { getModelToken } from '@nestjs/mongoose';
import { AuditoriaPadre } from './schemas/auditoria-padre.schema';
import { AuditoriaPadreDTO } from './dto/auditoria-padre.dto';
import { PlanAuditoria } from '../plan-auditoria/schemas/plan-auditoria.schema';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockAuditoriaPadreDTO: AuditoriaPadreDTO = {
  plan_auditoria_id: '67197dda3416d2a85e5d6d8f',
  titulo: 'Auditoría Padre 2024',
  tipo_evaluacion_id: 1,
  cronograma_actividad: [],
  estado_id: 1,
  vigencia_id: 2024,
  macroproceso_id: 10,
  proceso_id: 20,
  dependencia_id: 30,
  auditorias: [],
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_modificacion: new Date('2024-01-01'),
};

const mockAuditoriaPadre = {
  ...mockAuditoriaPadreDTO,
  _id: '671aa963064222e6583d56e4',
};

const mockPlanAuditoria = {
  _id: '67197dda3416d2a85e5d6d8f',
  nombre: 'Plan Anual de Auditoría 2024',
};

describe('AuditoriaPadreService', () => {
  let auditoriaPadreService: AuditoriaPadreService;
  let auditoriaPadreModel: Model<AuditoriaPadre>;
  let planAuditoriaModel: Model<PlanAuditoria>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriaPadreService,
        {
          provide: getModelToken(AuditoriaPadre.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: getModelToken(PlanAuditoria.name),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    auditoriaPadreService = module.get<AuditoriaPadreService>(
      AuditoriaPadreService,
    );
    auditoriaPadreModel = module.get<Model<AuditoriaPadre>>(
      getModelToken(AuditoriaPadre.name),
    );
    planAuditoriaModel = module.get<Model<PlanAuditoria>>(
      getModelToken(PlanAuditoria.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debería estar definido', () => {
    expect(auditoriaPadreService).toBeDefined();
    expect(auditoriaPadreModel).toBeDefined();
    expect(planAuditoriaModel).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver una auditoria padre cuando los datos son válidos', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);

      jest
        .spyOn(auditoriaPadreModel, 'create')
        .mockResolvedValue(mockAuditoriaPadre as any);

      const result = await auditoriaPadreService.post(mockAuditoriaPadreDTO);

      expect(result).toEqual(mockAuditoriaPadre);
    });

    it('Debería lanzar un error si el PlanAuditoria no existe', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        auditoriaPadreService.post(mockAuditoriaPadreDTO),
      ).rejects.toThrow(
        `Plan auditoria relacionada con id ${mockAuditoriaPadreDTO.plan_auditoria_id} no existe`,
      );
    });
  });

  describe('getAll', () => {
    it('Debería retornar todas las auditorias padre', async () => {
      const filterDto: FilterDto = {} as FilterDto;
      jest.spyOn(auditoriaPadreModel, 'find').mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockAuditoriaPadre]),
      } as any);

      jest.spyOn(auditoriaPadreModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      } as any);

      const result = await auditoriaPadreService.getAll(filterDto);

      expect(result).toEqual([mockAuditoriaPadre]);
    });
  });

  describe('getById', () => {
    it('Debería retornar una auditoria padre por id', async () => {
      jest.spyOn(auditoriaPadreModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditoriaPadre),
      } as any);

      const result = await auditoriaPadreService.getById(
        mockAuditoriaPadre._id,
      );

      expect(result).toEqual(mockAuditoriaPadre);
    });

    it('Debería lanzar un error si la auditoria padre no existe', async () => {
      jest.spyOn(auditoriaPadreModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        auditoriaPadreService.getById(mockAuditoriaPadre._id),
      ).rejects.toThrow(`${mockAuditoriaPadre._id} no existe`);
    });
  });

  describe('put', () => {
    it('Debería actualizar y retornar una auditoria padre', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);

      jest.spyOn(auditoriaPadreModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditoriaPadre),
      } as any);

      const result = await auditoriaPadreService.put(
        mockAuditoriaPadre._id,
        mockAuditoriaPadreDTO,
      );

      expect(result).toEqual(mockAuditoriaPadre);
    });

    it('Debería lanzar un error si la auditoria padre no existe al actualizar', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);

      jest.spyOn(auditoriaPadreModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        auditoriaPadreService.put(mockAuditoriaPadre._id, mockAuditoriaPadreDTO),
      ).rejects.toThrow(`${mockAuditoriaPadre._id} no existe`);
    });
  });

  describe('delete', () => {
    it('Debería desactivar y retornar una auditoria padre', async () => {
      jest.spyOn(auditoriaPadreModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockAuditoriaPadre, activo: false }),
      } as any);

      const result = await auditoriaPadreService.delete(mockAuditoriaPadre._id);

      expect(result).toEqual({ ...mockAuditoriaPadre, activo: false });
    });

    it('Debería lanzar un error si la auditoria padre no existe al eliminar', async () => {
      jest.spyOn(auditoriaPadreModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        auditoriaPadreService.delete(mockAuditoriaPadre._id),
      ).rejects.toThrow(`${mockAuditoriaPadre._id} no existe`);
    });
  });

  describe('count', () => {
    it('Debería retornar el conteo de auditorias padre', async () => {
      const filterDto: FilterDto = {} as FilterDto;
      jest.spyOn(auditoriaPadreModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      } as any);

      const result = await auditoriaPadreService.count(filterDto);

      expect(result).toBe(5);
    });
  });
});
