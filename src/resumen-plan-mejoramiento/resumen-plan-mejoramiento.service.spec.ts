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

  it('no consulta la base de datos sin dependencias', async () => {
    const resumen = await service.getResumen({
      ...filtros,
      dependencia_ids: [],
    });

    expect(resumen).toEqual({ total_auditorias: 0, por_estado: [] });
    expect(aggregate).not.toHaveBeenCalled();
  });
});
