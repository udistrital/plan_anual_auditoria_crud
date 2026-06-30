import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { FilterDto } from '../filters/filters.dto';
import { CalificacionAccionDto } from './dto/calificacion-accion.dto';
import { CalificacionAccionService } from './calificacion-accion.service';

jest.mock('../pipes/parse-object-id/parse-object-id.pipe');

import { CalificacionAccionController } from './calificacion-accion.controller';
import { Types } from 'mongoose';

const mockDto: CalificacionAccionDto = {
  accion_mejora_id: new Types.ObjectId('672d3050f7814a9a0c5261d4'),
  auditor_id: 55,
  criterio_evaluacion: 1,
  calificacion: 4,
  observacion: 'Buen avance en la implementación',
  fecha_calificacion: new Date('2024-03-15'),
  actual: true,
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_modificacion: new Date('2024-01-01'),
};

const mockCalificacion = { ...mockDto, _id: '672d36737e962bcac5ce9bed' };

describe('CalificacionAccionController', () => {
  let controller: CalificacionAccionController;
  let service: CalificacionAccionService;

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalificacionAccionController],
      providers: [
        {
          provide: CalificacionAccionService,
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

    controller = module.get<CalificacionAccionController>(
      CalificacionAccionController,
    );
    service = module.get<CalificacionAccionService>(CalificacionAccionService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear una calificación y retornar CREATED (201)', async () => {
      jest.spyOn(service, 'post').mockResolvedValue(mockCalificacion as any);
      const res = mockResponse();
      await controller.post(res, mockDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: mockCalificacion,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando el servicio lanza un error', async () => {
      const mockError = new Error('Validation failed');
      jest.spyOn(service, 'post').mockRejectedValue(mockError);
      const res = mockResponse();
      await controller.post(res, mockDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error servicio Post: la solicitud contiene un tipo de dato incorrecto o un parametro invalido',
        Data: mockError.message,
      });
    });

    it('Debería manejar errores de relación con acción de mejora', async () => {
      const mockError = new Error(
        'Acción de mejora relacionada con id 672d3050f7814a9a0c5261d4 no existe',
      );
      jest.spyOn(service, 'post').mockRejectedValue(mockError);
      const res = mockResponse();
      await controller.post(res, mockDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'activo:true',
      fields: 'calificacion,observacion',
      sortby: 'fecha_calificacion',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'false',
    };

    it('Debería retornar OK (200) con todas las calificaciones y metadata', async () => {
      const mockList = [
        { ...mockCalificacion, _id: '1' },
        { ...mockCalificacion, _id: '2' },
      ];
      jest.spyOn(service, 'getAll').mockResolvedValue(mockList as any);
      jest.spyOn(service, 'count').mockResolvedValue(2);
      const res = mockResponse();
      await controller.getAll(res, mockFilterDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockList,
        MetaData: { Count: 2 },
      });
    });

    it('Debería retornar OK (200) con array vacío', async () => {
      jest.spyOn(service, 'getAll').mockResolvedValue([]);
      jest.spyOn(service, 'count').mockResolvedValue(0);
      const res = mockResponse();
      await controller.getAll(res, mockFilterDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ Data: [], MetaData: { Count: 0 } }),
      );
    });

    it('Debería retornar NOT_FOUND (404) cuando el servicio lanza un error', async () => {
      jest
        .spyOn(service, 'getAll')
        .mockRejectedValue(new Error('Filter error'));
      const res = mockResponse();
      await controller.getAll(res, mockFilterDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });
  });

  describe('getById', () => {
    it('Debería retornar OK (200) con la calificación', async () => {
      jest.spyOn(service, 'getById').mockResolvedValue(mockCalificacion as any);
      const res = mockResponse();
      await controller.getById(res, mockCalificacion._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockCalificacion,
      });
    });

    it('Debería retornar NOT_FOUND (404) cuando el ID no existe', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(new Error('nonexistent no existe'));
      const res = mockResponse();
      await controller.getById(res, 'nonexistent');
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    it('Debería manejar errores de ID inválido', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(new Error('Cast to ObjectId failed'));
      const res = mockResponse();
      await controller.getById(res, 'invalid-id');
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });
  });

  describe('put', () => {
    const updateDto: CalificacionAccionDto = {
      ...mockDto,
      calificacion: 5,
      observacion: 'Excelente avance',
    };

    it('Debería actualizar y retornar OK (200)', async () => {
      const updated = { ...mockCalificacion, ...updateDto };
      jest.spyOn(service, 'put').mockResolvedValue(updated as any);
      const res = mockResponse();
      await controller.put(res, mockCalificacion._id, updateDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: updated,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando los datos son inválidos', async () => {
      jest
        .spyOn(service, 'put')
        .mockRejectedValue(new Error('Validation failed'));
      const res = mockResponse();
      await controller.put(res, mockCalificacion._id, updateDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('Debería retornar BAD_REQUEST (400) cuando el ID no existe', async () => {
      jest
        .spyOn(service, 'put')
        .mockRejectedValue(new Error('nonexistent no existe'));
      const res = mockResponse();
      await controller.put(res, 'nonexistent', updateDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('delete', () => {
    it('Debería eliminar y retornar OK (200)', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);
      const res = mockResponse();
      await controller.delete(res, mockCalificacion._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: { _id: mockCalificacion._id },
      });
    });

    it('Debería retornar NOT_FOUND (404) cuando el ID no existe', async () => {
      jest
        .spyOn(service, 'delete')
        .mockRejectedValue(new Error('nonexistent no existe'));
      const res = mockResponse();
      await controller.delete(res, 'nonexistent');
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    it('Debería manejar errores generales del servicio', async () => {
      jest
        .spyOn(service, 'delete')
        .mockRejectedValue(new Error('Database connection error'));
      const res = mockResponse();
      await controller.delete(res, mockCalificacion._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });
  });
});
