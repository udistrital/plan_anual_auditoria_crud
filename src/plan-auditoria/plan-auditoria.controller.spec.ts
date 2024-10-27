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
  creado_por_id: 10,
  estado_id: 5,
  vigencia_id: 3,
  aprobado_jefe_dependencia: true,
  jefe_dependencia_id: 5541,
  aprobado_secretario_tecnico: true,
  secretario_tecnico_id: 278,
  activo: true,
  fecha_creacion: new Date(),
  fecha_modificacion: new Date(),
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
        Message: 'Registration successful',
        Data: mockPlanAuditoria,
      });
    });

    it('Debería retornar BadRequest con error', async () => {
      const mockError = new Error(
        'ModalAlerta validation failed: activo: Cast to Boolean failed for value "2" (type number) at path "activo"',
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
          'Error service Post: The request contains an incorrect data type or an invalid parameter',
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
        Message: 'Request successful',
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
          'Error service GetAll: The request contains an incorrect parameter or no record exist',
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
        Message: 'Request successful',
        Data: mockPlanAuditoria,
      });
    });

    it('Debería retornar NotFound con id inválido', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(new Error(`${mockPlanAuditoria._id} doesn't exist`));

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
          'Error service GetOne: The request contains an incorrect parameter or no record exist',
        Data: `${mockPlanAuditoria._id} doesn't exist`,
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
        Message: 'Update successful',
        Data: mockPlanAuditoria,
      });
    });

    it('Debería retornar BadRequest con error', async () => {
      const mockError = new Error(`${mockPlanAuditoria._id} doesn't exist`);

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
          'Error service Put: The request contains an incorrect data type or an invalid parameter',
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
        Message: 'Delete successful',
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
        Message: 'Error service Delete: Request contains incorrect parameter',
        Data: mockError.message,
      });
    });
  });
});