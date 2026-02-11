import { Test, TestingModule } from '@nestjs/testing';
import { EstadoController } from './estado.controller';
import { PlanEstadoDto } from './dto/estado.dto';
import { EstadoService } from './estado.service';
import { HttpStatus } from '@nestjs/common';
import { FilterDto } from '../filters/filters.dto';

const mockEstadoPlanDTO: PlanEstadoDto = {
  plan_auditoria_id: '672d3050f7814a9a0c5261d4',
  usuario_id: 76767,
  observacion: 'llll',
  estado_id: 2552,
  fecha_ejecucion_estado: new Date(),
  activo: true,
};

const mockEstadoPlan = {
  ...mockEstadoPlanDTO,
  _id: '672d36737e962bcac5ce9beb',
};
describe('EstadoController', () => {
  let controller: EstadoController;
  let service: EstadoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadoController],
      providers: [
        {
          provide: EstadoService,
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

    controller = module.get<EstadoController>(EstadoController);
    service = module.get<EstadoService>(EstadoService);
  });

  it('Debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('post', () => {
    it('Debería retornar Created con datos válidos', async () => {
      jest.spyOn(service, 'post').mockResolvedValue(mockEstadoPlan as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.post(res as any, mockEstadoPlanDTO);

      expect(service.post).toHaveBeenCalledWith(mockEstadoPlanDTO);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: mockEstadoPlan,
      });
    });

    it('Debería retornar BadRequest con error', async () => {
      const mockError = new Error(
        'Auditoria validation failed: activo: Cast to Boolean failed for value "2" (type number) at path "activo"',
      );

      jest.spyOn(service, 'post').mockRejectedValue(mockError);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.post(res as any, mockEstadoPlanDTO);

      expect(service.post).toHaveBeenCalledWith(mockEstadoPlanDTO);
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
      const mockAuditorias = [
        {
          ...mockEstadoPlan,
          _id: '671aa963064222e6583d56e4',
          usuarioId: 1,
        },
        {
          ...mockEstadoPlan,
          _id: '671aaa8a064222e6583d56e7',
          usuarioId: 2,
        },
      ];

      jest.spyOn(service, 'getAll').mockResolvedValue(mockAuditorias as any);

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
        Data: mockAuditorias,
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
      jest.spyOn(service, 'getById').mockResolvedValue(mockEstadoPlan as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getById(res as any, mockEstadoPlan._id);

      expect(service.getById).toHaveBeenCalledWith(mockEstadoPlan._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockEstadoPlan,
      });
    });

    it('Debería retornar NotFound con id inválido', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(new Error(`${mockEstadoPlan._id} no existe`));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getById(res as any, mockEstadoPlan._id);

      expect(service.getById).toHaveBeenCalledWith(mockEstadoPlan._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en servicio GetOne: la peticion contiene un parametro incorrecto o no existe un registro',
        Data: `${mockEstadoPlan._id} no existe`,
      });
    });
  });

  describe('put', () => {
    it('Debería retornar OK con datos válidos', async () => {
      jest.spyOn(service, 'put').mockResolvedValue(mockEstadoPlan as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.put(res as any, mockEstadoPlan._id, mockEstadoPlanDTO);

      expect(service.put).toHaveBeenCalledWith(
        mockEstadoPlan._id,
        mockEstadoPlanDTO,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: mockEstadoPlan,
      });
    });

    it('Debería retornar BadRequest con error', async () => {
      const mockError = new Error(`${mockEstadoPlan._id} no existe`);

      jest.spyOn(service, 'put').mockRejectedValue(mockError);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.put(res as any, mockEstadoPlan._id, mockEstadoPlanDTO);

      expect(service.put).toHaveBeenCalledWith(
        mockEstadoPlan._id,
        mockEstadoPlanDTO,
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

      await controller.delete(res as any, mockEstadoPlan._id);

      expect(service.delete).toHaveBeenCalledWith(mockEstadoPlan._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: {
          _id: mockEstadoPlan._id,
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

      await controller.delete(res as any, mockEstadoPlan._id);

      expect(service.delete).toHaveBeenCalledWith(mockEstadoPlan._id);
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
