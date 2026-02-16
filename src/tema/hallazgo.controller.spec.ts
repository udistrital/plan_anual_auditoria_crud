import { Test, TestingModule } from '@nestjs/testing';
import { HallazgoController } from './hallazgo.controller';
import { TemaService } from './tema.service';
import { CreateHallazgoDTO, UpdateHallazgoDTO } from './dto/hallazgo.dto';
import { HttpStatus } from '@nestjs/common';
import { FilterDto } from '../filters/filters.dto';

const mockCreateHallazgoDto: CreateHallazgoDTO = {
  subtema_id: '507f1f77bcf86cd799439013',
  titulo: 'Falta de documentación',
  criterio: 'Norma ISO 9001',
  descripcion: 'No se encontró evidencia',
  activo: true,
};

const mockUpdateHallazgoDto: UpdateHallazgoDTO = {
  titulo: 'Falta de documentación actualizada',
  criterio: 'Norma ISO 9001',
  descripcion: 'Descripción actualizada',
};

const mockHallazgo = {
  _id: '507f1f77bcf86cd799439014',
  titulo: 'Falta de documentación',
  criterio: 'Norma ISO 9001',
  descripcion: 'No se encontró evidencia',
  activo: true,
  subtema: {
    _id: '507f1f77bcf86cd799439013',
    titulo: 'Archivo General',
  },
  tema: {
    _id: '507f1f77bcf86cd799439011',
    titulo: 'Gestión Documental',
  },
};

describe('HallazgoController', () => {
  let controller: HallazgoController;
  let service: TemaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HallazgoController],
      providers: [
        {
          provide: TemaService,
          useValue: {
            agregarHallazgo: jest.fn(),
            getAllHallazgos: jest.fn(),
            countHallazgos: jest.fn(),
            getHallazgoById: jest.fn(),
            updateHallazgo: jest.fn(),
            deleteHallazgo: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HallazgoController>(HallazgoController);
    service = module.get<TemaService>(TemaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('Debería crear un hallazgo correctamente', async () => {
      jest
        .spyOn(service, 'agregarHallazgo')
        .mockResolvedValue(mockHallazgo as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.create(res as any, mockCreateHallazgoDto);

      expect(service.agregarHallazgo).toHaveBeenCalledWith(
        mockCreateHallazgoDto.subtema_id,
        mockCreateHallazgoDto,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Hallazgo creado exitosamente',
        Data: mockHallazgo,
      });
    });

    it('Debería retornar BadRequest con error', async () => {
      const mockError = new Error('Subtema no existe');

      jest.spyOn(service, 'agregarHallazgo').mockRejectedValue(mockError);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.create(res as any, mockCreateHallazgoDto);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message: 'Error al crear hallazgo',
        Data: mockError.message,
      });
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'subtema_id:507f1f77bcf86cd799439013',
      fields: '',
      sortby: '',
      order: '',
      limit: '',
      offset: '',
      populate: '',
    };

    it('Debería retornar todos los hallazgos', async () => {
      const mockHallazgos = [mockHallazgo];

      jest.spyOn(service, 'getAllHallazgos').mockResolvedValue(mockHallazgos);
      jest.spyOn(service, 'countHallazgos').mockResolvedValue(1);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getAll(res as any, mockFilterDto);

      expect(service.getAllHallazgos).toHaveBeenCalledWith(mockFilterDto);
      expect(service.countHallazgos).toHaveBeenCalledWith(mockFilterDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockHallazgos,
        MetaData: { Count: 1 },
      });
    });
  });

  describe('getById', () => {
    it('Debería retornar un hallazgo por ID', async () => {
      jest.spyOn(service, 'getHallazgoById').mockResolvedValue(mockHallazgo);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getById(res as any, mockHallazgo._id);

      expect(service.getHallazgoById).toHaveBeenCalledWith(mockHallazgo._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockHallazgo,
      });
    });

    it('Debería retornar NotFound con ID inválido', async () => {
      const mockError = new Error('Hallazgo no existe');

      jest.spyOn(service, 'getHallazgoById').mockRejectedValue(mockError);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getById(res as any, 'invalid-id');

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Hallazgo no encontrado',
        Data: mockError.message,
      });
    });
  });

  describe('update', () => {
    it('Debería actualizar un hallazgo correctamente', async () => {
      jest
        .spyOn(service, 'updateHallazgo')
        .mockResolvedValue(mockHallazgo as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.update(
        res as any,
        mockHallazgo._id,
        mockUpdateHallazgoDto,
      );

      expect(service.updateHallazgo).toHaveBeenCalledWith(
        mockHallazgo._id,
        mockUpdateHallazgoDto,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });
  });

  describe('delete', () => {
    it('Debería eliminar un hallazgo correctamente', async () => {
      jest
        .spyOn(service, 'deleteHallazgo')
        .mockResolvedValue(mockHallazgo as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.delete(res as any, mockHallazgo._id);

      expect(service.deleteHallazgo).toHaveBeenCalledWith(mockHallazgo._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Hallazgo eliminado exitosamente',
        Data: mockHallazgo,
      });
    });
  });
});
