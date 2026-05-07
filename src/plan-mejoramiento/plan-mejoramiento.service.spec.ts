import { Test, TestingModule } from '@nestjs/testing';
import { PlanMejoramientoService } from './plan-mejoramiento.service';
import { getModelToken } from '@nestjs/mongoose';
import { PlanMejoramiento } from './schema/plan-mejoramiento.schema';
import { PlanMejoramientoDto } from './dto/plan-mejoramiento.dto';
import { Model, Types } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockPlanMejoramientoDto: PlanMejoramientoDto = {
  auditoria_id: new Types.ObjectId('672d3050f7814a9a0c5261d4'),
  vigencia_id: 2024,
  tipo_evaluacion_id: 1,
  fecha_apertura: new Date('2024-01-01'),
  fecha_limite: new Date('2024-12-31'),
  estado_id: 1,
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_modificacion: new Date('2024-01-01'),
};

const mockPlanMejoramiento = {
  ...mockPlanMejoramientoDto,
  _id: '672d36737e962bcac5ce9beb',
};

describe('PlanMejoramientoService', () => {
  let planMejoramientoService: PlanMejoramientoService;
  let planMejoramientoModel: Model<PlanMejoramiento>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanMejoramientoService,
        {
          provide: getModelToken(PlanMejoramiento.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
      ],
    }).compile();

    planMejoramientoService = module.get<PlanMejoramientoService>(
      PlanMejoramientoService,
    );
    planMejoramientoModel = module.get<Model<PlanMejoramiento>>(
      getModelToken(PlanMejoramiento.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debería estar definido', () => {
    expect(planMejoramientoService).toBeDefined();
    expect(planMejoramientoModel).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver un plan de mejoramiento con activo=true y fechas automáticas', async () => {
      const createSpy = jest
        .spyOn(planMejoramientoModel, 'create')
        .mockResolvedValue(mockPlanMejoramiento as any);

      const result = await planMejoramientoService.post(mockPlanMejoramientoDto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activo: true,
          fecha_creacion: expect.any(Date),
          fecha_modificacion: expect.any(Date),
        }),
      );
      expect(result).toEqual(mockPlanMejoramiento);
    });

    it('Debería establecer la misma fecha para fecha_creacion y fecha_modificacion', async () => {
      const createSpy = jest
        .spyOn(planMejoramientoModel, 'create')
        .mockResolvedValue(mockPlanMejoramiento as any);

      await planMejoramientoService.post(mockPlanMejoramientoDto);

      const callArg = createSpy.mock.calls[0][0] as PlanMejoramientoDto;
      expect(callArg.fecha_creacion).toEqual(callArg.fecha_modificacion);
    });

    it('Debería manejar errores durante la creación', async () => {
      const mockError = new Error('Database error');
      jest.spyOn(planMejoramientoModel, 'create').mockRejectedValue(mockError);

      await expect(
        planMejoramientoService.post(mockPlanMejoramientoDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'activo:true',
      fields: 'vigencia_id,estado_id',
      sortby: 'fecha_apertura',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'false',
    };

    const mockPlanes = [
      { ...mockPlanMejoramiento, _id: '1', vigencia_id: 2024 },
      { ...mockPlanMejoramiento, _id: '2', vigencia_id: 2023 },
    ];

    it('Debería retornar todos los planes con filtros aplicados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPlanes),
      };

      const findSpy = jest
        .spyOn(planMejoramientoModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await planMejoramientoService.getAll(mockFilterDto);

      expect(findSpy).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalled();
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual(mockPlanes);
    });

    it('Debería retornar un array vacío cuando no hay resultados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest
        .spyOn(planMejoramientoModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await planMejoramientoService.getAll(mockFilterDto);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('Debería manejar errores de la base de datos', async () => {
      const mockError = new Error('Database error');
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(mockError),
      };

      jest
        .spyOn(planMejoramientoModel, 'find')
        .mockReturnValue(mockQuery as any);

      await expect(
        planMejoramientoService.getAll(mockFilterDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('Debería retornar un plan de mejoramiento por su ID cuando existe', async () => {
      const findByIdSpy = jest
        .spyOn(planMejoramientoModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPlanMejoramiento),
        } as any);

      const result = await planMejoramientoService.getById(
        mockPlanMejoramiento._id,
      );

      expect(findByIdSpy).toHaveBeenCalledWith(mockPlanMejoramiento._id);
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPlanMejoramiento);
    });

    it('Debería lanzar un error si el plan no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      jest.spyOn(planMejoramientoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        planMejoramientoService.getById(nonExistentId),
      ).rejects.toThrow(`${nonExistentId} no existe`);
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database connection failed');
      jest.spyOn(planMejoramientoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(
        planMejoramientoService.getById(mockPlanMejoramiento._id),
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('put', () => {
    const updateDto: PlanMejoramientoDto = {
      ...mockPlanMejoramientoDto,
      vigencia_id: 2025,
      estado_id: 2,
    };

    it('Debería actualizar un plan de mejoramiento existente y actualizar fecha_modificacion', async () => {
      const updatedPlan = { ...mockPlanMejoramiento, ...updateDto };

      const updateSpy = jest
        .spyOn(planMejoramientoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedPlan),
        } as any);

      const result = await planMejoramientoService.put(
        mockPlanMejoramiento._id,
        updateDto,
      );

      expect(updateSpy).toHaveBeenCalledWith(
        mockPlanMejoramiento._id,
        expect.objectContaining({ fecha_modificacion: expect.any(Date) }),
        { new: true },
      );
      expect(result).toEqual(updatedPlan);
    });

    it('Debería no sobreescribir fecha_creacion si viene en el DTO', async () => {
      const dtoConFechaCreacion = {
        ...updateDto,
        fecha_creacion: new Date('2020-01-01'),
      };

      const updateSpy = jest
        .spyOn(planMejoramientoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPlanMejoramiento),
        } as any);

      await planMejoramientoService.put(
        mockPlanMejoramiento._id,
        dtoConFechaCreacion,
      );

      const callArg = updateSpy.mock.calls[0][1] as PlanMejoramientoDto;
      expect(callArg.fecha_creacion).toBeUndefined();
    });

    it('Debería lanzar un error si el plan no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      jest.spyOn(planMejoramientoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        planMejoramientoService.put(nonExistentId, updateDto),
      ).rejects.toThrow(`${nonExistentId} no existe`);
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error during update');

      jest.spyOn(planMejoramientoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(
        planMejoramientoService.put(mockPlanMejoramiento._id, updateDto),
      ).rejects.toThrow('Database error during update');
    });
  });

  describe('delete', () => {
    it('Debería marcar un plan como inactivo (soft delete)', async () => {
      const deletedPlan = { ...mockPlanMejoramiento, activo: false };

      const deleteSpy = jest
        .spyOn(planMejoramientoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(deletedPlan),
        } as any);

      const result = await planMejoramientoService.delete(
        mockPlanMejoramiento._id,
      );

      expect(deleteSpy).toHaveBeenCalledWith(
        mockPlanMejoramiento._id,
        { activo: false },
        { new: true },
      );
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deletedPlan);
      expect(result.activo).toBe(false);
    });

    it('Debería lanzar un error si el plan no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      jest.spyOn(planMejoramientoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        planMejoramientoService.delete(nonExistentId),
      ).rejects.toThrow(`${nonExistentId} no existe`);
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error during delete');

      jest.spyOn(planMejoramientoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(
        planMejoramientoService.delete(mockPlanMejoramiento._id),
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

    it('Debería retornar la cantidad de documentos que coinciden con el filtro', async () => {
      const expectedCount = 5;

      const countSpy = jest
        .spyOn(planMejoramientoModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(expectedCount),
        } as any);

      const result = await planMejoramientoService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(countSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedCount);
    });

    it('Debería retornar 0 cuando no hay documentos que coincidan', async () => {
      const countSpy = jest
        .spyOn(planMejoramientoModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(0),
        } as any);

      const result = await planMejoramientoService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      const mockError = new Error('Error al contar documentos');

      jest.spyOn(planMejoramientoModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(planMejoramientoService.count(filterDto)).rejects.toThrow(
        'Error al contar documentos',
      );
    });

    it('Debería aplicar correctamente los filtros del FilterDto', async () => {
      const complexFilterDto: FilterDto = {
        query: 'activo:true,vigencia_id:2024',
        fields: 'vigencia_id,estado_id',
        sortby: 'fecha_apertura',
        order: 'desc',
        limit: '10',
        offset: '0',
        populate: 'false',
      };

      const countSpy = jest
        .spyOn(planMejoramientoModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(3),
        } as any);

      const result = await planMejoramientoService.count(complexFilterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(3);
    });
  });
});
