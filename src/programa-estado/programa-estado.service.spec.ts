import { Test, TestingModule } from '@nestjs/testing';
import { ProgramaEstadoService } from './programa-estado.service';
import { getModelToken } from '@nestjs/mongoose';
import { ProgramaEstado } from './schema/programa-estado.schema';
import { ProgramaEstadoDto } from './dto/programa-estado.dto';
import { Auditoria } from '../auditoria/schemas/auditoria.schema';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';


// Mock data for testing
const mockProgramaEstadoDTO: ProgramaEstadoDto = {
  auditoria_id: '672d3050f7814a9a0c5261d4',
  usuario_id: 76767,
  usuario_rol: 'admin',
  observacion: 'llll',
  actual: true,
  estado_id: 2552,
  fecha_ejecucion_estado: new Date(),
  activo: true,
  fecha_creacion: new Date(),
  fecha_modificacion: new Date(),
};

const mockProgramaEstado1 = {
  ...mockProgramaEstadoDTO,
  _id: '672d36737e962bcac5ce9beb',
};

const mockProgramaEstado2 = {
  ...mockProgramaEstadoDTO,
  _id: '672d36837e962bcac5ce9bec',
  usuario_id: 76768,
  estado_id: 2553,
};


// Test suite for ProgramaEstadoService
describe('ProgramaEstadoService', () => {
  let programaEstadoService: ProgramaEstadoService;
  let ProgramaEstadoModel: Model<ProgramaEstado>;
  let AuditoriaModel: Model<Auditoria>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramaEstadoService,
        {
          provide: getModelToken(ProgramaEstado.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
            updateMany: jest.fn(),
          },
        },
        {
          provide: getModelToken(Auditoria.name),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    programaEstadoService = module.get<ProgramaEstadoService>(ProgramaEstadoService);
    ProgramaEstadoModel = module.get<Model<ProgramaEstado>>(
      getModelToken(ProgramaEstado.name),
    );
    AuditoriaModel = module.get<Model<Auditoria>>(
      getModelToken(Auditoria.name),
    );
  });

  it('Debería estar definido', () => {
    expect(ProgramaEstadoService).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver un programa-estado', async () => {
      jest.spyOn(ProgramaEstadoModel, 'find').mockResolvedValue([]);
      jest.spyOn(AuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProgramaEstado1),
      } as any);
      jest
        .spyOn(ProgramaEstadoModel, 'create')
        .mockImplementationOnce(() =>
          Promise.resolve(mockProgramaEstadoDTO as any),
        );

      const result = await programaEstadoService.post(mockProgramaEstadoDTO);
      expect(result).toEqual(mockProgramaEstadoDTO);
    });

    it('Debería lanzar un error si la Auditoría no existe', async () => {
      jest.spyOn(AuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(programaEstadoService.post(mockProgramaEstadoDTO)).rejects.toThrow(
        `Auditoría relacionada con id ${mockProgramaEstadoDTO.auditoria_id} no existe`,
      );
    });
  });

  describe('getAll', () => {
    it('Debería retornar todas los programa-estados con filtros aplicados', async () => {
      const mockProgramaEstados = [
        mockProgramaEstado1,
        mockProgramaEstado2,
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
        exec: jest.fn().mockResolvedValue(mockProgramaEstados),
      };

      jest.spyOn(ProgramaEstadoModel, 'find').mockReturnValue(mockQuery as any);

      const result = await programaEstadoService.getAll(mockFilterDto);

      expect(result).toEqual(mockProgramaEstados);
    });
  });

  describe('getById', () => {
    it('Debería retornar un programa-estado por su ID', async () => {
      jest.spyOn(ProgramaEstadoModel, 'findById').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockProgramaEstado1 as unknown as ProgramaEstado),
      } as any);

      const result = await programaEstadoService.getById(mockProgramaEstado1._id);

      expect(ProgramaEstadoModel.findById).toHaveBeenCalledWith(mockProgramaEstado1._id);
      expect(result).toEqual(mockProgramaEstado1);
    });

    it('Debería lanzar un error si el programa-estado no existe', async () => {
      jest.spyOn(ProgramaEstadoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        programaEstadoService.getById(mockProgramaEstado1._id),
      ).rejects.toThrow(`${mockProgramaEstado1._id} no existe`);

      expect(ProgramaEstadoModel.findById).toHaveBeenCalledWith(mockProgramaEstado1._id);
    });
  });

  describe('put', () => {
    it('Debería actualizar el programa-estado', async () => {
      jest.spyOn(AuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProgramaEstado1),
      } as any);
      jest.spyOn(ProgramaEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockProgramaEstadoDTO as unknown as ProgramaEstado),
      } as any);

      const result = await programaEstadoService.put(
        mockProgramaEstado1._id,
        mockProgramaEstadoDTO,
      );

      expect(ProgramaEstadoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockProgramaEstado1._id,
        mockProgramaEstadoDTO,
        { new: true },
      );
      expect(result).toEqual(mockProgramaEstadoDTO);
    });

    it('Debería lanzar un error si el programa-estado no existe', async () => {
      jest.spyOn(AuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProgramaEstado1),
      } as any);
      jest.spyOn(ProgramaEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        programaEstadoService.put(mockProgramaEstado1._id, mockProgramaEstadoDTO),
      ).rejects.toThrow(`${mockProgramaEstado1._id} no existe`);

      expect(ProgramaEstadoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockProgramaEstado1._id,
        mockProgramaEstadoDTO,
        { new: true },
      );
    });

    it('Debería lanzar un error si la Auditoría relacionada no existe', async () => {
      jest.spyOn(AuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        programaEstadoService.put(mockProgramaEstado1._id, mockProgramaEstadoDTO),
      ).rejects.toThrow(
        `Auditoría relacionada con id ${mockProgramaEstadoDTO.auditoria_id} no existe`,
      );
    });
  });

  describe('delete', () => {
    it('Debería marcar un programa-estado como inactivo', async () => {
      jest.spyOn(ProgramaEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockProgramaEstadoDTO as unknown as ProgramaEstado),
      } as any);

      const result = await programaEstadoService.delete(mockProgramaEstado1._id);

      expect(result).toEqual(mockProgramaEstadoDTO);
    });

    it('Debería lanzar un error si el programa-estado no existe', async () => {
      jest.spyOn(ProgramaEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        programaEstadoService.delete(mockProgramaEstado1._id),
      ).rejects.toThrow(`${mockProgramaEstado1._id} no existe`);
    });
  });

  describe('count', () => {
    const filterDto: FilterDto = {
      query: 'tipoEvaluacionId:3',
      fields: '',
      sortby: '',
      order: '',
      limit: '',
      offset: '',
      populate: '',
    };
    it('Debería retornar la cantidad de documentos', async () => {
      jest.spyOn(ProgramaEstadoModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      } as any);

      const result = await programaEstadoService.count(filterDto);

      expect(result).toBe(2);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      jest.spyOn(ProgramaEstadoModel, 'countDocuments').mockReturnValue({
        exec: jest
          .fn()
          .mockRejectedValue(new Error('Error al contar documentos')),
      } as any);

      await expect(programaEstadoService.count(filterDto)).rejects.toThrow(
        'Error al contar documentos',
      );
    });
  });
});
