import { Test, TestingModule } from '@nestjs/testing';
import { AccionMejoraService } from './accion-mejora.service';
import { getModelToken } from '@nestjs/mongoose';
import { AccionMejora } from './schema/accion-mejora.schema';
import { AccionMejoraDto } from './dto/accion-mejora.dto';
import { PlanMejoramiento } from '../plan-mejoramiento/schema/plan-mejoramiento.schema';
import { Hallazgo } from '../hallazgo/schemas/hallazgo.schema';
import { Model, Types } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockDto: AccionMejoraDto = {
  plan_mejoramiento_id: new Types.ObjectId('672d3050f7814a9a0c5261d4'),
  hallazgo_id: new Types.ObjectId('672d3050f7814a9a0c5261d5'),
  no_accion: 'AM-001',
  descripcion: 'Descripción de la acción de mejora',
  tipo_id: 1,
  nombre_indicador: 'Indicador de cumplimiento',
  formula_indicador: '(acciones cumplidas / total acciones) * 100',
  meta: '100%',
  fecha_inicio: new Date('2024-01-01'),
  fecha_fin: new Date('2024-06-30'),
  estado_id: 1,
  creado_por_id: 101,
  creado_por_rol: 'AUDITOR',
  modificado_por_id: 101,
  modificado_por_rol: 'AUDITOR',
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_modificacion: new Date('2024-01-01'),
};

const mockAccion = { ...mockDto, _id: '672d36737e962bcac5ce9beb' };
const mockPlan = { _id: '672d3050f7814a9a0c5261d4', vigencia_id: 2024 };
const mockHallazgo = { _id: '672d3050f7814a9a0c5261d5', titulo: 'Hallazgo de prueba' };

describe('AccionMejoraService', () => {
  let service: AccionMejoraService;
  let accionModel: Model<AccionMejora>;
  let planModel: Model<PlanMejoramiento>;
  let hallazgoModel: Model<Hallazgo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccionMejoraService,
        {
          provide: getModelToken(AccionMejora.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: getModelToken(PlanMejoramiento.name),
          useValue: { findById: jest.fn() },
        },
        {
          provide: getModelToken(Hallazgo.name),
          useValue: { findById: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AccionMejoraService>(AccionMejoraService);
    accionModel = module.get<Model<AccionMejora>>(
      getModelToken(AccionMejora.name),
    );
    planModel = module.get<Model<PlanMejoramiento>>(
      getModelToken(PlanMejoramiento.name),
    );
    hallazgoModel = module.get<Model<Hallazgo>>(getModelToken(Hallazgo.name));
  });

  afterEach(() => jest.clearAllMocks());

  it('Debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear una acción con activo=true y fechas automáticas', async () => {
      jest.spyOn(planModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlan),
      } as any);
      jest.spyOn(hallazgoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockHallazgo),
      } as any);
      const createSpy = jest
        .spyOn(accionModel, 'create')
        .mockResolvedValue(mockAccion as any);

      const result = await service.post(mockDto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activo: true,
          fecha_creacion: expect.any(Date),
          fecha_modificacion: expect.any(Date),
        }),
      );
      expect(result).toEqual(mockAccion);
    });

    it('Debería lanzar error si el plan de mejoramiento no existe', async () => {
      jest.spyOn(planModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.post(mockDto)).rejects.toThrow(
        `Plan de mejoramiento relacionado con id ${mockDto.plan_mejoramiento_id} no existe`,
      );
      expect(accionModel.create).not.toHaveBeenCalled();
    });

    it('Debería lanzar error si el hallazgo no existe', async () => {
      jest.spyOn(planModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlan),
      } as any);
      jest.spyOn(hallazgoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.post(mockDto)).rejects.toThrow(
        `Hallazgo relacionado con id ${mockDto.hallazgo_id} no existe`,
      );
      expect(accionModel.create).not.toHaveBeenCalled();
    });

    it('Debería propagar errores de la base de datos', async () => {
      jest.spyOn(planModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlan),
      } as any);
      jest.spyOn(hallazgoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockHallazgo),
      } as any);
      jest.spyOn(accionModel, 'create').mockRejectedValue(new Error('DB error'));

      await expect(service.post(mockDto)).rejects.toThrow('DB error');
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'activo:true',
      fields: 'no_accion,estado_id',
      sortby: 'fecha_inicio',
      order: 'asc',
      limit: '10',
      offset: '0',
      populate: 'false',
    };

    it('Debería retornar todas las acciones con filtros aplicados', async () => {
      const mockList = [mockAccion];
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockList),
      };
      jest.spyOn(accionModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getAll(mockFilterDto);
      expect(result).toEqual(mockList);
    });

    it('Debería aplicar populate cuando populate es "true"', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(accionModel, 'find').mockReturnValue(mockQuery as any);

      await service.getAll({ ...mockFilterDto, populate: 'true' });

      expect(mockQuery.populate).toHaveBeenCalledWith([
        { path: 'plan_mejoramiento_id' },
        { path: 'hallazgo_id' },
      ]);
    });

    it('Debería NO aplicar populate cuando populate es "false"', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(accionModel, 'find').mockReturnValue(mockQuery as any);

      await service.getAll(mockFilterDto);
      expect(mockQuery.populate).toHaveBeenCalledWith([]);
    });

    it('Debería retornar array vacío cuando no hay resultados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(accionModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getAll(mockFilterDto);
      expect(result).toEqual([]);
    });

    it('Debería manejar errores de la base de datos', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('DB error')),
      };
      jest.spyOn(accionModel, 'find').mockReturnValue(mockQuery as any);

      await expect(service.getAll(mockFilterDto)).rejects.toThrow('DB error');
    });
  });

  describe('getById', () => {
    it('Debería retornar una acción por su ID', async () => {
      jest.spyOn(accionModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccion),
      } as any);

      const result = await service.getById(mockAccion._id);
      expect(result).toEqual(mockAccion);
    });

    it('Debería lanzar error si la acción no existe', async () => {
      jest.spyOn(accionModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.getById('nonexistent')).rejects.toThrow(
        'nonexistent no existe',
      );
    });

    it('Debería propagar errores de la base de datos', async () => {
      jest.spyOn(accionModel, 'findById').mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB connection failed')),
      } as any);

      await expect(service.getById(mockAccion._id)).rejects.toThrow(
        'DB connection failed',
      );
    });
  });

  describe('put', () => {
    const updateDto: AccionMejoraDto = { ...mockDto, estado_id: 2 };

    it('Debería actualizar una acción y actualizar fecha_modificacion', async () => {
      jest.spyOn(planModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlan),
      } as any);
      jest.spyOn(hallazgoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockHallazgo),
      } as any);
      const updated = { ...mockAccion, ...updateDto };
      const updateSpy = jest.spyOn(accionModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(updated),
      } as any);

      const result = await service.put(mockAccion._id, updateDto);

      expect(updateSpy).toHaveBeenCalledWith(
        mockAccion._id,
        expect.objectContaining({ fecha_modificacion: expect.any(Date) }),
        { new: true },
      );
      expect(result).toEqual(updated);
    });

    it('Debería no sobreescribir fecha_creacion si viene en el DTO', async () => {
      jest.spyOn(planModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlan),
      } as any);
      jest.spyOn(hallazgoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockHallazgo),
      } as any);
      const updateSpy = jest.spyOn(accionModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccion),
      } as any);

      await service.put(mockAccion._id, {
        ...updateDto,
        fecha_creacion: new Date('2020-01-01'),
      });

      const callArg = updateSpy.mock.calls[0][1] as AccionMejoraDto;
      expect(callArg.fecha_creacion).toBeUndefined();
    });

    it('Debería lanzar error si la acción no existe', async () => {
      jest.spyOn(planModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlan),
      } as any);
      jest.spyOn(hallazgoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockHallazgo),
      } as any);
      jest.spyOn(accionModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.put('nonexistent', updateDto)).rejects.toThrow(
        'nonexistent no existe',
      );
    });

    it('Debería lanzar error si el plan de mejoramiento no existe', async () => {
      jest.spyOn(planModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.put(mockAccion._id, updateDto)).rejects.toThrow(
        `Plan de mejoramiento relacionado con id ${updateDto.plan_mejoramiento_id} no existe`,
      );
      expect(accionModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('Debería lanzar error si el hallazgo no existe', async () => {
      jest.spyOn(planModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlan),
      } as any);
      jest.spyOn(hallazgoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.put(mockAccion._id, updateDto)).rejects.toThrow(
        `Hallazgo relacionado con id ${updateDto.hallazgo_id} no existe`,
      );
      expect(accionModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('Debería actualizar sin validar relaciones si no se envían los ObjectId', async () => {
      const dtoSinRefs = {
        ...updateDto,
        plan_mejoramiento_id: undefined,
        hallazgo_id: undefined,
      };
      jest.spyOn(accionModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccion),
      } as any);

      await service.put(mockAccion._id, dtoSinRefs);

      expect(planModel.findById).not.toHaveBeenCalled();
      expect(hallazgoModel.findById).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('Debería marcar una acción como inactiva (soft delete)', async () => {
      const deleted = { ...mockAccion, activo: false };
      const deleteSpy = jest.spyOn(accionModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(deleted),
      } as any);

      const result = await service.delete(mockAccion._id);

      expect(deleteSpy).toHaveBeenCalledWith(
        mockAccion._id,
        { activo: false },
        { new: true },
      );
      expect(result.activo).toBe(false);
    });

    it('Debería lanzar error si la acción no existe', async () => {
      jest.spyOn(accionModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        'nonexistent no existe',
      );
    });

    it('Debería propagar errores de la base de datos', async () => {
      jest.spyOn(accionModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB error')),
      } as any);

      await expect(service.delete(mockAccion._id)).rejects.toThrow('DB error');
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

    it('Debería retornar la cantidad de documentos', async () => {
      jest.spyOn(accionModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      } as any);

      expect(await service.count(filterDto)).toBe(5);
    });

    it('Debería retornar 0 cuando no hay documentos', async () => {
      jest.spyOn(accionModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      } as any);

      expect(await service.count(filterDto)).toBe(0);
    });

    it('Debería lanzar error si countDocuments falla', async () => {
      jest.spyOn(accionModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Count error')),
      } as any);

      await expect(service.count(filterDto)).rejects.toThrow('Count error');
    });
  });
});
