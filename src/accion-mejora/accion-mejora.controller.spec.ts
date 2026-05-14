import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { FilterDto } from '../filters/filters.dto';
import { AccionMejoraDto } from './dto/accion-mejora.dto';
import { AccionMejoraService } from './accion-mejora.service';

jest.mock('../pipes/parse-object-id/parse-object-id.pipe');

import { AccionMejoraController } from './accion-mejora.controller';
import { Types } from 'mongoose';

const mockDto: AccionMejoraDto = {
  plan_mejoramiento_id: new Types.ObjectId('672d3050f7814a9a0c5261d4'),
  hallazgo_id: new Types.ObjectId('672d3050f7814a9a0c5261d5'),
  no_accion: 'AM-001',
  descripcion: 'Descripción de la acción de mejora',
  tipo_id: 1,
  nombre_indicador: 'Indicador de cumplimiento',
  formula_indicador: '(acciones cumplidas / total acciones) * 100',
  meta: '100%',
  fecha_inicio: new Date('2024-01-01'),
  fecha_fin: new Date('2024-06-30'),
  estado_id: 1,
  creado_por_id: 101,
  creado_por_rol: 'AUDITOR',
  modificado_por_id: 101,
  modificado_por_rol: 'AUDITOR',
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_modificacion: new Date('2024-01-01'),
};

const mockAccion = { ...mockDto, _id: '672d36737e962bcac5ce9beb' };

describe('AccionMejoraController', () => {
  let controller: AccionMejoraController;
  let service: AccionMejoraService;

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccionMejoraController],
      providers: [
        {
          provide: AccionMejoraService,
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

    controller = module.get<AccionMejoraController>(AccionMejoraController);
    service = module.get<AccionMejoraService>(AccionMejoraService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear una acción de mejora y retornar CREATED (201)', async () => {
      jest.spyOn(service, 'post').mockResolvedValue(mockAccion as any);
      const res = mockResponse();
      await controller.post(res, mockDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: mockAccion,
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

    it('Debería manejar errores de relación con plan de mejoramiento', async () => {
      const mockError = new Error(
        'Plan de mejoramiento relacionado con id 672d3050f7814a9a0c5261d4 no existe',
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
      fields: 'no_accion,estado_id',
      sortby: 'fecha_inicio',
      order: 'asc',
      limit: '10',
      offset: '0',
      populate: 'false',
    };

    it('Debería retornar OK (200) con todas las acciones y metadata', async () => {
      const mockList = [{ ...mockAccion, _id: '1' }, { ...mockAccion, _id: '2' }];
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
      jest.spyOn(service, 'getAll').mockRejectedValue(new Error('Filter error'));
      const res = mockResponse();
      await controller.getAll(res, mockFilterDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });
  });

  describe('getById', () => {
    it('Debería retornar OK (200) con la acción', async () => {
      jest.spyOn(service, 'getById').mockResolvedValue(mockAccion as any);
      const res = mockResponse();
      await controller.getById(res, mockAccion._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockAccion,
      });
    });

    it('Debería retornar NOT_FOUND (404) cuando el ID no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(new Error(`${nonExistentId} no existe`));
      const res = mockResponse();
      await controller.getById(res, nonExistentId);
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
    const updateDto: AccionMejoraDto = { ...mockDto, estado_id: 2 };

    it('Debería actualizar y retornar OK (200)', async () => {
      const updated = { ...mockAccion, ...updateDto };
      jest.spyOn(service, 'put').mockResolvedValue(updated as any);
      const res = mockResponse();
      await controller.put(res, mockAccion._id, updateDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: updated,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando los datos son inválidos', async () => {
      jest.spyOn(service, 'put').mockRejectedValue(new Error('Validation failed'));
      const res = mockResponse();
      await controller.put(res, mockAccion._id, updateDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('Debería retornar BAD_REQUEST (400) cuando el ID no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      jest
        .spyOn(service, 'put')
        .mockRejectedValue(new Error(`${nonExistentId} no existe`));
      const res = mockResponse();
      await controller.put(res, nonExistentId, updateDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('delete', () => {
    it('Debería eliminar y retornar OK (200)', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);
      const res = mockResponse();
      await controller.delete(res, mockAccion._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: { _id: mockAccion._id },
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
      await controller.delete(res, mockAccion._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });
  });
});
