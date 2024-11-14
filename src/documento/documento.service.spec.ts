import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoService } from './documento.service';
import { getModelToken } from '@nestjs/mongoose';
import { DocumentoDTO } from './dto/documento.dto'
import { Documento } from './schemas/documento.schema'
import { Model } from 'mongoose';
import { Auditoria } from '../auditoria/schemas/auditoria.schema'
import { PlanAuditoria } from '../plan-auditoria/schemas/plan-auditoria.schema'

import { FilterDto } from '../filters/filters.dto';

const mockDocumentoDto: DocumentoDTO = {
  referencia_id: "67197dda3416d2a85e5d6d8f",
  referencia_tipo: 'Plan Auditoria',
  nuxeo_id: 123,
  tipo_id: 123,
  activo: true,
  fecha_creacion: new Date(),
};

const mockDocumento = {
  ...mockDocumentoDto,
  _id: '6735761419eb159ed6ef0da7',
};

const mockAuditoria = {
  _id: '671aa963064222e6583d56e4',
  titulo: ''
};
const mockPlanAuditoria = {
  _id: '67197dda3416d2a85e5d6d8f',
  titulo: ''
};
describe('DocumentoService', () => {
  let actividadService: DocumentoService;
  let actividadModel: Model<Documento>;
  let auditoriaModel: Model<Auditoria>;
  let planAuditoriaModel: Model<PlanAuditoria>;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentoService,
        {
          provide: getModelToken(Documento.name),
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
        {
          provide: getModelToken(PlanAuditoria.name),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    actividadService = module.get<DocumentoService>(DocumentoService);
    actividadModel = module.get<Model<Documento>>(
      getModelToken(Documento.name),
    );
    auditoriaModel = module.get<Model<Auditoria>>(
      getModelToken(Auditoria.name),
    );
    planAuditoriaModel = module.get<Model<PlanAuditoria>>(
      getModelToken(PlanAuditoria.name),
    );
  });

  it('Debería estar definido', () => {
    expect(DocumentoService).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver una actividad', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditoria),
      } as any);
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);
      jest
        .spyOn(actividadModel, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockDocumentoDto as any));

      const result = await actividadService.post(mockDocumentoDto);
      expect(result).toEqual(mockDocumentoDto);
    });

    it('Debería lanzar un error si el Documento no existe', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(actividadService.post(mockDocumentoDto)).rejects.toThrow(
        `Documento relacionada con id ${mockDocumentoDto.referencia_id} no existe en `,
      );
    });
  });

  describe('getAll', () => {
    it('Debería retornar todas las actividades con filtros aplicados', async () => {
      const mockActividads = [
        mockDocumento,
        {
          _id: '671aaf35d779a09e092cb732',
          referencia_id: "67197dda3416d2a85e5d6d8f",
          titulo: 'string',
          fechaInicio: new Date(),
          fechaFin: new Date(),
          referencia: 'string',
          descripcion: 'string',
          folio: 0,
          medio_id: 0,
          carpeta: 'string',
          activo: true,
          fecha_creacion: new Date(),
          fecha_modificacion: new Date(),
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
        exec: jest.fn().mockResolvedValue(mockActividads),
      };

      jest.spyOn(actividadModel, 'find').mockReturnValue(mockQuery as any);

      const result = await actividadService.getAll(mockFilterDto);

      expect(result).toEqual(mockActividads);
    });
  });

  describe('getById', () => {
    it('Debería retornar una acividad por su ID', async () => {
      jest.spyOn(actividadModel, 'findById').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockDocumento as unknown as Documento),
      } as any);

      const result = await actividadService.getById(mockDocumento._id);

      expect(actividadModel.findById).toHaveBeenCalledWith(
        mockDocumento._id,
      );
      expect(result).toEqual(mockDocumento);
    });

    it('Debería lanzar un error si la actividad no existe', async () => {
      jest.spyOn(actividadModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        actividadService.getById(mockDocumento._id),
      ).rejects.toThrow(`${mockDocumento._id} no existe`);

      expect(actividadModel.findById).toHaveBeenCalledWith(
        mockDocumento._id,
      );
    });
  });

  describe('put', () => {
    it('Debería actualizar una actividad', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditoria),
      } as any);
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);
      jest.spyOn(actividadModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockDocumentoDto as unknown as Documento),
      } as any);

      const result = await actividadService.put(
        mockDocumento._id,
        mockDocumentoDto,
      );

      expect(actividadModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockDocumento._id,
        mockDocumentoDto,
        { new: true },
      );
      expect(result).toEqual(mockDocumentoDto);
    });

    it('Debería lanzar un error si la actividad no existe', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditoria),
      } as any);
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);
      jest.spyOn(actividadModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        actividadService.put(mockDocumento._id, mockDocumentoDto),
      ).rejects.toThrow(`${mockDocumento._id} no existe`);

      expect(actividadModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockDocumento._id,
        mockDocumentoDto,
        { new: true },
      );
    });

    it('Debería lanzar un error si la Documento relacionado no existe', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        actividadService.put(mockDocumento._id, mockDocumentoDto),
      ).rejects.toThrow(
        `Documento relacionada con id ${mockDocumentoDto.referencia_id} no existe`,
      );
    });
  });

  describe('delete', () => {
    it('Debería marcar una actividad como inactiva', async () => {
      jest.spyOn(actividadModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockDocumentoDto as unknown as Documento),
      } as any);

      const result = await actividadService.delete(mockDocumento._id);

      expect(result).toEqual(mockDocumentoDto);
    });

    it('Debería lanzar un error si la actividad no existe', async () => {
      jest.spyOn(actividadModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        actividadService.delete(mockDocumento._id),
      ).rejects.toThrow(`${mockDocumento._id} no existe`);
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
      jest.spyOn(actividadModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      } as any);

      const result = await actividadService.count(filterDto);

      expect(result).toBe(2);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      jest.spyOn(actividadModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Error al contar documentos')),
      } as any);

      await expect(actividadService.count(filterDto)).rejects.toThrow(
        'Error al contar documentos',
      );
    });
  });
});