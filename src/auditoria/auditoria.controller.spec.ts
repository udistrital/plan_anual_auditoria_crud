import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaService } from './auditoria.service';
import { HttpStatus } from '@nestjs/common';
import { AuditoriaDTO } from './dto/auditoria.dto';
import { FilterDto } from '../filters/filters.dto';

// Mock del ParseObjectIdPipe usando ruta relativa
jest.mock('../pipes/parse-object-id/parse-object-id.pipe');

// Importar el controlador después del mock
import { AuditoriaController } from './auditoria.controller';
import { Types } from 'mongoose';

const mockAuditoriaDTO: AuditoriaDTO = {
  plan_auditoria_id: new Types.ObjectId('67197dda3416d2a85e5d6d8f'),
  auditoria_padre_id: new Types.ObjectId('67297dda3416d2a85e5d6d90'),
  subtitulo: 'prueba',
  cronograma_id: [1, 2, 3],
  estado_id: 3,
  consecutivo_no_auditoria: 123420,
  vigencia_id: 1234,
  consecutivo_OCI: 'EHS54F',
  consecutivo_IE: 'PASJF4532',
  fecha_inicio: new Date('2024-01-01'),
  fecha_fin: new Date('2024-12-31'),
  objetivo: 'Evaluar el cumplimiento de procesos',
  alcance: 'Procesos administrativos y financieros',
  criterio: 'Normas ISO 9001',
  rec_tecnologico: 'Software de auditoría',
  rec_humano: 'Equipo de 5 auditores',
  rec_fisico: 'Oficinas y equipos',
  tema: 'Gestión de calidad, procesos, controles',
  correo_complementario: [{ dependencia_id: 30, correo: 'correo@email.com' }],
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_modificacion: new Date('2024-01-01'),
};

const mockAuditoria = {
  ...mockAuditoriaDTO,
  _id: '671aaa8a064222e6583d56e7',
};

describe('AuditoriaController', () => {
  let controller: AuditoriaController;
  let service: AuditoriaService;

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditoriaController],
      providers: [
        {
          provide: AuditoriaService,
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

    controller = module.get<AuditoriaController>(AuditoriaController);
    service = module.get<AuditoriaService>(AuditoriaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debería estar definido', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear una auditoría y retornar CREATED (201) con datos válidos', async () => {
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockResolvedValue(mockAuditoria as any);
      const res = mockResponse();

      await controller.post(res, mockAuditoriaDTO);

      expect(serviceSpy).toHaveBeenCalledWith(mockAuditoriaDTO);
      expect(serviceSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: mockAuditoria,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando el servicio lanza un error de validación', async () => {
      const mockError = new Error(
        'Auditoria validation failed: activo: Cast to Boolean failed for value "2" (type number) at path "activo"',
      );
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.post(res, mockAuditoriaDTO);

      expect(serviceSpy).toHaveBeenCalledWith(mockAuditoriaDTO);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error servicio Post: la solicitud contiene un tipo de dato incorrecto o un parametro invalido',
        Data: mockError.message,
      });
    });

    it('Debería manejar errores de relación con plan de auditoría', async () => {
      const mockError = new Error(
        'Plan auditoria relacionada con id 67197dda3416d2a85e5d6d8f no existe',
      );
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.post(res, mockAuditoriaDTO);

      expect(serviceSpy).toHaveBeenCalledWith(mockAuditoriaDTO);
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
      query: 'estado_id: 3',
      fields: 'titulo,objetivo,alcance',
      sortby: 'fecha_creacion',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'true',
    };

    const mockAuditorias = [
      {
        ...mockAuditoria,
        _id: '671aa963064222e6583d56e4',
        titulo: 'Auditoría 1',
      },
      {
        ...mockAuditoria,
        _id: '671aaa8a064222e6583d56e7',
        titulo: 'Auditoría 2',
      },
    ];

    it('Debería retornar OK (200) con todas las auditorías y metadata', async () => {
      const getAllSpy = jest
        .spyOn(service, 'getAll')
        .mockResolvedValue(mockAuditorias as any);
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
        Data: mockAuditorias,
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
      const mockError = new Error('No records found');
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
    it('Debería retornar OK (200) con la auditoría cuando el ID es válido', async () => {
      const getByIdSpy = jest
        .spyOn(service, 'getById')
        .mockResolvedValue(mockAuditoria as any);
      const res = mockResponse();

      await controller.getById(res, mockAuditoria._id);

      expect(getByIdSpy).toHaveBeenCalledWith(mockAuditoria._id);
      expect(getByIdSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockAuditoria,
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
    const updateDto: AuditoriaDTO = {
      ...mockAuditoriaDTO,
      objetivo: 'Objetivo actualizado',
      alcance: 'Alcance ampliado',
    };

    it('Debería actualizar y retornar OK (200) con datos válidos', async () => {
      const updatedAuditoria = { ...mockAuditoria, ...updateDto };
      const putSpy = jest
        .spyOn(service, 'put')
        .mockResolvedValue(updatedAuditoria as any);
      const res = mockResponse();

      await controller.put(res, mockAuditoria._id, updateDto);

      expect(putSpy).toHaveBeenCalledWith(mockAuditoria._id, updateDto);
      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: updatedAuditoria,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando los datos son inválidos', async () => {
      const mockError = new Error('Validation failed');
      const putSpy = jest.spyOn(service, 'put').mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.put(res, mockAuditoria._id, updateDto);

      expect(putSpy).toHaveBeenCalledWith(mockAuditoria._id, updateDto);
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

      await controller.delete(res, mockAuditoria._id);

      expect(deleteSpy).toHaveBeenCalledWith(mockAuditoria._id);
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: {
          _id: mockAuditoria._id,
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

      await controller.delete(res, mockAuditoria._id);

      expect(deleteSpy).toHaveBeenCalledWith(mockAuditoria._id);
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
