import { Test, TestingModule } from '@nestjs/testing';
import { ActividadController } from './actividad.controller';
import { ActividadDTO } from './dto/actividad.dto'
import { ActividadService } from './actividad.service';
import { HttpStatus } from '@nestjs/common';
import { FilterDto } from '../filters/filters.dto';
import {Actividad} from './schemas/actividad.schema'

const mockActividadDto: ActividadDTO = {
  auditoriaId: "671aaa8a064222e6583d56e7",
  titulo: 'string',
  fechaInicio: new Date(),
  fechaFin: new Date(),
  referencia: 'string',
  descripcion: 'string',
  folio: 0,
  medioId: 0,
  carpeta: 'string',
  activo: true,
  fechaCreacion: new Date(),
  fechaModificacion: new Date(),
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
            count: jest.fn(),
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
        Message: 'Registro Exitoso',
        Data: mockActividadDto,
      });
    });

    it('Debería retornar BadRequest con error', async () => {
      const mockError = new Error(
        'Actividad validation failed: activo: Cast to Boolean failed for value "2" (type number) at path "activo"',
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
          'Error servicio Post: la solicitud contiene un tipo de dato incorrecto o un parametro invalido',
        Data: mockError.message,
      });
    });
  });


  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'titulo: actividad 1',
      fields: 'titulo',
      sortby: 'fechaCreacion',
      order: 'asc',
      limit: '0',
      offset: '1',
      populate: 'true',
    };
  
    beforeEach(() => {
      jest.spyOn(service, 'count').mockResolvedValue(2);
    });
  
    it('Debería retornar OK con datos válidos', async () => {
      const mockActividades = [
        {
          ...mockActividad,
          _id: '1',
          titulo: 'actividad 1',
        },
        {
          ...mockActividad,
          _id: '2',
          titulo: 'actividad 2',
        },
      ];
  
      jest.spyOn(service, 'getAll').mockResolvedValue(mockActividades as any);
  
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
        Data: mockActividades,
        MetaData: { Count: 2 },
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
        Message: 'Peticion Exitosa',
        Data: mockActividad,
      });
    });

    it('Debería retornar NotFound con id inválido', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(new Error(`${mockActividad._id} no existe`));

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
          'Error en servicio GetOne: la peticion contiene un parametro incorrecto o no existe un registro',
        Data: `${mockActividad._id} no existe`,
      });
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'titulo: actividad 1',
      fields: 'titulo',
      sortby: 'fechaCreacion',
      order: 'asc',
      limit: '0',
      offset: '1',
      populate: 'true',
    };
  
    beforeEach(() => {
      jest.spyOn(service, 'count').mockResolvedValue(2); // Simula retorno del método count
    });
  
    it('Debería retornar OK con datos válidos', async () => {
      const mockActividades = [
        {
          ...mockActividad,
          _id: '1',
          titulo: 'actividad 1',
        },
        {
          ...mockActividad,
          _id: '2',
          titulo: 'actividad 2',
        },
      ];
    
      jest.spyOn(service, 'getAll').mockResolvedValue(mockActividades as any);
  
    
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await controller.getAll(res as any, mockFilterDto);
  
      expect(service.getAll).toHaveBeenCalledWith(mockFilterDto);
      expect(service.count).toHaveBeenCalled(); // Verifica que count es llamado
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockActividades,
        MetaData: { Count: 2 },
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
        Message: 'Eliminacion Exitosa',
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
        Message: 'Error en el servicio Delete: la peticion contiene paratros incorrectos',
        Data: mockError.message,
      });
    });
  });
});