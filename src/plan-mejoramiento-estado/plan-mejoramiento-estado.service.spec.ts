import { Test, TestingModule } from '@nestjs/testing';
import { PlanMejoramientoEstadoService } from './plan-mejoramiento-estado.service';
import { getModelToken } from '@nestjs/mongoose';
import { PlanMejoramientoEstado } from './schema/plan-mejoramiento-estado.schema';
import { PlanMejoramientoEstadoDto } from './dto/plan-mejoramiento-estado.dto';
import { PlanMejoramiento } from '../plan-mejoramiento/schema/plan-mejoramiento.schema';
import { Model, Types } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockDto: PlanMejoramientoEstadoDto = {
  plan_mejoramiento_id: new Types.ObjectId('672d3050f7814a9a0c5261d4'),
  usuario_id: 76767,
  usuario_rol: 'AUDITOR',
  observacion: 'Estado inicial del plan de mejoramiento',
  actual: true,
  estado_id: 1,
  fecha_ejecucion_estado: new Date('2024-01-15'),
  activo: true,
};

const mockEstado = {
  ...mockDto,
  _id: '672d36737e962bcac5ce9beb',
};

const mockPlanMejoramiento = {
  _id: '672d3050f7814a9a0c5261d4',
  vigencia_id: 2024,
  estado_id: 1,
};

describe('PlanMejoramientoEstadoService', () => {
  let service: PlanMejoramientoEstadoService;
  let estadoModel: Model<PlanMejoramientoEstado>;
  let planModel: Model<PlanMejoramiento>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanMejoramientoEstadoService,
        {
          provide: getModelToken(PlanMejoramientoEstado.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
            updateMany: jest.fn(),
          },
        },
        {
          provide: getModelToken(PlanMejoramiento.name),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockPlanMejoramiento),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PlanMejoramientoEstadoService>(
      PlanMejoramientoEstadoService,
    );
    estadoModel = module.get<Model<PlanMejoramientoEstado>>(
      getModelToken(PlanMejoramientoEstado.name),
    );
    planModel = module.get<Model<PlanMejoramiento>>(
      getModelToken(PlanMejoramiento.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debería estar definido', () => {
    expect(service).toBeDefined();
    expect(estadoModel).toBeDefined();
    expect(planModel).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver un estado cuando no hay estados previos', async () => {
      const findSpy = jest
        .spyOn(estadoModel, 'find')
        .mockResolvedValue([] as any);

      const createSpy = jest
        .spyOn(estadoModel, 'create')
        .mockResolvedValue(mockEstado as any);

      const result = await service.post(mockDto);

      expect(findSpy).toHaveBeenCalledWith({
        plan_mejoramiento_id: mockDto.plan_mejoramiento_id,
        actual: true,
      });
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          actual: true,
          activo: true,
          fecha_ejecucion_estado: expect.any(Date),
        }),
      );
      expect(result).toEqual(mockEstado);
    });

    it('Debería desactivar estados anteriores cuando ya existe un estado actual', async () => {
      const estadosAnteriores = [
        { ...mockEstado, _id: 'estado1', actual: true },
        { ...mockEstado, _id: 'estado2', actual: true },
      ];

      const findSpy = jest
        .spyOn(estadoModel, 'find')
        .mockResolvedValue(estadosAnteriores as any);

      const updateManySpy = jest
        .spyOn(estadoModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 2 } as any);

      const createSpy = jest
        .spyOn(estadoModel, 'create')
        .mockResolvedValue(mockEstado as any);

      await service.post(mockDto);

      expect(findSpy).toHaveBeenCalledWith({
        plan_mejoramiento_id: mockDto.plan_mejoramiento_id,
        actual: true,
      });
      expect(updateManySpy).toHaveBeenCalledWith(
        { plan_mejoramiento_id: mockDto.plan_mejoramiento_id, actual: true },
        { $set: { actual: false } },
      );
      expect(createSpy).toHaveBeenCalled();
    });

    it('Debería actualizar estado_id en el plan de mejoramiento padre', async () => {
      jest.spyOn(estadoModel, 'find').mockResolvedValue([] as any);
      jest.spyOn(estadoModel, 'create').mockResolvedValue(mockEstado as any);

      await service.post(mockDto);

      expect(planModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockEstado.plan_mejoramiento_id,
        { estado_id: mockEstado.estado_id },
        { new: true },
      );
    });

    it('Debería establecer actual en true, activo en true y fecha automáticamente', async () => {
      jest.spyOn(estadoModel, 'find').mockResolvedValue([] as any);

      const createSpy = jest
        .spyOn(estadoModel, 'create')
        .mockResolvedValue(mockEstado as any);

      await service.post(mockDto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          actual: true,
          activo: true,
          fecha_ejecucion_estado: expect.any(Date),
        }),
      );
    });

    it('Debería manejar errores durante la creación', async () => {
      const mockError = new Error('Database error');
      jest.spyOn(estadoModel, 'find').mockResolvedValue([] as any);
      jest.spyOn(estadoModel, 'create').mockRejectedValue(mockError);

      await expect(service.post(mockDto)).rejects.toThrow('Database error');
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'activo:true',
      fields: 'estado_id,observacion',
      sortby: 'fecha_ejecucion_estado',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'false',
    };

    const mockEstados = [
      { ...mockEstado, _id: '1', estado_id: 1 },
      { ...mockEstado, _id: '2', estado_id: 2 },
    ];

    it('Debería retornar todos los estados con filtros aplicados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockEstados),
      };

      const findSpy = jest
        .spyOn(estadoModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await service.getAll(mockFilterDto);

      expect(findSpy).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalled();
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual(mockEstados);
    });

    it('Debería aplicar populate cuando populate es "true"', async () => {
      const filterWithPopulate = { ...mockFilterDto, populate: 'true' };
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockEstados),
      };

      jest.spyOn(estadoModel, 'find').mockReturnValue(mockQuery as any);

      await service.getAll(filterWithPopulate);

      expect(mockQuery.populate).toHaveBeenCalledWith([
        { path: 'plan_mejoramiento_id' },
      ]);
    });

    it('Debería NO aplicar populate cuando populate es "false"', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockEstados),
      };

      jest.spyOn(estadoModel, 'find').mockReturnValue(mockQuery as any);

      await service.getAll(mockFilterDto);

      expect(mockQuery.populate).toHaveBeenCalledWith([]);
    });

    it('Debería retornar un array vacío cuando no hay resultados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(estadoModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getAll(mockFilterDto);

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

      jest.spyOn(estadoModel, 'find').mockReturnValue(mockQuery as any);

      await expect(service.getAll(mockFilterDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getById', () => {
    it('Debería retornar un estado por su ID cuando existe', async () => {
      const findByIdSpy = jest
        .spyOn(estadoModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEstado),
        } as any);

      const result = await service.getById(mockEstado._id);

      expect(findByIdSpy).toHaveBeenCalledWith(mockEstado._id);
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockEstado);
    });

    it('Debería lanzar un error si el estado no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      jest.spyOn(estadoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.getById(nonExistentId)).rejects.toThrow(
        `${nonExistentId} no existe`,
      );
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database connection failed');
      jest.spyOn(estadoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(service.getById(mockEstado._id)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('put', () => {
    const updateDto: PlanMejoramientoEstadoDto = {
      ...mockDto,
      observacion: 'Observación actualizada',
      estado_id: 2,
      actual: false,
    };

    it('Debería actualizar un estado existente', async () => {
      const updatedEstado = { ...mockEstado, ...updateDto };

      const planFindSpy = jest
        .spyOn(planModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPlanMejoramiento),
        } as any);

      const updateSpy = jest
        .spyOn(estadoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedEstado),
        } as any);

      const result = await service.put(mockEstado._id, updateDto);

      expect(planFindSpy).toHaveBeenCalledWith(updateDto.plan_mejoramiento_id);
      expect(updateSpy).toHaveBeenCalledWith(mockEstado._id, updateDto, {
        new: true,
      });
      expect(result).toEqual(updatedEstado);
    });

    it('Debería lanzar un error si el estado no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      jest.spyOn(planModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanMejoramiento),
      } as any);

      jest.spyOn(estadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.put(nonExistentId, updateDto)).rejects.toThrow(
        `${nonExistentId} no existe`,
      );
    });

    it('Debería lanzar un error si el plan de mejoramiento relacionado no existe', async () => {
      jest.spyOn(planModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        service.put(mockEstado._id, updateDto),
      ).rejects.toThrow(
        `Plan de mejoramiento relacionado con id ${updateDto.plan_mejoramiento_id} no existe`,
      );

      expect(estadoModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('Debería actualizar sin verificar plan si no se proporciona plan_mejoramiento_id', async () => {
      const dtoSinPlan = { ...updateDto, plan_mejoramiento_id: undefined };

      const updateSpy = jest
        .spyOn(estadoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEstado),
        } as any);

      await service.put(mockEstado._id, dtoSinPlan);

      expect(planModel.findById).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('Debería marcar un estado como inactivo (soft delete)', async () => {
      const deletedEstado = { ...mockEstado, activo: false };

      const deleteSpy = jest
        .spyOn(estadoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(deletedEstado),
        } as any);

      const result = await service.delete(mockEstado._id);

      expect(deleteSpy).toHaveBeenCalledWith(
        mockEstado._id,
        { activo: false },
        { new: true },
      );
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deletedEstado);
      expect(result.activo).toBe(false);
    });

    it('Debería lanzar un error si el estado no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      jest.spyOn(estadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.delete(nonExistentId)).rejects.toThrow(
        `${nonExistentId} no existe`,
      );
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error during delete');

      jest.spyOn(estadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(service.delete(mockEstado._id)).rejects.toThrow(
        'Database error during delete',
      );
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

    it('Debería retornar la cantidad de documentos que coinciden con el filtro', async () => {
      const expectedCount = 5;

      const countSpy = jest
        .spyOn(estadoModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(expectedCount),
        } as any);

      const result = await service.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(countSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedCount);
    });

    it('Debería retornar 0 cuando no hay documentos que coincidan', async () => {
      const countSpy = jest
        .spyOn(estadoModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(0),
        } as any);

      const result = await service.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      const mockError = new Error('Error al contar documentos');

      jest.spyOn(estadoModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(service.count(filterDto)).rejects.toThrow(
        'Error al contar documentos',
      );
    });

    it('Debería aplicar correctamente los filtros del FilterDto', async () => {
      const complexFilterDto: FilterDto = {
        query: 'activo:true,actual:true',
        fields: 'estado_id,observacion',
        sortby: 'fecha_ejecucion_estado',
        order: 'desc',
        limit: '10',
        offset: '0',
        populate: 'false',
      };

      const countSpy = jest
        .spyOn(estadoModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(3),
        } as any);

      const result = await service.count(complexFilterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(3);
    });
  });
});
