import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuditoriaPadre } from '../auditoria-padre/schemas/auditoria-padre.schema';
import {
  FiltrosResumenPlan,
  ResumenPlanMejoramientoService,
} from './resumen-plan-mejoramiento.service';

const filtros: FiltrosResumenPlan = {
  vigencia_id: 7087,
  tipo_evaluacion_id: 6770,
  dependencia_ids: [32, 45],
  estado_auditoria_id: 7079,
};

describe('ResumenPlanMejoramientoService', () => {
  let service: ResumenPlanMejoramientoService;
  const aggregate = jest.fn();

  beforeEach(async () => {
    aggregate.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumenPlanMejoramientoService,
        {
          provide: getModelToken(AuditoriaPadre.name),
          useValue: { aggregate },
        },
      ],
    }).compile();

    service = module.get<ResumenPlanMejoramientoService>(
      ResumenPlanMejoramientoService,
    );
  });

  it('devuelve los conteos por estado y el total', async () => {
    aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        { estado_id: null, cantidad: 2 },
        { estado_id: 7084, cantidad: 3 },
      ]),
    });

    const resumen = await service.getResumen(filtros);

    expect(resumen).toEqual({
      total_auditorias: 5,
      por_estado: [
        { estado_id: null, cantidad: 2 },
        { estado_id: 7084, cantidad: 3 },
      ],
    });
  });

  it('filtra auditorías padre y auditorías con los parámetros recibidos', () => {
    const [matchPadre, lookupAuditoria] = service.construirPipeline(
      filtros,
    ) as any[];

    expect(matchPadre.$match).toEqual({
      activo: true,
      vigencia_id: 7087,
      tipo_evaluacion_id: 6770,
      dependencia_id: { $in: [32, 45] },
    });
    expect(lookupAuditoria.$lookup.from).toBe('auditoria');
    expect(lookupAuditoria.$lookup.pipeline[0].$match).toMatchObject({
      activo: true,
      estado_id: 7079,
    });
  });

  it('solo considera planes activos', () => {
    const lookupPlan = (service.construirPipeline(filtros) as any[]).find(
      (etapa) => etapa.$lookup?.from === 'plan_mejoramiento',
    );

    expect(lookupPlan.$lookup.pipeline[0].$match.activo).toBe(true);
  });

  it('no consulta la base de datos con una lista de dependencias vacía', async () => {
    const resumen = await service.getResumen({
      ...filtros,
      dependencia_ids: [],
    });

    expect(resumen).toEqual({ total_auditorias: 0, por_estado: [] });
    expect(aggregate).not.toHaveBeenCalled();
  });

  describe('vista del auditor', () => {
    const sinDependencias: FiltrosResumenPlan = {
      ...filtros,
      dependencia_ids: undefined,
    };
    const etapaDe = (pipeline: any[], from: string) =>
      pipeline.find((etapa) => etapa.$lookup?.from === from);

    it('sin dependencias ni auditor cuenta toda la institución', () => {
      const pipeline = service.construirPipeline(sinDependencias) as any[];

      expect(pipeline[0].$match).toEqual({
        activo: true,
        vigencia_id: 7087,
        tipo_evaluacion_id: 6770,
      });
      expect(etapaDe(pipeline, 'auditoria_auditor')).toBeUndefined();
      expect(etapaDe(pipeline, 'plan_mejoramiento_auditor')).toBeUndefined();
    });

    it('con auditor solo deja las auditorías donde es auditor de la auditoría o del plan', () => {
      const pipeline = service.construirPipeline({
        ...sinDependencias,
        auditor_id: 10,
      }) as any[];

      expect(
        etapaDe(pipeline, 'auditoria_auditor').$lookup.pipeline[0].$match,
      ).toMatchObject({ activo: true, asignado: true, auditor_id: 10 });
      expect(
        etapaDe(pipeline, 'plan_mejoramiento_auditor').$lookup.pipeline[0]
          .$match,
      ).toMatchObject({ activo: true, auditor_id: 10 });
      expect(pipeline).toContainEqual({
        $match: {
          $or: [
            { 'asignacion_auditoria.0': { $exists: true } },
            { 'asignacion_plan.0': { $exists: true } },
          ],
        },
      });
    });

    it('filtra por asignación antes de agrupar por estado', () => {
      const pipeline = service.construirPipeline({
        ...sinDependencias,
        auditor_id: 10,
      }) as any[];
      const indiceFiltro = pipeline.findIndex((e) => e.$match?.$or);
      const indiceGrupo = pipeline.findIndex((e) => e.$group);

      expect(indiceFiltro).toBeGreaterThan(-1);
      expect(indiceFiltro).toBeLessThan(indiceGrupo);
    });

    it('consulta la base de datos sin lista de dependencias', async () => {
      aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ estado_id: null, cantidad: 4 }]),
      });

      const resumen = await service.getResumen({
        ...sinDependencias,
        auditor_id: 10,
      });

      expect(resumen.total_auditorias).toBe(4);
      expect(aggregate).toHaveBeenCalledTimes(1);
    });
  });
});
