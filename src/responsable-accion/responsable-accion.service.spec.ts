import { Test, TestingModule } from '@nestjs/testing';
import { ResponsableAccionService } from './responsable-accion.service';
import { getModelToken } from '@nestjs/mongoose';
import { ResponsableAccion } from './schema/responsable-accion.schema';
import { ResponsableAccionDto } from './dto/responsable-accion.dto';
import { AccionMejora } from '../accion-mejora/schema/accion-mejora.schema';
import { Model, Types } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockDto: ResponsableAccionDto = {
  accion_mejora_id: new Types.ObjectId('672d3050f7814a9a0c5261d4'),
  dependencia_id: 10,
  dependencia_lider: true,
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_modificacion: new Date('2024-01-01'),
};

const mockResponsable = { ...mockDto, _id: '672d36737e962bcac5ce9bec' };
const mockAccion = { _id: '672d3050f7814a9a0c5261d4', no_accion: 'AM-001' };

describe('ResponsableAccionService', () => {
  let service: ResponsableAccionService;
  let responsableModel: Model<ResponsableAccion>;
  let accionModel: Model<AccionMejora>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResponsableAccionService,
        {
          provide: getModelToken(ResponsableAccion.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: getModelToken(AccionMejora.name),
          useValue: { findById: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ResponsableAccionService>(ResponsableAccionService);
    responsableModel = module.get<Model<ResponsableAccion>>(
      getModelToken(ResponsableAccion.name),
    );
    accionModel = module.get<Model<AccionMejora>>(
      getModelToken(AccionMejora.name),
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('Debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear un responsable con activo=true y fechas automáticas', async () => {
      jest.spyOn(accionModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccion),
      } as any);
      const createSpy = jest
        .spyOn(responsableModel, 'create')
        .mockResolvedValue(mockResponsable as any);

      const result = await service.post(mockDto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activo: true,
          fecha_creacion: expect.any(Date),
          fecha_modificacion: expect.any(Date),
        }),
      );
      expect(result).toEqual(mockResponsable);
    });

    it('Debería lanzar error si la acción de mejora no existe', async () => {
      jest.spyOn(accionModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.post(mockDto)).rejects.toThrow(
        `Acción de mejora relacionada con id ${mockDto.accion_mejora_id} no existe`,
      );
      expect(responsableModel.create).not.toHaveBeenCalled();
    });

    it('Debería propagar errores de la base de datos', async () => {
      jest.spyOn(accionModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccion),
      } as any);
      jest
        .spyOn(responsableModel, 'create')
        .mockRejectedValue(new Error('DB error'));

      await expect(service.post(mockDto)).rejects.toThrow('DB error');
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'activo:true',
      fields: 'dependencia_id',
      sortby: 'fecha_creacion',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'false',
    };

    it('Debería retornar todos los responsables con filtros aplicados', async () => {
      const mockList = [mockResponsable];
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockList),
      };
      jest.spyOn(responsableModel, 'find').mockReturnValue(mockQuery as any);

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
      jest.spyOn(responsableModel, 'find').mockReturnValue(mockQuery as any);

      await service.getAll({ ...mockFilterDto, populate: 'true' });

      expect(mockQuery.populate).toHaveBeenCalledWith([
        { path: 'accion_mejora_id' },
      ]);
    });

    it('Debería NO aplicar populate cuando populate es "false"', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(responsableModel, 'find').mockReturnValue(mockQuery as any);

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
      jest.spyOn(responsableModel, 'find').mockReturnValue(mockQuery as any);

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
      jest.spyOn(responsableModel, 'find').mockReturnValue(mockQuery as any);

      await expect(service.getAll(mockFilterDto)).rejects.toThrow('DB error');
    });
  });

  describe('getById', () => {
    it('Debería retornar un responsable por su ID', async () => {
      jest.spyOn(responsableModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockResponsable),
      } as any);

      const result = await service.getById(mockResponsable._id);
      expect(result).toEqual(mockResponsable);
    });

    it('Debería lanzar error si el responsable no existe', async () => {
      jest.spyOn(responsableModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.getById('nonexistent')).rejects.toThrow(
        'nonexistent no existe',
      );
    });

    it('Debería propagar errores de la base de datos', async () => {
      jest.spyOn(responsableModel, 'findById').mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB connection failed')),
      } as any);

      await expect(service.getById(mockResponsable._id)).rejects.toThrow(
        'DB connection failed',
      );
    });
  });

  describe('put', () => {
    const updateDto: ResponsableAccionDto = {
      ...mockDto,
      dependencia_lider: false,
    };

    it('Debería actualizar un responsable y actualizar fecha_modificacion', async () => {
      jest.spyOn(accionModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccion),
      } as any);
      const updated = { ...mockResponsable, ...updateDto };
      const updateSpy = jest
        .spyOn(responsableModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(updated),
        } as any);

      const result = await service.put(mockResponsable._id, updateDto);

      expect(updateSpy).toHaveBeenCalledWith(
        mockResponsable._id,
        expect.objectContaining({ fecha_modificacion: expect.any(Date) }),
        { new: true },
      );
      expect(result).toEqual(updated);
    });

    it('Debería no sobreescribir fecha_creacion si viene en el DTO', async () => {
      jest.spyOn(accionModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccion),
      } as any);
      const updateSpy = jest
        .spyOn(responsableModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockResponsable),
        } as any);

      await service.put(mockResponsable._id, {
        ...updateDto,
        fecha_creacion: new Date('2020-01-01'),
      });

      const callArg = updateSpy.mock.calls[0][1] as ResponsableAccionDto;
      expect(callArg.fecha_creacion).toBeUndefined();
    });

    it('Debería lanzar error si el responsable no existe', async () => {
      jest.spyOn(accionModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccion),
      } as any);
      jest.spyOn(responsableModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.put('nonexistent', updateDto)).rejects.toThrow(
        'nonexistent no existe',
      );
    });

    it('Debería lanzar error si la acción de mejora no existe', async () => {
      jest.spyOn(accionModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.put(mockResponsable._id, updateDto)).rejects.toThrow(
        `Acción de mejora relacionada con id ${updateDto.accion_mejora_id} no existe`,
      );
      expect(responsableModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('Debería actualizar sin validar relación si no se proporciona accion_mejora_id', async () => {
      const dtoSinRef = { ...updateDto, accion_mejora_id: undefined };
      jest.spyOn(responsableModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockResponsable),
      } as any);

      await service.put(mockResponsable._id, dtoSinRef);
      expect(accionModel.findById).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('Debería marcar un responsable como inactivo (soft delete)', async () => {
      const deleted = { ...mockResponsable, activo: false };
      const deleteSpy = jest
        .spyOn(responsableModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(deleted),
        } as any);

      const result = await service.delete(mockResponsable._id);

      expect(deleteSpy).toHaveBeenCalledWith(
        mockResponsable._id,
        { activo: false },
        { new: true },
      );
      expect(result.activo).toBe(false);
    });

    it('Debería lanzar error si el responsable no existe', async () => {
      jest.spyOn(responsableModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        'nonexistent no existe',
      );
    });

    it('Debería propagar errores de la base de datos', async () => {
      jest.spyOn(responsableModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB error')),
      } as any);

      await expect(service.delete(mockResponsable._id)).rejects.toThrow(
        'DB error',
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

    it('Debería retornar la cantidad de documentos', async () => {
      jest.spyOn(responsableModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(3),
      } as any);

      expect(await service.count(filterDto)).toBe(3);
    });

    it('Debería retornar 0 cuando no hay documentos', async () => {
      jest.spyOn(responsableModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      } as any);

      expect(await service.count(filterDto)).toBe(0);
    });

    it('Debería lanzar error si countDocuments falla', async () => {
      jest.spyOn(responsableModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Count error')),
      } as any);

      await expect(service.count(filterDto)).rejects.toThrow('Count error');
    });
  });
});
