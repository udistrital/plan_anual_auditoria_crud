import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';

// Mock de módulos con rutas absolutas antes de importar el controlador
jest.mock('../auditoria-estado/dto/auditoria-estado.dto', () => ({
  AuditoriaEstadoDto: class MockAuditoriaEstadoDto {},
}));

import { AuditoriaGestionController } from './auditoria-gestion.controller';
import { AuditoriaGestionService } from './auditoria-gestion.service';
import { CreateAuditoriaGestionDto } from './dto/create-auditoria-gestion.dto';
import { AuditoriaEstadoDto } from '../auditoria-estado/dto/auditoria-estado.dto';

const mockCreateAuditoriaGestionDto: CreateAuditoriaGestionDto = {
  // Datos de Auditoría
  plan_auditoria_id: '67197dda3416d2a85e5d6d8f',
  titulo: 'Auditoría General 2024',
  tipo_evaluacion_id: 2,
  cronograma_id: [1, 2, 3],
  estado_id: 2552,
  no_auditoria: 123420,
  vigencia_id: 1234,
  consecutivo_OCI: 'EHS54F',
  consecutivo_IE: 'PASJF4532',
  macroproceso_id: 10,
  proceso_id: 20,
  dependencia_id: 30,
  fecha_inicio: new Date('2024-01-01'),
  fecha_fin: new Date('2024-12-31'),
  objetivo: 'Evaluar el cumplimiento de procesos',
  alcance: 'Procesos administrativos y financieros',
  criterio: 'Normas ISO 9001',
  rec_tecnologico: 'Software de auditoría',
  rec_humano: 'Equipo de 5 auditores',
  rec_fisico: 'Oficinas y equipos',
  temas: 'Gestión de calidad, procesos, controles',
  correo_complementario: 'correo@email.com',
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_modificacion: new Date('2024-01-01'),
  auditoria_padre_id: '67297dda3416d2a85e5d6d90',
  // Datos de Estado (auditoria_id se crea automáticamente, no se envía en POST)
  auditoria_id: undefined,
  usuario_id: 76767,
  usuario_rol: 'AUDITOR',
  observacion: 'Estado inicial de la auditoría',
  actual: true,
  fase_id: 'PROGRAMACION',
  fecha_ejecucion_estado: new Date('2024-01-15'),
};

const mockAuditoriaEstado = {
  _id: '672d36737e962bcac5ce9beb',
  auditoria_id: '672d3050f7814a9a0c5261d4',
  usuario_id: 76767,
  usuario_rol: 'AUDITOR',
  observacion: 'Estado inicial de la auditoría',
  estado_id: 2552,
  actual: true,
  activo: true,
  fase_id: 'PROGRAMACION',
  fecha_ejecucion_estado: new Date('2024-01-15'),
};

const mockAuditoriaEstadoDto: AuditoriaEstadoDto = {
  auditoria_id: '672d3050f7814a9a0c5261d4',
  usuario_id: 76767,
  usuario_rol: 'AUDITOR_LIDER',
  observacion: 'Cambio de estado a ejecución',
  actual: true,
  estado_id: 2553,
  fase_id: 'EJECUCION',
  fecha_ejecucion_estado: new Date('2024-02-01'),
  activo: true,
};

describe('AuditoriaGestionController', () => {
  let controller: AuditoriaGestionController;
  let service: AuditoriaGestionService;

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditoriaGestionController],
      providers: [
        {
          provide: AuditoriaGestionService,
          useValue: {
            post: jest.fn(),
            put: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuditoriaGestionController>(
      AuditoriaGestionController,
    );
    service = module.get<AuditoriaGestionService>(AuditoriaGestionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear una auditoría con estado inicial y retornar CREATED (201)', async () => {
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockResolvedValue(mockAuditoriaEstado as any);
      const res = mockResponse();

      await controller.post(res, mockCreateAuditoriaGestionDto);

      expect(serviceSpy).toHaveBeenCalledWith(mockCreateAuditoriaGestionDto);
      expect(serviceSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: mockAuditoriaEstado,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando falla la creación de auditoría', async () => {
      const mockError = new Error(
        'Auditoria validation failed: titulo is required',
      );
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.post(res, mockCreateAuditoriaGestionDto);

      expect(serviceSpy).toHaveBeenCalledWith(mockCreateAuditoriaGestionDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error servicio Post: la solicitud contiene un tipo de dato incorrecto o un parametro invalido',
        Data: mockError.message,
      });
    });

    it('Debería manejar errores de base de datos durante la creación', async () => {
      const mockError = new Error('Database connection error');
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.post(res, mockCreateAuditoriaGestionDto);

      expect(serviceSpy).toHaveBeenCalledWith(mockCreateAuditoriaGestionDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error servicio Post: la solicitud contiene un tipo de dato incorrecto o un parametro invalido',
        Data: mockError.message,
      });
    });

    it('Debería manejar errores de validación de datos', async () => {
      const mockError = new Error('Invalid date format');
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.post(res, mockCreateAuditoriaGestionDto);

      expect(serviceSpy).toHaveBeenCalledWith(mockCreateAuditoriaGestionDto);
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

  describe('put', () => {
    const planAuditoriaId = '67197dda3416d2a85e5d6d8f';

    it('Debería llamar al servicio put con los parámetros correctos', () => {
      const serviceSpy = jest
        .spyOn(service, 'put')
        .mockResolvedValue([] as any);
      const res = mockResponse();

      controller.put(res as any, planAuditoriaId, mockAuditoriaEstadoDto);

      expect(serviceSpy).toHaveBeenCalledWith(
        planAuditoriaId,
        mockAuditoriaEstadoDto,
      );
    });
  });
});
