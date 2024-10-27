import { Test, TestingModule } from '@nestjs/testing';
import { ActividadController } from './actividad.controller';
import {ActividadDTO} from './dto/actividad.dto'
import { ActividadService } from './actividad.service';
import { HttpStatus } from '@nestjs/common';
import { FilterDto } from '../filters/filters.dto';

const mockActividadDto: ActividadDTO = {
  auditoria_id: "671aa963064222e6583d56e4",
  titulo: 'string',
  fechaInicio: new Date(),
  fechaFin: new Date(),
  referencia: 'string',
  descripcion: 'string',
  folio: 0,
  medio_id: 0,
  carpeta: 'string',
  activo: true,
  fecha_creacion: new Date(),
  fecha_modificacion: new Date(),
};

const mockActividad = {
  ...mockActividadDto,
  _id: '671aaf35d779a09e092cb732',
};

describe('ActividadController', () => {
  let controller: ActividadController;
  let service: ActividadService;

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
          },
        },
      ],
    }).compile();

    controller = module.get<ActividadController>(ActividadController);
    service = module.get<ActividadService>(ActividadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('post', () => {
    it('Debería retornar Created con datos válidos', async () => {
      jest.spyOn(service, 'post').mockResolvedValue(mockActividadDto as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.post(res as any, mockActividadDto);

      expect(service.post).toHaveBeenCalledWith(mockActividadDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registration successful',
        Data: mockActividadDto,
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

      await controller.post(res as any, mockActividadDto);

      expect(service.post).toHaveBeenCalledWith(mockActividadDto);
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
    const mockActividad = [
      {
        ...mockActividadDto,
        _id: '671aaf35d779a09e092cb732',
        titulo: 'Alerta 1',
      },
      {
        ...mockActividadDto,
        _id: '671aaf82d779a09e092cb735',
        titulo: 'Alerta 2',
      },
    ];

    jest.spyOn(service, 'getAll').mockResolvedValue(mockActividad as any);

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
      Data: mockActividad,
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
    jest.spyOn(service, 'getById').mockResolvedValue(mockActividad as any);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await controller.getById(res as any, mockActividad._id);

    expect(service.getById).toHaveBeenCalledWith(mockActividad._id);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({
      Success: true,
      Status: HttpStatus.OK,
      Message: 'Request successful',
      Data: mockActividad,
    });
  });

  it('Debería retornar NotFound con id inválido', async () => {
    jest
      .spyOn(service, 'getById')
      .mockRejectedValue(new Error(`${mockActividad._id} doesn't exist`));

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await controller.getById(res as any, mockActividad._id);

    expect(service.getById).toHaveBeenCalledWith(mockActividad._id);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith({
      Success: false,
      Status: HttpStatus.NOT_FOUND,
      Message:
        'Error service GetOne: The request contains an incorrect parameter or no record exist',
      Data: `${mockActividad._id} doesn't exist`,
    });
  });
});

describe('put', () => {
  it('Debería retornar OK con datos válidos', async () => {
    jest.spyOn(service, 'put').mockResolvedValue(mockActividad as any);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await controller.put(res as any, mockActividad._id, mockActividadDto);

    expect(service.put).toHaveBeenCalledWith(
      mockActividad._id,
      mockActividadDto,
    );
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({
      Success: true,
      Status: HttpStatus.OK,
      Message: 'Update successful',
      Data: mockActividad,
    });
  });

  it('Debería retornar BadRequest con error', async () => {
    const mockError = new Error(`${mockActividad._id} doesn't exist`);

    jest.spyOn(service, 'put').mockRejectedValue(mockError);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await controller.put(res as any, mockActividad._id, mockActividadDto);

    expect(service.put).toHaveBeenCalledWith(
      mockActividad._id,
      mockActividadDto,
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

    await controller.delete(res as any, mockActividad._id);

    expect(service.delete).toHaveBeenCalledWith(mockActividad._id);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({
      Success: true,
      Status: HttpStatus.OK,
      Message: 'Delete successful',
      Data: {
        _id: mockActividad._id,
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

    await controller.delete(res as any, mockActividad._id);

    expect(service.delete).toHaveBeenCalledWith(mockActividad._id);
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