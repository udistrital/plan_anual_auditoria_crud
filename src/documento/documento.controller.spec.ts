import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoController } from './documento.controller';
import { DocumentoDTO } from './dto/documento.dto';
import { DocumentoService } from './documento.service';
import { HttpStatus } from '@nestjs/common';
import { FilterDto } from '../filters/filters.dto';

const mockDocumentoDto: DocumentoDTO = {
  referencia_id: '67197dda3416d2a85e5d6d8f',
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
describe('DocumentoController', () => {
  let controller: DocumentoController;
  let service: DocumentoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentoController],
      providers: [
        {
          provide: DocumentoService,
          useValue: {
            post: jest.fn(),
            getAll: jest.fn(),
            getById: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DocumentoController>(DocumentoController);
    service = module.get<DocumentoService>(DocumentoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('post', () => {
    it('Debería retornar Created con datos válidos', async () => {
      jest.spyOn(service, 'post').mockResolvedValue(mockDocumentoDto as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.post(res as any, mockDocumentoDto);

      expect(service.post).toHaveBeenCalledWith(mockDocumentoDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: mockDocumentoDto,
      });
    });

    it('Debería retornar BadRequest con error', async () => {
      const mockError = new Error(
        'Actividad validation failed: activo: Cast to Boolean failed for value "2" (type number) at path "activo"',
      );

      jest.spyOn(service, 'post').mockRejectedValue(mockError);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.post(res as any, mockDocumentoDto);

      expect(service.post).toHaveBeenCalledWith(mockDocumentoDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error servicio Post: la solicitud contiene un tipo de dato incorrecto o un parametro invalido',
        Data: mockError.message,
      });
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: '',
      fields: '',
      sortby: '',
      order: '',
      limit: '',
      offset: '',
      populate: '',
    };

    beforeEach(() => {
      jest.spyOn(service, 'count').mockResolvedValue(2);
    });

    it('Debería retornar OK con datos válidos', async () => {
      const mockActividades = [
        {
          ...mockDocumento,
          _id: '1',
          titulo: 'documento 1',
        },
        {
          ...mockDocumento,
          _id: '2',
          titulo: 'documento 2',
        },
      ];

      jest.spyOn(service, 'getAll').mockResolvedValue(mockActividades as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getAll(res as any, mockFilterDto);

      expect(service.getAll).toHaveBeenCalledWith(mockFilterDto);
      expect(service.count).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockActividades,
        MetaData: { Count: 2 },
      });
    });
  });

  describe('getById', () => {
    it('Debería retornar OK con id válido', async () => {
      jest.spyOn(service, 'getById').mockResolvedValue(mockDocumento as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getById(res as any, mockDocumento._id);

      expect(service.getById).toHaveBeenCalledWith(mockDocumento._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockDocumento,
      });
    });

    it('Debería retornar NotFound con id inválido', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(new Error(`${mockDocumento._id} no existe`));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getById(res as any, mockDocumento._id);

      expect(service.getById).toHaveBeenCalledWith(mockDocumento._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en servicio GetOne: la peticion contiene un parametro incorrecto o no existe un registro',
        Data: `${mockDocumento._id} no existe`,
      });
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: '',
      fields: '',
      sortby: '',
      order: '',
      limit: '',
      offset: '',
      populate: '',
    };

    beforeEach(() => {
      jest.spyOn(service, 'count').mockResolvedValue(2); // Simula retorno del método count
    });

    it('Debería retornar OK con datos válidos', async () => {
      const mockActividades = [
        {
          ...mockDocumento,
          _id: '1',
          nuxeo_id: 234,
        },
        {
          ...mockDocumento,
          _id: '2',
          nuxeo_id: 123,
        },
      ];

      jest.spyOn(service, 'getAll').mockResolvedValue(mockActividades as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getAll(res as any, mockFilterDto);

      expect(service.getAll).toHaveBeenCalledWith(mockFilterDto);
      expect(service.count).toHaveBeenCalled(); // Verifica que count es llamado
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockActividades,
        MetaData: { Count: 2 },
      });
    });
  });

  describe('delete', () => {
    it('Debería retornar OK con id válido', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.delete(res as any, mockDocumento._id);

      expect(service.delete).toHaveBeenCalledWith(mockDocumento._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: {
          _id: mockDocumento._id,
        },
      });
    });

    it('Debería retornar NotFound con error', async () => {
      const mockError = new Error('Record not found');

      jest.spyOn(service, 'delete').mockRejectedValue(mockError);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.delete(res as any, mockDocumento._id);

      expect(service.delete).toHaveBeenCalledWith(mockDocumento._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en el servicio Delete: la peticion contiene paratros incorrectos',
        Data: mockError.message,
      });
    });
  });
});
