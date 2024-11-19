import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaService } from './auditoria.service';
import { getModelToken } from '@nestjs/mongoose';
import { Auditoria } from './schemas/auditoria.schema';
import { AuditoriaDTO } from './dto/auditoria.dto';
import { PlanAuditoria } from '../plan-auditoria/schemas/plan-auditoria.schema';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockAuditoriaDTO: AuditoriaDTO = {
  titulo: "auditoria 1",
  tipo_evaluacion_id: 2,
  plan_auditoria_id: "67197dda3416d2a85e5d6d8f",
  cronograma_id: Array (3),
  estado_id: 3,
  no_auditoria: 123420,
  vigencia_id: 1234,
  consecutivo_OCI: "EHS54F",
  consecutivo_IE: "PASJF4532",
  tipo_id: 3,
  macroproceso: 4,
  lider_id: 3,
  responsable_id: 34,
  fecha_inicio: new Date(),
  fecha_fin: new Date(),
  objetivo: "objetivo",
  alcance: "alcance",
  criterio: "criterio",
  rec_tecnologico: "rec_T",
  rec_humano: "rec_H",
  rec_fisico: "rec_F",
  activo: true,
  fecha_creacion: new Date(),
  fecha_modificacion: new Date(),
};


const mockAuditoria = {
  ...mockAuditoriaDTO,
  _id: '671aa963064222e6583d56e4',
};

const mockPlanAuditoria = {
  _id: '66aed6a431c4ca1c60085cdd',
  nombre: 'PlanAuditoria de Prueba',
};

describe('AuditoriaService', () => {
  let auditoriaService: AuditoriaService;
  let auditoriaModel: Model<Auditoria>;
  let planAuditoriaModel: Model<PlanAuditoria>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriaService,
        {
          provide: getModelToken(Auditoria.name),
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

    auditoriaService = module.get<AuditoriaService>(AuditoriaService);
    auditoriaModel = module.get<Model<Auditoria>>(
      getModelToken(Auditoria.name),
    );
    planAuditoriaModel = module.get<Model<PlanAuditoria>>(
      getModelToken(PlanAuditoria.name),
    );
  });

  it('Debería estar definido', () => {
    expect(AuditoriaService).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver una auditoria', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);
      jest
        .spyOn(auditoriaModel, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockAuditoriaDTO as any));

      const result = await auditoriaService.post(mockAuditoriaDTO);
      expect(result).toEqual(mockAuditoriaDTO);
    });

    it('Debería lanzar un error si el PlanAuditoria no existe', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(auditoriaService.post(mockAuditoriaDTO)).rejects.toThrow(
        `Plan auditoria relacionada con id ${mockAuditoriaDTO.plan_auditoria_id} no existe`,
      );
    });
  });

  describe('getAll', () => {
    it('Debería retornar todas las auditorias con filtros aplicados', async () => {
      const mockAuditorias = [
        mockAuditoria,
        {
          _id: '671aa963064222e6583d56e4',
          titulo: "auditoria 1",
          tipoEvaluacionId: 2,
          plan_auditoria_id: "67197f9a3416d2a85e5d6d93",
          cronogramaActividad: Array (3),
          estadoId: 3,
          noAuditoria: 123420,
          vigencia_id: 12345,
          consecutivoOCI: "EHS54F",
          consecutivoIE: "PASJF4532",
          tipoAd: 3,
          macroproceso: 4,
          lider: 3,
          responsable: 34,
          fechaInicio: new Date(),
          fechaFin: new Date(),
          objetivo: "objetivo",
          alcance: "alcance",
          criterio: "criterio",
          recTecnologico: "rec_T",
          recHumano: "rec_H",
          recFisico: "rec_F",
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

      jest.spyOn(auditoriaModel, 'find').mockReturnValue(mockQuery as any);

      const result = await auditoriaService.getAll(mockFilterDto);

      expect(result).toEqual(mockAuditorias);
    });
  });

  describe('getById', () => {
    it('Debería retornar una auditoria por su ID', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockAuditoria as unknown as Auditoria),
      } as any);

      const result = await auditoriaService.getById(mockAuditoria._id);

      expect(auditoriaModel.findById).toHaveBeenCalledWith(
        mockAuditoria._id,
      );
      expect(result).toEqual(mockAuditoria);
    });

    it('Debería lanzar un error si la auditoria no existe', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        auditoriaService.getById(mockAuditoria._id),
      ).rejects.toThrow(`${mockAuditoria._id} no existe`);

      expect(auditoriaModel.findById).toHaveBeenCalledWith(
        mockAuditoria._id,
      );
    });
  });

  describe('put', () => {
    it('Debería actualizar una auditoria', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);
      jest.spyOn(auditoriaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockAuditoriaDTO as unknown as Auditoria),
      } as any);

      const result = await auditoriaService.put(
        mockAuditoria._id,
        mockAuditoriaDTO,
      );

      expect(auditoriaModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockAuditoria._id,
        mockAuditoriaDTO,
        { new: true },
      );
      expect(result).toEqual(mockAuditoriaDTO);
    });

    it('Debería lanzar un error si la auditoria no existe', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);
      jest.spyOn(auditoriaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        auditoriaService.put(mockAuditoria._id, mockAuditoriaDTO),
      ).rejects.toThrow(`${mockAuditoria._id} no existe`);

      expect(auditoriaModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockAuditoria._id,
        mockAuditoriaDTO,
        { new: true },
      );
    });

    it('Debería lanzar un error si el PlanAuditoria relacionado no existe', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        auditoriaService.put(mockAuditoria._id, mockAuditoriaDTO),
      ).rejects.toThrow(
        `Plan auditoria relacionada con id ${mockAuditoriaDTO.plan_auditoria_id} no existe`,
      );
    });
  });

  describe('delete', () => {
    it('Debería marcar una auditoria como inactiva', async () => {
      jest.spyOn(auditoriaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockAuditoriaDTO as unknown as Auditoria),
      } as any);

      const result = await auditoriaService.delete(mockAuditoria._id);

      expect(result).toEqual(mockAuditoriaDTO);
    });

    it('Debería lanzar un error si la auditoria no existe', async () => {
      jest.spyOn(auditoriaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        auditoriaService.delete(mockAuditoria._id),
      ).rejects.toThrow(`${mockAuditoria._id} no existe`);
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
      
      jest.spyOn(auditoriaModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      } as any);

      const result = await auditoriaService.count(filterDto);

      expect(result).toBe(2);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      jest.spyOn(auditoriaModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Error al contar documentos')),
      } as any);

      await expect(auditoriaService.count(filterDto)).rejects.toThrow(
        'Error al contar documentos',
      );
    });
  });
});