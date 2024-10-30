import { Test, TestingModule } from '@nestjs/testing';
import { PlanAuditoriaService } from './plan-auditoria.service';
import { getModelToken } from '@nestjs/mongoose';
import { PlanAuditoria } from './schemas/plan-auditoria.schema';
import { PlanAuditoriaDTO } from './dto/plan-auditoria.dto';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';


const mockPlanAuditoriaDTO: PlanAuditoriaDTO = {
  objetivo: "el objetivo es",
  alcance: "asdasd",
  criterio: "criterio de los criterios",
  recurso: "los recursos son",
  creadoPorId: 10,
  estadoId: 5,
  vigenciaId: 3,
  aprobadoJefeDependencia: true,
  jefeDependenciaId: 5541,
  aprobadoSecretarioTecnico: true,
  secretarioTecnicoId: 278,
  activo: true,
  fechaCreacion: new Date(),
  fechaModificacion: new Date(),
};


const mockPlanAuditoria = {
  ...mockPlanAuditoriaDTO,
  Id: '67197dda3416d2a85e5d6d8f',
};


describe('PlanAuditoriaService', () => {
  let planAuditoriaService: PlanAuditoriaService;
  let planAuditoriaModel: Model<PlanAuditoria>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanAuditoriaService,
        {
          provide: getModelToken(PlanAuditoria.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    planAuditoriaService = module.get<PlanAuditoriaService>(PlanAuditoriaService);
    planAuditoriaModel = module.get<Model<PlanAuditoria>>(getModelToken(PlanAuditoria.name));

  });

  it('Debería estar definido', () => {
    expect(PlanAuditoriaService).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver un plan de auditoria', async () => {

      jest
        .spyOn(planAuditoriaModel, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockPlanAuditoriaDTO as any));

      const result = await planAuditoriaService.post(mockPlanAuditoriaDTO);
      expect(result).toEqual(mockPlanAuditoriaDTO);
    });
  });

  describe('getAll', () => {
    it('Debería retornar todas las alertas modales con filtros aplicados', async () => {
      const mockPlanAuditorias = [
        mockPlanAuditoria,
        {
          Id: '67197dda3416d2a85e5d6d8f',
          objetivo: "el objetivo es",
          alcance: "asdasd",
          criterio: "criterio de los criterios",
          recurso: "los recursos son",
          creado_porId: 10,
          estadoId: 5,
          vigenciaId: 3,
          aprobado_jefe_dependencia: true,
          jefe_dependenciaId: 5541,
          aprobado_secretario_tecnico: true,
          secretario_tecnicoId: 278,
          activo: true,
          fecha_creacion: new Date(),
          fecha_modificacion: new Date(),
        },
      ];

      const mockFilterDto: FilterDto = {
        query: '',
        fields: '',
        sortby: '',
        order: '',
        limit: '',
        offset: '',
        populate: '',
      };

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPlanAuditorias),
      };

      jest.spyOn(planAuditoriaModel, 'find').mockReturnValue(mockQuery as any);

      const result = await planAuditoriaService.getAll(mockFilterDto);

      expect(result).toEqual(mockPlanAuditorias);
    });
  });

  describe('getById', () => {
    it('Debería retornar un plan de auditoria por su ID', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockPlanAuditoria as unknown as PlanAuditoria),
      } as any);

      const result = await planAuditoriaService.getById(mockPlanAuditoria.Id);

      expect(planAuditoriaModel.findById).toHaveBeenCalledWith(
        mockPlanAuditoria.Id,
      );
      expect(result).toEqual(mockPlanAuditoria);
    });

    it('Debería lanzar un error si el plan de auditoria no existe', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        planAuditoriaService.getById(mockPlanAuditoria.Id),
      ).rejects.toThrow(`${mockPlanAuditoria.Id} no existe`);

      expect(planAuditoriaModel.findById).toHaveBeenCalledWith(
        mockPlanAuditoria.Id,
      );
    });
  });

  describe('put', () => {
    it('Debería actualizar un plan de auditoria', async () => {
      jest.spyOn(planAuditoriaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoriaDTO as unknown as PlanAuditoria),
      } as any);

      const result = await planAuditoriaService.put(
        mockPlanAuditoria.Id,
        mockPlanAuditoriaDTO,
      );
      expect(planAuditoriaModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPlanAuditoria.Id,
        mockPlanAuditoriaDTO,
        { new: true },
      );
      expect(result).toEqual(mockPlanAuditoriaDTO);
    });

    it('Debería lanzar un error si el plan de auditoria no existe', async () => {
      jest.spyOn(planAuditoriaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        planAuditoriaService.put(mockPlanAuditoria.Id, mockPlanAuditoriaDTO),
      ).rejects.toThrow(`${mockPlanAuditoria.Id} no existe`);

      expect(planAuditoriaModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPlanAuditoria.Id,
        mockPlanAuditoriaDTO,
        { new: true },
      );
    });
  });

  describe('delete', () => {
    it('Debería marcar un plan de auditoria como inactiva', async () => {
      jest.spyOn(planAuditoriaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockPlanAuditoriaDTO as unknown as PlanAuditoria),
      } as any);

      const result = await planAuditoriaService.delete(mockPlanAuditoria.Id);

      expect(result).toEqual(mockPlanAuditoriaDTO);
    });

    it('Debería lanzar un error si el plan de auditoria no existe', async () => {
      jest.spyOn(planAuditoriaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        planAuditoriaService.delete(mockPlanAuditoria.Id),
      ).rejects.toThrow(`${mockPlanAuditoria.Id} no existe`);
    });
  });
});