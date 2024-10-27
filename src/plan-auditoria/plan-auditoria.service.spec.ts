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
  creado_por_id: 10,
  estado_id: 5,
  vigencia_id: 3,
  aprobado_jefe_dependencia: true,
  jefe_dependencia_id: 5541,
  aprobado_secretario_tecnico: true,
  secretario_tecnico_id: 278,
  activo: true,
  fecha_creacion: new Date(),
  fecha_modificacion: new Date(),
};


const mockPlanAuditoria = {
  ...mockPlanAuditoriaDTO,
  _id: '67197dda3416d2a85e5d6d8f',
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
    planAuditoriaModel = module.get<Model<PlanAuditoria>>(PlanAuditoria.name);
   
  });

  it('Debería estar definido', () => {
    expect(PlanAuditoriaService).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver una alerta modal', async () => {
    
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
          _id: '67197dda3416d2a85e5d6d8f',
          objetivo: "el objetivo es",
          alcance: "asdasd",
          criterio: "criterio de los criterios",
          recurso: "los recursos son",
          creado_por_id: 10,
          estado_id: 5,
          vigencia_id: 3,
          aprobado_jefe_dependencia: true,
          jefe_dependencia_id: 5541,
          aprobado_secretario_tecnico: true,
          secretario_tecnico_id: 278,
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
    it('Debería retornar una alerta modal por su ID', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockPlanAuditoria as unknown as PlanAuditoria),
      } as any);

      const result = await planAuditoriaService.getById(mockPlanAuditoria._id);

      expect(planAuditoriaModel.findById).toHaveBeenCalledWith(
        mockPlanAuditoria._id,
      );
      expect(result).toEqual(mockPlanAuditoria);
    });

    it('Debería lanzar un error si la alerta modal no existe', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        planAuditoriaService.getById(mockPlanAuditoria._id),
      ).rejects.toThrow(`${mockPlanAuditoria._id} doesn't exist`);

      expect(planAuditoriaModel.findById).toHaveBeenCalledWith(
        mockPlanAuditoria._id,
      );
    });
  });

  describe('put', () => {
    it('Debería actualizar una alerta modal', async () => {
      jest.spyOn(planAuditoriaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoriaDTO as PlanAuditoria),
      } as any);

      const result = await planAuditoriaService.put(
        mockPlanAuditoria._id,
        mockPlanAuditoriaDTO,
      );
      expect(planAuditoriaModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPlanAuditoria._id,
        mockPlanAuditoriaDTO,
        { new: true },
      );
      expect(result).toEqual(mockPlanAuditoriaDTO);
    });
      
    it('Debería lanzar un error si la alerta modal no existe', async () => {
      jest.spyOn(planAuditoriaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        planAuditoriaService.put(mockPlanAuditoria._id, mockPlanAuditoriaDTO),
      ).rejects.toThrow(`${mockPlanAuditoria._id} doesn't exist`);

      expect(planAuditoriaModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPlanAuditoria._id,
        mockPlanAuditoriaDTO,
        { new: true },
      );
    });
  });

  describe('delete', () => {
    it('Debería marcar una alerta modal como inactiva', async () => {
      jest.spyOn(planAuditoriaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockPlanAuditoriaDTO as unknown as PlanAuditoria),
      } as any);

      const result = await planAuditoriaService.delete(mockPlanAuditoria._id);

      expect(result).toEqual(mockPlanAuditoriaDTO);
    });

    it('Debería lanzar un error si la alerta modal no existe', async () => {
      jest.spyOn(planAuditoriaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        planAuditoriaService.delete(mockPlanAuditoria._id),
      ).rejects.toThrow(`${mockPlanAuditoria._id} doesn't exist`);
    });
  });
});