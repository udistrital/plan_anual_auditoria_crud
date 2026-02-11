import { Test, TestingModule } from '@nestjs/testing';
import { InformeEstadoController } from './informe-estado.controller';
import { InformeEstadoDto } from './dto/informe-estado.dto';
import { InformeEstadoService } from './informe-estado.service';
import { HttpStatus } from '@nestjs/common';
import { FilterDto } from '../filters/filters.dto';

const mockInformeEstadoDTO: InformeEstadoDto = {
  informe_id: '507f1f77bcf86cd799439011',
  usuario_id: 123,
  usuario_rol: 'Auditor',
  observacion: 'Estado inicial del informe',
  estado_id: 1,
  fecha_ejecucion_estado: new Date(),
  activo: true,
  actual: true,
};

const mockInformeEstado = {
  ...mockInformeEstadoDTO,
  _id: '507f1f77bcf86cd799439012',
};

describe('InformeEstadoController', () => {
  let controller: InformeEstadoController;
  let service: InformeEstadoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InformeEstadoController],
      providers: [
        {
          provide: InformeEstadoService,
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

    controller = module.get<InformeEstadoController>(InformeEstadoController);
    service = module.get<InformeEstadoService>(InformeEstadoService);
  });

  it('Debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('post', () => {
    it('Debería retornar Created con datos válidos', async () => {
      jest.spyOn(service, 'post').mockResolvedValue(mockInformeEstado as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.post(res as any, mockInformeEstadoDTO);

      expect(service.post).toHaveBeenCalledWith(mockInformeEstadoDTO);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: mockInformeEstado,
      });
    });

    it('Debería retornar BadRequest con error', async () => {
      const mockError = new Error(
        'InformeEstado validation failed: activo: Cast to Boolean failed',
      );

      jest.spyOn(service, 'post').mockRejectedValue(mockError);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.post(res as any, mockInformeEstadoDTO);

      expect(service.post).toHaveBeenCalledWith(mockInformeEstadoDTO);
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
      const mockEstados = [
        {
          ...mockInformeEstado,
          _id: '1',
          usuario_id: 123,
        },
        {
          ...mockInformeEstado,
          _id: '2',
          usuario_id: 456,
        },
      ];

      jest.spyOn(service, 'getAll').mockResolvedValue(mockEstados as any);

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
        Data: mockEstados,
        MetaData: { Count: 2 },
      });
    });

    it('Debería retornar NotFound con error', async () => {
      const mockError = new Error('No records found');

      jest.spyOn(service, 'getAll').mockRejectedValue(mockError);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getAll(res as any, mockFilterDto);

      expect(service.getAll).toHaveBeenCalledWith(mockFilterDto);
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
    it('Debería retornar OK con id válido', async () => {
      jest
        .spyOn(service, 'getById')
        .mockResolvedValue(mockInformeEstado as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getById(res as any, mockInformeEstado._id);

      expect(service.getById).toHaveBeenCalledWith(mockInformeEstado._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockInformeEstado,
      });
    });

    it('Debería retornar NotFound con id inválido', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(new Error(`${mockInformeEstado._id} no existe`));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getById(res as any, mockInformeEstado._id);

      expect(service.getById).toHaveBeenCalledWith(mockInformeEstado._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en servicio GetOne: la peticion contiene un parametro incorrecto o no existe un registro',
        Data: `${mockInformeEstado._id} no existe`,
      });
    });
  });

  describe('put', () => {
    it('Debería retornar OK con datos válidos', async () => {
      jest.spyOn(service, 'put').mockResolvedValue(mockInformeEstado as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.put(
        res as any,
        mockInformeEstado._id,
        mockInformeEstadoDTO,
      );

      expect(service.put).toHaveBeenCalledWith(
        mockInformeEstado._id,
        mockInformeEstadoDTO,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: mockInformeEstado,
      });
    });

    it('Debería retornar BadRequest con error', async () => {
      const mockError = new Error(`${mockInformeEstado._id} no existe`);

      jest.spyOn(service, 'put').mockRejectedValue(mockError);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.put(
        res as any,
        mockInformeEstado._id,
        mockInformeEstadoDTO,
      );

      expect(service.put).toHaveBeenCalledWith(
        mockInformeEstado._id,
        mockInformeEstadoDTO,
      );
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
    it('Debería retornar OK con id válido', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.delete(res as any, mockInformeEstado._id);

      expect(service.delete).toHaveBeenCalledWith(mockInformeEstado._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: {
          _id: mockInformeEstado._id,
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

      await controller.delete(res as any, mockInformeEstado._id);

      expect(service.delete).toHaveBeenCalledWith(mockInformeEstado._id);
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
