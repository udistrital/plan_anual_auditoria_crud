import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';
import { HttpStatus } from '@nestjs/common';
import { AuditoriaDTO } from './dto/auditoria.dto';
import { FilterDto } from '../filters/filters.dto';

const mockAuditoriaDTO: AuditoriaDTO = {
  titulo: "auditoria 1",
  tipo_evaluacion_id: 2,
  plan_uditoria_id: "67197dda3416d2a85e5d6d8f",
  cronograma_actividad: Array (3),
  estado_id: 3,
  no_auditoria: 123420,
  consecutivo_OCI: "EHS54F",
  consecutivo_IE: "PASJF4532",
  tipo_id: 3,
  macroproceso: 4,
  lider: 3,
  responsable: 34,
  fechaInicio: new Date(),
  fechaFin: new Date(),
  objetivo: "objetivo",
  alcance: "alcance",
  criterio: "criterio",
  rec_tecnologico: "rec_T",
  rec_humano: "rec_H",
  rec_fisico: "rec_F",
  activo: true,
  fecha_creacion: new Date(),
  fecha_modificacion: new Date(),
};

const mockAuditoria = {
  ...mockAuditoriaDTO,
  _id: '67197dda3416d2a85e5d6d8f',
};

describe('AuditoriaController', () => {
  let controller: AuditoriaController;
  let service: AuditoriaService;

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
          },
        },
      ],
    }).compile();

    controller = module.get<AuditoriaController>(AuditoriaController);
    service = module.get<AuditoriaService>(AuditoriaService);
  });

  it('Debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('post', () => {
    it('Debería retornar Created con datos válidos', async () => {
      jest.spyOn(service, 'post').mockResolvedValue(mockAuditoria as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.post(res as any, mockAuditoriaDTO);

      expect(service.post).toHaveBeenCalledWith(mockAuditoriaDTO);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registration successful',
        Data: mockAuditoria,
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

      await controller.post(res as any, mockAuditoriaDTO);

      expect(service.post).toHaveBeenCalledWith(mockAuditoriaDTO);
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
      const mockAuditorias = [
        {
          ...mockAuditoria,
          _id: '671aa963064222e6583d56e4',
          titulo: 'Alerta 1',
        },
        {
          ...mockAuditoria,
          _id: '671aaa8a064222e6583d56e7',
          titulo: 'Alerta 2',
        },
      ];

      jest.spyOn(service, 'getAll').mockResolvedValue(mockAuditorias as any);

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
        Data: mockAuditorias,
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
      jest.spyOn(service, 'getById').mockResolvedValue(mockAuditoria as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getById(res as any, mockAuditoria._id);

      expect(service.getById).toHaveBeenCalledWith(mockAuditoria._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Request successful',
        Data: mockAuditoria,
      });
    });

    it('Debería retornar NotFound con id inválido', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(new Error(`${mockAuditoria._id} doesn't exist`));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getById(res as any, mockAuditoria._id);

      expect(service.getById).toHaveBeenCalledWith(mockAuditoria._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error service GetOne: The request contains an incorrect parameter or no record exist',
        Data: `${mockAuditoria._id} doesn't exist`,
      });
    });
  });

  describe('put', () => {
    it('Debería retornar OK con datos válidos', async () => {
      jest.spyOn(service, 'put').mockResolvedValue(mockAuditoria as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.put(res as any, mockAuditoria._id, mockAuditoriaDTO);

      expect(service.put).toHaveBeenCalledWith(
        mockAuditoria._id,
        mockAuditoriaDTO,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Update successful',
        Data: mockAuditoria,
      });
    });

    it('Debería retornar BadRequest con error', async () => {
      const mockError = new Error(`${mockAuditoria._id} doesn't exist`);

      jest.spyOn(service, 'put').mockRejectedValue(mockError);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.put(res as any, mockAuditoria._id, mockAuditoriaDTO);

      expect(service.put).toHaveBeenCalledWith(
        mockAuditoria._id,
        mockAuditoriaDTO,
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

      await controller.delete(res as any, mockAuditoria._id);

      expect(service.delete).toHaveBeenCalledWith(mockAuditoria._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Delete successful',
        Data: {
          _id: mockAuditoria._id,
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

      await controller.delete(res as any, mockAuditoria._id);

      expect(service.delete).toHaveBeenCalledWith(mockAuditoria._id);
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