import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { FilterDto } from '../filters/filters.dto';
import { AuditoriaEstadoDto } from './dto/auditoria-estado.dto';
import { EstadoAuditoriaService } from './auditoria-estado.service';

// Mock del ParseObjectIdPipe usando ruta relativa
jest.mock('../pipes/parse-object-id/parse-object-id.pipe');

// Importar el controlador después del mock
import { EstadoAuditoriaController } from './auditoria-estado.controller';

const mockAuditoriaEstadoDto: AuditoriaEstadoDto = {
  auditoria_id: '672d3050f7814a9a0c5261d4',
  usuario_id: 76767,
  usuario_rol: 'AUDITOR',
  observacion: 'Estado inicial de la auditoría',
  actual: true,
  estado_id: 2552,
  fase_id: 'PROGRAMACION',
  fecha_ejecucion_estado: new Date('2024-01-15'),
  activo: true,
};

const mockEstadoAuditoria = {
  ...mockAuditoriaEstadoDto,
  _id: '672d36737e962bcac5ce9beb',
};

describe('EstadoAuditoriaController', () => {
  let controller: EstadoAuditoriaController;
  let service: EstadoAuditoriaService;

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadoAuditoriaController],
      providers: [
        {
          provide: EstadoAuditoriaService,
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

    controller = module.get<EstadoAuditoriaController>(
      EstadoAuditoriaController,
    );
    service = module.get<EstadoAuditoriaService>(EstadoAuditoriaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear un estado de auditoría y retornar CREATED (201) con datos válidos', async () => {
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockResolvedValue(mockEstadoAuditoria as any);
      const res = mockResponse();

      await controller.post(res, mockAuditoriaEstadoDto);

      expect(serviceSpy).toHaveBeenCalledWith(mockAuditoriaEstadoDto);
      expect(serviceSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: mockEstadoAuditoria,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando el servicio lanza un error de validación', async () => {
      const mockError = new Error(
        'AuditoriaEstado validation failed: estado_id is required',
      );
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.post(res, mockAuditoriaEstadoDto);

      expect(serviceSpy).toHaveBeenCalledWith(mockAuditoriaEstadoDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error servicio Post: la solicitud contiene un tipo de dato incorrecto o un parametro invalido',
        Data: mockError.message,
      });
    });

    it('Debería manejar errores de relación con auditoría', async () => {
      const mockError = new Error(
        'Plan auditoria relacionada con id 672d3050f7814a9a0c5261d4 no existe',
      );
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.post(res, mockAuditoriaEstadoDto);

      expect(serviceSpy).toHaveBeenCalledWith(mockAuditoriaEstadoDto);
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
      query: 'actual: true',
      fields: 'estado_id,fase_id,observacion',
      sortby: 'fecha_ejecucion_estado',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'true',
    };

    const mockEstados = [
      {
        ...mockEstadoAuditoria,
        _id: '1',
        estado_id: 2552,
      },
      {
        ...mockEstadoAuditoria,
        _id: '2',
        estado_id: 2553,
      },
    ];

    it('Debería retornar OK (200) con todos los estados de auditoría y metadata', async () => {
      const getAllSpy = jest
        .spyOn(service, 'getAll')
        .mockResolvedValue(mockEstados as any);
      const countSpy = jest.spyOn(service, 'count').mockResolvedValue(2);
      const res = mockResponse();

      await controller.getAll(res, mockFilterDto);

      expect(getAllSpy).toHaveBeenCalledWith(mockFilterDto);
      expect(getAllSpy).toHaveBeenCalledTimes(1);
      expect(countSpy).toHaveBeenCalledWith(mockFilterDto);
      expect(countSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockEstados,
        MetaData: { Count: 2 },
      });
    });

    it('Debería retornar OK (200) con array vacío cuando no hay resultados', async () => {
      const getAllSpy = jest.spyOn(service, 'getAll').mockResolvedValue([]);
      const countSpy = jest.spyOn(service, 'count').mockResolvedValue(0);
      const res = mockResponse();

      await controller.getAll(res, mockFilterDto);

      expect(getAllSpy).toHaveBeenCalledWith(mockFilterDto);
      expect(countSpy).toHaveBeenCalledWith(mockFilterDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: [],
        MetaData: { Count: 0 },
      });
    });

    it('Debería retornar NOT_FOUND (404) cuando el servicio lanza un error', async () => {
      const mockError = new Error('Error en el filtro de búsqueda');
      const getAllSpy = jest
        .spyOn(service, 'getAll')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.getAll(res, mockFilterDto);

      expect(getAllSpy).toHaveBeenCalledWith(mockFilterDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en servicio GetAll: la peticion contiene un parametro incorrecto o no existe un registro',
        Data: mockError.message,
      });
    });
  });

  describe('getById', () => {
    it('Debería retornar OK (200) con el estado cuando el ID es válido', async () => {
      const getByIdSpy = jest
        .spyOn(service, 'getById')
        .mockResolvedValue(mockEstadoAuditoria as any);
      const res = mockResponse();

      await controller.getById(res, mockEstadoAuditoria._id);

      expect(getByIdSpy).toHaveBeenCalledWith(mockEstadoAuditoria._id);
      expect(getByIdSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockEstadoAuditoria,
      });
    });

    it('Debería retornar NOT_FOUND (404) cuando el ID no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      const mockError = new Error(`${nonExistentId} no existe`);
      const getByIdSpy = jest
        .spyOn(service, 'getById')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.getById(res, nonExistentId);

      expect(getByIdSpy).toHaveBeenCalledWith(nonExistentId);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en servicio GetOne: la peticion contiene un parametro incorrecto o no existe un registro',
        Data: mockError.message,
      });
    });

    it('Debería manejar errores de formato de ID inválido', async () => {
      const invalidId = 'invalid-id-format';
      const mockError = new Error('Cast to ObjectId failed');
      const getByIdSpy = jest
        .spyOn(service, 'getById')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.getById(res, invalidId);

      expect(getByIdSpy).toHaveBeenCalledWith(invalidId);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en servicio GetOne: la peticion contiene un parametro incorrecto o no existe un registro',
        Data: mockError.message,
      });
    });
  });

  describe('put', () => {
    const updateDto: AuditoriaEstadoDto = {
      ...mockAuditoriaEstadoDto,
      observacion: 'Observación actualizada',
      estado_id: 2553,
      actual: false,
    };

    it('Debería actualizar y retornar OK (200) con datos válidos', async () => {
      const updatedEstado = { ...mockEstadoAuditoria, ...updateDto };
      const putSpy = jest
        .spyOn(service, 'put')
        .mockResolvedValue(updatedEstado as any);
      const res = mockResponse();

      await controller.put(res, mockEstadoAuditoria._id, updateDto);

      expect(putSpy).toHaveBeenCalledWith(mockEstadoAuditoria._id, updateDto);
      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: updatedEstado,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando los datos son inválidos', async () => {
      const mockError = new Error('Validation failed');
      const putSpy = jest.spyOn(service, 'put').mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.put(res, mockEstadoAuditoria._id, updateDto);

      expect(putSpy).toHaveBeenCalledWith(mockEstadoAuditoria._id, updateDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error en servicio Put: la peticion contiene un tipo de dato incorrecto o un parametro invalido',
        Data: mockError.message,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando el ID no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      const mockError = new Error(`${nonExistentId} no existe`);
      const putSpy = jest.spyOn(service, 'put').mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.put(res, nonExistentId, updateDto);

      expect(putSpy).toHaveBeenCalledWith(nonExistentId, updateDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error en servicio Put: la peticion contiene un tipo de dato incorrecto o un parametro invalido',
        Data: mockError.message,
      });
    });
  });

  describe('delete', () => {
    it('Debería eliminar (desactivar) y retornar OK (200) con ID válido', async () => {
      const deleteSpy = jest
        .spyOn(service, 'delete')
        .mockResolvedValue(undefined);
      const res = mockResponse();

      await controller.delete(res, mockEstadoAuditoria._id);

      expect(deleteSpy).toHaveBeenCalledWith(mockEstadoAuditoria._id);
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: {
          _id: mockEstadoAuditoria._id,
        },
      });
    });

    it('Debería retornar NOT_FOUND (404) cuando el ID no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      const mockError = new Error(`${nonExistentId} no existe`);
      const deleteSpy = jest
        .spyOn(service, 'delete')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.delete(res, nonExistentId);

      expect(deleteSpy).toHaveBeenCalledWith(nonExistentId);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en el servicio Delete: la peticion contiene parametros incorrectos',
        Data: mockError.message,
      });
    });

    it('Debería manejar errores generales del servicio', async () => {
      const mockError = new Error('Database connection error');
      const deleteSpy = jest
        .spyOn(service, 'delete')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.delete(res, mockEstadoAuditoria._id);

      expect(deleteSpy).toHaveBeenCalledWith(mockEstadoAuditoria._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en el servicio Delete: la peticion contiene parametros incorrectos',
        Data: mockError.message,
      });
    });
  });
});
