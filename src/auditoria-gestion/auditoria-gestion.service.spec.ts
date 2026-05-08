import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditoriaGestionService } from './auditoria-gestion.service';
import { AuditoriaPadre } from '../auditoria-padre/schemas/auditoria-padre.schema';
import { AuditoriaPadreEstado } from '../auditoria-padre-estado/schema/auditoria-padre-estado.schema';
import { CreateAuditoriaGestionDto } from './dto/create-auditoria-gestion.dto';
import { AuditoriaPadreEstadoDto } from '../auditoria-padre-estado/dto/auditoria-padre-estado.dto';
import { PlanAuditoria } from '../plan-auditoria/schemas/plan-auditoria.schema';

const mockCreateAuditoriaGestionDto: CreateAuditoriaGestionDto = {
  plan_auditoria_id: new Types.ObjectId('67197dda3416d2a85e5d6d8f'),
  titulo: 'Auditoría General 2024',
  tipo_evaluacion_id: 2,
  cronograma_id: [1, 2, 3],
  estado_id: 2552,
  vigencia_id: 1234,
  macroproceso_id: [10],
  proceso_id: [20],
  dependencia_id: [30],
  auditorias: [],
  cantidad_auditorias: 0,
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_modificacion: new Date('2024-01-01'),
  usuario_id: 76767,
  usuario_rol: 'AUDITOR',
  observacion: 'Estado inicial de la auditoría',
  actual: true,
  fase_id: 'PROGRAMACION',
  fecha_ejecucion_estado: new Date('2024-01-15'),
};

const mockAuditoriaPadre = {
  _id: new Types.ObjectId('672d3050f7814a9a0c5261d4'),
  plan_auditoria_id: new Types.ObjectId('67197dda3416d2a85e5d6d8f'),
  titulo: 'Auditoría General 2024',
  activo: true,
};

const mockAuditoriaPadreEstado = {
  _id: new Types.ObjectId('672d36737e962bcac5ce9beb'),
  auditoria_padre_id: new Types.ObjectId('672d3050f7814a9a0c5261d4'),
  usuario_id: 76767,
  usuario_rol: 'AUDITOR',
  observacion: 'Estado inicial de la auditoría',
  estado_id: 2552,
  actual: true,
  activo: true,
  fase_id: 'PROGRAMACION',
  fecha_ejecucion_estado: new Date('2024-01-15'),
};

const mockAuditoriaEstadoDto: AuditoriaPadreEstadoDto = {
  auditoria_padre_id: new Types.ObjectId('672d3050f7814a9a0c5261d4'),
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
  let auditoriaPadreModel: Model<AuditoriaPadre>;
  let auditoriaPadreEstadoModel: Model<AuditoriaPadreEstado>;
  let planAuditoriaModel: Model<PlanAuditoria>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriaGestionService,
        {
          provide: getModelToken(AuditoriaPadre.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            updateMany: jest.fn(),
          },
        },
        {
          provide: getModelToken(AuditoriaPadreEstado.name),
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
    auditoriaPadreModel = module.get<Model<AuditoriaPadre>>(
      getModelToken(AuditoriaPadre.name),
    );
    auditoriaPadreEstadoModel = module.get<Model<AuditoriaPadreEstado>>(
      getModelToken(AuditoriaPadreEstado.name),
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
    expect(auditoriaPadreModel).toBeDefined();
    expect(auditoriaPadreEstadoModel).toBeDefined();
    expect(planAuditoriaModel).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear una auditoría y su estado inicial correctamente', async () => {
      const auditoriaCreateSpy = jest
        .spyOn(auditoriaPadreModel, 'create')
        .mockResolvedValue(mockAuditoriaPadre as any);

      const estadoCreateSpy = jest
        .spyOn(auditoriaPadreEstadoModel, 'create')
        .mockResolvedValue(mockAuditoriaPadreEstado as any);

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
          auditoria_padre_id: expect.any(Object),
          usuario_id: mockCreateAuditoriaGestionDto.usuario_id,
          actual: true,
          activo: true,
          fecha_ejecucion_estado: expect.any(Date),
        }),
      );

      expect(planUpdateSpy).toHaveBeenCalledWith(
        mockCreateAuditoriaGestionDto.plan_auditoria_id,
        { $push: { auditorias: mockAuditoriaPadre._id.toString() } },
        { new: true },
      );

      expect(auditoriaCreateSpy).toHaveBeenCalledTimes(1);
      expect(estadoCreateSpy).toHaveBeenCalledTimes(1);
      expect(planUpdateSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAuditoriaPadreEstado);
    });

    it('Debería establecer campos automáticos en la auditoría', async () => {
      const auditoriaCreateSpy = jest
        .spyOn(auditoriaPadreModel, 'create')
        .mockResolvedValue(mockAuditoriaPadre as any);

      jest
        .spyOn(auditoriaPadreEstadoModel, 'create')
        .mockResolvedValue(mockAuditoriaPadreEstado as any);

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
        .spyOn(auditoriaPadreModel, 'create')
        .mockResolvedValue(mockAuditoriaPadre as any);

      const estadoCreateSpy = jest
        .spyOn(auditoriaPadreEstadoModel, 'create')
        .mockResolvedValue(mockAuditoriaPadreEstado as any);

      jest
        .spyOn(planAuditoriaModel, 'findByIdAndUpdate')
        .mockResolvedValue({} as any);

      await service.post(mockCreateAuditoriaGestionDto);

      expect(estadoCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          auditoria_padre_id: expect.any(Object),
          actual: true,
          activo: true,
          fecha_ejecucion_estado: expect.any(Date),
        }),
      );
    });

    it('Debería propagar errores si falla la creación de la auditoría', async () => {
      const mockError = new Error('Auditoria validation failed');
      jest.spyOn(auditoriaPadreModel, 'create').mockRejectedValue(mockError);

      await expect(service.post(mockCreateAuditoriaGestionDto)).rejects.toThrow(
        'Auditoria validation failed',
      );

      expect(auditoriaPadreEstadoModel.create).not.toHaveBeenCalled();
      expect(planAuditoriaModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('Debería propagar errores si falla la creación del estado', async () => {
      const mockError = new Error('AuditoriaEstado validation failed');
      jest
        .spyOn(auditoriaPadreModel, 'create')
        .mockResolvedValue(mockAuditoriaPadre as any);
      jest
        .spyOn(auditoriaPadreEstadoModel, 'create')
        .mockRejectedValue(mockError);

      await expect(service.post(mockCreateAuditoriaGestionDto)).rejects.toThrow(
        'AuditoriaEstado validation failed',
      );
    });

    it('Debería usar el ID de la auditoría creada para el estado', async () => {
      const nuevaAuditoriaId = new Types.ObjectId();
      const auditoriaConId = { ...mockAuditoriaPadre, _id: nuevaAuditoriaId };

      jest
        .spyOn(auditoriaPadreModel, 'create')
        .mockResolvedValue(auditoriaConId as any);

      const estadoCreateSpy = jest
        .spyOn(auditoriaPadreEstadoModel, 'create')
        .mockResolvedValue(mockAuditoriaPadreEstado as any);

      jest
        .spyOn(planAuditoriaModel, 'findByIdAndUpdate')
        .mockResolvedValue({} as any);

      await service.post(mockCreateAuditoriaGestionDto);

      expect(estadoCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          auditoria_padre_id: expect.any(Object),
        }),
      );
    });
  });

  describe('put', () => {
    const planAuditoriaId = '67197dda3416d2a85e5d6d8f';
    const aud1Id = new Types.ObjectId();
    const aud2Id = new Types.ObjectId();
    const aud3Id = new Types.ObjectId();
    const mockAuditorias = [
      { ...mockAuditoriaPadre, _id: aud1Id },
      { ...mockAuditoriaPadre, _id: aud2Id },
      { ...mockAuditoriaPadre, _id: aud3Id },
    ];

    it('Debería actualizar estados de todas las auditorías en un plan', async () => {
      const auditoriaFindSpy = jest
        .spyOn(auditoriaPadreModel, 'find')
        .mockResolvedValue(mockAuditorias as any);

      const estadoUpdateManySpy = jest
        .spyOn(auditoriaPadreEstadoModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 2 } as any);

      const insertManySpy = jest
        .spyOn(auditoriaPadreEstadoModel, 'insertMany')
        .mockResolvedValue([mockAuditoriaPadreEstado] as any);

      const auditoriaUpdateManySpy = jest
        .spyOn(auditoriaPadreModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 3 } as any);

      const result = await service.put(planAuditoriaId, mockAuditoriaEstadoDto);

      expect(auditoriaFindSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activo: true,
        }),
      );

      expect(estadoUpdateManySpy).toHaveBeenCalledWith(
        {
          auditoria_padre_id: {
            $in: expect.arrayContaining([aud1Id, aud2Id, aud3Id]),
          },
          actual: true,
        },
        { $set: { actual: false } },
      );

      expect(insertManySpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            auditoria_padre_id: expect.any(Object), // ObjectId
            usuario_id: mockAuditoriaEstadoDto.usuario_id,
            estado_id: mockAuditoriaEstadoDto.estado_id,
            actual: true,
            activo: true,
          }),
          expect.objectContaining({
            auditoria_padre_id: expect.any(Object), // ObjectId
            usuario_id: mockAuditoriaEstadoDto.usuario_id,
            estado_id: mockAuditoriaEstadoDto.estado_id,
            actual: true,
            activo: true,
          }),
          expect.objectContaining({
            auditoria_padre_id: expect.any(Object), // ObjectId
            usuario_id: mockAuditoriaEstadoDto.usuario_id,
            estado_id: mockAuditoriaEstadoDto.estado_id,
            actual: true,
            activo: true,
          }),
        ]),
      );

      expect(auditoriaUpdateManySpy).toHaveBeenCalledWith(
        { _id: { $in: expect.arrayContaining([aud1Id, aud2Id, aud3Id]) } },
        { $set: { estado_id: mockAuditoriaEstadoDto.estado_id } },
      );

      expect(result).toEqual([mockAuditoriaPadreEstado]);
    });

    it('Debería desactivar estados anteriores antes de crear nuevos', async () => {
      jest
        .spyOn(auditoriaPadreModel, 'find')
        .mockResolvedValue(mockAuditorias as any);

      const updateManySpy = jest
        .spyOn(auditoriaPadreEstadoModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 2 } as any);

      const insertManySpy = jest
        .spyOn(auditoriaPadreEstadoModel, 'insertMany')
        .mockResolvedValue([mockAuditoriaPadreEstado] as any);

      jest
        .spyOn(auditoriaPadreModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 3 } as any);

      await service.put(planAuditoriaId, mockAuditoriaEstadoDto);

      const updateManyOrder = updateManySpy.mock.invocationCallOrder[0];
      const insertManyOrder = insertManySpy.mock.invocationCallOrder[0];

      expect(updateManyOrder).toBeLessThan(insertManyOrder);
    });

    it('Debería llamar updateMany incluso si no hay estados anteriores', async () => {
      jest
        .spyOn(auditoriaPadreModel, 'find')
        .mockResolvedValue(mockAuditorias as any);

      const updateManySpy = jest
        .spyOn(auditoriaPadreEstadoModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 0 } as any);

      jest
        .spyOn(auditoriaPadreEstadoModel, 'insertMany')
        .mockResolvedValue([mockAuditoriaPadreEstado] as any);

      jest
        .spyOn(auditoriaPadreModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 3 } as any);

      await service.put(planAuditoriaId, mockAuditoriaEstadoDto);

      expect(updateManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          actual: true,
        }),
        { $set: { actual: false } },
      );
    });

    it('Debería crear un estado por cada auditoría en el plan', async () => {
      jest
        .spyOn(auditoriaPadreModel, 'find')
        .mockResolvedValue(mockAuditorias as any);

      jest
        .spyOn(auditoriaPadreEstadoModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 2 } as any);

      const insertManySpy = jest
        .spyOn(auditoriaPadreEstadoModel, 'insertMany')
        .mockResolvedValue([mockAuditoriaPadreEstado] as any);

      jest
        .spyOn(auditoriaPadreModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 3 } as any);

      await service.put(planAuditoriaId, mockAuditoriaEstadoDto);

      const insertedStates = insertManySpy.mock.calls[0][0];
      expect(insertedStates).toHaveLength(mockAuditorias.length);
    });

    it('Debería establecer campos automáticos en los nuevos estados', async () => {
      jest
        .spyOn(auditoriaPadreModel, 'find')
        .mockResolvedValue(mockAuditorias as any);

      jest
        .spyOn(auditoriaPadreEstadoModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 2 } as any);

      const insertManySpy = jest
        .spyOn(auditoriaPadreEstadoModel, 'insertMany')
        .mockResolvedValue([mockAuditoriaPadreEstado] as any);

      jest
        .spyOn(auditoriaPadreModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 3 } as any);

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
      jest.spyOn(auditoriaPadreModel, 'find').mockResolvedValue([] as any);

      const insertManySpy = jest
        .spyOn(auditoriaPadreEstadoModel, 'insertMany')
        .mockResolvedValue([] as any);

      const result = await service.put(planAuditoriaId, mockAuditoriaEstadoDto);

      expect(insertManySpy).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error');
      jest.spyOn(auditoriaPadreModel, 'find').mockRejectedValue(mockError);

      await expect(
        service.put(planAuditoriaId, mockAuditoriaEstadoDto),
      ).rejects.toThrow('Database error');
    });

    it('Debería copiar todos los campos del DTO al nuevo estado', async () => {
      jest
        .spyOn(auditoriaPadreModel, 'find')
        .mockResolvedValue([mockAuditorias[0]] as any);

      jest
        .spyOn(auditoriaPadreEstadoModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 0 } as any);

      const insertManySpy = jest
        .spyOn(auditoriaPadreEstadoModel, 'insertMany')
        .mockResolvedValue([mockAuditoriaPadreEstado] as any);

      jest
        .spyOn(auditoriaPadreModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 1 } as any);

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
