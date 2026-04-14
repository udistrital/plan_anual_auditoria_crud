import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaPadreService } from './auditoria-padre.service';
import { getModelToken } from '@nestjs/mongoose';
import { AuditoriaPadre } from './schemas/auditoria-padre.schema';
import { AuditoriaPadreDTO } from './dto/auditoria-padre.dto';
import { PlanAuditoria } from '../plan-auditoria/schemas/plan-auditoria.schema';
import { Model, Types } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { EstadoAuditoriaPadreService } from '../auditoria-padre-estado/auditoria-padre-estado.service';
import { GenerarAuditoriaDto } from './dto/generar-auditoria.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { EstadoAuditoriaService } from 'src/auditoria-estado/auditoria-estado.service';

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
  cantidad_auditorias: 2,
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_modificacion: new Date('2024-01-01'),
};

const mockAuditoriaPadre = {
  ...mockAuditoriaPadreDTO,
  _id: '671aa963064222e6583d56e4',
};

const mockPlanAuditoria = {
  _id: '67197dda3416d2a85e5d6d8f',
  nombre: 'Plan Anual de Auditoría 2024',
};

describe('AuditoriaPadreService', () => {
  let auditoriaPadreService: AuditoriaPadreService;
  let auditoriaPadreModel: Model<AuditoriaPadre>;
  let planAuditoriaModel: Model<PlanAuditoria>;
  let auditoriaService: AuditoriaService;
  let estadoAuditoriaService: EstadoAuditoriaService;
  let auditoriaPadreEstadoService: EstadoAuditoriaPadreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriaPadreService,
        {
          provide: getModelToken(AuditoriaPadre.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: getModelToken(PlanAuditoria.name),
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: EstadoAuditoriaPadreService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: AuditoriaService,
          useValue: {
            getAll: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: EstadoAuditoriaService,
          useValue: {
            getAll: jest.fn(),
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    auditoriaPadreService = module.get<AuditoriaPadreService>(
      AuditoriaPadreService,
    );
    auditoriaPadreModel = module.get<Model<AuditoriaPadre>>(
      getModelToken(AuditoriaPadre.name),
    );
    planAuditoriaModel = module.get<Model<PlanAuditoria>>(
      getModelToken(PlanAuditoria.name),
    );
    auditoriaPadreEstadoService = module.get<EstadoAuditoriaPadreService>(
      EstadoAuditoriaPadreService,
    );
    auditoriaService = module.get<AuditoriaService>(AuditoriaService);
    estadoAuditoriaService = module.get<EstadoAuditoriaService>(
      EstadoAuditoriaService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debería estar definido', () => {
    expect(auditoriaPadreService).toBeDefined();
    expect(auditoriaPadreModel).toBeDefined();
    expect(planAuditoriaModel).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver una auditoria padre cuando los datos son válidos', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);

      jest
        .spyOn(auditoriaPadreModel, 'create')
        .mockResolvedValue(mockAuditoriaPadre as any);

      const result = await auditoriaPadreService.post(mockAuditoriaPadreDTO);

      expect(result).toEqual(mockAuditoriaPadre);
    });

    it('Debería lanzar un error si el PlanAuditoria no existe', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        auditoriaPadreService.post(mockAuditoriaPadreDTO),
      ).rejects.toThrow(
        `Plan auditoria relacionada con id ${mockAuditoriaPadreDTO.plan_auditoria_id} no existe`,
      );
    });
  });

  describe('getAll', () => {
    it('Debería retornar todas las auditorias padre', async () => {
      const filterDto: FilterDto = {} as FilterDto;
      jest.spyOn(auditoriaPadreModel, 'find').mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockAuditoriaPadre]),
      } as any);

      jest.spyOn(auditoriaPadreModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      } as any);

      const result = await auditoriaPadreService.getAll(filterDto);

      expect(result).toEqual([mockAuditoriaPadre]);
    });
  });

  describe('getById', () => {
    it('Debería retornar una auditoria padre por id', async () => {
      jest.spyOn(auditoriaPadreModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditoriaPadre),
      } as any);

      const result = await auditoriaPadreService.getById(
        mockAuditoriaPadre._id,
      );

      expect(result).toEqual(mockAuditoriaPadre);
    });

    it('Debería lanzar un error si la auditoria padre no existe', async () => {
      jest.spyOn(auditoriaPadreModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        auditoriaPadreService.getById(mockAuditoriaPadre._id),
      ).rejects.toThrow(`${mockAuditoriaPadre._id} no existe`);
    });
  });

  describe('put', () => {
    it('Debería actualizar y retornar una auditoria padre', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);

      jest.spyOn(auditoriaPadreModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditoriaPadre),
      } as any);

      jest.spyOn(auditoriaPadreModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditoriaPadre),
      } as any);

      const result = await auditoriaPadreService.put(
        mockAuditoriaPadre._id,
        mockAuditoriaPadreDTO,
      );

      expect(result).toEqual(mockAuditoriaPadre);
    });

    it('Debería lanzar un error si la auditoria padre no existe al actualizar', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);

      jest.spyOn(auditoriaPadreModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        auditoriaPadreService.put(
          mockAuditoriaPadre._id,
          mockAuditoriaPadreDTO,
        ),
      ).rejects.toThrow(`${mockAuditoriaPadre._id} no existe`);
    });
  });

  describe('delete', () => {
    it('Debería desactivar y retornar una auditoria padre', async () => {
      jest.spyOn(auditoriaPadreModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...mockAuditoriaPadre, activo: false }),
      } as any);

      const result = await auditoriaPadreService.delete(mockAuditoriaPadre._id);

      expect(result).toEqual({ ...mockAuditoriaPadre, activo: false });
    });

    it('Debería lanzar un error si la auditoria padre no existe al eliminar', async () => {
      jest.spyOn(auditoriaPadreModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        auditoriaPadreService.delete(mockAuditoriaPadre._id),
      ).rejects.toThrow(`${mockAuditoriaPadre._id} no existe`);
    });
  });

  describe('count', () => {
    it('Debería retornar el conteo de auditorias padre', async () => {
      const filterDto: FilterDto = {} as FilterDto;
      jest.spyOn(auditoriaPadreModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      } as any);

      const result = await auditoriaPadreService.count(filterDto);

      expect(result).toBe(5);
    });
  });

  describe('generarAuditorias', () => {
    const auditoriaPadreId = 'padre-1';
    const generarAuditoriaDto: GenerarAuditoriaDto = {
      auditoria_id: undefined,
      usuario_id: 1,
      usuario_rol: 'ADMIN',
      observacion: 'Generar auditorías de prueba',
      estado_id_padre_actual: 1,
      estado_id_padre_nuevo: 2,
      estado_id_hija_actual: 1,
      estado_id_hija_nuevo: 2,
      fase_id: 'fase-1',
      fecha_ejecucion_estado: new Date(),
      activo: true,
    } as any;

    const mockAuditoriaPadreConCantidad = {
      _id: auditoriaPadreId,
      plan_auditoria_id: new Types.ObjectId('67197dda3416d2a85e5d6d8f'),
      titulo: 'Padre 1',
      cantidad_auditorias: 2,
      vigencia_id: 2024,
    } as any;

    it('Debería generar auditorías correctamente y retornar la lista', async () => {
      jest
        .spyOn(auditoriaPadreService, 'getById')
        .mockResolvedValue(mockAuditoriaPadreConCantidad as any);

      jest.spyOn(auditoriaService, 'getAll').mockResolvedValue([] as any);
      jest.spyOn(estadoAuditoriaService, 'getAll').mockResolvedValue([] as any);

      const createdAuditorias = [{ _id: 'a1' }, { _id: 'a2' }];
      jest
        .spyOn(auditoriaService, 'post')
        .mockResolvedValueOnce(createdAuditorias[0] as any)
        .mockResolvedValueOnce(createdAuditorias[1] as any);

      jest
        .spyOn(estadoAuditoriaService, 'post')
        .mockResolvedValue(undefined as any);
      jest
        .spyOn(auditoriaPadreEstadoService, 'post')
        .mockResolvedValue(undefined as any);

      const result = await auditoriaPadreService.generarAuditorias(
        auditoriaPadreId,
        generarAuditoriaDto,
      );

      expect(auditoriaService.post).toHaveBeenCalledTimes(2);
      expect(estadoAuditoriaService.post).toHaveBeenCalledTimes(2);
      expect(auditoriaPadreEstadoService.post).toHaveBeenCalledTimes(1);
      expect(result).toEqual(createdAuditorias as any);
    });

    it('Debería generar auditorías únicamente auditorías faltantes', async () => {
      jest
        .spyOn(auditoriaPadreService, 'getById')
        .mockResolvedValue(mockAuditoriaPadreConCantidad as any);

      jest
        .spyOn(auditoriaService, 'getAll')
        .mockResolvedValue([{ _id: 'ex1' }] as any);

      jest
        .spyOn(estadoAuditoriaService, 'getAll')
        .mockResolvedValue([{ auditoria_id: 'ex1' }] as any);

      const createdAuditorias = [{ _id: 'a1' }];
      jest
        .spyOn(auditoriaService, 'post')
        .mockResolvedValueOnce(createdAuditorias[0] as any);

      jest
        .spyOn(estadoAuditoriaService, 'post')
        .mockResolvedValue(undefined as any);
      jest
        .spyOn(auditoriaPadreEstadoService, 'post')
        .mockResolvedValue(undefined as any);

      const result = await auditoriaPadreService.generarAuditorias(
        auditoriaPadreId,
        generarAuditoriaDto,
      );

      expect(auditoriaService.post).toHaveBeenCalledTimes(1);
      expect(estadoAuditoriaService.post).toHaveBeenCalledTimes(1);
      expect(result).toEqual(createdAuditorias as any);
    });

    it('Debería crear estados para auditorías hijas existentes cuando faltan', async () => {
      jest
        .spyOn(auditoriaPadreService, 'getById')
        .mockResolvedValue(mockAuditoriaPadreConCantidad as any);

      const auditoriasHijasExistentes = [{ _id: 'ex1' }, { _id: 'ex2' }];
      jest
        .spyOn(auditoriaService, 'getAll')
        .mockResolvedValue(auditoriasHijasExistentes as any);

      // No existen estados para las hijas
      jest.spyOn(estadoAuditoriaService, 'getAll').mockResolvedValue([] as any);

      const postEstadoSpy = jest
        .spyOn(estadoAuditoriaService, 'post')
        .mockResolvedValue(undefined as any);

      // Como ya hay 2 hijas y cantidad_auditorias=2, no se crearán auditorías nuevas
      jest
        .spyOn(auditoriaPadreEstadoService, 'post')
        .mockResolvedValue(undefined as any);

      const result = await auditoriaPadreService.generarAuditorias(
        auditoriaPadreId,
        generarAuditoriaDto,
      );

      expect(postEstadoSpy).toHaveBeenCalledTimes(
        auditoriasHijasExistentes.length,
      );
      expect(postEstadoSpy).toHaveBeenCalledWith(
        expect.objectContaining({ auditoria_id: 'ex1' }),
      );
      expect(postEstadoSpy).toHaveBeenCalledWith(
        expect.objectContaining({ auditoria_id: 'ex2' }),
      );
      expect(auditoriaService.post).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('Debería lanzar un error cuando falla la creación de estado para auditoría hija existente', async () => {
      const auditoriaPadre = {
        ...mockAuditoriaPadreConCantidad,
        _id: 'padre-ex-err',
        titulo: 'Padre Ex Err',
      };
      jest
        .spyOn(auditoriaPadreService, 'getById')
        .mockResolvedValue(auditoriaPadre as any);

      const auditoriasHijasExistentes = [{ _id: 'ex1' }, { _id: 'ex2' }];
      jest
        .spyOn(auditoriaService, 'getAll')
        .mockResolvedValue(auditoriasHijasExistentes as any);

      // No existen estados para las hijas
      jest.spyOn(estadoAuditoriaService, 'getAll').mockResolvedValue([] as any);

      // Falla la creación del estado en la segunda hija
      jest
        .spyOn(estadoAuditoriaService, 'post')
        .mockResolvedValueOnce(undefined as any)
        .mockRejectedValueOnce(new Error('estado fail'));

      await expect(
        auditoriaPadreService.generarAuditorias(
          auditoriaPadre._id,
          generarAuditoriaDto,
        ),
      ).rejects.toThrow(
        new Error(
          `Error al generar estado de auditoría hija existente ${auditoriasHijasExistentes[1]._id} de auditoríaPadre ${auditoriaPadre._id} (${auditoriaPadre.titulo}).`,
        ),
      );
    });

    it('Debería lanzar un error cuando auditoriaService.post falla en alguna iteración (varias auditorías)', async () => {
      const auditoriaPadre = {
        ...mockAuditoriaPadreConCantidad,
        _id: 'padre-err',
        titulo: 'Padre Err',
      };
      jest
        .spyOn(auditoriaPadreService, 'getById')
        .mockResolvedValue(auditoriaPadre as any);

      jest.spyOn(auditoriaService, 'getAll').mockResolvedValue([] as any);
      jest.spyOn(estadoAuditoriaService, 'getAll').mockResolvedValue([] as any);

      // Simula éxito en la primera creación y fallo en la segunda
      const created = [{ _id: 'a1' }];
      jest
        .spyOn(auditoriaService, 'post')
        .mockResolvedValueOnce(created[0] as any)
        .mockRejectedValueOnce(new Error('post failed'));

      await expect(
        auditoriaPadreService.generarAuditorias(
          auditoriaPadre._id,
          generarAuditoriaDto,
        ),
      ).rejects.toThrow(
        new Error(
          `Error al generar auditoría 2 de auditoríaPadre ${auditoriaPadre._id} (${auditoriaPadre.titulo}).`,
        ),
      );
    });

    it('Debería lanzar un error cuando estadoAuditoriaService.post falla en alguna iteración (varias auditorías)', async () => {
      const auditoriaPadre = {
        ...mockAuditoriaPadreConCantidad,
        _id: 'padre-2',
        titulo: 'Padre 2',
      };
      jest
        .spyOn(auditoriaPadreService, 'getById')
        .mockResolvedValue(auditoriaPadre as any);

      jest.spyOn(auditoriaService, 'getAll').mockResolvedValue([] as any);
      jest.spyOn(estadoAuditoriaService, 'getAll').mockResolvedValue([] as any);

      // auditoriaService crea dos auditorías
      jest
        .spyOn(auditoriaService, 'post')
        .mockResolvedValueOnce({ _id: 'new1' } as any)
        .mockResolvedValueOnce({ _id: 'new2' } as any);

      // estadoAuditoriaService falla en la segunda iteración
      jest
        .spyOn(estadoAuditoriaService, 'post')
        .mockResolvedValueOnce(undefined as any)
        .mockRejectedValueOnce(new Error('estado fail'));

      await expect(
        auditoriaPadreService.generarAuditorias(
          auditoriaPadre._id,
          generarAuditoriaDto,
        ),
      ).rejects.toThrow(
        new Error(
          `Error al generar estado de auditoría 2 de auditoríaPadre ${auditoriaPadre._id} (${auditoriaPadre.titulo}).`,
        ),
      );
    });

    it('Debería lanzar un error cuando estadoAuditoriaPadreService.post falla', async () => {
      const auditoriaPadre = {
        ...mockAuditoriaPadreConCantidad,
        _id: 'padre-3',
        titulo: 'Padre 3',
        cantidad_auditorias: 1,
      };
      jest
        .spyOn(auditoriaPadreService, 'getById')
        .mockResolvedValue(auditoriaPadre as any);

      jest.spyOn(auditoriaService, 'getAll').mockResolvedValue([] as any);
      jest.spyOn(estadoAuditoriaService, 'getAll').mockResolvedValue([] as any);

      jest
        .spyOn(auditoriaService, 'post')
        .mockResolvedValueOnce({ _id: 'new1' } as any);

      jest
        .spyOn(estadoAuditoriaService, 'post')
        .mockResolvedValue(undefined as any);
      // Mockea fallo al actualizar estado de auditoría padre
      jest
        .spyOn(auditoriaPadreEstadoService, 'post')
        .mockRejectedValue(new Error('estado padre fail'));

      await expect(
        auditoriaPadreService.generarAuditorias(
          auditoriaPadre._id,
          generarAuditoriaDto,
        ),
      ).rejects.toThrow(
        new Error(
          `Error al actualizar estado de auditoríaPadre ${auditoriaPadre._id} (${auditoriaPadre.titulo}) después de generar sus auditorías.`,
        ),
      );
    });

    it('Debería propagar error cuando la auditoría padre no existe', async () => {
      const missingId = 'no-existe';
      jest
        .spyOn(auditoriaPadreService, 'getById')
        .mockRejectedValue(new Error(`${missingId} no existe`));

      await expect(
        auditoriaPadreService.generarAuditorias(missingId, generarAuditoriaDto),
      ).rejects.toThrow(new Error(`${missingId} no existe`));
    });

    it('Debería lanzar error cuando la auditoría padre no tiene cantidad de auditorías', async () => {
      const auditoriaPadreSinCantidad = {
        ...mockAuditoriaPadreConCantidad,
        cantidad_auditorias: 0,
      };
      jest
        .spyOn(auditoriaPadreService, 'getById')
        .mockResolvedValue(auditoriaPadreSinCantidad as any);

      await expect(
        auditoriaPadreService.generarAuditorias(
          auditoriaPadreId,
          generarAuditoriaDto,
        ),
      ).rejects.toThrow(
        new Error(
          `La auditoría padre con ID ${auditoriaPadreId} no tiene una cantidad de auditorías asignada.`,
        ),
      );
    });
  });

  describe('generarUnaAuditoria', () => {
    const auditoriaPadreId = 'padre-una';
    const generarAuditoriaDto: GenerarAuditoriaDto = {
      auditoria_id: undefined,
      usuario_id: 1,
      usuario_rol: 'ADMIN',
      observacion: 'Generar una auditoría de prueba',
      estado_id_padre_actual: 1,
      estado_id_padre_nuevo: 2,
      estado_id_hija_actual: 1,
      estado_id_hija_nuevo: 2,
      fase_id: 'fase-1',
      fecha_ejecucion_estado: new Date(),
      activo: true,
    } as any;

    const mockAuditoriaPadreConCantidad = {
      _id: auditoriaPadreId,
      plan_auditoria_id: new Types.ObjectId('67197dda3416d2a85e5d6d8f'),
      titulo: 'Padre Único',
      cantidad_auditorias: 3,
      vigencia_id: 2024,
    } as any;

    it('Debería generar una auditoría cuando hay cupo disponible', async () => {
      jest
        .spyOn(auditoriaPadreService, 'getById')
        .mockResolvedValue(mockAuditoriaPadreConCantidad as any);

      jest
        .spyOn(auditoriaService, 'getAll')
        .mockResolvedValue([{ _id: 'ex1' }] as any);

      const generarAuditoriaSpy = jest
        .spyOn(auditoriaPadreService as any, 'generarAuditoria')
        .mockResolvedValue({ _id: 'nueva-auditoria' } as any);

      const result = await auditoriaPadreService.generarUnaAuditoria(
        auditoriaPadreId,
        generarAuditoriaDto,
      );

      expect(generarAuditoriaSpy).toHaveBeenCalledWith(
        1,
        mockAuditoriaPadreConCantidad,
        expect.objectContaining({
          estado_id: generarAuditoriaDto.estado_id_hija_nuevo,
          usuario_id: generarAuditoriaDto.usuario_id,
          usuario_rol: generarAuditoriaDto.usuario_rol,
          fase_id: generarAuditoriaDto.fase_id,
        }),
      );
      expect(result).toEqual({ _id: 'nueva-auditoria' });
    });

    it('Debería lanzar error cuando no existe cantidad_auditorias', async () => {
      const auditoriaPadreSinCantidad = {
        ...mockAuditoriaPadreConCantidad,
        cantidad_auditorias: 0,
      };

      jest
        .spyOn(auditoriaPadreService, 'getById')
        .mockResolvedValue(auditoriaPadreSinCantidad as any);

      await expect(
        auditoriaPadreService.generarUnaAuditoria(
          auditoriaPadreId,
          generarAuditoriaDto,
        ),
      ).rejects.toThrow(
        new Error(
          `La auditoría padre con ID ${auditoriaPadreId} no tiene una cantidad de auditorías asignada.`,
        ),
      );
    });

    it('Debería lanzar error cuando ya alcanzó el máximo de auditorías hijas', async () => {
      jest
        .spyOn(auditoriaPadreService, 'getById')
        .mockResolvedValue(mockAuditoriaPadreConCantidad as any);

      jest.spyOn(auditoriaService, 'getAll').mockResolvedValue(
        [{ _id: 'ex1' }, { _id: 'ex2' }, { _id: 'ex3' }] as any,
      );

      await expect(
        auditoriaPadreService.generarUnaAuditoria(
          auditoriaPadreId,
          generarAuditoriaDto,
        ),
      ).rejects.toThrow(
        new Error(
          `La auditoría padre con ID ${auditoriaPadreId} ya tiene el número máximo de auditorías hijas generadas.`,
        ),
      );
    });

    it('Debería propagar error cuando la auditoría padre no existe', async () => {
      const missingId = 'no-existe';
      jest
        .spyOn(auditoriaPadreService, 'getById')
        .mockRejectedValue(new Error(`${missingId} no existe`));

      await expect(
        auditoriaPadreService.generarUnaAuditoria(
          missingId,
          generarAuditoriaDto,
        ),
      ).rejects.toThrow(new Error(`${missingId} no existe`));
    });
  });

});
