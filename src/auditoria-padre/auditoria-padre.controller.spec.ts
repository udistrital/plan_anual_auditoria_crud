import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaPadreService } from './auditoria-padre.service';
import { HttpStatus } from '@nestjs/common';
import { AuditoriaPadreDTO } from './dto/auditoria-padre.dto';
import { FilterDto } from '../filters/filters.dto';

// Mock del ParseObjectIdPipe usando ruta relativa
jest.mock('../pipes/parse-object-id/parse-object-id.pipe');

// Importar el controlador después del mock
import { AuditoriaPadreController } from './auditoria-padre.controller';
import { Types } from 'mongoose';

const mockAuditoriaPadreDTO: AuditoriaPadreDTO = {
  plan_auditoria_id: new Types.ObjectId('67197dda3416d2a85e5d6d8f'),
  titulo: 'Auditoría Padre 2024',
  tipo_evaluacion_id: 1,
  cronograma_id: [],
  estado_id: 1,
  vigencia_id: 2024,
  macroproceso_id: 10,
  proceso_id: 20,
  dependencia_id: 30,
  no_auditoria: 2,
  auditoria_padre: [],
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_modificacion: new Date('2024-01-01'),
};

const mockAuditoriaPadre = {
  ...mockAuditoriaPadreDTO,
  _id: '671aa963064222e6583d56e4',
};

describe('AuditoriaPadreController', () => {
  let auditoriaPadreController: AuditoriaPadreController;

  const mockAuditoriaPadreService = {
    post: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditoriaPadreController],
      providers: [
        {
          provide: AuditoriaPadreService,
          useValue: mockAuditoriaPadreService,
        },
      ],
    }).compile();

    auditoriaPadreController = module.get<AuditoriaPadreController>(
      AuditoriaPadreController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debería estar definido', () => {
    expect(auditoriaPadreController).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear una auditoria padre exitosamente', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mockAuditoriaPadreService.post.mockResolvedValue(mockAuditoriaPadre);

      await auditoriaPadreController.post(
        mockRes as any,
        mockAuditoriaPadreDTO,
      );

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockRes.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: mockAuditoriaPadre,
      });
    });

    it('Debería retornar BAD_REQUEST si el servicio lanza un error', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mockAuditoriaPadreService.post.mockRejectedValue(
        new Error('Error al crear'),
      );

      await auditoriaPadreController.post(
        mockRes as any,
        mockAuditoriaPadreDTO,
      );

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('getAll', () => {
    it('Debería retornar todas las auditorias padre', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const filterDto: FilterDto = {} as FilterDto;

      mockAuditoriaPadreService.getAll.mockResolvedValue([mockAuditoriaPadre]);
      mockAuditoriaPadreService.count.mockResolvedValue(1);

      await auditoriaPadreController.getAll(mockRes as any, filterDto);

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockRes.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: [mockAuditoriaPadre],
        MetaData: { Count: 1 },
      });
    });
  });

  describe('getById', () => {
    it('Debería retornar una auditoria padre por id', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mockAuditoriaPadreService.getById.mockResolvedValue(mockAuditoriaPadre);

      await auditoriaPadreController.getById(
        mockRes as any,
        mockAuditoriaPadre._id,
      );

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockRes.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockAuditoriaPadre,
      });
    });

    it('Debería retornar NOT_FOUND si no existe', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mockAuditoriaPadreService.getById.mockRejectedValue(
        new Error('no existe'),
      );

      await auditoriaPadreController.getById(mockRes as any, 'id-invalido');

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });
  });

  describe('put', () => {
    it('Debería actualizar una auditoria padre exitosamente', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mockAuditoriaPadreService.put.mockResolvedValue(mockAuditoriaPadre);

      await auditoriaPadreController.put(
        mockRes as any,
        mockAuditoriaPadre._id,
        mockAuditoriaPadreDTO,
      );

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockRes.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: mockAuditoriaPadre,
      });
    });
  });

  describe('delete', () => {
    it('Debería eliminar una auditoria padre exitosamente', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mockAuditoriaPadreService.delete.mockResolvedValue({
        ...mockAuditoriaPadre,
        activo: false,
      });

      await auditoriaPadreController.delete(
        mockRes as any,
        mockAuditoriaPadre._id,
      );

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockRes.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: { _id: mockAuditoriaPadre._id },
      });
    });
  });
});
