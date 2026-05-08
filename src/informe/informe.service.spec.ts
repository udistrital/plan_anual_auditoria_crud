import { Test, TestingModule } from '@nestjs/testing';
import { InformeService } from './informe.service';
import { getModelToken } from '@nestjs/mongoose';
import { InformeDTO } from './dto/informe.dto';
import { Informe } from './schemas/informe.schema';
import { Tema } from '../tema/schemas/tema.schema';
import { Hallazgo } from '../hallazgo/schemas/hallazgo.schema';
import { Model, Types } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

// Helper para crear un query builder mock
const createQueryBuilderMock = (resolveValue: any = []) => ({
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(resolveValue),
});

const mockInformeDto: InformeDTO = {
  auditoria_id: new Types.ObjectId('507f1f77bcf86cd799439011'),
  fecha_emision: new Date('2024-01-20'),
  muestra: 'Muestra de prueba',
  aspecto_general: 'Aspectos generales de prueba',
  activo: true,
  fecha_creacion: new Date(),
};

const mockInforme = {
  ...mockInformeDto,
  _id: '507f1f77bcf86cd799439012',
};

describe('InformeService', () => {
  let informeService: InformeService;
  let informeModel: Model<Informe>;
  let temaModel: Model<Tema>;
  let hallazgoModel: Model<Hallazgo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InformeService,
        {
          provide: getModelToken(Informe.name),
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
            find: jest
              .fn()
              .mockImplementation(() => createQueryBuilderMock([])),
          },
        },
        {
          provide: getModelToken(Hallazgo.name),
          useValue: {
            find: jest
              .fn()
              .mockImplementation(() => createQueryBuilderMock([])),
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken(Hallazgo.name),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    informeService = module.get<InformeService>(InformeService);
    informeModel = module.get<Model<Informe>>(getModelToken(Informe.name));
    temaModel = module.get<Model<Tema>>(getModelToken(Tema.name));
    hallazgoModel = module.get<Model<Hallazgo>>(getModelToken(Hallazgo.name));
  });

  it('Debería estar definido', () => {
    expect(InformeService).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver un informe', async () => {
      jest
        .spyOn(informeModel, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockInformeDto as any));

      const result = await informeService.post(mockInformeDto);
      expect(result).toEqual(mockInformeDto);
    });

    it('Debería lanzar un error si el Informe no existe', async () => {
      jest.spyOn(informeModel, 'create').mockImplementationOnce(() => {
        throw new Error(
          `Informe relacionado con id ${mockInformeDto.auditoria_id} no existe`,
        );
      });

      await expect(informeService.post(mockInformeDto)).rejects.toThrow(
        `Informe relacionado con id ${mockInformeDto.auditoria_id} no existe`,
      );
    });
  });

  describe('getAll', () => {
    it('Debería retornar todos los informes con filtros aplicados', async () => {
      const mockInformes = [
        mockInforme,
        {
          _id: '507f1f77bcf86cd799439013',
          auditoria_id: '507f1f77bcf86cd799439011',
          fecha_emision: new Date('2024-01-21'),
          activo: true,
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
        exec: jest.fn().mockResolvedValue(mockInformes),
      };

      jest.spyOn(informeModel, 'find').mockReturnValue(mockQuery as any);

      const result = await informeService.getAll(mockFilterDto);

      expect(result).toEqual(mockInformes);
    });
  });

  describe('getById', () => {
    it('Debería retornar un informe por su ID', async () => {
      jest.spyOn(informeModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInforme as unknown as Informe),
      } as any);

      const result = await informeService.getById(mockInforme._id);

      expect(informeModel.findById).toHaveBeenCalledWith(mockInforme._id);
      expect(result).toEqual(mockInforme);
    });

    it('Debería lanzar un error si el informe no existe', async () => {
      jest.spyOn(informeModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(informeService.getById(mockInforme._id)).rejects.toThrow(
        `${mockInforme._id} no existe`,
      );

      expect(informeModel.findById).toHaveBeenCalledWith(mockInforme._id);
    });
  });

  describe('put', () => {
    it('Debería actualizar un informe', async () => {
      jest.spyOn(informeModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInformeDto as unknown as Informe),
      } as any);

      const result = await informeService.put(mockInforme._id, mockInformeDto);

      expect(informeModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockInforme._id,
        mockInformeDto,
        { new: true },
      );
      expect(result).toEqual(mockInformeDto);
    });

    it('Debería lanzar un error si el informe no existe', async () => {
      jest.spyOn(informeModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        informeService.put(mockInforme._id, mockInformeDto),
      ).rejects.toThrow(`${mockInforme._id} no existe`);

      expect(informeModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockInforme._id,
        mockInformeDto,
        { new: true },
      );
    });
  });

  describe('delete', () => {
    it('Debería marcar un informe como inactivo', async () => {
      jest.spyOn(informeModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInformeDto as unknown as Informe),
      } as any);

      const result = await informeService.delete(mockInforme._id);

      expect(result).toEqual(mockInformeDto);
    });

    it('Debería lanzar un error si el informe no existe', async () => {
      jest.spyOn(informeModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(informeService.delete(mockInforme._id)).rejects.toThrow(
        `${mockInforme._id} no existe`,
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

    it('Debería retornar la cantidad de informes', async () => {
      jest.spyOn(informeModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      } as any);

      const result = await informeService.count(filterDto);

      expect(result).toBe(5);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      jest.spyOn(informeModel, 'countDocuments').mockReturnValue({
        exec: jest
          .fn()
          .mockRejectedValue(new Error('Error al contar informes')),
      } as any);

      await expect(informeService.count(filterDto)).rejects.toThrow(
        'Error al contar informes',
      );
    });
  });

  describe('getHallazgosByInforme', () => {
    it('Debería lanzar error si el informe no existe', async () => {
      jest.spyOn(informeModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        informeService.getHallazgosByInforme(mockInforme._id),
      ).rejects.toThrow(`Informe ${mockInforme._id} no existe`);
    });

    it('Debería retornar hallazgos en estructura plana', async () => {
      const mockTemas = [
        {
          _id: 'tema1',
          titulo: 'Tema 1',
          activo: true,
          subtema: [
            {
              _id: 'sub1',
              titulo: 'Subtema 1',
              activo: true,
            },
          ],
        },
      ];

      const mockHallazgos = [
        {
          _id: 'hall1',
          titulo: 'Hallazgo 1',
          criterio: 'Criterio 1',
          descripcion: 'Descripción 1',
          rechazado: false,
          activo: true,
          subtema_id: 'sub1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(informeModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInforme),
      } as any);

      jest.spyOn(temaModel, 'find').mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockTemas),
      } as any);

      jest.spyOn(hallazgoModel, 'find').mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockHallazgos),
      } as any);

      const result = await informeService.getHallazgosByInforme(
        mockInforme._id,
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('_id', 'hall1');
      expect(result[0]).toHaveProperty('tema_id', 'tema1');
      expect(result[0]).toHaveProperty('subtema_id');
    });
  });
});
