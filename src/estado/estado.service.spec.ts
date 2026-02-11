import { Test, TestingModule } from '@nestjs/testing';
import { EstadoService } from './estado.service';
import { getModelToken } from '@nestjs/mongoose';
import { PlanEstado } from './schema/estado.schema';
import { PlanEstadoDto } from './dto/estado.dto';
import { PlanAuditoria } from '../plan-auditoria/schemas/plan-auditoria.schema';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockEstadoPlanDTO: PlanEstadoDto = {
  plan_auditoria_id: '672d3050f7814a9a0c5261d4',
  usuario_id: 76767,
  observacion: 'llll',
  estado_id: 2552,
  fecha_ejecucion_estado: new Date(),
  activo: true,
};

const mockEstadoPlan = {
  ...mockEstadoPlanDTO,
  _id: '672d36737e962bcac5ce9beb',
};
describe('EstadoService', () => {
  let estadoPlanService: EstadoService;
  let PlanEstadoModel: Model<PlanEstado>;
  let planAuditoriaModel: Model<PlanAuditoria>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstadoService,
        {
          provide: getModelToken(PlanEstado.name),
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
      ],
    }).compile();

    estadoPlanService = module.get<EstadoService>(EstadoService);
    PlanEstadoModel = module.get<Model<PlanEstado>>(
      getModelToken(PlanEstado.name),
    );
    planAuditoriaModel = module.get<Model<PlanAuditoria>>(
      getModelToken(PlanAuditoria.name),
    );
  });

  it('Debería estar definido', () => {
    expect(EstadoService).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver una auditoria', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEstadoPlan),
      } as any);
      jest
        .spyOn(PlanEstadoModel, 'create')
        .mockImplementationOnce(() =>
          Promise.resolve(mockEstadoPlanDTO as any),
        );

      const result = await estadoPlanService.post(mockEstadoPlanDTO);
      expect(result).toEqual(mockEstadoPlanDTO);
    });

    it('Debería lanzar un error si el Plan auditoria no existe', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(estadoPlanService.post(mockEstadoPlanDTO)).rejects.toThrow(
        `Plan auditoria relacionada con id ${mockEstadoPlanDTO.plan_auditoria_id} no existe`,
      );
    });
  });

  describe('getAll', () => {
    it('Debería retornar todas las auditorias con filtros aplicados', async () => {
      const mockAuditorias = [
        mockEstadoPlan,
        {
          _id: '671aa963064222e6583d56e4',
          titulo: 'auditoria 1',
          tipoEvaluacionId: 2,
          plan_auditoria_id: '67197f9a3416d2a85e5d6d93',
          cronogramaActividad: Array(3),
          estadoId: 3,
          noAuditoria: 123420,
          consecutivoOCI: 'EHS54F',
          consecutivoIE: 'PASJF4532',
          tipoAd: 3,
          macroproceso: 4,
          lider: 3,
          responsable: 34,
          fechaInicio: new Date(),
          fechaFin: new Date(),
          objetivo: 'objetivo',
          alcance: 'alcance',
          criterio: 'criterio',
          recTecnologico: 'rec_T',
          recHumano: 'rec_H',
          recFisico: 'rec_F',
          activo: true,
          fechaCreacion: new Date(),
          fechaModificacion: new Date(),
        },
      ];

      const mockFilterDto: FilterDto = {
        query: '',
        fields: '',
        sortby: '',
        order: '',
        limit: '',
        offset: '',
        populate: '',
      };

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAuditorias),
      };

      jest.spyOn(PlanEstadoModel, 'find').mockReturnValue(mockQuery as any);

      const result = await estadoPlanService.getAll(mockFilterDto);

      expect(result).toEqual(mockAuditorias);
    });
  });

  describe('getById', () => {
    it('Debería retornar una auditoria por su ID', async () => {
      jest.spyOn(PlanEstadoModel, 'findById').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockEstadoPlan as unknown as PlanEstado),
      } as any);

      const result = await estadoPlanService.getById(mockEstadoPlan._id);

      expect(PlanEstadoModel.findById).toHaveBeenCalledWith(mockEstadoPlan._id);
      expect(result).toEqual(mockEstadoPlan);
    });

    it('Debería lanzar un error si la auditoria no existe', async () => {
      jest.spyOn(PlanEstadoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        estadoPlanService.getById(mockEstadoPlan._id),
      ).rejects.toThrow(`${mockEstadoPlan._id} no existe`);

      expect(PlanEstadoModel.findById).toHaveBeenCalledWith(mockEstadoPlan._id);
    });
  });

  describe('put', () => {
    it('Debería actualizar una auditoria', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEstadoPlan),
      } as any);
      jest.spyOn(PlanEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockEstadoPlanDTO as unknown as PlanEstado),
      } as any);

      const result = await estadoPlanService.put(
        mockEstadoPlan._id,
        mockEstadoPlanDTO,
      );

      expect(PlanEstadoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockEstadoPlan._id,
        mockEstadoPlanDTO,
        { new: true },
      );
      expect(result).toEqual(mockEstadoPlanDTO);
    });

    it('Debería lanzar un error si la auditoria no existe', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEstadoPlan),
      } as any);
      jest.spyOn(PlanEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        estadoPlanService.put(mockEstadoPlan._id, mockEstadoPlanDTO),
      ).rejects.toThrow(`${mockEstadoPlan._id} no existe`);

      expect(PlanEstadoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockEstadoPlan._id,
        mockEstadoPlanDTO,
        { new: true },
      );
    });

    it('Debería lanzar un error si el Plan auditoria relacionado no existe', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        estadoPlanService.put(mockEstadoPlan._id, mockEstadoPlanDTO),
      ).rejects.toThrow(
        `Plan auditoria relacionada con id ${mockEstadoPlanDTO.plan_auditoria_id} no existe`,
      );
    });
  });

  describe('delete', () => {
    it('Debería marcar una auditoria como inactiva', async () => {
      jest.spyOn(PlanEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockEstadoPlanDTO as unknown as PlanEstado),
      } as any);

      const result = await estadoPlanService.delete(mockEstadoPlan._id);

      expect(result).toEqual(mockEstadoPlanDTO);
    });

    it('Debería lanzar un error si la auditoria no existe', async () => {
      jest.spyOn(PlanEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        estadoPlanService.delete(mockEstadoPlan._id),
      ).rejects.toThrow(`${mockEstadoPlan._id} no existe`);
    });
  });

  describe('count', () => {
    const filterDto: FilterDto = {
      query: 'tipoEvaluacionId:3',
      fields: '',
      sortby: '',
      order: '',
      limit: '',
      offset: '',
      populate: '',
    };
    it('Debería retornar la cantidad de documentos', async () => {
      jest.spyOn(PlanEstadoModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      } as any);

      const result = await estadoPlanService.count(filterDto);

      expect(result).toBe(2);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      jest.spyOn(PlanEstadoModel, 'countDocuments').mockReturnValue({
        exec: jest
          .fn()
          .mockRejectedValue(new Error('Error al contar documentos')),
      } as any);

      await expect(estadoPlanService.count(filterDto)).rejects.toThrow(
        'Error al contar documentos',
      );
    });
  });
});
