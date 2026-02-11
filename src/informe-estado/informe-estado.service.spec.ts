import { Test, TestingModule } from '@nestjs/testing';
import { InformeEstadoService } from './informe-estado.service';
import { getModelToken } from '@nestjs/mongoose';
import { InformeEstado } from './schemas/informe-estado.schema';
import { InformeEstadoDto } from './dto/informe-estado.dto';
import { Informe } from '../informe/schemas/informe.schema';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockInformeEstadoDTO: InformeEstadoDto = {
  informe_id: '507f1f77bcf86cd799439011',
  usuario_id: 123,
  usuario_rol: 'Auditor',
  observacion: 'Estado inicial del informe',
  estado_id: 1,
  fecha_ejecucion_estado: new Date(),
  activo: true,
  actual: true,
};

const mockInformeEstado = {
  ...mockInformeEstadoDTO,
  _id: '507f1f77bcf86cd799439012',
};

const mockInforme = {
  _id: '507f1f77bcf86cd799439011',
  auditoria_id: '507f1f77bcf86cd799439010',
};

describe('InformeEstadoService', () => {
  let informeEstadoService: InformeEstadoService;
  let informeEstadoModel: Model<InformeEstado>;
  let informeModel: Model<Informe>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InformeEstadoService,
        {
          provide: getModelToken(InformeEstado.name),
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
          provide: getModelToken(Informe.name),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    informeEstadoService =
      module.get<InformeEstadoService>(InformeEstadoService);
    informeEstadoModel = module.get<Model<InformeEstado>>(
      getModelToken(InformeEstado.name),
    );
    informeModel = module.get<Model<Informe>>(getModelToken(Informe.name));
  });

  it('Debería estar definido', () => {
    expect(InformeEstadoService).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver un estado de informe', async () => {
      jest.spyOn(informeModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInforme),
      } as any);

      jest.spyOn(informeEstadoModel, 'find').mockResolvedValue([]);

      jest
        .spyOn(informeEstadoModel, 'create')
        .mockImplementationOnce(() =>
          Promise.resolve(mockInformeEstadoDTO as any),
        );

      const result = await informeEstadoService.post(mockInformeEstadoDTO);
      expect(result).toEqual(mockInformeEstadoDTO);
    });

    it('Debería desactivar estados anteriores al crear uno nuevo', async () => {
      const estadoAnterior = {
        _id: '507f1f77bcf86cd799439099',
        informe_id: mockInformeEstadoDTO.informe_id,
        actual: true,
      };

      jest.spyOn(informeModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInforme),
      } as any);

      jest
        .spyOn(informeEstadoModel, 'find')
        .mockResolvedValue([estadoAnterior] as any);

      const updateManySpy = jest
        .spyOn(informeEstadoModel, 'updateMany')
        .mockResolvedValue({} as any);

      jest
        .spyOn(informeEstadoModel, 'create')
        .mockImplementationOnce(() =>
          Promise.resolve(mockInformeEstadoDTO as any),
        );

      await informeEstadoService.post(mockInformeEstadoDTO);

      expect(updateManySpy).toHaveBeenCalledWith(
        {
          informe_id: mockInformeEstadoDTO.informe_id,
          actual: true,
        },
        { $set: { actual: false } },
      );
    });

    it('Debería lanzar un error si el Informe no existe', async () => {
      jest.spyOn(informeEstadoModel, 'find').mockResolvedValue([]);

      jest.spyOn(informeModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        informeEstadoService.post(mockInformeEstadoDTO),
      ).rejects.toThrow(
        `Informe relacionado con id ${mockInformeEstadoDTO.informe_id} no existe`,
      );
    });
  });

  describe('getAll', () => {
    it('Debería retornar todos los estados de informe con filtros aplicados', async () => {
      const mockEstados = [
        mockInformeEstado,
        {
          _id: '507f1f77bcf86cd799439013',
          informe_id: '507f1f77bcf86cd799439011',
          usuario_id: 456,
          estado_id: 2,
          actual: true,
          activo: true,
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
        exec: jest.fn().mockResolvedValue(mockEstados),
      };

      jest.spyOn(informeEstadoModel, 'find').mockReturnValue(mockQuery as any);

      const result = await informeEstadoService.getAll(mockFilterDto);

      expect(result).toEqual(mockEstados);
    });
  });

  describe('getById', () => {
    it('Debería retornar un estado de informe por su ID', async () => {
      jest.spyOn(informeEstadoModel, 'findById').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockInformeEstado as unknown as InformeEstado),
      } as any);

      const result = await informeEstadoService.getById(mockInformeEstado._id);

      expect(informeEstadoModel.findById).toHaveBeenCalledWith(
        mockInformeEstado._id,
      );
      expect(result).toEqual(mockInformeEstado);
    });

    it('Debería lanzar un error si el estado de informe no existe', async () => {
      jest.spyOn(informeEstadoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        informeEstadoService.getById(mockInformeEstado._id),
      ).rejects.toThrow(`${mockInformeEstado._id} no existe`);

      expect(informeEstadoModel.findById).toHaveBeenCalledWith(
        mockInformeEstado._id,
      );
    });
  });

  describe('put', () => {
    it('Debería actualizar un estado de informe', async () => {
      jest.spyOn(informeModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInforme),
      } as any);
      jest.spyOn(informeEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockInformeEstadoDTO as unknown as InformeEstado),
      } as any);

      const result = await informeEstadoService.put(
        mockInformeEstado._id,
        mockInformeEstadoDTO,
      );

      expect(informeEstadoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockInformeEstado._id,
        mockInformeEstadoDTO,
        { new: true },
      );
      expect(result).toEqual(mockInformeEstadoDTO);
    });

    it('Debería lanzar un error si el estado de informe no existe', async () => {
      jest.spyOn(informeModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInforme),
      } as any);
      jest.spyOn(informeEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        informeEstadoService.put(mockInformeEstado._id, mockInformeEstadoDTO),
      ).rejects.toThrow(`${mockInformeEstado._id} no existe`);

      expect(informeEstadoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockInformeEstado._id,
        mockInformeEstadoDTO,
        { new: true },
      );
    });

    it('Debería lanzar un error si el Informe relacionado no existe', async () => {
      jest.spyOn(informeModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        informeEstadoService.put(mockInformeEstado._id, mockInformeEstadoDTO),
      ).rejects.toThrow(
        `Informe relacionado con id ${mockInformeEstadoDTO.informe_id} no existe`,
      );
    });
  });

  describe('delete', () => {
    it('Debería marcar un estado de informe como inactivo', async () => {
      jest.spyOn(informeEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockInformeEstadoDTO as unknown as InformeEstado),
      } as any);

      const result = await informeEstadoService.delete(mockInformeEstado._id);

      expect(result).toEqual(mockInformeEstadoDTO);
    });

    it('Debería lanzar un error si el estado de informe no existe', async () => {
      jest.spyOn(informeEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        informeEstadoService.delete(mockInformeEstado._id),
      ).rejects.toThrow(`${mockInformeEstado._id} no existe`);
    });
  });

  describe('count', () => {
    const filterDto: FilterDto = {
      query: 'actual:true',
      fields: '',
      sortby: '',
      order: '',
      limit: '',
      offset: '',
      populate: '',
    };

    it('Debería retornar la cantidad de documentos', async () => {
      jest.spyOn(informeEstadoModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      } as any);

      const result = await informeEstadoService.count(filterDto);

      expect(result).toBe(5);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      jest.spyOn(informeEstadoModel, 'countDocuments').mockReturnValue({
        exec: jest
          .fn()
          .mockRejectedValue(new Error('Error al contar documentos')),
      } as any);

      await expect(informeEstadoService.count(filterDto)).rejects.toThrow(
        'Error al contar documentos',
      );
    });
  });
});
