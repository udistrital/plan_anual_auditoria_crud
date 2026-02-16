import { Test, TestingModule } from '@nestjs/testing';
import { SubtemaController } from './subtema.controller';
import { TemaService } from './tema.service';
import { CreateSubtemaDTO, UpdateSubtemaDTO } from './dto/subtema.dto';
import { HttpStatus } from '@nestjs/common';
import { FilterDto } from '../filters/filters.dto';

const mockCreateSubtemaDto: CreateSubtemaDTO = {
  tema_id: '507f1f77bcf86cd799439011',
  titulo: 'Archivo General',
  activo: true,
};

const mockUpdateSubtemaDto: UpdateSubtemaDTO = {
  titulo: 'Archivo General Actualizado',
};

const mockSubtema = {
  _id: '507f1f77bcf86cd799439013',
  titulo: 'Archivo General',
  activo: true,
  hallazgo: [],
  tema: {
    _id: '507f1f77bcf86cd799439011',
    titulo: 'Gestión Documental',
  },
};

describe('SubtemaController', () => {
  let controller: SubtemaController;
  let service: TemaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubtemaController],
      providers: [
        {
          provide: TemaService,
          useValue: {
            agregarSubtema: jest.fn(),
            getAllSubtemas: jest.fn(),
            countSubtemas: jest.fn(),
            getSubtemaById: jest.fn(),
            updateSubtema: jest.fn(),
            deleteSubtema: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SubtemaController>(SubtemaController);
    service = module.get<TemaService>(TemaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('Debería crear un subtema correctamente', async () => {
      jest
        .spyOn(service, 'agregarSubtema')
        .mockResolvedValue(mockSubtema as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.create(res as any, mockCreateSubtemaDto);

      expect(service.agregarSubtema).toHaveBeenCalledWith(
        mockCreateSubtemaDto.tema_id,
        mockCreateSubtemaDto,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Subtema creado exitosamente',
        Data: mockSubtema,
      });
    });

    it('Debería retornar BadRequest con error', async () => {
      const mockError = new Error('Tema no existe');

      jest.spyOn(service, 'agregarSubtema').mockRejectedValue(mockError);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.create(res as any, mockCreateSubtemaDto);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message: 'Error al crear subtema',
        Data: mockError.message,
      });
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'tema_id:507f1f77bcf86cd799439011',
      fields: '',
      sortby: '',
      order: '',
      limit: '',
      offset: '',
      populate: '',
    };

    it('Debería retornar todos los subtemas', async () => {
      const mockSubtemas = [mockSubtema];

      jest.spyOn(service, 'getAllSubtemas').mockResolvedValue(mockSubtemas);
      jest.spyOn(service, 'countSubtemas').mockResolvedValue(1);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getAll(res as any, mockFilterDto);

      expect(service.getAllSubtemas).toHaveBeenCalledWith(mockFilterDto);
      expect(service.countSubtemas).toHaveBeenCalledWith(mockFilterDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockSubtemas,
        MetaData: { Count: 1 },
      });
    });
  });

  describe('getById', () => {
    it('Debería retornar un subtema por ID', async () => {
      jest.spyOn(service, 'getSubtemaById').mockResolvedValue(mockSubtema);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getById(res as any, mockSubtema._id);

      expect(service.getSubtemaById).toHaveBeenCalledWith(mockSubtema._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockSubtema,
      });
    });

    it('Debería retornar NotFound con ID inválido', async () => {
      const mockError = new Error('Subtema no existe');

      jest.spyOn(service, 'getSubtemaById').mockRejectedValue(mockError);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getById(res as any, 'invalid-id');

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Subtema no encontrado',
        Data: mockError.message,
      });
    });
  });

  describe('update', () => {
    it('Debería actualizar un subtema correctamente', async () => {
      jest
        .spyOn(service, 'updateSubtema')
        .mockResolvedValue(mockSubtema as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.update(
        res as any,
        mockSubtema._id,
        mockUpdateSubtemaDto,
      );

      expect(service.updateSubtema).toHaveBeenCalledWith(
        mockSubtema._id,
        mockUpdateSubtemaDto,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });
  });

  describe('delete', () => {
    it('Debería eliminar un subtema correctamente', async () => {
      jest
        .spyOn(service, 'deleteSubtema')
        .mockResolvedValue(mockSubtema as any);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.delete(res as any, mockSubtema._id);

      expect(service.deleteSubtema).toHaveBeenCalledWith(mockSubtema._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Subtema eliminado exitosamente',
        Data: mockSubtema,
      });
    });
  });
});
