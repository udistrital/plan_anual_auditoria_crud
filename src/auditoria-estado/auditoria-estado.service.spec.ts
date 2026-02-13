import { Test, TestingModule } from '@nestjs/testing';
import { EstadoAuditoriaService } from './auditoria-estado.service';
import { getModelToken } from '@nestjs/mongoose';
import { AuditoriaEstado } from './schema/auditoria-estado.schema';
import { AuditoriaEstadoDto } from './dto/auditoria-estado.dto';
import { Auditoria } from '../auditoria/schemas/auditoria.schema';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockEstadoAuditoriaDTO: AuditoriaEstadoDto = {
  auditoria_id: '672d3050f7814a9a0c5261d4',
  usuario_id: 76767,
  observacion: 'llll',
  estado_id: 2552,
  fecha_ejecucion_estado: new Date(),
  activo: true,
  actual: true,
  usuario_rol: 'AUDITOR',
  fase_id: 'PROGRAMACION',
};

const mockEstadoAuditoria = {
  ...mockEstadoAuditoriaDTO,
  _id: '672d36737e962bcac5ce9beb',
};
describe('EstadoAuditoriaService', () => {
  let estadoAuditoriaService: EstadoAuditoriaService;
  let AuditoriaEstadoModel: Model<AuditoriaEstado>;
  let auditoriaModel: Model<Auditoria>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstadoAuditoriaService,
        {
          provide: getModelToken(AuditoriaEstado.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
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

    estadoAuditoriaService = module.get<EstadoAuditoriaService>(
      EstadoAuditoriaService,
    );
    AuditoriaEstadoModel = module.get<Model<AuditoriaEstado>>(
      getModelToken(AuditoriaEstado.name),
    );
    auditoriaModel = module.get<Model<Auditoria>>(
      getModelToken(Auditoria.name),
    );
  });

  it('Debería estar definido', () => {
    expect(EstadoAuditoriaService).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver el estado de una auditoria', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEstadoAuditoria),
      } as any);
      jest
        .spyOn(AuditoriaEstadoModel, 'create')
        .mockImplementationOnce(() =>
          Promise.resolve(mockEstadoAuditoriaDTO as any),
        );

      const result = await estadoAuditoriaService.post(mockEstadoAuditoriaDTO);
      expect(result).toEqual(mockEstadoAuditoriaDTO);
    });

    it('Debería lanzar un error si la auditoria no existe', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        estadoAuditoriaService.post(mockEstadoAuditoriaDTO),
      ).rejects.toThrow(
        `Auditoria relacionada con id ${mockEstadoAuditoriaDTO.auditoria_id} no existe`,
      );
    });
  });

  describe('getAll', () => {
    it('Debería retornar todos los estados con filtros aplicados', async () => {
      const mockAuditorias = [
        mockEstadoAuditoria,
        {
          _id: '671aa963064222e6583d56e4',
          titulo: 'auditoria 1',
          tipoEvaluacionId: 2,
          plan_auditoria_id: '67197f9a3416d2a85e5d6d93',
          cronogramaActividad: Array(3),
          estadoId: 3,
          noAuditoria: 123420,
          consecutivoOCI: 'EHS54F',
          consecutivoIE: 'PASJF4532',
          tipoAd: 3,
          macroproceso: 4,
          lider: 3,
          responsable: 34,
          fechaInicio: new Date(),
          fechaFin: new Date(),
          objetivo: 'objetivo',
          alcance: 'alcance',
          criterio: 'criterio',
          recTecnologico: 'rec_T',
          recHumano: 'rec_H',
          recFisico: 'rec_F',
          temas: 'temas',
          activo: true,
          fechaCreacion: new Date(),
          fechaModificacion: new Date(),
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
        exec: jest.fn().mockResolvedValue(mockAuditorias),
      };

      jest
        .spyOn(AuditoriaEstadoModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await estadoAuditoriaService.getAll(mockFilterDto);

      expect(result).toEqual(mockAuditorias);
    });
  });

  describe('getById', () => {
    it('Debería retornar el estado de una auditoria por su ID', async () => {
      jest.spyOn(AuditoriaEstadoModel, 'findById').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockEstadoAuditoria as unknown as AuditoriaEstado),
      } as any);

      const result = await estadoAuditoriaService.getById(
        mockEstadoAuditoria._id,
      );

      expect(AuditoriaEstadoModel.findById).toHaveBeenCalledWith(
        mockEstadoAuditoria._id,
      );
      expect(result).toEqual(mockEstadoAuditoria);
    });

    it('Debería lanzar un error si el estado de la auditoria no existe', async () => {
      jest.spyOn(AuditoriaEstadoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        estadoAuditoriaService.getById(mockEstadoAuditoria._id),
      ).rejects.toThrow(`${mockEstadoAuditoria._id} no existe`);

      expect(AuditoriaEstadoModel.findById).toHaveBeenCalledWith(
        mockEstadoAuditoria._id,
      );
    });
  });

  describe('put', () => {
    it('Debería actualizar el estado de una auditoria', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEstadoAuditoria),
      } as any);
      jest.spyOn(AuditoriaEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(
            mockEstadoAuditoriaDTO as unknown as AuditoriaEstado,
          ),
      } as any);

      const result = await estadoAuditoriaService.put(
        mockEstadoAuditoria._id,
        mockEstadoAuditoriaDTO,
      );

      expect(AuditoriaEstadoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockEstadoAuditoria._id,
        mockEstadoAuditoriaDTO,
        { new: true },
      );
      expect(result).toEqual(mockEstadoAuditoriaDTO);
    });

    it('Debería lanzar un error si el estado de la auditoria no existe', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEstadoAuditoria),
      } as any);
      jest.spyOn(AuditoriaEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        estadoAuditoriaService.put(
          mockEstadoAuditoria._id,
          mockEstadoAuditoriaDTO,
        ),
      ).rejects.toThrow(`${mockEstadoAuditoria._id} no existe`);

      expect(AuditoriaEstadoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockEstadoAuditoria._id,
        mockEstadoAuditoriaDTO,
        { new: true },
      );
    });

    it('Debería lanzar un error si la auditoria relacionado no existe', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        estadoAuditoriaService.put(
          mockEstadoAuditoria._id,
          mockEstadoAuditoriaDTO,
        ),
      ).rejects.toThrow(
        `Auditoria relacionada con id ${mockEstadoAuditoriaDTO.auditoria_id} no existe`,
      );
    });
  });

  describe('delete', () => {
    it('Debería marcar el estado de una auditoria como inactivo', async () => {
      jest.spyOn(AuditoriaEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(
            mockEstadoAuditoriaDTO as unknown as AuditoriaEstado,
          ),
      } as any);

      const result = await estadoAuditoriaService.delete(
        mockEstadoAuditoria._id,
      );

      expect(result).toEqual(mockEstadoAuditoriaDTO);
    });

    it('Debería lanzar un error si el estado de la auditoria no existe', async () => {
      jest.spyOn(AuditoriaEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        estadoAuditoriaService.delete(mockEstadoAuditoria._id),
      ).rejects.toThrow(`${mockEstadoAuditoria._id} no existe`);
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
      jest.spyOn(AuditoriaEstadoModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      } as any);

      const result = await estadoAuditoriaService.count(filterDto);

      expect(result).toBe(2);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      jest.spyOn(AuditoriaEstadoModel, 'countDocuments').mockReturnValue({
        exec: jest
          .fn()
          .mockRejectedValue(new Error('Error al contar documentos')),
      } as any);

      await expect(estadoAuditoriaService.count(filterDto)).rejects.toThrow(
        'Error al contar documentos',
      );
    });
  });
});
