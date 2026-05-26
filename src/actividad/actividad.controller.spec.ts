import { Test, TestingModule } from '@nestjs/testing';
import { ActividadDTO } from './dto/actividad.dto';
import { ActividadService } from './actividad.service';
import { HttpStatus } from '@nestjs/common';
import { FilterDto } from '../filters/filters.dto';

// Mock del ParseObjectIdPipe usando ruta relativa
jest.mock('../pipes/parse-object-id/parse-object-id.pipe.ts');

// Importar el controlador después del mock
import { ActividadController } from './actividad.controller';
import { Types } from 'mongoose';

const mockActividadDto: ActividadDTO = {
  auditoria_id: new Types.ObjectId('671aaa8a064222e6583d56e7'),
  titulo: 'Actividad de prueba',
  fecha_inicio: new Date('2024-01-01'),
  fecha_fin: new Date('2024-01-31'),
  referencia: 'REF-001',
  descripcion: 'Descripción de la actividad de prueba',
  observacion: 'Observaciones importantes',
  folio: 123,
  medio: 'Físico',
  carpeta: 'carpeta-prueba',
  completada: false,
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_modificacion: new Date('2024-01-01'),
};

const mockActividad = {
  ...mockActividadDto,
  _id: '671aaf35d779a09e092cb732',
};

describe('ActividadController', () => {
  let controller: ActividadController;
  let service: ActividadService;

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActividadController],
      providers: [
        {
          provide: ActividadService,
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

    controller = module.get<ActividadController>(ActividadController);
    service = module.get<ActividadService>(ActividadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear una actividad y retornar CREATED (201) con datos válidos', async () => {
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockResolvedValue(mockActividad as any);
      const res = mockResponse();

      await controller.post(res, mockActividadDto);

      expect(serviceSpy).toHaveBeenCalledWith(mockActividadDto);
      expect(serviceSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: mockActividad,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando el servicio lanza un error de validación', async () => {
      const mockError = new Error(
        'Actividad validation failed: activo: Cast to Boolean failed for value "2" (type number) at path "activo"',
      );
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.post(res, mockActividadDto);

      expect(serviceSpy).toHaveBeenCalledWith(mockActividadDto);
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
        'Auditoria relacionada con id 671aaa8a064222e6583d56e7 no existe',
      );
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.post(res, mockActividadDto);

      expect(serviceSpy).toHaveBeenCalledWith(mockActividadDto);
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
      query: 'titulo: actividad 1',
      fields: 'titulo,descripcion',
      sortby: 'fecha_creacion',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'true',
    };

    const mockActividades = [
      {
        ...mockActividad,
        _id: '1',
        titulo: 'actividad 1',
      },
      {
        ...mockActividad,
        _id: '2',
        titulo: 'actividad 2',
      },
    ];

    it('Debería retornar OK (200) con todas las actividades y metadata', async () => {
      const getAllSpy = jest
        .spyOn(service, 'getAll')
        .mockResolvedValue(mockActividades as any);
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
        Data: mockActividades,
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
    it('Debería retornar OK (200) con la actividad cuando el ID es válido', async () => {
      const getByIdSpy = jest
        .spyOn(service, 'getById')
        .mockResolvedValue(mockActividad as any);
      const res = mockResponse();

      await controller.getById(res, mockActividad._id);

      expect(getByIdSpy).toHaveBeenCalledWith(mockActividad._id);
      expect(getByIdSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockActividad,
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
    const updateDto: ActividadDTO = {
      ...mockActividadDto,
      titulo: 'Actividad actualizada',
      descripcion: 'Descripción actualizada',
      completada: true,
    };

    it('Debería actualizar y retornar OK (200) con datos válidos', async () => {
      const updatedActividad = { ...mockActividad, ...updateDto };
      const putSpy = jest
        .spyOn(service, 'put')
        .mockResolvedValue(updatedActividad as any);
      const res = mockResponse();

      await controller.put(res, mockActividad._id, updateDto);

      expect(putSpy).toHaveBeenCalledWith(mockActividad._id, updateDto);
      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: updatedActividad,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando los datos son inválidos', async () => {
      const mockError = new Error('Validation failed');
      const putSpy = jest.spyOn(service, 'put').mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.put(res, mockActividad._id, updateDto);

      expect(putSpy).toHaveBeenCalledWith(mockActividad._id, updateDto);
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

      await controller.delete(res, mockActividad._id);

      expect(deleteSpy).toHaveBeenCalledWith(mockActividad._id);
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: {
          _id: mockActividad._id,
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
          'Error en el servicio Delete: la peticion contiene paratros incorrectos',
        Data: mockError.message,
      });
    });

    it('Debería manejar errores generales del servicio', async () => {
      const mockError = new Error('Database connection error');
      const deleteSpy = jest
        .spyOn(service, 'delete')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.delete(res, mockActividad._id);

      expect(deleteSpy).toHaveBeenCalledWith(mockActividad._id);
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
