import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EjecutorDependenciaService,
  MAX_EJECUTORES_POR_DEPENDENCIA,
} from './ejecutor-dependencia.service';
import { EjecutorDependencia } from './schema/ejecutor-dependencia.schema';
import { EjecutorDependenciaDto } from './dto/ejecutor-dependencia.dto';

const ID = '507f1f77bcf86cd799439011';

const crearDto = (
  over: Partial<EjecutorDependenciaDto> = {},
): EjecutorDependenciaDto => ({
  dependencia_id: 10,
  usuario_id: 100,
  ...over,
});

const execResuelve = (valor: any) => ({
  exec: jest.fn().mockResolvedValue(valor),
});
const leanExec = (valor: any) => ({
  lean: jest.fn().mockReturnValue(execResuelve(valor)),
});

describe('EjecutorDependenciaService', () => {
  let service: EjecutorDependenciaService;
  let model: Model<EjecutorDependencia>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EjecutorDependenciaService,
        {
          provide: getModelToken(EjecutorDependencia.name),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
            updateMany: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(EjecutorDependenciaService);
    model = module.get(getModelToken(EjecutorDependencia.name));
  });

  afterEach(() => jest.clearAllMocks());

  /** Sin asignación previa del usuario y bajo el cupo de la dependencia. */
  const reglasOk = (activos = 0) => {
    jest.spyOn(model, 'findOne').mockReturnValue(leanExec(null) as any);
    jest
      .spyOn(model, 'countDocuments')
      .mockReturnValue(execResuelve(activos) as any);
  };

  describe('post · reglas de asignación', () => {
    it('crea la asignación cuando cumple cupo y exclusividad', async () => {
      reglasOk(2);
      const createSpy = jest
        .spyOn(model, 'create')
        .mockResolvedValue({ _id: ID } as any);

      await service.post(crearDto());

      const data = createSpy.mock.calls[0][0] as any;
      expect(data.activo).toBe(true);
      expect(data.actual).toBe(true);
      expect(data.usuario_rol).toBe('ejecutor');
    });

    it('rechaza el cuarto ejecutor de una dependencia', async () => {
      reglasOk(MAX_EJECUTORES_POR_DEPENDENCIA);

      await expect(service.post(crearDto())).rejects.toThrow(
        /máximo de 3 ejecutores activos/,
      );
      expect(model.create).not.toHaveBeenCalled();
    });

    it('rechaza a un usuario ya activo en otra dependencia', async () => {
      jest
        .spyOn(model, 'findOne')
        .mockReturnValue(leanExec({ dependencia_id: 99 }) as any);

      await expect(
        service.post(crearDto({ dependencia_id: 10 })),
      ).rejects.toThrow(/ejecutor activo en otra dependencia/);
    });

    it('rechaza el duplicado del mismo usuario en la misma dependencia', async () => {
      jest
        .spyOn(model, 'findOne')
        .mockReturnValue(leanExec({ dependencia_id: 10 }) as any);

      await expect(
        service.post(crearDto({ dependencia_id: 10 })),
      ).rejects.toThrow(/ya está asignado como ejecutor en esta dependencia/);
    });
  });

  describe('put · reactivación', () => {
    it('revalida reglas cuando la modificación deja el registro vigente', async () => {
      jest.spyOn(model, 'findById').mockReturnValue(
        execResuelve({
          _id: ID,
          dependencia_id: 10,
          usuario_id: 100,
          activo: false,
          actual: false,
        }) as any,
      );
      reglasOk(MAX_EJECUTORES_POR_DEPENDENCIA);

      await expect(
        service.put(ID, crearDto({ activo: true, actual: true })),
      ).rejects.toThrow(/máximo de 3 ejecutores activos/);
    });

    it('no revalida reglas si la modificación no reactiva el registro', async () => {
      jest.spyOn(model, 'findById').mockReturnValue(
        execResuelve({
          _id: ID,
          dependencia_id: 10,
          usuario_id: 100,
          activo: false,
          actual: false,
        }) as any,
      );
      const findOneSpy = jest.spyOn(model, 'findOne');
      jest
        .spyOn(model, 'findByIdAndUpdate')
        .mockReturnValue(execResuelve({ _id: ID }) as any);

      await service.put(ID, crearDto({ fecha_fin: new Date() }));

      expect(findOneSpy).not.toHaveBeenCalled();
    });
  });

  describe('desactivarVencidos · consulta del job', () => {
    it('desactiva solo los activos con fecha_fin vencida y conserva historial', async () => {
      const updateSpy = jest
        .spyOn(model, 'updateMany')
        .mockReturnValue(execResuelve({ modifiedCount: 2 }) as any);

      const ref = new Date('2024-01-01T00:00:00Z');
      const res = await service.desactivarVencidos(ref);

      const [filtro, cambios] = updateSpy.mock.calls[0] as any[];
      expect(filtro.activo).toBe(true);
      expect(filtro.fecha_fin).toEqual({ $ne: null, $lte: ref });
      expect(cambios.$set).toMatchObject({ activo: false, actual: false });
      expect(res).toEqual({ desactivados: 2 });
    });

    it('es idempotente: si no hay vencidos nuevos devuelve 0', async () => {
      jest
        .spyOn(model, 'updateMany')
        .mockReturnValue(execResuelve({ modifiedCount: 0 }) as any);

      await expect(service.desactivarVencidos()).resolves.toEqual({
        desactivados: 0,
      });
    });
  });
});
