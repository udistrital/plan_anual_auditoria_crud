import { Test, TestingModule } from '@nestjs/testing';
import { HallazgoRemisionService } from './hallazgo-remision.service';
import { HttpStatus } from '@nestjs/common';
import { HallazgoRemisionDTO } from './dto/hallazgo-remision.dto';
import { FilterDto } from '../filters/filters.dto';
import { Types } from 'mongoose';

jest.mock('../pipes/parse-object-id/parse-object-id.pipe');

import { HallazgoRemisionController } from './hallazgo-remision.controller';

const mockHallazgoRemisionDTO: HallazgoRemisionDTO = {
  hallazgo_id: new Types.ObjectId('67197dda3416d2a85e5d6d8f'),
  dependencia_origen_id: 123,
  dependencia_destino_id: [456],
  usuario_id: 789,
  usuario_rol: 'Auditor',
  observacion: 'Se remite por competencia',
  estado: 'pendiente',
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_modificacion: new Date('2024-01-01'),
};

const mockHallazgoRemision = {
  ...mockHallazgoRemisionDTO,
  _id: '671aaa8a064222e6583d56e7',
};

describe('HallazgoRemisionController', () => {
  let controller: HallazgoRemisionController;
  let service: HallazgoRemisionService;

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HallazgoRemisionController],
      providers: [
        {
          provide: HallazgoRemisionService,
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

    controller = module.get<HallazgoRemisionController>(
      HallazgoRemisionController,
    );
    service = module.get<HallazgoRemisionService>(HallazgoRemisionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debería estar definido', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear una remisión de hallazgo y retornar CREATED (201) con datos válidos', async () => {
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockResolvedValue(mockHallazgoRemision as any);
      const res = mockResponse();

      await controller.post(res, mockHallazgoRemisionDTO);

      expect(serviceSpy).toHaveBeenCalledWith(mockHallazgoRemisionDTO);
      expect(serviceSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: mockHallazgoRemision,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando el servicio lanza un error de validación', async () => {
      const mockError = new Error('Validation failed');
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.post(res, mockHallazgoRemisionDTO);

      expect(serviceSpy).toHaveBeenCalledWith(mockHallazgoRemisionDTO);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error servicio Post: la solicitud contiene un tipo de dato incorrecto o un parametro invalido',
        Data: mockError.message,
      });
    });

    it('Debería manejar errores de relación con hallazgo', async () => {
      const mockError = new Error(
        'Hallazgo relacionado con id 67197dda3416d2a85e5d6d8f no existe',
      );
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.post(res, mockHallazgoRemisionDTO);

      expect(serviceSpy).toHaveBeenCalledWith(mockHallazgoRemisionDTO);
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
      query: 'hallazgo_id:67197dda3416d2a85e5d6d8f',
      fields: 'observacion,estado',
      sortby: 'fecha_creacion',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'true',
    };

    const mockHallazgosRemision = [
      {
        ...mockHallazgoRemision,
        _id: '671aa963064222e6583d56e4',
      },
      {
        ...mockHallazgoRemision,
        _id: '671aaa8a064222e6583d56e7',
      },
    ];

    it('Debería retornar OK (200) con todas las remisiones y metadata', async () => {
      const getAllSpy = jest
        .spyOn(service, 'getAll')
        .mockResolvedValue(mockHallazgosRemision as any);
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
        Data: mockHallazgosRemision,
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
    it('Debería retornar OK (200) con la remisión cuando el ID es válido', async () => {
      const getByIdSpy = jest
        .spyOn(service, 'getById')
        .mockResolvedValue(mockHallazgoRemision as any);
      const res = mockResponse();

      await controller.getById(res, mockHallazgoRemision._id);

      expect(getByIdSpy).toHaveBeenCalledWith(mockHallazgoRemision._id);
      expect(getByIdSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockHallazgoRemision,
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
  });

  describe('put', () => {
    const updateDto: HallazgoRemisionDTO = {
      ...mockHallazgoRemisionDTO,
      observacion: 'Observación actualizada',
      estado: 'aceptada',
    };

    it('Debería actualizar y retornar OK (200) con datos válidos', async () => {
      const updatedRemision = { ...mockHallazgoRemision, ...updateDto };
      const putSpy = jest
        .spyOn(service, 'put')
        .mockResolvedValue(updatedRemision as any);
      const res = mockResponse();

      await controller.put(res, mockHallazgoRemision._id, updateDto);

      expect(putSpy).toHaveBeenCalledWith(mockHallazgoRemision._id, updateDto);
      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: updatedRemision,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando los datos son inválidos', async () => {
      const mockError = new Error('Validation failed');
      const putSpy = jest.spyOn(service, 'put').mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.put(res, mockHallazgoRemision._id, updateDto);

      expect(putSpy).toHaveBeenCalledWith(mockHallazgoRemision._id, updateDto);
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

      await controller.delete(res, mockHallazgoRemision._id);

      expect(deleteSpy).toHaveBeenCalledWith(mockHallazgoRemision._id);
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: {
          _id: mockHallazgoRemision._id,
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
  });
});
