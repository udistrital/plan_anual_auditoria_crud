import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaPadreService } from './auditoria-padre.service';
import { HttpStatus } from '@nestjs/common';
import { AuditoriaPadreDTO } from './dto/auditoria-padre.dto';
import { FilterDto } from '../filters/filters.dto';
import { GenerarAuditoriaDto } from './dto/generar-auditoria.dto';

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
  macroproceso_id: [10],
  proceso_id: [20],
  dependencia_id: [30],
  cantidad_auditorias: 2,
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
  let auditoriaPadreService: AuditoriaPadreService;

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockAuditoriaPadreService = {
    post: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    generarAuditorias: jest.fn(),
    generarUnaAuditoria: jest.fn(),
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
    auditoriaPadreService = module.get<AuditoriaPadreService>(
      AuditoriaPadreService,
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

  describe('generarAuditorias', () => {
    const mockAuditoriasGeneradas = [
      { _id: 'a1', nombre: 'Auditoria hija 1' },
      { _id: 'a2', nombre: 'Auditoria hija 2' },
    ];
    const generarAuditoriaDto: GenerarAuditoriaDto = {
      auditoria_id: undefined,
      usuario_id: 1,
      usuario_rol: 'ADMIN',
      observacion: 'Generar auditorías controlador',
      estado_id_padre_actual: 1,
      estado_id_padre_nuevo: 2,
      estado_id_hija_actual: 1,
      estado_id_hija_nuevo: 2,
      fase_id: 'fase-1',
      fecha_ejecucion_estado: new Date('2024-02-01'),
      activo: true,
    } as any;

    it('Debería generar auditorías y retornar CREATED (201) con datos válidos', async () => {
      const serviceSpy = jest
        .spyOn(auditoriaPadreService, 'generarAuditorias')
        .mockResolvedValue(mockAuditoriasGeneradas as any);
      const res = mockResponse();

      await auditoriaPadreController.generarAuditorias(
        res,
        mockAuditoriaPadre._id,
        generarAuditoriaDto,
      );

      expect(serviceSpy).toHaveBeenCalledWith(
        mockAuditoriaPadre._id,
        generarAuditoriaDto,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Auditorías generadas exitosamente',
        Data: mockAuditoriasGeneradas,
      });
    });

    it('Debería retornar NOT_FOUND (404) cuando el plan no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      const mockError = new Error(`${nonExistentId} no existe`);
      const serviceSpy = jest
        .spyOn(auditoriaPadreService, 'generarAuditorias')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await auditoriaPadreController.generarAuditorias(
        res,
        nonExistentId,
        generarAuditoriaDto,
      );

      expect(serviceSpy).toHaveBeenCalledWith(
        nonExistentId,
        generarAuditoriaDto,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en servicio generarAuditorias: el plan de auditoria no existe',
        Data: mockError.message,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando la validación falla', async () => {
      const mockError = new Error('AuditoriaEstado validation failed');
      const serviceSpy = jest
        .spyOn(auditoriaPadreService, 'generarAuditorias')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await auditoriaPadreController.generarAuditorias(
        res,
        mockAuditoriaPadre._id,
        generarAuditoriaDto,
      );

      expect(serviceSpy).toHaveBeenCalledWith(
        mockAuditoriaPadre._id,
        generarAuditoriaDto,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error en servicio generarAuditorias: la solicitud contiene un tipo de dato incorrecto o un parámetro invalido',
        Data: mockError.message,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando el ID tiene formato inválido', async () => {
      const invalidId = 'invalid-id-format';
      const mockError = new Error('Cast to ObjectId failed');
      const serviceSpy = jest
        .spyOn(auditoriaPadreService, 'generarAuditorias')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await auditoriaPadreController.generarAuditorias(
        res,
        invalidId,
        generarAuditoriaDto,
      );

      expect(serviceSpy).toHaveBeenCalledWith(invalidId, generarAuditoriaDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error en servicio generarAuditorias: la solicitud contiene un tipo de dato incorrecto o un parámetro invalido',
        Data: mockError.message,
      });
    });

    it('Debería manejar errores generales del servicio (BD) con BAD_REQUEST', async () => {
      const mockError = new Error('Database failure');
      const serviceSpy = jest
        .spyOn(auditoriaPadreService, 'generarAuditorias')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await auditoriaPadreController.generarAuditorias(
        res,
        mockAuditoriaPadre._id,
        generarAuditoriaDto,
      );

      expect(serviceSpy).toHaveBeenCalledWith(
        mockAuditoriaPadre._id,
        generarAuditoriaDto,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error en servicio generarAuditorias: la solicitud contiene un tipo de dato incorrecto o un parámetro invalido',
        Data: mockError.message,
      });
    });
  });

  describe('generarUnaAuditorias', () => {
    const mockAuditoriaGenerada = { _id: 'a1', nombre: 'Auditoria hija 1' };
    const generarAuditoriaDto: GenerarAuditoriaDto = {
      auditoria_id: undefined,
      usuario_id: 1,
      usuario_rol: 'ADMIN',
      observacion: 'Generar una auditoría controlador',
      estado_id_padre_actual: 1,
      estado_id_padre_nuevo: 2,
      estado_id_hija_actual: 1,
      estado_id_hija_nuevo: 2,
      fase_id: 'fase-1',
      fecha_ejecucion_estado: new Date('2024-02-01'),
      activo: true,
    } as any;

    it('Debería generar una auditoría y retornar CREATED (201) con datos válidos', async () => {
      const serviceSpy = jest
        .spyOn(auditoriaPadreService, 'generarUnaAuditoria')
        .mockResolvedValue(mockAuditoriaGenerada as any);
      const res = mockResponse();

      await auditoriaPadreController.generarUnaAuditorias(
        res,
        mockAuditoriaPadre._id,
        generarAuditoriaDto,
      );

      expect(serviceSpy).toHaveBeenCalledWith(
        mockAuditoriaPadre._id,
        generarAuditoriaDto,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Auditoría generada exitosamente',
        Data: mockAuditoriaGenerada,
      });
    });

    it('Debería retornar NOT_FOUND (404) cuando la auditoría padre no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      const mockError = new Error(`${nonExistentId} no existe`);
      const serviceSpy = jest
        .spyOn(auditoriaPadreService, 'generarUnaAuditoria')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await auditoriaPadreController.generarUnaAuditorias(
        res,
        nonExistentId,
        generarAuditoriaDto,
      );

      expect(serviceSpy).toHaveBeenCalledWith(
        nonExistentId,
        generarAuditoriaDto,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en servicio generarUnaAuditoria: el plan de auditoria no existe',
        Data: mockError.message,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando falla la validación', async () => {
      const mockError = new Error('AuditoriaEstado validation failed');
      const serviceSpy = jest
        .spyOn(auditoriaPadreService, 'generarUnaAuditoria')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await auditoriaPadreController.generarUnaAuditorias(
        res,
        mockAuditoriaPadre._id,
        generarAuditoriaDto,
      );

      expect(serviceSpy).toHaveBeenCalledWith(
        mockAuditoriaPadre._id,
        generarAuditoriaDto,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error en servicio generarUnaAuditoria: la solicitud contiene un tipo de dato incorrecto o un parámetro invalido',
        Data: mockError.message,
      });
    });
  });

});
