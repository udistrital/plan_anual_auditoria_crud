import { Test, TestingModule } from '@nestjs/testing';
import { ObservacionService } from './observacion.service';
import { HttpStatus } from '@nestjs/common';
import { FilterDto } from '../filters/filters.dto';
import {
  CreateObservacionDTO,
  UpdateObservacionDTO,
} from './dto/observacion.dto';

jest.mock('../pipes/parse-object-id/parse-object-id.pipe.ts');

import { ObservacionController } from './observacion.controller';

const mockCreateObservacionDto: CreateObservacionDTO = {
  hallazgo_id: '507f1f77bcf86cd799439011',
  observacion: 'Se observa incumplimiento en el proceso',
  dependencia_id: [1, 2],
  usuario_id: 42,
  usuario_rol: 'auditor',
  activo: true,
};

const mockObservacion = {
  ...mockCreateObservacionDto,
  _id: '507f1f77bcf86cd799439012',
};

describe('ObservacionController', () => {
  let controller: ObservacionController;
  let service: ObservacionService;

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObservacionController],
      providers: [
        {
          provide: ObservacionService,
          useValue: {
            agregarObservacion: jest.fn(),
            getAllObservaciones: jest.fn(),
            countObservaciones: jest.fn(),
            getObservacionById: jest.fn(),
            updateObservacion: jest.fn(),
            deleteObservacion: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ObservacionController>(ObservacionController);
    service = module.get<ObservacionService>(ObservacionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('Debería crear una observación y retornar CREATED (201)', async () => {
      const spy = jest
        .spyOn(service, 'agregarObservacion')
        .mockResolvedValue(mockObservacion as any);
      const res = mockResponse();

      await controller.create(res, mockCreateObservacionDto);

      expect(spy).toHaveBeenCalledWith(mockCreateObservacionDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Observación creada exitosamente',
        Data: mockObservacion,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando el servicio lanza un error', async () => {
      const mockError = new Error('Error al guardar en base de datos');
      jest.spyOn(service, 'agregarObservacion').mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.create(res, mockCreateObservacionDto);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message: 'Error al crear observación',
        Data: mockError.message,
      });
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'activo:true',
      fields: '',
      sortby: '',
      order: '',
      limit: '10',
      offset: '0',
      populate: '',
    };

    const mockObservaciones = [
      mockObservacion,
      { ...mockObservacion, _id: '507f1f77bcf86cd799439099' },
    ];

    it('Debería retornar OK (200) con todas las observaciones y metadata', async () => {
      jest
        .spyOn(service, 'getAllObservaciones')
        .mockResolvedValue(mockObservaciones as any);
      jest.spyOn(service, 'countObservaciones').mockResolvedValue(2);
      const res = mockResponse();

      await controller.getAll(res, mockFilterDto);

      expect(service.getAllObservaciones).toHaveBeenCalledWith(mockFilterDto);
      expect(service.countObservaciones).toHaveBeenCalledWith(mockFilterDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockObservaciones,
        MetaData: { Count: 2 },
      });
    });

    it('Debería retornar OK (200) con array vacío cuando no hay resultados', async () => {
      jest.spyOn(service, 'getAllObservaciones').mockResolvedValue([]);
      jest.spyOn(service, 'countObservaciones').mockResolvedValue(0);
      const res = mockResponse();

      await controller.getAll(res, mockFilterDto);

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
      jest.spyOn(service, 'getAllObservaciones').mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.getAll(res, mockFilterDto);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Error al obtener observaciones',
        Data: mockError.message,
      });
    });
  });

  describe('getById', () => {
    it('Debería retornar OK (200) con la observación cuando el ID es válido', async () => {
      jest
        .spyOn(service, 'getObservacionById')
        .mockResolvedValue(mockObservacion as any);
      const res = mockResponse();

      await controller.getById(res, mockObservacion._id);

      expect(service.getObservacionById).toHaveBeenCalledWith(
        mockObservacion._id,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockObservacion,
      });
    });

    it('Debería retornar NOT_FOUND (404) cuando el ID no existe', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';
      const mockError = new Error(`Observacion ${nonExistentId} no existe`);
      jest.spyOn(service, 'getObservacionById').mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.getById(res, nonExistentId);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Observación no encontrada',
        Data: mockError.message,
      });
    });
  });

  describe('update', () => {
    const updateDto: UpdateObservacionDTO = {
      observacion: 'Observación actualizada con más detalle',
      dependencia_id: [3],
    };

    it('Debería actualizar y retornar OK (200)', async () => {
      const updatedObservacion = { ...mockObservacion, ...updateDto };
      jest
        .spyOn(service, 'updateObservacion')
        .mockResolvedValue(updatedObservacion as any);
      const res = mockResponse();

      await controller.update(res, mockObservacion._id, updateDto);

      expect(service.updateObservacion).toHaveBeenCalledWith(
        mockObservacion._id,
        updateDto,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Observación actualizada exitosamente',
        Data: updatedObservacion,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando la observación no existe', async () => {
      const mockError = new Error(
        `Observacion ${mockObservacion._id} no existe`,
      );
      jest.spyOn(service, 'updateObservacion').mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.update(res, mockObservacion._id, updateDto);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message: 'Error al actualizar observación',
        Data: mockError.message,
      });
    });
  });

  describe('delete', () => {
    it('Debería marcar como inactiva y retornar OK (200)', async () => {
      const deletedObservacion = { ...mockObservacion, activo: false };
      jest
        .spyOn(service, 'deleteObservacion')
        .mockResolvedValue(deletedObservacion as any);
      const res = mockResponse();

      await controller.delete(res, mockObservacion._id);

      expect(service.deleteObservacion).toHaveBeenCalledWith(
        mockObservacion._id,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Observación eliminada exitosamente',
        Data: deletedObservacion,
      });
    });

    it('Debería retornar NOT_FOUND (404) cuando la observación no existe', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';
      const mockError = new Error(`Observacion ${nonExistentId} no existe`);
      jest.spyOn(service, 'deleteObservacion').mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.delete(res, nonExistentId);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Error al eliminar observación',
        Data: mockError.message,
      });
    });
  });
});
