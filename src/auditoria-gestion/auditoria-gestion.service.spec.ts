import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditoriaGestionService } from './auditoria-gestion.service';
import { Auditoria } from '../auditoria/schemas/auditoria.schema';
import { AuditoriaEstado } from '../auditoria-estado/schema/auditoria-estado.schema';
import { CreateAuditoriaGestionDto } from './dto/create-auditoria-gestion.dto';
import { AuditoriaEstadoDto } from '../auditoria-estado/dto/auditoria-estado.dto';
import { PlanAuditoria } from '../plan-auditoria/schemas/plan-auditoria.schema';

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
  // Datos de Estado (auditoria_id se genera automáticamente)
  auditoria_id: undefined,
  usuario_id: 76767,
  usuario_rol: 'AUDITOR',
  observacion: 'Estado inicial de la auditoría',
  actual: true,
  fase_id: 'PROGRAMACION',
  fecha_ejecucion_estado: new Date('2024-01-15'),
};

const mockAuditoria = {
  _id: '672d3050f7814a9a0c5261d4',
  plan_auditoria_id: '67197dda3416d2a85e5d6d8f',
  titulo: 'Auditoría General 2024',
  activo: true,
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

describe('AuditoriaGestionService', () => {
  let service: AuditoriaGestionService;
  let auditoriaModel: Model<Auditoria>;
  let auditoriaEstadoModel: Model<AuditoriaEstado>;
  let planAuditoriaModel: Model<PlanAuditoria>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriaGestionService,
        {
          provide: getModelToken(Auditoria.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getModelToken(AuditoriaEstado.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            updateMany: jest.fn(),
            insertMany: jest.fn(),
          },
        },
        {
          provide: getModelToken(PlanAuditoria.name),
          useValue: {
            findByIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuditoriaGestionService>(AuditoriaGestionService);
    auditoriaModel = module.get<Model<Auditoria>>(
      getModelToken(Auditoria.name),
    );
    auditoriaEstadoModel = module.get<Model<AuditoriaEstado>>(
      getModelToken(AuditoriaEstado.name),
    );
    planAuditoriaModel = module.get<Model<PlanAuditoria>>(
      getModelToken(PlanAuditoria.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(auditoriaModel).toBeDefined();
    expect(auditoriaEstadoModel).toBeDefined();
    expect(planAuditoriaModel).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear una auditoría y su estado inicial correctamente', async () => {
      const auditoriaCreateSpy = jest
        .spyOn(auditoriaModel, 'create')
        .mockResolvedValue(mockAuditoria as any);

      const estadoCreateSpy = jest
        .spyOn(auditoriaEstadoModel, 'create')
        .mockResolvedValue(mockAuditoriaEstado as any);

      const planUpdateSpy = jest
        .spyOn(planAuditoriaModel, 'findByIdAndUpdate')
        .mockResolvedValue({} as any);

      const result = await service.post(mockCreateAuditoriaGestionDto);

      expect(auditoriaCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          plan_auditoria_id: mockCreateAuditoriaGestionDto.plan_auditoria_id,
          titulo: mockCreateAuditoriaGestionDto.titulo,
          activo: true,
          fecha_creacion: expect.any(Date),
          fecha_modificacion: expect.any(Date),
        }),
      );

      expect(estadoCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          auditoria_id: mockAuditoria._id,
          usuario_id: mockCreateAuditoriaGestionDto.usuario_id,
          actual: true,
          activo: true,
          fecha_ejecucion_estado: expect.any(Date),
        }),
      );

      expect(planUpdateSpy).toHaveBeenCalledWith(
        mockCreateAuditoriaGestionDto.plan_auditoria_id,
        { $push: { auditorias: mockAuditoria._id.toString() } },
        { new: true },
      );

      expect(auditoriaCreateSpy).toHaveBeenCalledTimes(1);
      expect(estadoCreateSpy).toHaveBeenCalledTimes(1);
      expect(planUpdateSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAuditoriaEstado);
    });

    it('Debería establecer campos automáticos en la auditoría', async () => {
      const auditoriaCreateSpy = jest
        .spyOn(auditoriaModel, 'create')
        .mockResolvedValue(mockAuditoria as any);

      jest
        .spyOn(auditoriaEstadoModel, 'create')
        .mockResolvedValue(mockAuditoriaEstado as any);

      jest
        .spyOn(planAuditoriaModel, 'findByIdAndUpdate')
        .mockResolvedValue({} as any);

      await service.post(mockCreateAuditoriaGestionDto);

      expect(auditoriaCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activo: true,
          fecha_creacion: expect.any(Date),
          fecha_modificacion: expect.any(Date),
        }),
      );
    });

    it('Debería establecer campos automáticos en el estado inicial', async () => {
      jest
        .spyOn(auditoriaModel, 'create')
        .mockResolvedValue(mockAuditoria as any);

      const estadoCreateSpy = jest
        .spyOn(auditoriaEstadoModel, 'create')
        .mockResolvedValue(mockAuditoriaEstado as any);

      jest
        .spyOn(planAuditoriaModel, 'findByIdAndUpdate')
        .mockResolvedValue({} as any);

      await service.post(mockCreateAuditoriaGestionDto);

      expect(estadoCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          auditoria_id: mockAuditoria._id,
          actual: true,
          activo: true,
          fecha_ejecucion_estado: expect.any(Date),
        }),
      );
    });

    it('Debería propagar errores si falla la creación de la auditoría', async () => {
      const mockError = new Error('Auditoria validation failed');
      jest.spyOn(auditoriaModel, 'create').mockRejectedValue(mockError);

      await expect(service.post(mockCreateAuditoriaGestionDto)).rejects.toThrow(
        'Auditoria validation failed',
      );

      expect(auditoriaEstadoModel.create).not.toHaveBeenCalled();
      expect(planAuditoriaModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('Debería propagar errores si falla la creación del estado', async () => {
      const mockError = new Error('AuditoriaEstado validation failed');
      jest
        .spyOn(auditoriaModel, 'create')
        .mockResolvedValue(mockAuditoria as any);
      jest.spyOn(auditoriaEstadoModel, 'create').mockRejectedValue(mockError);

      await expect(service.post(mockCreateAuditoriaGestionDto)).rejects.toThrow(
        'AuditoriaEstado validation failed',
      );
    });

    it('Debería usar el ID de la auditoría creada para el estado', async () => {
      const nuevaAuditoriaId = 'nueva-auditoria-id-123';
      const auditoriaConId = { ...mockAuditoria, _id: nuevaAuditoriaId };

      jest
        .spyOn(auditoriaModel, 'create')
        .mockResolvedValue(auditoriaConId as any);

      const estadoCreateSpy = jest
        .spyOn(auditoriaEstadoModel, 'create')
        .mockResolvedValue(mockAuditoriaEstado as any);

      jest
        .spyOn(planAuditoriaModel, 'findByIdAndUpdate')
        .mockResolvedValue({} as any);

      await service.post(mockCreateAuditoriaGestionDto);

      expect(estadoCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          auditoria_id: nuevaAuditoriaId,
        }),
      );
    });
  });

  describe('put', () => {
    const planAuditoriaId = '67197dda3416d2a85e5d6d8f';
    const mockAuditorias = [
      { ...mockAuditoria, _id: 'aud1' },
      { ...mockAuditoria, _id: 'aud2' },
      { ...mockAuditoria, _id: 'aud3' },
    ];
    const mockEstadosAnteriores = [
      { ...mockAuditoriaEstado, _id: 'est1', auditoria_id: 'aud1' },
      { ...mockAuditoriaEstado, _id: 'est2', auditoria_id: 'aud2' },
    ];

    it('Debería actualizar estados de todas las auditorías en un plan', async () => {
      const auditoriaFindSpy = jest
        .spyOn(auditoriaModel, 'find')
        .mockResolvedValue(mockAuditorias as any);

      const estadoFindSpy = jest
        .spyOn(auditoriaEstadoModel, 'find')
        .mockResolvedValue(mockEstadosAnteriores as any);

      const updateManySpy = jest
        .spyOn(auditoriaEstadoModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 2 } as any);

      const insertManySpy = jest
        .spyOn(auditoriaEstadoModel, 'insertMany')
        .mockResolvedValue([mockAuditoriaEstado] as any);

      const result = await service.put(planAuditoriaId, mockAuditoriaEstadoDto);

      expect(auditoriaFindSpy).toHaveBeenCalledWith({
        plan_auditoria_id: planAuditoriaId,
        activo: true,
      });

      expect(estadoFindSpy).toHaveBeenCalledWith({
        auditoria_id: { $in: ['aud1', 'aud2', 'aud3'] },
        actual: true,
      });

      expect(updateManySpy).toHaveBeenCalledWith(
        {
          auditoria_id: { $in: ['aud1', 'aud2', 'aud3'] },
          actual: true,
        },
        { $set: { actual: false } },
      );

      expect(insertManySpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            auditoria_id: 'aud1',
            usuario_id: mockAuditoriaEstadoDto.usuario_id,
            estado_id: mockAuditoriaEstadoDto.estado_id,
            actual: true,
            activo: true,
          }),
          expect.objectContaining({
            auditoria_id: 'aud2',
            usuario_id: mockAuditoriaEstadoDto.usuario_id,
            estado_id: mockAuditoriaEstadoDto.estado_id,
            actual: true,
            activo: true,
          }),
          expect.objectContaining({
            auditoria_id: 'aud3',
            usuario_id: mockAuditoriaEstadoDto.usuario_id,
            estado_id: mockAuditoriaEstadoDto.estado_id,
            actual: true,
            activo: true,
          }),
        ]),
      );

      expect(result).toEqual([mockAuditoriaEstado]);
    });

    it('Debería desactivar estados anteriores antes de crear nuevos', async () => {
      jest
        .spyOn(auditoriaModel, 'find')
        .mockResolvedValue(mockAuditorias as any);

      jest
        .spyOn(auditoriaEstadoModel, 'find')
        .mockResolvedValue(mockEstadosAnteriores as any);

      const updateManySpy = jest
        .spyOn(auditoriaEstadoModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 2 } as any);

      const insertManySpy = jest
        .spyOn(auditoriaEstadoModel, 'insertMany')
        .mockResolvedValue([mockAuditoriaEstado] as any);

      await service.put(planAuditoriaId, mockAuditoriaEstadoDto);

      const updateManyOrder = updateManySpy.mock.invocationCallOrder[0];
      const insertManyOrder = insertManySpy.mock.invocationCallOrder[0];

      expect(updateManyOrder).toBeLessThan(insertManyOrder);
    });

    it('Debería NO llamar updateMany si no hay estados anteriores', async () => {
      jest
        .spyOn(auditoriaModel, 'find')
        .mockResolvedValue(mockAuditorias as any);

      jest.spyOn(auditoriaEstadoModel, 'find').mockResolvedValue([] as any);

      const updateManySpy = jest
        .spyOn(auditoriaEstadoModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 0 } as any);

      jest
        .spyOn(auditoriaEstadoModel, 'insertMany')
        .mockResolvedValue([mockAuditoriaEstado] as any);

      await service.put(planAuditoriaId, mockAuditoriaEstadoDto);

      expect(updateManySpy).not.toHaveBeenCalled();
    });

    it('Debería crear un estado por cada auditoría en el plan', async () => {
      jest
        .spyOn(auditoriaModel, 'find')
        .mockResolvedValue(mockAuditorias as any);

      jest
        .spyOn(auditoriaEstadoModel, 'find')
        .mockResolvedValue(mockEstadosAnteriores as any);

      jest
        .spyOn(auditoriaEstadoModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 2 } as any);

      const insertManySpy = jest
        .spyOn(auditoriaEstadoModel, 'insertMany')
        .mockResolvedValue([mockAuditoriaEstado] as any);

      await service.put(planAuditoriaId, mockAuditoriaEstadoDto);

      const insertedStates = insertManySpy.mock.calls[0][0];
      expect(insertedStates).toHaveLength(mockAuditorias.length);
    });

    it('Debería establecer campos automáticos en los nuevos estados', async () => {
      jest
        .spyOn(auditoriaModel, 'find')
        .mockResolvedValue(mockAuditorias as any);

      jest
        .spyOn(auditoriaEstadoModel, 'find')
        .mockResolvedValue(mockEstadosAnteriores as any);

      jest
        .spyOn(auditoriaEstadoModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 2 } as any);

      const insertManySpy = jest
        .spyOn(auditoriaEstadoModel, 'insertMany')
        .mockResolvedValue([mockAuditoriaEstado] as any);

      await service.put(planAuditoriaId, mockAuditoriaEstadoDto);

      expect(insertManySpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            actual: true,
            activo: true,
            fecha_ejecucion_estado: expect.any(Date),
          }),
        ]),
      );
    });

    it('Debería manejar el caso cuando no hay auditorías en el plan', async () => {
      jest.spyOn(auditoriaModel, 'find').mockResolvedValue([] as any);

      jest.spyOn(auditoriaEstadoModel, 'find').mockResolvedValue([] as any);

      const insertManySpy = jest
        .spyOn(auditoriaEstadoModel, 'insertMany')
        .mockResolvedValue([] as any);

      const result = await service.put(planAuditoriaId, mockAuditoriaEstadoDto);

      expect(insertManySpy).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error');
      jest.spyOn(auditoriaModel, 'find').mockRejectedValue(mockError);

      await expect(
        service.put(planAuditoriaId, mockAuditoriaEstadoDto),
      ).rejects.toThrow('Database error');
    });

    it('Debería copiar todos los campos del DTO al nuevo estado', async () => {
      jest
        .spyOn(auditoriaModel, 'find')
        .mockResolvedValue([mockAuditorias[0]] as any);

      jest.spyOn(auditoriaEstadoModel, 'find').mockResolvedValue([] as any);

      const insertManySpy = jest
        .spyOn(auditoriaEstadoModel, 'insertMany')
        .mockResolvedValue([mockAuditoriaEstado] as any);

      await service.put(planAuditoriaId, mockAuditoriaEstadoDto);

      const insertedState = insertManySpy.mock.calls[0][0][0];
      expect(insertedState).toMatchObject({
        usuario_id: mockAuditoriaEstadoDto.usuario_id,
        usuario_rol: mockAuditoriaEstadoDto.usuario_rol,
        observacion: mockAuditoriaEstadoDto.observacion,
        estado_id: mockAuditoriaEstadoDto.estado_id,
        fase_id: mockAuditoriaEstadoDto.fase_id,
      });
    });
  });
});
