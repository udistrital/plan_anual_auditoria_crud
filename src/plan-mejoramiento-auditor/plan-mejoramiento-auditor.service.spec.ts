import { Test, TestingModule } from '@nestjs/testing';
import { PlanMejoramientoAuditorService } from './plan-mejoramiento-auditor.service';
import { getModelToken } from '@nestjs/mongoose';
import { PlanMejoramientoAuditor } from './schema/plan-mejoramiento-auditor.schema';
import { PlanMejoramientoAuditorDto } from './dto/plan-mejoramiento-auditor.dto';
import { PlanMejoramiento } from '../plan-mejoramiento/schema/plan-mejoramiento.schema';
import { Model, Types } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockDto: PlanMejoramientoAuditorDto = {
  plan_mejoramiento_id: new Types.ObjectId('672d3050f7814a9a0c5261d4'),
  auditor_id: 101,
  asignado: true,
  asignado_por_id: 202,
  auditor_lider: false,
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_modificacion: new Date('2024-01-01'),
};

const mockAuditor = { ...mockDto, _id: '672d36737e962bcac5ce9beb' };
const mockPlan = { _id: '672d3050f7814a9a0c5261d4', vigencia_id: 2024 };

describe('PlanMejoramientoAuditorService', () => {
  let service: PlanMejoramientoAuditorService;
  let auditorModel: Model<PlanMejoramientoAuditor>;
  let planModel: Model<PlanMejoramiento>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanMejoramientoAuditorService,
        {
          provide: getModelToken(PlanMejoramientoAuditor.name),
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
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PlanMejoramientoAuditorService>(
      PlanMejoramientoAuditorService,
    );
    auditorModel = module.get<Model<PlanMejoramientoAuditor>>(
      getModelToken(PlanMejoramientoAuditor.name),
    );
    planModel = module.get<Model<PlanMejoramiento>>(
      getModelToken(PlanMejoramiento.name),
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('Debería estar definido', () => {
    expect(service).toBeDefined();
    expect(auditorModel).toBeDefined();
    expect(planModel).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear un auditor con activo=true y fechas automáticas', async () => {
      jest.spyOn(planModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlan),
      } as any);
      const createSpy = jest
        .spyOn(auditorModel, 'create')
        .mockResolvedValue(mockAuditor as any);

      const result = await service.post(mockDto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activo: true,
          fecha_creacion: expect.any(Date),
          fecha_modificacion: expect.any(Date),
        }),
      );
      expect(result).toEqual(mockAuditor);
    });

    it('Debería lanzar error si el plan de mejoramiento no existe', async () => {
      jest.spyOn(planModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.post(mockDto)).rejects.toThrow(
        `Plan de mejoramiento relacionado con id ${mockDto.plan_mejoramiento_id} no existe`,
      );
      expect(auditorModel.create).not.toHaveBeenCalled();
    });

    it('Debería propagar errores de la base de datos', async () => {
      jest.spyOn(planModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlan),
      } as any);
      jest
        .spyOn(auditorModel, 'create')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.post(mockDto)).rejects.toThrow('Database error');
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'activo:true',
      fields: 'auditor_id',
      sortby: 'fecha_creacion',
      order: 'asc',
      limit: '10',
      offset: '0',
      populate: 'false',
    };

    it('Debería retornar todos los auditores con filtros aplicados', async () => {
      const mockList = [mockAuditor];
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockList),
      };
      jest.spyOn(auditorModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getAll(mockFilterDto);

      expect(result).toEqual(mockList);
      expect(mockQuery.sort).toHaveBeenCalled();
      expect(mockQuery.lean).toHaveBeenCalled();
    });

    it('Debería aplicar populate cuando populate es "true"', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(auditorModel, 'find').mockReturnValue(mockQuery as any);

      await service.getAll({ ...mockFilterDto, populate: 'true' });

      expect(mockQuery.populate).toHaveBeenCalledWith([
        { path: 'plan_mejoramiento_id' },
      ]);
    });

    it('Debería NO aplicar populate cuando populate es "false"', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(auditorModel, 'find').mockReturnValue(mockQuery as any);

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
      jest.spyOn(auditorModel, 'find').mockReturnValue(mockQuery as any);

      const result = await service.getAll(mockFilterDto);

      expect(result).toEqual([]);
    });

    it('Debería manejar errores de la base de datos', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      jest.spyOn(auditorModel, 'find').mockReturnValue(mockQuery as any);

      await expect(service.getAll(mockFilterDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getById', () => {
    it('Debería retornar un auditor por su ID', async () => {
      jest.spyOn(auditorModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditor),
      } as any);

      const result = await service.getById(mockAuditor._id);
      expect(result).toEqual(mockAuditor);
    });

    it('Debería lanzar error si el auditor no existe', async () => {
      jest.spyOn(auditorModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.getById('nonexistent')).rejects.toThrow(
        'nonexistent no existe',
      );
    });

    it('Debería propagar errores de la base de datos', async () => {
      jest.spyOn(auditorModel, 'findById').mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB connection failed')),
      } as any);

      await expect(service.getById(mockAuditor._id)).rejects.toThrow(
        'DB connection failed',
      );
    });
  });

  describe('put', () => {
    const updateDto: PlanMejoramientoAuditorDto = {
      ...mockDto,
      auditor_lider: true,
    };

    it('Debería actualizar un auditor y actualizar fecha_modificacion', async () => {
      jest.spyOn(planModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlan),
      } as any);
      const updated = { ...mockAuditor, ...updateDto };
      jest.spyOn(auditorModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(updated),
      } as any);

      const result = await service.put(mockAuditor._id, updateDto);

      expect(auditorModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockAuditor._id,
        expect.objectContaining({ fecha_modificacion: expect.any(Date) }),
        { new: true },
      );
      expect(result).toEqual(updated);
    });

    it('Debería no sobreescribir fecha_creacion si viene en el DTO', async () => {
      jest.spyOn(planModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlan),
      } as any);
      const updateSpy = jest
        .spyOn(auditorModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAuditor),
        } as any);

      await service.put(mockAuditor._id, {
        ...updateDto,
        fecha_creacion: new Date('2020-01-01'),
      });

      const callArg = updateSpy.mock.calls[0][1] as PlanMejoramientoAuditorDto;
      expect(callArg.fecha_creacion).toBeUndefined();
    });

    it('Debería lanzar error si el auditor no existe', async () => {
      jest.spyOn(planModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlan),
      } as any);
      jest.spyOn(auditorModel, 'findByIdAndUpdate').mockReturnValue({
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

      await expect(service.put(mockAuditor._id, updateDto)).rejects.toThrow(
        `Plan de mejoramiento relacionado con id ${updateDto.plan_mejoramiento_id} no existe`,
      );
      expect(auditorModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('Debería actualizar sin validar relación si no se proporciona plan_mejoramiento_id', async () => {
      const dtoSinPlan = { ...updateDto, plan_mejoramiento_id: undefined };
      jest.spyOn(auditorModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditor),
      } as any);

      await service.put(mockAuditor._id, dtoSinPlan);

      expect(planModel.findById).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('Debería marcar un auditor como inactivo (soft delete)', async () => {
      const deleted = { ...mockAuditor, activo: false };
      const deleteSpy = jest
        .spyOn(auditorModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(deleted),
        } as any);

      const result = await service.delete(mockAuditor._id);

      expect(deleteSpy).toHaveBeenCalledWith(
        mockAuditor._id,
        { activo: false },
        { new: true },
      );
      expect(result.activo).toBe(false);
    });

    it('Debería lanzar error si el auditor no existe', async () => {
      jest.spyOn(auditorModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        'nonexistent no existe',
      );
    });

    it('Debería propagar errores de la base de datos', async () => {
      jest.spyOn(auditorModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB error')),
      } as any);

      await expect(service.delete(mockAuditor._id)).rejects.toThrow('DB error');
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
      jest.spyOn(auditorModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      } as any);

      const result = await service.count(filterDto);
      expect(result).toBe(5);
    });

    it('Debería retornar 0 cuando no hay documentos', async () => {
      jest.spyOn(auditorModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      } as any);

      const result = await service.count(filterDto);
      expect(result).toBe(0);
    });

    it('Debería lanzar error si countDocuments falla', async () => {
      jest.spyOn(auditorModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Count error')),
      } as any);

      await expect(service.count(filterDto)).rejects.toThrow('Count error');
    });
  });
});
