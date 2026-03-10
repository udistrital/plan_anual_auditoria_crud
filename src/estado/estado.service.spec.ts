import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EstadoService } from './estado.service';
import { PlanEstado } from './schema/estado.schema';
import { PlanEstadoDto } from './dto/estado.dto';
import { PlanAuditoria } from '../plan-auditoria/schemas/plan-auditoria.schema';
import { FilterDto } from '../filters/filters.dto';

const mockEstadoPlanDTO: PlanEstadoDto = {
  plan_auditoria_id: new Types.ObjectId('672d3050f7814a9a0c5261d4'),
  usuario_id: 76767,
  usuario_rol: 'Auditor',
  observacion: 'Estado inicial del plan de auditoría',
  actual: true,
  estado_id: 2552,
  fecha_ejecucion_estado: new Date('2024-01-15'),
  activo: true,
};

const mockEstadoPlan = {
  ...mockEstadoPlanDTO,
  _id: '672d36737e962bcac5ce9beb',
};

const mockPlanAuditoria = {
  _id: '672d3050f7814a9a0c5261d4',
  titulo: 'Plan de Auditoría 2024',
  activo: true,
};

describe('EstadoService', () => {
  let estadoPlanService: EstadoService;
  let planEstadoModel: Model<PlanEstado>;
  let planAuditoriaModel: Model<PlanAuditoria>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstadoService,
        {
          provide: getModelToken(PlanEstado.name),
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
          provide: getModelToken(PlanAuditoria.name),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    estadoPlanService = module.get<EstadoService>(EstadoService);
    planEstadoModel = module.get<Model<PlanEstado>>(
      getModelToken(PlanEstado.name),
    );
    planAuditoriaModel = module.get<Model<PlanAuditoria>>(
      getModelToken(PlanAuditoria.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debería estar definido', () => {
    expect(estadoPlanService).toBeDefined();
    expect(planEstadoModel).toBeDefined();
    expect(planAuditoriaModel).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver un estado de plan cuando los datos son válidos', async () => {
      const findByIdSpy = jest
        .spyOn(planAuditoriaModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
        } as any);

      const findSpy = jest.spyOn(planEstadoModel, 'find').mockResolvedValue([]);

      const createSpy = jest
        .spyOn(planEstadoModel, 'create')
        .mockResolvedValue(mockEstadoPlan as any);

      const result = await estadoPlanService.post(mockEstadoPlanDTO);

      expect(findByIdSpy).not.toHaveBeenCalled(); // checkRelated no se llama en post
      expect(findSpy).toHaveBeenCalledWith({
        plan_auditoria_id: mockEstadoPlanDTO.plan_auditoria_id,
        actual: true,
      });
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          plan_auditoria_id: mockEstadoPlanDTO.plan_auditoria_id,
          usuario_id: mockEstadoPlanDTO.usuario_id,
          estado_id: mockEstadoPlanDTO.estado_id,
          actual: true,
          activo: true,
          fecha_ejecucion_estado: expect.any(Date),
        }),
      );
      expect(result).toEqual(mockEstadoPlan);
    });

    it('Debería establecer actual en true automáticamente', async () => {
      jest.spyOn(planEstadoModel, 'find').mockResolvedValue([]);

      const createSpy = jest
        .spyOn(planEstadoModel, 'create')
        .mockResolvedValue(mockEstadoPlan as any);

      await estadoPlanService.post(mockEstadoPlanDTO);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          actual: true,
        }),
      );
    });

    it('Debería establecer activo en true automáticamente', async () => {
      jest.spyOn(planEstadoModel, 'find').mockResolvedValue([]);

      const createSpy = jest
        .spyOn(planEstadoModel, 'create')
        .mockResolvedValue(mockEstadoPlan as any);

      await estadoPlanService.post(mockEstadoPlanDTO);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activo: true,
        }),
      );
    });

    it('Debería establecer fecha_ejecucion_estado automáticamente', async () => {
      jest.spyOn(planEstadoModel, 'find').mockResolvedValue([]);

      const createSpy = jest
        .spyOn(planEstadoModel, 'create')
        .mockResolvedValue(mockEstadoPlan as any);

      await estadoPlanService.post(mockEstadoPlanDTO);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          fecha_ejecucion_estado: expect.any(Date),
        }),
      );
    });

    it('Debería desactivar estados actuales anteriores cuando existen', async () => {
      const estadosAnteriores = [
        {
          ...mockEstadoPlan,
          _id: 'estado1',
          actual: true,
        },
        {
          ...mockEstadoPlan,
          _id: 'estado2',
          actual: true,
        },
      ];

      const findSpy = jest
        .spyOn(planEstadoModel, 'find')
        .mockResolvedValue(estadosAnteriores as any);

      const updateManySpy = jest
        .spyOn(planEstadoModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 2 } as any);

      const createSpy = jest
        .spyOn(planEstadoModel, 'create')
        .mockResolvedValue(mockEstadoPlan as any);

      await estadoPlanService.post(mockEstadoPlanDTO);

      expect(findSpy).toHaveBeenCalledWith({
        plan_auditoria_id: mockEstadoPlanDTO.plan_auditoria_id,
        actual: true,
      });
      expect(updateManySpy).toHaveBeenCalledWith(
        {
          plan_auditoria_id: mockEstadoPlanDTO.plan_auditoria_id,
          actual: true,
        },
        { $set: { actual: false } },
      );
      expect(createSpy).toHaveBeenCalled();
    });

    it('NO debería llamar updateMany cuando no hay estados actuales anteriores', async () => {
      const findSpy = jest.spyOn(planEstadoModel, 'find').mockResolvedValue([]);

      const updateManySpy = jest
        .spyOn(planEstadoModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 0 } as any);

      const createSpy = jest
        .spyOn(planEstadoModel, 'create')
        .mockResolvedValue(mockEstadoPlan as any);

      await estadoPlanService.post(mockEstadoPlanDTO);

      expect(findSpy).toHaveBeenCalled();
      expect(updateManySpy).not.toHaveBeenCalled();
      expect(createSpy).toHaveBeenCalled();
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error');
      jest.spyOn(planEstadoModel, 'find').mockRejectedValue(mockError);

      await expect(estadoPlanService.post(mockEstadoPlanDTO)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'activo:true',
      fields: 'plan_auditoria_id,estado_id',
      sortby: 'fecha_ejecucion_estado',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'true',
    };

    const mockEstadosPlanes = [
      {
        ...mockEstadoPlan,
        _id: '672d36737e962bcac5ce9be1',
        estado_id: 2552,
      },
      {
        ...mockEstadoPlan,
        _id: '672d36737e962bcac5ce9be2',
        estado_id: 2553,
      },
    ];

    it('Debería retornar todos los estados de plan con filtros aplicados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockEstadosPlanes),
      };

      const findSpy = jest
        .spyOn(planEstadoModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await estadoPlanService.getAll(mockFilterDto);

      expect(findSpy).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalled();
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual(mockEstadosPlanes);
    });

    it('Debería aplicar populate cuando populate es "true"', async () => {
      const filterWithPopulate = { ...mockFilterDto, populate: 'true' };
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockEstadosPlanes),
      };

      jest.spyOn(planEstadoModel, 'find').mockReturnValue(mockQuery as any);

      await estadoPlanService.getAll(filterWithPopulate);

      expect(mockQuery.populate).toHaveBeenCalledWith([
        { path: 'plan_auditoria_id' },
      ]);
    });

    it('Debería NO aplicar populate cuando populate es "false"', async () => {
      const filterWithoutPopulate = { ...mockFilterDto, populate: 'false' };
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockEstadosPlanes),
      };

      jest.spyOn(planEstadoModel, 'find').mockReturnValue(mockQuery as any);

      await estadoPlanService.getAll(filterWithoutPopulate);

      expect(mockQuery.populate).toHaveBeenCalledWith([]);
    });

    it('Debería retornar un array vacío cuando no hay resultados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(planEstadoModel, 'find').mockReturnValue(mockQuery as any);

      const result = await estadoPlanService.getAll(mockFilterDto);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('Debería manejar errores de la base de datos', async () => {
      const mockError = new Error('Database error');
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(mockError),
      };

      jest.spyOn(planEstadoModel, 'find').mockReturnValue(mockQuery as any);

      await expect(estadoPlanService.getAll(mockFilterDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getById', () => {
    it('Debería retornar un estado de plan por su ID cuando existe', async () => {
      const findByIdSpy = jest
        .spyOn(planEstadoModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEstadoPlan),
        } as any);

      const result = await estadoPlanService.getById(mockEstadoPlan._id);

      expect(findByIdSpy).toHaveBeenCalledWith(mockEstadoPlan._id);
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockEstadoPlan);
    });

    it('Debería lanzar un error si el estado de plan no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      const findByIdSpy = jest
        .spyOn(planEstadoModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(estadoPlanService.getById(nonExistentId)).rejects.toThrow(
        `${nonExistentId} no existe`,
      );

      expect(findByIdSpy).toHaveBeenCalledWith(nonExistentId);
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database connection failed');
      jest.spyOn(planEstadoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(
        estadoPlanService.getById(mockEstadoPlan._id),
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('put', () => {
    const updateDto: PlanEstadoDto = {
      ...mockEstadoPlanDTO,
      estado_id: 2555,
      observacion: 'Estado actualizado',
    };

    it('Debería actualizar un estado de plan existente', async () => {
      const updatedEstadoPlan = { ...mockEstadoPlan, ...updateDto };

      const checkRelatedSpy = jest
        .spyOn(planAuditoriaModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
        } as any);

      const updateSpy = jest
        .spyOn(planEstadoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedEstadoPlan),
        } as any);

      const result = await estadoPlanService.put(mockEstadoPlan._id, updateDto);

      expect(checkRelatedSpy).toHaveBeenCalledWith(updateDto.plan_auditoria_id);
      expect(updateSpy).toHaveBeenCalledWith(mockEstadoPlan._id, updateDto, {
        new: true,
      });
      expect(result).toEqual(updatedEstadoPlan);
    });

    it('Debería lanzar un error si el estado de plan no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);

      const updateSpy = jest
        .spyOn(planEstadoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(
        estadoPlanService.put(nonExistentId, updateDto),
      ).rejects.toThrow(`${nonExistentId} no existe`);

      expect(updateSpy).toHaveBeenCalledWith(nonExistentId, updateDto, {
        new: true,
      });
    });

    it('Debería lanzar un error si el plan de auditoría relacionado no existe', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        estadoPlanService.put(mockEstadoPlan._id, updateDto),
      ).rejects.toThrow(
        `Plan auditoria relacionada con id ${updateDto.plan_auditoria_id} no existe`,
      );
    });

    it('Debería validar el plan de auditoría antes de actualizar', async () => {
      const checkRelatedSpy = jest
        .spyOn(planAuditoriaModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
        } as any);

      jest.spyOn(planEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEstadoPlan),
      } as any);

      await estadoPlanService.put(mockEstadoPlan._id, updateDto);

      expect(checkRelatedSpy).toHaveBeenCalledWith(updateDto.plan_auditoria_id);
      expect(checkRelatedSpy).toHaveBeenCalledTimes(1);
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error');
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);

      jest.spyOn(planEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(
        estadoPlanService.put(mockEstadoPlan._id, updateDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    it('Debería marcar un estado de plan como inactivo (soft delete)', async () => {
      const deletedEstadoPlan = { ...mockEstadoPlan, activo: false };

      const deleteSpy = jest
        .spyOn(planEstadoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(deletedEstadoPlan),
        } as any);

      const result = await estadoPlanService.delete(mockEstadoPlan._id);

      expect(deleteSpy).toHaveBeenCalledWith(
        mockEstadoPlan._id,
        { activo: false },
        { new: true },
      );
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deletedEstadoPlan);
      expect(result.activo).toBe(false);
    });

    it('Debería lanzar un error si el estado de plan no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      const deleteSpy = jest
        .spyOn(planEstadoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(estadoPlanService.delete(nonExistentId)).rejects.toThrow(
        `${nonExistentId} no existe`,
      );

      expect(deleteSpy).toHaveBeenCalledWith(
        nonExistentId,
        { activo: false },
        { new: true },
      );
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error during delete');

      jest.spyOn(planEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(
        estadoPlanService.delete(mockEstadoPlan._id),
      ).rejects.toThrow('Database error during delete');
    });
  });

  describe('count', () => {
    const filterDto: FilterDto = {
      query: 'activo:true',
      fields: '',
      sortby: '',
      order: '',
      limit: '',
      offset: '',
      populate: '',
    };

    it('Debería retornar la cantidad de estados de plan que coinciden con el filtro', async () => {
      const expectedCount = 5;

      const countSpy = jest
        .spyOn(planEstadoModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(expectedCount),
        } as any);

      const result = await estadoPlanService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(countSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedCount);
    });

    it('Debería retornar 0 cuando no hay estados de plan que coincidan', async () => {
      const countSpy = jest
        .spyOn(planEstadoModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(0),
        } as any);

      const result = await estadoPlanService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      const mockError = new Error('Error al contar documentos');

      jest.spyOn(planEstadoModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(estadoPlanService.count(filterDto)).rejects.toThrow(
        'Error al contar documentos',
      );
    });

    it('Debería aplicar correctamente los filtros del FilterDto', async () => {
      const complexFilterDto: FilterDto = {
        query: 'activo:true,actual:true',
        fields: 'plan_auditoria_id,estado_id',
        sortby: 'fecha_ejecucion_estado',
        order: 'desc',
        limit: '10',
        offset: '0',
        populate: 'false',
      };

      const countSpy = jest
        .spyOn(planEstadoModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(3),
        } as any);

      const result = await estadoPlanService.count(complexFilterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(3);
    });
  });
});
