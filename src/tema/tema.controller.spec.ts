import { Test, TestingModule } from '@nestjs/testing';
import { TemaController } from './tema.controller';
import { TemaDTO } from './dto/tema.dto';
import { SubtemaDTO } from './dto/subtema.dto';
import { HallazgoDTO } from './dto/hallazgo.dto';
import { TemaService } from './tema.service';
import { HttpStatus } from '@nestjs/common';
import { FilterDto } from '../filters/filters.dto';

const mockTemaDto: TemaDTO = {
  informe_id: '507f1f77bcf86cd799439011',
  titulo: 'Gestión Documental',
  activo: true,
  subtema: [],
  fecha_creacion: new Date(),
};

const mockTema = {
  ...mockTemaDto,
  _id: '507f1f77bcf86cd799439012',
};

const mockSubtemaDto: SubtemaDTO = {
  titulo: 'Archivo General',
  activo: true,
  hallazgo: [],
};

const mockHallazgoDto: HallazgoDTO = {
  titulo: 'Falta de documentación',
  criterio: 'Norma ISO 9001',
  descripcion: 'No se encontró evidencia',
  activo: true,
};

describe('TemaController', () => {
  let controller: TemaController;
  let service: TemaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemaController],
      providers: [
        {
          provide: TemaService,
          useValue: {
            post: jest.fn(),
            getAll: jest.fn(),
            getById: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            agregarSubtema: jest.fn(),
            actualizarSubtema: jest.fn(),
            eliminarSubtema: jest.fn(),
            agregarHallazgo: jest.fn(),
            actualizarHallazgo: jest.fn(),
            eliminarHallazgo: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TemaController>(TemaController);
    service = module.get<TemaService>(TemaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('post', () => {
    it('Debería retornar Created con datos válidos', async () => {
      jest.spyOn(service, 'post').mockResolvedValue(mockTemaDto as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.post(res as any, mockTemaDto);

      expect(service.post).toHaveBeenCalledWith(mockTemaDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: mockTemaDto,
      });
    });

    it('Debería retornar BadRequest con error', async () => {
      const mockError = new Error('Tema validation failed');

      jest.spyOn(service, 'post').mockRejectedValue(mockError);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.post(res as any, mockTemaDto);

      expect(service.post).toHaveBeenCalledWith(mockTemaDto);
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
      const mockTemas = [
        {
          ...mockTema,
          _id: '1',
          titulo: 'tema 1',
        },
        {
          ...mockTema,
          _id: '2',
          titulo: 'tema 2',
        },
      ];

      jest.spyOn(service, 'getAll').mockResolvedValue(mockTemas as any);

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
        Data: mockTemas,
        MetaData: { Count: 2 },
      });
    });
  });

  describe('getById', () => {
    it('Debería retornar OK con id válido', async () => {
      jest.spyOn(service, 'getById').mockResolvedValue(mockTema as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getById(res as any, mockTema._id);

      expect(service.getById).toHaveBeenCalledWith(mockTema._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockTema,
      });
    });

    it('Debería retornar NotFound con id inválido', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(new Error(`${mockTema._id} no existe`));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getById(res as any, mockTema._id);

      expect(service.getById).toHaveBeenCalledWith(mockTema._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en servicio GetOne: la peticion contiene un parametro incorrecto o no existe un registro',
        Data: `${mockTema._id} no existe`,
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

      await controller.delete(res as any, mockTema._id);

      expect(service.delete).toHaveBeenCalledWith(mockTema._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: {
          _id: mockTema._id,
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

      await controller.delete(res as any, mockTema._id);

      expect(service.delete).toHaveBeenCalledWith(mockTema._id);
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

  describe('agregarSubtema', () => {
    it('Debería agregar un subtema correctamente', async () => {
      jest.spyOn(service, 'agregarSubtema').mockResolvedValue(mockTema as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.agregarSubtema(res as any, mockTema._id, mockSubtemaDto);

      expect(service.agregarSubtema).toHaveBeenCalledWith(
        mockTema._id,
        mockSubtemaDto,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    });
  });

  describe('agregarHallazgo', () => {
    it('Debería agregar un hallazgo correctamente', async () => {
      jest.spyOn(service, 'agregarHallazgo').mockResolvedValue(mockTema as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.agregarHallazgo(
        res as any,
        mockTema._id,
        'sub1',
        mockHallazgoDto,
      );

      expect(service.agregarHallazgo).toHaveBeenCalledWith(
        mockTema._id,
        'sub1',
        mockHallazgoDto,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    });
  });
});