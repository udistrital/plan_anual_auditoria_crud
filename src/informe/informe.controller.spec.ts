import { Test, TestingModule } from '@nestjs/testing';
import { InformeController } from './informe.controller';
import { InformeDTO } from './dto/informe.dto';
import { InformeService } from './informe.service';
import { HttpStatus } from '@nestjs/common';
import { FilterDto } from '../filters/filters.dto';
import { InformeEstadoService } from '../informe-estado/informe-estado.service';

const mockInformeDto: InformeDTO = {
  auditoria_id: '507f1f77bcf86cd799439011',
  fecha_emision: new Date('2024-01-20'),
  muestra: 'Muestra de prueba',
  activo: true,
  fecha_creacion: new Date(),
};

const mockInforme = {
  ...mockInformeDto,
  _id: '507f1f77bcf86cd799439012',
};

describe('InformeController', () => {
  let controller: InformeController;
  let service: InformeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InformeController],
      providers: [
        {
          provide: InformeService,
          useValue: {
            post: jest.fn(),
            getAll: jest.fn(),
            getById: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            getHallazgosByInforme: jest.fn(),
          },
        },
        {
          provide: InformeEstadoService,  
          useValue: {
            getAll: jest.fn(),
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<InformeController>(InformeController);
    service = module.get<InformeService>(InformeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('post', () => {
    it('Debería retornar Created con datos válidos', async () => {
      jest.spyOn(service, 'post').mockResolvedValue(mockInformeDto as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.post(res as any, mockInformeDto);

      expect(service.post).toHaveBeenCalledWith(mockInformeDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: mockInformeDto,
      });
    });

    it('Debería retornar BadRequest con error', async () => {
      const mockError = new Error(
        'Informe validation failed: activo: Cast to Boolean failed',
      );

      jest.spyOn(service, 'post').mockRejectedValue(mockError);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.post(res as any, mockInformeDto);

      expect(service.post).toHaveBeenCalledWith(mockInformeDto);
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
      const mockInformes = [
        {
          ...mockInforme,
          _id: '1',
          muestra: 'informe 1',
        },
        {
          ...mockInforme,
          _id: '2',
          muestra: 'informe 2',
        },
      ];

      jest.spyOn(service, 'getAll').mockResolvedValue(mockInformes as any);

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
        Data: mockInformes,
        MetaData: { Count: 2 },
      });
    });
  });

  describe('getById', () => {
    it('Debería retornar OK con id válido', async () => {
      jest.spyOn(service, 'getById').mockResolvedValue(mockInforme as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getById(res as any, mockInforme._id);

      expect(service.getById).toHaveBeenCalledWith(mockInforme._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockInforme,
      });
    });

    it('Debería retornar NotFound con id inválido', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(new Error(`${mockInforme._id} no existe`));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getById(res as any, mockInforme._id);

      expect(service.getById).toHaveBeenCalledWith(mockInforme._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en servicio GetOne: la peticion contiene un parametro incorrecto o no existe un registro',
        Data: `${mockInforme._id} no existe`,
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

      await controller.delete(res as any, mockInforme._id);

      expect(service.delete).toHaveBeenCalledWith(mockInforme._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: {
          _id: mockInforme._id,
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

      await controller.delete(res as any, mockInforme._id);

      expect(service.delete).toHaveBeenCalledWith(mockInforme._id);
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

  describe('getHallazgos', () => {
    it('Debería retornar hallazgos del informe', async () => {
      const mockHallazgos = [
        {
          _id: 'hall1',
          titulo: 'Hallazgo 1',
          criterio: 'Criterio 1',
          descripcion: 'Descripción 1',
        },
      ];

      jest
        .spyOn(service, 'getHallazgosByInforme')
        .mockResolvedValue(mockHallazgos as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getHallazgos(res as any, mockInforme._id);

      expect(service.getHallazgosByInforme).toHaveBeenCalledWith(
        mockInforme._id,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockHallazgos,
        MetaData: { Count: 1 },
      });
    });

    it('Debería retornar NotFound si el informe no existe', async () => {
      const mockError = new Error(`Informe ${mockInforme._id} no existe`);

      jest.spyOn(service, 'getHallazgosByInforme').mockRejectedValue(mockError);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getHallazgos(res as any, mockInforme._id);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Error al obtener hallazgos del informe',
        Data: mockError.message,
      });
    });
  });
});