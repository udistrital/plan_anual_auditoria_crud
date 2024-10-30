import { Test, TestingModule } from '@nestjs/testing';
import { PlanAuditoriaController } from './plan-auditoria.controller';
import { PlanAuditoriaService } from './plan-auditoria.service';
import { HttpStatus } from '@nestjs/common';
import { PlanAuditoriaDTO } from './dto/plan-auditoria.dto';
import { FilterDto } from '../filters/filters.dto';

const mockPlanAuditoriaDTO: PlanAuditoriaDTO = {
  objetivo: "el objetivo es",
  alcance: "asdasd",
  criterio: "criterio de los criterios",
  recurso: "los recursos son",
  creadoPorId: 10,
  estadoId: 5,
  vigenciaId: 3,
  aprobadoJefeDependencia: true,
  jefeDependenciaId: 5541,
  aprobadoSecretarioTecnico: true,
  secretarioTecnicoId: 278,
  activo: true,
  fechaCreacion: new Date(),
  fechaModificacion: new Date(),
};

const mockPlanAuditoria = {
  ...mockPlanAuditoriaDTO,
  _id: '67197dda3416d2a85e5d6d8f',
};

describe('PlanAuditoriaController', () => {
  let controller: PlanAuditoriaController;
  let service: PlanAuditoriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanAuditoriaController],
      providers: [
        {
          provide: PlanAuditoriaService,
          useValue: {
            post: jest.fn(),
            getAll: jest.fn(),
            getById: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PlanAuditoriaController>(PlanAuditoriaController);
    service = module.get<PlanAuditoriaService>(PlanAuditoriaService);
  });

  it('Debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('post', () => {
    it('Debería retornar Created con datos válidos', async () => {
      jest.spyOn(service, 'post').mockResolvedValue(mockPlanAuditoria as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.post(res as any, mockPlanAuditoriaDTO);

      expect(service.post).toHaveBeenCalledWith(mockPlanAuditoriaDTO);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: mockPlanAuditoria,
      });
    });

    it('Debería retornar BadRequest con error', async () => {
      const mockError = new Error(
        'Plan Auditoria validation failed: activo: Cast to Boolean failed for value "2" (type number) at path "activo"',
      );

      jest.spyOn(service, 'post').mockRejectedValue(mockError);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.post(res as any, mockPlanAuditoriaDTO);

      expect(service.post).toHaveBeenCalledWith(mockPlanAuditoriaDTO);
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

    it('Debería retornar OK con datos válidos', async () => {
      const mockPlanAuditorias = [
        {
          ...mockPlanAuditoria,
          _id: '67197dda3416d2a85e5d6d8f',
          titulo: 'Alerta 1',
        },
        {
          ...mockPlanAuditoria,
          _id: '67197f9a3416d2a85e5d6d93',
          titulo: 'Alerta 2',
        },
      ];

      jest.spyOn(service, 'getAll').mockResolvedValue(mockPlanAuditorias as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getAll(res as any, mockFilterDto);

      expect(service.getAll).toHaveBeenCalledWith(mockFilterDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockPlanAuditorias,
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
      jest.spyOn(service, 'getById').mockResolvedValue(mockPlanAuditoria as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getById(res as any, mockPlanAuditoria._id);

      expect(service.getById).toHaveBeenCalledWith(mockPlanAuditoria._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockPlanAuditoria,
      });
    });

    it('Debería retornar NotFound con id inválido', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(new Error(`${mockPlanAuditoria._id} no existe`));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getById(res as any, mockPlanAuditoria._id);

      expect(service.getById).toHaveBeenCalledWith(mockPlanAuditoria._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en servicio GetOne: la peticion contiene un parametro incorrecto o no existe un registro',
        Data: `${mockPlanAuditoria._id} no existe`,
      });
    });
  });

  describe('put', () => {
    it('Debería retornar OK con datos válidos', async () => {
      jest.spyOn(service, 'put').mockResolvedValue(mockPlanAuditoria as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.put(res as any, mockPlanAuditoria._id, mockPlanAuditoriaDTO);

      expect(service.put).toHaveBeenCalledWith(
        mockPlanAuditoria._id,
        mockPlanAuditoriaDTO,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: mockPlanAuditoria,
      });
    });

    it('Debería retornar BadRequest con error', async () => {
      const mockError = new Error(`${mockPlanAuditoria._id} no existe`);

      jest.spyOn(service, 'put').mockRejectedValue(mockError);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.put(res as any, mockPlanAuditoria._id, mockPlanAuditoriaDTO);

      expect(service.put).toHaveBeenCalledWith(
        mockPlanAuditoria._id,
        mockPlanAuditoriaDTO,
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

      await controller.delete(res as any, mockPlanAuditoria._id);

      expect(service.delete).toHaveBeenCalledWith(mockPlanAuditoria._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: {
          _id: mockPlanAuditoria._id,
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

      await controller.delete(res as any, mockPlanAuditoria._id);

      expect(service.delete).toHaveBeenCalledWith(mockPlanAuditoria._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Error en el servicio Delete: la peticion contiene paratros incorrectos',
        Data: mockError.message,
      });
    });
  });
});