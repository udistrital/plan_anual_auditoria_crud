import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentoService } from './documento.service';
import { Documento } from './schemas/documento.schema';
import { DocumentoDTO } from './dto/documento.dto';
import { FilterDto } from '../filters/filters.dto';

const mockDocumentoDto: DocumentoDTO = {
  referencia_id: '67197dda3416d2a85e5d6d8f',
  referencia_tipo: 'Plan Auditoria',
  nuxeo_id: 123456,
  nuxeo_enlace: 'https://nuxeo.example.com/doc/123456',
  tipo_id: 789,
  activo: true,
  fecha_creacion: new Date('2024-01-15'),
};

const mockDocumento = {
  ...mockDocumentoDto,
  _id: '6735761419eb159ed6ef0da7',
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debería estar definido', () => {
    expect(documentoService).toBeDefined();
    expect(documentoModel).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver un documento cuando los datos son válidos', async () => {
      const createSpy = jest
        .spyOn(documentoModel, 'create')
        .mockResolvedValue(mockDocumento as any);

      const result = await documentoService.post(mockDocumentoDto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockDocumentoDto,
          activo: true,
          fechaCreacion: expect.any(Date),
        }),
      );
      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDocumento);
    });

    it('Debería establecer activo en true automáticamente', async () => {
      const createSpy = jest
        .spyOn(documentoModel, 'create')
        .mockResolvedValue(mockDocumento as any);

      await documentoService.post(mockDocumentoDto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activo: true,
        }),
      );
    });

    it('Debería establecer fechaCreacion automáticamente', async () => {
      const createSpy = jest
        .spyOn(documentoModel, 'create')
        .mockResolvedValue(mockDocumento as any);

      await documentoService.post(mockDocumentoDto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          fechaCreacion: expect.any(Date),
        }),
      );
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error');
      jest.spyOn(documentoModel, 'create').mockRejectedValue(mockError);

      await expect(documentoService.post(mockDocumentoDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'activo:true',
      fields: 'referencia_id,nuxeo_id',
      sortby: 'fecha_creacion',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'false',
    };

    const mockDocumentos = [
      {
        ...mockDocumento,
        _id: '1',
        nuxeo_id: 123456,
      },
      {
        ...mockDocumento,
        _id: '2',
        nuxeo_id: 789012,
      },
    ];

    it('Debería retornar todos los documentos con filtros aplicados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDocumentos),
      };

      const findSpy = jest
        .spyOn(documentoModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await documentoService.getAll(mockFilterDto);

      expect(findSpy).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalled();
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual(mockDocumentos);
    });

    it('Debería aplicar populate cuando populate es "true"', async () => {
      const filterWithPopulate = { ...mockFilterDto, populate: 'true' };
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDocumentos),
      };

      jest.spyOn(documentoModel, 'find').mockReturnValue(mockQuery as any);

      await documentoService.getAll(filterWithPopulate);

      expect(mockQuery.populate).toHaveBeenCalledWith([{ path: '' }]);
    });

    it('Debería NO aplicar populate cuando populate es "false"', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDocumentos),
      };

      jest.spyOn(documentoModel, 'find').mockReturnValue(mockQuery as any);

      await documentoService.getAll(mockFilterDto);

      expect(mockQuery.populate).toHaveBeenCalledWith([]);
    });

    it('Debería retornar un array vacío cuando no hay resultados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(documentoModel, 'find').mockReturnValue(mockQuery as any);

      const result = await documentoService.getAll(mockFilterDto);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('Debería manejar errores de la base de datos', async () => {
      const mockError = new Error('Database error');
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(mockError),
      };

      jest.spyOn(documentoModel, 'find').mockReturnValue(mockQuery as any);

      await expect(documentoService.getAll(mockFilterDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getById', () => {
    it('Debería retornar un documento por su ID cuando existe', async () => {
      const findByIdSpy = jest
        .spyOn(documentoModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockDocumento),
        } as any);

      const result = await documentoService.getById(mockDocumento._id);

      expect(findByIdSpy).toHaveBeenCalledWith(mockDocumento._id);
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDocumento);
    });

    it('Debería lanzar un error si el documento no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      const findByIdSpy = jest
        .spyOn(documentoModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(documentoService.getById(nonExistentId)).rejects.toThrow(
        `${nonExistentId} no existe`,
      );

      expect(findByIdSpy).toHaveBeenCalledWith(nonExistentId);
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database connection failed');
      jest.spyOn(documentoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(documentoService.getById(mockDocumento._id)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('put', () => {
    const updateDto: DocumentoDTO = {
      ...mockDocumentoDto,
      nuxeo_id: 999999,
      nuxeo_enlace: 'https://nuxeo.example.com/doc/999999',
    };

    it('Debería actualizar un documento existente', async () => {
      const updatedDocumento = { ...mockDocumento, ...updateDto };

      const updateSpy = jest
        .spyOn(documentoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedDocumento),
        } as any);

      const result = await documentoService.put(mockDocumento._id, updateDto);

      expect(updateSpy).toHaveBeenCalledWith(mockDocumento._id, updateDto, {
        new: true,
      });
      expect(result).toEqual(updatedDocumento);
    });

    it('Debería eliminar fecha_creacion si está presente en el DTO', async () => {
      const dtoWithFechaCreacion = {
        ...updateDto,
        fecha_creacion: new Date('2024-01-01'),
      };

      const updateSpy = jest
        .spyOn(documentoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockDocumento),
        } as any);

      await documentoService.put(mockDocumento._id, dtoWithFechaCreacion);

      const calledDto = updateSpy.mock.calls[0][1];
      expect(calledDto).not.toHaveProperty('fecha_creacion');
    });

    it('Debería lanzar un error si el documento no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      const updateSpy = jest
        .spyOn(documentoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(
        documentoService.put(nonExistentId, updateDto),
      ).rejects.toThrow(
        `Documento relacionada con id ${nonExistentId} no existe`,
      );

      expect(updateSpy).toHaveBeenCalledWith(nonExistentId, updateDto, {
        new: true,
      });
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error');
      jest.spyOn(documentoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(
        documentoService.put(mockDocumento._id, updateDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    it('Debería marcar un documento como inactivo (soft delete)', async () => {
      const deletedDocumento = { ...mockDocumento, activo: false };

      const deleteSpy = jest
        .spyOn(documentoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(deletedDocumento),
        } as any);

      const result = await documentoService.delete(mockDocumento._id);

      expect(deleteSpy).toHaveBeenCalledWith(
        mockDocumento._id,
        { activo: false },
        { new: true },
      );
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deletedDocumento);
      expect(result.activo).toBe(false);
    });

    it('Debería lanzar un error si el documento no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      const deleteSpy = jest
        .spyOn(documentoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(documentoService.delete(nonExistentId)).rejects.toThrow(
        `${nonExistentId} no existe`,
      );

      expect(deleteSpy).toHaveBeenCalledWith(
        nonExistentId,
        { activo: false },
        { new: true },
      );
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error during delete');

      jest.spyOn(documentoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(documentoService.delete(mockDocumento._id)).rejects.toThrow(
        'Database error during delete',
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

    it('Debería retornar la cantidad de documentos que coinciden con el filtro', async () => {
      const expectedCount = 5;

      const countSpy = jest
        .spyOn(documentoModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(expectedCount),
        } as any);

      const result = await documentoService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(countSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedCount);
    });

    it('Debería retornar 0 cuando no hay documentos que coincidan', async () => {
      const countSpy = jest
        .spyOn(documentoModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(0),
        } as any);

      const result = await documentoService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      const mockError = new Error('Error al contar documentos');

      jest.spyOn(documentoModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(documentoService.count(filterDto)).rejects.toThrow(
        'Error al contar documentos',
      );
    });

    it('Debería aplicar correctamente los filtros del FilterDto', async () => {
      const complexFilterDto: FilterDto = {
        query: 'activo:true,referencia_tipo:Plan Auditoria',
        fields: 'nuxeo_id,tipo_id',
        sortby: 'fecha_creacion',
        order: 'desc',
        limit: '10',
        offset: '0',
        populate: 'false',
      };

      const countSpy = jest
        .spyOn(documentoModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(3),
        } as any);

      const result = await documentoService.count(complexFilterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(3);
    });
  });
});
