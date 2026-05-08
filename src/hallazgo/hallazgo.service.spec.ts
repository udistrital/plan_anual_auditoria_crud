import { Test, TestingModule } from '@nestjs/testing';
import { HallazgoService } from './hallazgo.service';
import { getModelToken } from '@nestjs/mongoose';
import { CreateHallazgoDTO, UpdateHallazgoDTO } from './dto/hallazgo.dto';
import { Hallazgo } from './schemas/hallazgo.schema';
import { Tema } from '../tema/schemas/tema.schema';
import { Model, Types } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockCreateHallazgoDto: CreateHallazgoDTO = {
  auditoria_id: '507f1f77bcf86cd799439010',
  informe_id: '507f1f77bcf86cd799439011',
  subtema_id: '507f1f77bcf86cd799439013',
  titulo: 'Falta de documentación',
  criterio: 'Norma ISO 9001',
  descripcion: 'No se encontró evidencia de los registros requeridos',
  rechazado: false,
  activo: true,
};

const mockHallazgo = {
  ...mockCreateHallazgoDto,
  _id: '507f1f77bcf86cd799439012',
};

const mockUpdateHallazgoDto: UpdateHallazgoDTO = {
  titulo: 'Falta de documentación actualizada',
  criterio: 'Norma ISO 9001 v2',
  descripcion: 'Descripción actualizada',
};

describe('HallazgoService', () => {
  let hallazgoService: HallazgoService;
  let hallazgoModel: Model<Hallazgo>;
  let temaModel: Model<Tema>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HallazgoService,
        {
          provide: getModelToken(Hallazgo.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: getModelToken(Tema.name),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    hallazgoService = module.get<HallazgoService>(HallazgoService);
    hallazgoModel = module.get<Model<Hallazgo>>(getModelToken(Hallazgo.name));
    temaModel = module.get<Model<Tema>>(getModelToken(Tema.name));
  });

  it('Debería estar definido', () => {
    expect(hallazgoService).toBeDefined();
  });

  describe('agregarHallazgo', () => {
    it('Debería crear y devolver un hallazgo cuando el subtema existe', async () => {
      jest.spyOn(temaModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'tema1', subtema: [] }),
      } as any);

      jest
        .spyOn(hallazgoModel, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockHallazgo as any));

      const result = await hallazgoService.agregarHallazgo(mockCreateHallazgoDto);

      expect(temaModel.findOne).toHaveBeenCalledWith({
        'subtema._id': mockCreateHallazgoDto.subtema_id,
      });
      expect(result).toEqual(mockHallazgo);
    });

    it('Debería lanzar error si el subtema no existe', async () => {
      jest.spyOn(temaModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        hallazgoService.agregarHallazgo(mockCreateHallazgoDto),
      ).rejects.toThrow(
        `Subtema ${mockCreateHallazgoDto.subtema_id} no existe`,
      );
    });
  });

  describe('getAllHallazgos', () => {
    it('Debería retornar todos los hallazgos con filtros aplicados', async () => {
      const mockHallazgos = [mockHallazgo, { ...mockHallazgo, _id: '507f1f77bcf86cd799439099' }];
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
        exec: jest.fn().mockResolvedValue(mockHallazgos),
      };

      jest.spyOn(hallazgoModel, 'find').mockReturnValue(mockQuery as any);

      const result = await hallazgoService.getAllHallazgos(mockFilterDto);

      expect(result).toEqual(mockHallazgos);
    });
  });

  describe('countHallazgos', () => {
    const filterDto: FilterDto = {
      query: 'activo:true',
      fields: '',
      sortby: '',
      order: '',
      limit: '',
      offset: '',
      populate: '',
    };

    it('Debería retornar la cantidad de hallazgos', async () => {
      jest.spyOn(hallazgoModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(4),
      } as any);

      const result = await hallazgoService.countHallazgos(filterDto);

      expect(result).toBe(4);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      jest.spyOn(hallazgoModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Error al contar hallazgos')),
      } as any);

      await expect(hallazgoService.countHallazgos(filterDto)).rejects.toThrow(
        'Error al contar hallazgos',
      );
    });
  });

  describe('getHallazgoById', () => {
    it('Debería retornar un hallazgo por su ID', async () => {
      jest.spyOn(hallazgoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockHallazgo as unknown as Hallazgo),
      } as any);

      const result = await hallazgoService.getHallazgoById(mockHallazgo._id);

      expect(hallazgoModel.findById).toHaveBeenCalledWith(mockHallazgo._id);
      expect(result).toEqual(mockHallazgo);
    });

    it('Debería lanzar un error si el hallazgo no existe', async () => {
      jest.spyOn(hallazgoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        hallazgoService.getHallazgoById(mockHallazgo._id),
      ).rejects.toThrow(`Hallazgo ${mockHallazgo._id} no existe`);
    });
  });

  describe('updateHallazgo', () => {
    it('Debería actualizar y devolver el hallazgo', async () => {
      const updatedHallazgo = { ...mockHallazgo, ...mockUpdateHallazgoDto };

      jest.spyOn(hallazgoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedHallazgo as unknown as Hallazgo),
      } as any);

      const result = await hallazgoService.updateHallazgo(
        mockHallazgo._id,
        mockUpdateHallazgoDto,
      );

      expect(hallazgoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockHallazgo._id,
        mockUpdateHallazgoDto,
        { new: true },
      );
      expect(result).toEqual(updatedHallazgo);
    });

    it('Debería lanzar un error si el hallazgo no existe', async () => {
      jest.spyOn(hallazgoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        hallazgoService.updateHallazgo(mockHallazgo._id, mockUpdateHallazgoDto),
      ).rejects.toThrow(`Hallazgo ${mockHallazgo._id} no existe`);
    });
  });

  describe('deleteHallazgo', () => {
    it('Debería marcar el hallazgo como inactivo', async () => {
      const deletedHallazgo = { ...mockHallazgo, activo: false };

      jest.spyOn(hallazgoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(deletedHallazgo as unknown as Hallazgo),
      } as any);

      const result = await hallazgoService.deleteHallazgo(mockHallazgo._id);

      expect(hallazgoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockHallazgo._id,
        { activo: false },
        { new: true },
      );
      expect(result).toEqual(deletedHallazgo);
    });

    it('Debería lanzar un error si el hallazgo no existe', async () => {
      jest.spyOn(hallazgoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        hallazgoService.deleteHallazgo(mockHallazgo._id),
      ).rejects.toThrow(`Hallazgo ${mockHallazgo._id} no existe`);
    });
  });
});
