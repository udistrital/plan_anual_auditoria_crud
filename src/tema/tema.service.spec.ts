import { Test, TestingModule } from '@nestjs/testing';
import { TemaService } from './tema.service';
import { getModelToken } from '@nestjs/mongoose';
import { TemaDTO } from './dto/tema.dto';
import { SubtemaDTO } from './dto/subtema.dto';
import { HallazgoDTO } from './dto/hallazgo.dto';
import { Tema } from './schemas/tema.schema';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockTemaDto: TemaDTO = {
  informe_id: '507f1f77bcf86cd799439011',
  titulo: 'Gestión Documental',
  activo: true,
  subtema: [],
  fecha_creacion: new Date(),
};

const mockTema = {
  ...mockTemaDto,
  _id: '507f1f77bcf86cd799439012',
  subtema: [],
};

const mockSubtemaDto: SubtemaDTO = {
  titulo: 'Archivo General',
  activo: true,
  hallazgo: [],
};

const mockHallazgoDto: HallazgoDTO = {
  titulo: 'Falta de documentación',
  criterio: 'Norma ISO 9001',
  descripcion: 'No se encontró evidencia',
  activo: true,
};

describe('TemaService', () => {
  let temaService: TemaService;
  let temaModel: Model<Tema>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemaService,
        {
          provide: getModelToken(Tema.name),
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

    temaService = module.get<TemaService>(TemaService);
    temaModel = module.get<Model<Tema>>(getModelToken(Tema.name));
  });

  it('Debería estar definido', () => {
    expect(TemaService).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver un tema', async () => {
      jest
        .spyOn(temaModel, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockTemaDto as any));

      const result = await temaService.post(mockTemaDto);
      expect(result).toEqual(mockTemaDto);
    });

    it('Debería lanzar un error si el Tema no existe', async () => {
      jest
        .spyOn(temaModel, 'create')
        .mockImplementationOnce(() => {
          throw new Error(`Tema relacionado con id ${mockTemaDto.informe_id} no existe`);
        });

      await expect(temaService.post(mockTemaDto)).rejects.toThrow(
        `Tema relacionado con id ${mockTemaDto.informe_id} no existe`,
      );
    });
  });

  describe('getAll', () => {
    it('Debería retornar todos los temas con filtros aplicados', async () => {
      const mockTemas = [
        mockTema,
        {
          _id: '507f1f77bcf86cd799439013',
          informe_id: '507f1f77bcf86cd799439011',
          titulo: 'Tema 2',
          activo: true,
          subtema: [],
          fecha_creacion: new Date(),
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
        exec: jest.fn().mockResolvedValue(mockTemas),
      };

      jest.spyOn(temaModel, 'find').mockReturnValue(mockQuery as any);

      const result = await temaService.getAll(mockFilterDto);

      expect(result).toEqual(mockTemas);
    });
  });

  describe('getById', () => {
    it('Debería retornar un tema por su ID', async () => {
      jest.spyOn(temaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTema as unknown as Tema),
      } as any);

      const result = await temaService.getById(mockTema._id);

      expect(temaModel.findById).toHaveBeenCalledWith(mockTema._id);
      expect(result).toEqual(mockTema);
    });

    it('Debería lanzar un error si el tema no existe', async () => {
      jest.spyOn(temaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(temaService.getById(mockTema._id)).rejects.toThrow(
        `${mockTema._id} no existe`,
      );

      expect(temaModel.findById).toHaveBeenCalledWith(mockTema._id);
    });
  });

  describe('put', () => {
    it('Debería actualizar un tema', async () => {
      jest.spyOn(temaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTemaDto as unknown as Tema),
      } as any);

      const result = await temaService.put(mockTema._id, mockTemaDto);

      expect(temaModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockTema._id,
        mockTemaDto,
        { new: true },
      );
      expect(result).toEqual(mockTemaDto);
    });

    it('Debería lanzar un error si el tema no existe', async () => {
      jest.spyOn(temaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(temaService.put(mockTema._id, mockTemaDto)).rejects.toThrow(
        `${mockTema._id} no existe`,
      );

      expect(temaModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockTema._id,
        mockTemaDto,
        { new: true },
      );
    });
  });

  describe('delete', () => {
    it('Debería marcar un tema como inactivo', async () => {
      jest.spyOn(temaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTemaDto as unknown as Tema),
      } as any);

      const result = await temaService.delete(mockTema._id);

      expect(result).toEqual(mockTemaDto);
    });

    it('Debería lanzar un error si el tema no existe', async () => {
      jest.spyOn(temaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(temaService.delete(mockTema._id)).rejects.toThrow(
        `${mockTema._id} no existe`,
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

    it('Debería retornar la cantidad de temas', async () => {
      jest.spyOn(temaModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(3),
      } as any);

      const result = await temaService.count(filterDto);

      expect(result).toBe(3);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      jest.spyOn(temaModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Error al contar temas')),
      } as any);

      await expect(temaService.count(filterDto)).rejects.toThrow(
        'Error al contar temas',
      );
    });
  });

  describe('agregarSubtema', () => {
    it('Debería agregar un subtema al tema', async () => {
      const temaConSubtema = {
        ...mockTema,
        subtema: [{ ...mockSubtemaDto, _id: 'sub1' }],
        save: jest.fn().mockResolvedValue({
          ...mockTema,
          subtema: [{ ...mockSubtemaDto, _id: 'sub1' }],
        }),
      };

      jest.spyOn(temaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(temaConSubtema),
      } as any);

      const result = await temaService.agregarSubtema(
        mockTema._id,
        mockSubtemaDto,
      );

      expect(temaConSubtema.save).toHaveBeenCalled();
    });

    it('Debería lanzar error si el tema no existe', async () => {
      jest.spyOn(temaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        temaService.agregarSubtema(mockTema._id, mockSubtemaDto),
      ).rejects.toThrow(`${mockTema._id} no existe`);
    });
  });

  describe('agregarHallazgo', () => {
    it('Debería agregar un hallazgo al subtema', async () => {
      const mockSubtemaConId = {
        _id: 'sub1',
        ...mockSubtemaDto,
        hallazgo: [],
      };

      const temaConSubtema = {
        ...mockTema,
        subtema: {
          id: jest.fn().mockReturnValue(mockSubtemaConId),
        },
        save: jest.fn().mockResolvedValue(mockTema),
      };

      jest.spyOn(temaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(temaConSubtema),
      } as any);

      const result = await temaService.agregarHallazgo(
        mockTema._id,
        'sub1',
        mockHallazgoDto,
      );

      expect(temaConSubtema.save).toHaveBeenCalled();
    });

    it('Debería lanzar error si el tema no existe', async () => {
      jest.spyOn(temaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        temaService.agregarHallazgo(mockTema._id, 'sub1', mockHallazgoDto),
      ).rejects.toThrow(`${mockTema._id} no existe`);
    });
  });
});