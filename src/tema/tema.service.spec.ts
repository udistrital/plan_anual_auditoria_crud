import { Test, TestingModule } from '@nestjs/testing';
import { TemaService } from './tema.service';
import { getModelToken } from '@nestjs/mongoose';
import { TemaDTO } from './dto/tema.dto';
import { CreateSubtemaDTO, UpdateSubtemaDTO } from './dto/subtema.dto';
import { Tema } from './schemas/tema.schema';
import { Hallazgo } from '../hallazgo/schemas/hallazgo.schema';
import { Model, Types } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockTemaDto: TemaDTO = {
  informe_id: new Types.ObjectId('507f1f77bcf86cd799439011'),
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

const mockCreateSubtemaDto: CreateSubtemaDTO = {
  tema_id: '507f1f77bcf86cd799439011',
  titulo: 'Archivo General',
  activo: true,
};

const mockUpdateSubtemaDto: UpdateSubtemaDTO = {
  titulo: 'Archivo General Actualizado',
};

describe('TemaService', () => {
  let temaService: TemaService;
  let temaModel: Model<Tema>;
  let hallazgoModel: Model<Hallazgo>;

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
            findOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: getModelToken(Hallazgo.name),
          useValue: {
            updateMany: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue({}),
            }),
          },
        },
      ],
    }).compile();

    temaService = module.get<TemaService>(TemaService);
    temaModel = module.get<Model<Tema>>(getModelToken(Tema.name));
    hallazgoModel = module.get<Model<Hallazgo>>(getModelToken(Hallazgo.name));
  });

  it('Debería estar definido', () => {
    expect(temaService).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver un tema', async () => {
      jest
        .spyOn(temaModel, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockTemaDto as any));

      const result = await temaService.post(mockTemaDto);
      expect(result).toEqual(mockTemaDto);
    });

    it('Debería lanzar un error si el Tema no puede ser creado', async () => {
      jest.spyOn(temaModel, 'create').mockImplementationOnce(() => {
        throw new Error('Error al crear tema');
      });

      await expect(temaService.post(mockTemaDto)).rejects.toThrow(
        'Error al crear tema',
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
        lean: jest.fn().mockReturnThis(),
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
        `Tema ${mockTema._id} no existe`,
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
        `Tema ${mockTema._id} no existe`,
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
        `Tema ${mockTema._id} no existe`,
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
        subtema: [{ ...mockCreateSubtemaDto, _id: 'sub1' }],
        save: jest.fn().mockResolvedValue({
          ...mockTema,
          subtema: [{ ...mockCreateSubtemaDto, _id: 'sub1' }],
        }),
      };

      jest.spyOn(temaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(temaConSubtema),
      } as any);

      await temaService.agregarSubtema(mockTema._id, mockCreateSubtemaDto);

      expect(temaConSubtema.save).toHaveBeenCalled();
    });

    it('Debería lanzar error si el tema no existe', async () => {
      jest.spyOn(temaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        temaService.agregarSubtema(mockTema._id, mockCreateSubtemaDto),
      ).rejects.toThrow(`Tema ${mockTema._id} no existe`);
    });
  });

  describe('updateSubtema', () => {
    it('Debería actualizar un subtema', async () => {
      const mockSubtemaConId = {
        _id: 'sub1',
        titulo: 'Archivo General',
        activo: true,
        hallazgo: [],
      };

      const temaConSubtema = {
        ...mockTema,
        subtema: {
          id: jest.fn().mockReturnValue(mockSubtemaConId),
        },
        save: jest.fn().mockResolvedValue(mockTema),
      };

      jest.spyOn(temaModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(temaConSubtema),
      } as any);

      await temaService.updateSubtema('sub1', mockUpdateSubtemaDto);

      expect(temaConSubtema.save).toHaveBeenCalled();
    });

    it('Debería lanzar error si el subtema no existe', async () => {
      jest.spyOn(temaModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        temaService.updateSubtema('sub1', mockUpdateSubtemaDto),
      ).rejects.toThrow('Subtema sub1 no existe');
    });
  });

  describe('deleteSubtema', () => {
    it('Debería eliminar un subtema', async () => {
      const mockSubtemaConId = {
        _id: 'sub1',
        titulo: 'Archivo General',
        activo: true,
        hallazgo: [],
      };

      const temaConSubtema = {
        ...mockTema,
        subtema: {
          id: jest.fn().mockReturnValue(mockSubtemaConId),
        },
        save: jest.fn().mockResolvedValue(mockTema),
      };

      jest.spyOn(temaModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(temaConSubtema),
      } as any);

      jest.spyOn(hallazgoModel, 'updateMany').mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      } as any);

      await temaService.deleteSubtema('sub1');

      expect(temaConSubtema.save).toHaveBeenCalled();
    });
  });
});
