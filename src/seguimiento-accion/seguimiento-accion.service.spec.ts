import { Test, TestingModule } from '@nestjs/testing';
import { SeguimientoAccionService } from './seguimiento-accion.service';
import { getModelToken } from '@nestjs/mongoose';
import { SeguimientoAccion } from './schema/seguimiento-accion.schema';
import { SeguimientoAccionDto } from './dto/seguimiento-accion.dto';
import { AccionMejora } from '../accion-mejora/schema/accion-mejora.schema';
import { Model, Types } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockDto: SeguimientoAccionDto = {
  accion_mejora_id: new Types.ObjectId('672d3050f7814a9a0c5261d4'),
  usuario_id: 101,
  usuario_rol: 'AUDITOR',
  descripcion_avance: 'Se avanzó en la implementación del control',
  fecha_avance: new Date('2024-03-01'),
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_modificacion: new Date('2024-01-01'),
};

const mockSeguimiento = { ...mockDto, _id: '672d36737e962bcac5ce9beb' };
const mockAccion = { _id: '672d3050f7814a9a0c5261d4', no_accion: 'AM-001' };

describe('SeguimientoAccionService', () => {
  let service: SeguimientoAccionService;
  let seguimientoModel: Model<SeguimientoAccion>;
  let accionModel: Model<AccionMejora>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeguimientoAccionService,
        {
          provide: getModelToken(SeguimientoAccion.name),
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

    service = module.get<SeguimientoAccionService>(SeguimientoAccionService);
    seguimientoModel = module.get<Model<SeguimientoAccion>>(
      getModelToken(SeguimientoAccion.name),
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
    it('Debería crear un seguimiento con activo=true y fechas automáticas', async () => {
      jest.spyOn(accionModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccion),
      } as any);
      const createSpy = jest
        .spyOn(seguimientoModel, 'create')
        .mockResolvedValue(mockSeguimiento as any);

      const result = await service.post(mockDto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activo: true,
          fecha_creacion: expect.any(Date),
          fecha_modificacion: expect.any(Date),
        }),
      );
      expect(result).toEqual(mockSeguimiento);
    });

    it('Debería lanzar error si la acción de mejora no existe', async () => {
      jest.spyOn(accionModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.post(mockDto)).rejects.toThrow(
        `Acción de mejora relacionada con id ${mockDto.accion_mejora_id} no existe`,
      );
      expect(seguimientoModel.create).not.toHaveBeenCalled();
    });

    it('Debería propagar errores de la base de datos', async () => {
      jest.spyOn(accionModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccion),
      } as any);
      jest
        .spyOn(seguimientoModel, 'create')
        .mockRejectedValue(new Error('DB error'));

      await expect(service.post(mockDto)).rejects.toThrow('DB error');
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'activo:true',
      fields: 'descripcion_avance',
      sortby: 'fecha_avance',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'false',
    };

    it('Debería retornar todos los seguimientos con filtros aplicados', async () => {
      const mockList = [mockSeguimiento];
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockList),
      };
      jest.spyOn(seguimientoModel, 'find').mockReturnValue(mockQuery as any);

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
      jest.spyOn(seguimientoModel, 'find').mockReturnValue(mockQuery as any);

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
      jest.spyOn(seguimientoModel, 'find').mockReturnValue(mockQuery as any);

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
      jest.spyOn(seguimientoModel, 'find').mockReturnValue(mockQuery as any);

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
      jest.spyOn(seguimientoModel, 'find').mockReturnValue(mockQuery as any);

      await expect(service.getAll(mockFilterDto)).rejects.toThrow('DB error');
    });
  });

  describe('getById', () => {
    it('Debería retornar un seguimiento por su ID', async () => {
      jest.spyOn(seguimientoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSeguimiento),
      } as any);

      const result = await service.getById(mockSeguimiento._id);
      expect(result).toEqual(mockSeguimiento);
    });

    it('Debería lanzar error si el seguimiento no existe', async () => {
      jest.spyOn(seguimientoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.getById('nonexistent')).rejects.toThrow(
        'nonexistent no existe',
      );
    });

    it('Debería propagar errores de la base de datos', async () => {
      jest.spyOn(seguimientoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB connection failed')),
      } as any);

      await expect(service.getById(mockSeguimiento._id)).rejects.toThrow(
        'DB connection failed',
      );
    });
  });

  describe('put', () => {
    const updateDto: SeguimientoAccionDto = {
      ...mockDto,
      descripcion_avance: 'Avance actualizado',
    };

    it('Debería actualizar un seguimiento y actualizar fecha_modificacion', async () => {
      jest.spyOn(accionModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccion),
      } as any);
      const updated = { ...mockSeguimiento, ...updateDto };
      const updateSpy = jest
        .spyOn(seguimientoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(updated),
        } as any);

      const result = await service.put(mockSeguimiento._id, updateDto);

      expect(updateSpy).toHaveBeenCalledWith(
        mockSeguimiento._id,
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
        .spyOn(seguimientoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockSeguimiento),
        } as any);

      await service.put(mockSeguimiento._id, {
        ...updateDto,
        fecha_creacion: new Date('2020-01-01'),
      });

      const callArg = updateSpy.mock.calls[0][1] as SeguimientoAccionDto;
      expect(callArg.fecha_creacion).toBeUndefined();
    });

    it('Debería lanzar error si el seguimiento no existe', async () => {
      jest.spyOn(accionModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccion),
      } as any);
      jest.spyOn(seguimientoModel, 'findByIdAndUpdate').mockReturnValue({
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

      await expect(service.put(mockSeguimiento._id, updateDto)).rejects.toThrow(
        `Acción de mejora relacionada con id ${updateDto.accion_mejora_id} no existe`,
      );
      expect(seguimientoModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('Debería actualizar sin validar relación si no se proporciona accion_mejora_id', async () => {
      const dtoSinRef = { ...updateDto, accion_mejora_id: undefined };
      jest.spyOn(seguimientoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSeguimiento),
      } as any);

      await service.put(mockSeguimiento._id, dtoSinRef);
      expect(accionModel.findById).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('Debería marcar un seguimiento como inactivo (soft delete)', async () => {
      const deleted = { ...mockSeguimiento, activo: false };
      const deleteSpy = jest
        .spyOn(seguimientoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(deleted),
        } as any);

      const result = await service.delete(mockSeguimiento._id);

      expect(deleteSpy).toHaveBeenCalledWith(
        mockSeguimiento._id,
        { activo: false },
        { new: true },
      );
      expect(result.activo).toBe(false);
    });

    it('Debería lanzar error si el seguimiento no existe', async () => {
      jest.spyOn(seguimientoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        'nonexistent no existe',
      );
    });

    it('Debería propagar errores de la base de datos', async () => {
      jest.spyOn(seguimientoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB error')),
      } as any);

      await expect(service.delete(mockSeguimiento._id)).rejects.toThrow(
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
      jest.spyOn(seguimientoModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(3),
      } as any);

      expect(await service.count(filterDto)).toBe(3);
    });

    it('Debería retornar 0 cuando no hay documentos', async () => {
      jest.spyOn(seguimientoModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      } as any);

      expect(await service.count(filterDto)).toBe(0);
    });

    it('Debería lanzar error si countDocuments falla', async () => {
      jest.spyOn(seguimientoModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Count error')),
      } as any);

      await expect(service.count(filterDto)).rejects.toThrow('Count error');
    });
  });
});
