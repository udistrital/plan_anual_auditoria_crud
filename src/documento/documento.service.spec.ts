import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoService } from './documento.service';
import { getModelToken } from '@nestjs/mongoose';
import { DocumentoDTO } from './dto/documento.dto'
import { Documento } from './schemas/documento.schema'
import { Model } from 'mongoose';


import { FilterDto } from '../filters/filters.dto';

const mockDocumentoDto: DocumentoDTO = {
  referencia_id: "6735761419eb159ed6ef0da7",
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
  let documentoService: DocumentoService;
  let documentoModel: Model<Documento>;


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

      ],
    }).compile();

    documentoService = module.get<DocumentoService>(DocumentoService);
    documentoModel = module.get<Model<Documento>>(
      getModelToken(Documento.name),
    );

  });

  it('Debería estar definido', () => {
    expect(DocumentoService).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver un documento', async () => {
      jest
        .spyOn(documentoModel, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockDocumentoDto as any));

      const result = await documentoService.post(mockDocumentoDto);
      expect(result).toEqual(mockDocumentoDto);
    });

    it('Debería lanzar un error si el Documento no existe', async () => {
      // Simula que el método `create` lanza un error
      jest
        .spyOn(documentoModel, 'create')
        .mockImplementationOnce(() => {
          throw new Error(`Documento relacionada con id ${mockDocumentoDto.referencia_id} no existe en `);
        });

      await expect(documentoService.post(mockDocumentoDto)).rejects.toThrow(
        `Documento relacionada con id ${mockDocumentoDto.referencia_id} no existe en `,
      );
    });
  });

  describe('getAll', () => {
    it('Debería retornar todas las actividades con filtros aplicados', async () => {
      const mockActividads = [
        mockDocumento,
        {
          _id: '6735761419eb159ed6ef0da7',
          referencia_id: "67197dda3416d2a85e5d6d8f",
          referencia_tipo: 'Plan Auditoria',
          nuxeo_id: 123,
          tipo_id: 123,
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
        exec: jest.fn().mockResolvedValue(mockActividads),
      };

      jest.spyOn(documentoModel, 'find').mockReturnValue(mockQuery as any);

      const result = await documentoService.getAll(mockFilterDto);

      expect(result).toEqual(mockActividads);
    });
  });

  describe('getById', () => {
    it('Debería retornar una acividad por su ID', async () => {
      jest.spyOn(documentoModel, 'findById').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockDocumento as unknown as Documento),
      } as any);

      const result = await documentoService.getById(mockDocumento._id);

      expect(documentoModel.findById).toHaveBeenCalledWith(
        mockDocumento._id,
      );
      expect(result).toEqual(mockDocumento);
    });

    it('Debería lanzar un error si la documento no existe', async () => {
      jest.spyOn(documentoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        documentoService.getById(mockDocumento._id),
      ).rejects.toThrow(`${mockDocumento._id} no existe`);

      expect(documentoModel.findById).toHaveBeenCalledWith(
        mockDocumento._id,
      );
    });
  });

  describe('put', () => {
    it('Debería actualizar una documento', async () => {

      jest.spyOn(documentoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockDocumentoDto as unknown as Documento),
      } as any);

      const result = await documentoService.put(
        mockDocumento._id,
        mockDocumentoDto,
      );

      expect(documentoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockDocumento._id,
        mockDocumentoDto,
        { new: true },
      );
      expect(result).toEqual(mockDocumentoDto);
    });

    it('Debería lanzar un error si la documento no existe', async () => {

      jest.spyOn(documentoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        documentoService.put(mockDocumento._id, mockDocumentoDto),
      ).rejects.toThrow(`${mockDocumento._id} no existe`);

      expect(documentoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockDocumento._id,
        mockDocumentoDto,
        { new: true },
      );
    });

    it('Debería lanzar un error si la Documento relacionado no existe', async () => {
      jest.spyOn(documentoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        documentoService.put(mockDocumento._id, mockDocumentoDto),
      ).rejects.toThrow(
        `Documento relacionada con id ${mockDocumentoDto.referencia_id} no existe`,
      );
    });
  });

  describe('delete', () => {
    it('Debería marcar una documento como inactiva', async () => {
      jest.spyOn(documentoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockDocumentoDto as unknown as Documento),
      } as any);

      const result = await documentoService.delete(mockDocumento._id);

      expect(result).toEqual(mockDocumentoDto);
    });

    it('Debería lanzar un error si la documento no existe', async () => {
      jest.spyOn(documentoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        documentoService.delete(mockDocumento._id),
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
      jest.spyOn(documentoModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      } as any);

      const result = await documentoService.count(filterDto);

      expect(result).toBe(2);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      jest.spyOn(documentoModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Error al contar documentos')),
      } as any);

      await expect(documentoService.count(filterDto)).rejects.toThrow(
        'Error al contar documentos',
      );
    });
  });
});