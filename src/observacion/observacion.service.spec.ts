import { Test, TestingModule } from '@nestjs/testing';
import { ObservacionService } from './observacion.service';
import { getModelToken } from '@nestjs/mongoose';
import { CreateObservacionDTO, UpdateObservacionDTO } from './dto/observacion.dto';
import { Observacion } from './schemas/observacion.schema';
import { Model, Types } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockCreateObservacionDto: CreateObservacionDTO = {
  hallazgo_id: '507f1f77bcf86cd799439011',
  observacion: 'Se observa incumplimiento en el proceso',
  dependencia_id: [1, 2],
  usuario_id: 42,
  usuario_rol: 'auditor',
  activo: true,
};

const mockObservacion = {
  ...mockCreateObservacionDto,
  _id: '507f1f77bcf86cd799439012',
};

const mockUpdateObservacionDto: UpdateObservacionDTO = {
  observacion: 'Observación actualizada con más detalle',
  dependencia_id: [3],
};

describe('ObservacionService', () => {
  let observacionService: ObservacionService;
  let observacionModel: Model<Observacion>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObservacionService,
        {
          provide: getModelToken(Observacion.name),
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

    observacionService = module.get<ObservacionService>(ObservacionService);
    observacionModel = module.get<Model<Observacion>>(
      getModelToken(Observacion.name),
    );
  });

  it('Debería estar definido', () => {
    expect(observacionService).toBeDefined();
  });

  describe('agregarObservacion', () => {
    it('Debería crear y devolver una observación', async () => {
      jest
        .spyOn(observacionModel, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockObservacion as any));

      const result = await observacionService.agregarObservacion(
        mockCreateObservacionDto,
      );

      expect(result).toEqual(mockObservacion);
    });

    it('Debería lanzar un error si falla la creación', async () => {
      jest.spyOn(observacionModel, 'create').mockImplementationOnce(() => {
        throw new Error('Error al crear observacion');
      });

      await expect(
        observacionService.agregarObservacion(mockCreateObservacionDto),
      ).rejects.toThrow('Error al crear observacion');
    });
  });

  describe('getAllObservaciones', () => {
    it('Debería retornar todas las observaciones con filtros aplicados', async () => {
      const mockObservaciones = [
        mockObservacion,
        { ...mockObservacion, _id: '507f1f77bcf86cd799439099' },
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
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockObservaciones),
      };

      jest.spyOn(observacionModel, 'find').mockReturnValue(mockQuery as any);

      const result = await observacionService.getAllObservaciones(mockFilterDto);

      expect(result).toEqual(mockObservaciones);
    });
  });

  describe('countObservaciones', () => {
    const filterDto: FilterDto = {
      query: 'activo:true',
      fields: '',
      sortby: '',
      order: '',
      limit: '',
      offset: '',
      populate: '',
    };

    it('Debería retornar la cantidad de observaciones', async () => {
      jest.spyOn(observacionModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(3),
      } as any);

      const result = await observacionService.countObservaciones(filterDto);

      expect(result).toBe(3);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      jest.spyOn(observacionModel, 'countDocuments').mockReturnValue({
        exec: jest
          .fn()
          .mockRejectedValue(new Error('Error al contar observaciones')),
      } as any);

      await expect(
        observacionService.countObservaciones(filterDto),
      ).rejects.toThrow('Error al contar observaciones');
    });
  });

  describe('getObservacionById', () => {
    it('Debería retornar una observación por su ID', async () => {
      jest.spyOn(observacionModel, 'findById').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockObservacion as unknown as Observacion),
      } as any);

      const result = await observacionService.getObservacionById(
        mockObservacion._id,
      );

      expect(observacionModel.findById).toHaveBeenCalledWith(mockObservacion._id);
      expect(result).toEqual(mockObservacion);
    });

    it('Debería lanzar un error si la observación no existe', async () => {
      jest.spyOn(observacionModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        observacionService.getObservacionById(mockObservacion._id),
      ).rejects.toThrow(`Observacion ${mockObservacion._id} no existe`);
    });
  });

  describe('updateObservacion', () => {
    it('Debería actualizar y devolver la observación', async () => {
      const updatedObservacion = { ...mockObservacion, ...mockUpdateObservacionDto };

      jest.spyOn(observacionModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(updatedObservacion as unknown as Observacion),
      } as any);

      const result = await observacionService.updateObservacion(
        mockObservacion._id,
        mockUpdateObservacionDto,
      );

      expect(observacionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockObservacion._id,
        mockUpdateObservacionDto,
        { new: true },
      );
      expect(result).toEqual(updatedObservacion);
    });

    it('Debería lanzar un error si la observación no existe', async () => {
      jest.spyOn(observacionModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        observacionService.updateObservacion(
          mockObservacion._id,
          mockUpdateObservacionDto,
        ),
      ).rejects.toThrow(`Observacion ${mockObservacion._id} no existe`);
    });
  });

  describe('deleteObservacion', () => {
    it('Debería marcar la observación como inactiva', async () => {
      const deletedObservacion = { ...mockObservacion, activo: false };

      jest.spyOn(observacionModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(deletedObservacion as unknown as Observacion),
      } as any);

      const result = await observacionService.deleteObservacion(
        mockObservacion._id,
      );

      expect(observacionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockObservacion._id,
        { activo: false },
        { new: true },
      );
      expect(result).toEqual(deletedObservacion);
    });

    it('Debería lanzar un error si la observación no existe', async () => {
      jest.spyOn(observacionModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        observacionService.deleteObservacion(mockObservacion._id),
      ).rejects.toThrow(`Observacion ${mockObservacion._id} no existe`);
    });
  });
});
