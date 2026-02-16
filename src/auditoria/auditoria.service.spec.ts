import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaService } from './auditoria.service';
import { getModelToken } from '@nestjs/mongoose';
import { Auditoria } from './schemas/auditoria.schema';
import { AuditoriaDTO } from './dto/auditoria.dto';
import { PlanAuditoria } from '../plan-auditoria/schemas/plan-auditoria.schema';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockAuditoriaDTO: AuditoriaDTO = {
  titulo: 'Auditoría General 2024',
  tipo_evaluacion_id: 2,
  plan_auditoria_id: '67197dda3416d2a85e5d6d8f',
  cronograma_id: [1, 2, 3],
  estado_id: 3,
  no_auditoria: 123420,
  vigencia_id: 1234,
  consecutivo_OCI: 'EHS54F',
  consecutivo_IE: 'PASJF4532',
  tipo_id: 3,
  macroproceso: 4,
  macroproceso_id: 10,
  proceso_id: 20,
  dependencia_id: 30,
  lider_id: 3,
  responsable_id: 34,
  fecha_inicio: new Date('2024-01-01'),
  fecha_fin: new Date('2024-12-31'),
  objetivo: 'Evaluar el cumplimiento de procesos',
  alcance: 'Procesos administrativos y financieros',
  criterio: 'Normas ISO 9001',
  rec_tecnologico: 'Software de auditoría',
  rec_humano: 'Equipo de 5 auditores',
  rec_fisico: 'Oficinas y equipos',
  temas: 'Gestión de calidad, procesos, controles',
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_modificacion: new Date('2024-01-01'),
};

const mockAuditoria = {
  ...mockAuditoriaDTO,
  _id: '671aa963064222e6583d56e4',
};

const mockPlanAuditoria = {
  _id: '67197dda3416d2a85e5d6d8f',
  nombre: 'Plan Anual de Auditoría 2024',
  descripcion: 'Plan de auditoría para el año 2024',
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debería estar definido', () => {
    expect(auditoriaService).toBeDefined();
    expect(auditoriaModel).toBeDefined();
    expect(planAuditoriaModel).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver una auditoría cuando los datos son válidos', async () => {
      const planAuditoriaFindSpy = jest
        .spyOn(planAuditoriaModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
        } as any);

      const createSpy = jest
        .spyOn(auditoriaModel, 'create')
        .mockResolvedValue(mockAuditoria as any);

      const result = await auditoriaService.post(mockAuditoriaDTO);

      expect(planAuditoriaFindSpy).toHaveBeenCalledWith(
        mockAuditoriaDTO.plan_auditoria_id,
      );
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockAuditoriaDTO,
          activo: true,
          fechaCreacion: expect.any(Date),
          fechaModificacion: expect.any(Date),
        }),
      );
      expect(result).toEqual(mockAuditoria);
    });

    it('Debería lanzar un error si el PlanAuditoria no existe', async () => {
      const planAuditoriaFindSpy = jest
        .spyOn(planAuditoriaModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(auditoriaService.post(mockAuditoriaDTO)).rejects.toThrow(
        `Plan auditoria relacionada con id ${mockAuditoriaDTO.plan_auditoria_id} no existe`,
      );

      expect(planAuditoriaFindSpy).toHaveBeenCalledWith(
        mockAuditoriaDTO.plan_auditoria_id,
      );
      expect(auditoriaModel.create).not.toHaveBeenCalled();
    });

    it('Debería crear una auditoría incluso sin plan_auditoria_id', async () => {
      const dtoSinPlanAuditoria = {
        ...mockAuditoriaDTO,
        plan_auditoria_id: undefined,
      };
      const createSpy = jest
        .spyOn(auditoriaModel, 'create')
        .mockResolvedValue(mockAuditoria as any);

      const result = await auditoriaService.post(dtoSinPlanAuditoria);

      expect(planAuditoriaModel.findById).not.toHaveBeenCalled();
      expect(createSpy).toHaveBeenCalled();
      expect(result).toEqual(mockAuditoria);
    });

    it('Debería establecer activo en true y fechas automáticamente', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);

      const createSpy = jest
        .spyOn(auditoriaModel, 'create')
        .mockResolvedValue(mockAuditoria as any);

      await auditoriaService.post(mockAuditoriaDTO);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activo: true,
          fechaCreacion: expect.any(Date),
          fechaModificacion: expect.any(Date),
        }),
      );
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'activo:true',
      fields: 'titulo,objetivo,alcance',
      sortby: 'fecha_creacion',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'false',
    };

    const mockAuditorias = [
      {
        ...mockAuditoria,
        _id: '671aa963064222e6583d56e4',
        titulo: 'Auditoría 1',
      },
      {
        ...mockAuditoria,
        _id: '671aaa8a064222e6583d56e7',
        titulo: 'Auditoría 2',
      },
    ];

    it('Debería retornar todas las auditorías con filtros aplicados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAuditorias),
      };

      const findSpy = jest
        .spyOn(auditoriaModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await auditoriaService.getAll(mockFilterDto);

      expect(findSpy).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalled();
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual(mockAuditorias);
    });

    it('Debería aplicar populate cuando populate es "true"', async () => {
      const filterWithPopulate = { ...mockFilterDto, populate: 'true' };
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAuditorias),
      };

      jest.spyOn(auditoriaModel, 'find').mockReturnValue(mockQuery as any);

      await auditoriaService.getAll(filterWithPopulate);

      expect(mockQuery.populate).toHaveBeenCalledWith([
        { path: 'plan_auditoria_id' },
      ]);
    });

    it('Debería NO aplicar populate cuando populate es "false"', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAuditorias),
      };

      jest.spyOn(auditoriaModel, 'find').mockReturnValue(mockQuery as any);

      await auditoriaService.getAll(mockFilterDto);

      expect(mockQuery.populate).toHaveBeenCalledWith([]);
    });

    it('Debería retornar un array vacío cuando no hay resultados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(auditoriaModel, 'find').mockReturnValue(mockQuery as any);

      const result = await auditoriaService.getAll(mockFilterDto);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('Debería manejar errores de la base de datos', async () => {
      const mockError = new Error('Database error');
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(mockError),
      };

      jest.spyOn(auditoriaModel, 'find').mockReturnValue(mockQuery as any);

      await expect(auditoriaService.getAll(mockFilterDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getById', () => {
    it('Debería retornar una auditoría por su ID cuando existe', async () => {
      const findByIdSpy = jest
        .spyOn(auditoriaModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAuditoria),
        } as any);

      const result = await auditoriaService.getById(mockAuditoria._id);

      expect(findByIdSpy).toHaveBeenCalledWith(mockAuditoria._id);
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAuditoria);
    });

    it('Debería lanzar un error si la auditoría no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      const findByIdSpy = jest
        .spyOn(auditoriaModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(auditoriaService.getById(nonExistentId)).rejects.toThrow(
        `${nonExistentId} no existe`,
      );

      expect(findByIdSpy).toHaveBeenCalledWith(nonExistentId);
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database connection failed');
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(auditoriaService.getById(mockAuditoria._id)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('put', () => {
    const updateDto: AuditoriaDTO = {
      ...mockAuditoriaDTO,
      titulo: 'Auditoría Actualizada 2024',
      objetivo: 'Objetivo actualizado',
      alcance: 'Alcance ampliado',
    };

    it('Debería actualizar una auditoría existente', async () => {
      const updatedAuditoria = { ...mockAuditoria, ...updateDto };

      const planAuditoriaFindSpy = jest
        .spyOn(planAuditoriaModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
        } as any);

      const updateSpy = jest
        .spyOn(auditoriaModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedAuditoria),
        } as any);

      const result = await auditoriaService.put(mockAuditoria._id, updateDto);

      expect(planAuditoriaFindSpy).toHaveBeenCalledWith(
        updateDto.plan_auditoria_id,
      );
      expect(updateSpy).toHaveBeenCalledWith(
        mockAuditoria._id,
        expect.objectContaining({
          ...updateDto,
          fecha_modificacion: expect.any(Date),
        }),
        { new: true },
      );
      expect(result).toEqual(updatedAuditoria);
    });

    it('Debería eliminar fecha_creacion del DTO antes de actualizar', async () => {
      const dtoWithCreationDate = {
        ...updateDto,
        fecha_creacion: new Date('2024-01-01'),
      };

      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);

      const updateSpy = jest
        .spyOn(auditoriaModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAuditoria),
        } as any);

      await auditoriaService.put(mockAuditoria._id, dtoWithCreationDate);

      const calledWith = updateSpy.mock.calls[0][1];
      expect(calledWith).not.toHaveProperty('fecha_creacion');
      expect(calledWith).toHaveProperty('fecha_modificacion');
    });

    it('Debería lanzar un error si la auditoría no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);

      const updateSpy = jest
        .spyOn(auditoriaModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(
        auditoriaService.put(nonExistentId, updateDto),
      ).rejects.toThrow(`${nonExistentId} no existe`);

      expect(updateSpy).toHaveBeenCalledWith(
        nonExistentId,
        expect.any(Object),
        { new: true },
      );
    });

    it('Debería lanzar un error si el PlanAuditoria relacionado no existe', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        auditoriaService.put(mockAuditoria._id, updateDto),
      ).rejects.toThrow(
        `Plan auditoria relacionada con id ${updateDto.plan_auditoria_id} no existe`,
      );

      expect(auditoriaModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('Debería actualizar sin verificar PlanAuditoria si no se proporciona plan_auditoria_id', async () => {
      const dtoSinPlanAuditoria = {
        ...updateDto,
        plan_auditoria_id: undefined,
      };

      const updateSpy = jest
        .spyOn(auditoriaModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAuditoria),
        } as any);

      await auditoriaService.put(mockAuditoria._id, dtoSinPlanAuditoria);

      expect(planAuditoriaModel.findById).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalled();
    });

    it('Debería actualizar fecha_modificacion automáticamente', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);

      const updateSpy = jest
        .spyOn(auditoriaModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAuditoria),
        } as any);

      const dateBefore = new Date();
      await auditoriaService.put(mockAuditoria._id, updateDto);
      const dateAfter = new Date();

      const calledWith = updateSpy.mock.calls[0][1];
      expect(calledWith.fecha_modificacion).toBeInstanceOf(Date);
      expect(calledWith.fecha_modificacion.getTime()).toBeGreaterThanOrEqual(
        dateBefore.getTime(),
      );
      expect(calledWith.fecha_modificacion.getTime()).toBeLessThanOrEqual(
        dateAfter.getTime(),
      );
    });
  });

  describe('delete', () => {
    it('Debería marcar una auditoría como inactiva (soft delete)', async () => {
      const deletedAuditoria = { ...mockAuditoria, activo: false };

      const deleteSpy = jest
        .spyOn(auditoriaModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(deletedAuditoria),
        } as any);

      const result = await auditoriaService.delete(mockAuditoria._id);

      expect(deleteSpy).toHaveBeenCalledWith(
        mockAuditoria._id,
        { activo: false },
        { new: true },
      );
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deletedAuditoria);
      expect(result.activo).toBe(false);
    });

    it('Debería lanzar un error si la auditoría no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      const deleteSpy = jest
        .spyOn(auditoriaModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(auditoriaService.delete(nonExistentId)).rejects.toThrow(
        `${nonExistentId} no existe`,
      );

      expect(deleteSpy).toHaveBeenCalledWith(
        nonExistentId,
        { activo: false },
        { new: true },
      );
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error during delete');

      jest.spyOn(auditoriaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(auditoriaService.delete(mockAuditoria._id)).rejects.toThrow(
        'Database error during delete',
      );
    });
  });

  describe('count', () => {
    const filterDto: FilterDto = {
      query: 'activo:true',
      fields: '',
      sortby: '',
      order: '',
      limit: '',
      offset: '',
      populate: '',
    };

    it('Debería retornar la cantidad de documentos que coinciden con el filtro', async () => {
      const expectedCount = 5;

      const countSpy = jest
        .spyOn(auditoriaModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(expectedCount),
        } as any);

      const result = await auditoriaService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(countSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedCount);
    });

    it('Debería retornar 0 cuando no hay documentos que coincidan', async () => {
      const countSpy = jest
        .spyOn(auditoriaModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(0),
        } as any);

      const result = await auditoriaService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      const mockError = new Error('Error al contar documentos');

      jest.spyOn(auditoriaModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(auditoriaService.count(filterDto)).rejects.toThrow(
        'Error al contar documentos',
      );
    });

    it('Debería aplicar correctamente los filtros del FilterDto', async () => {
      const complexFilterDto: FilterDto = {
        query: 'activo:true,estado_id:3',
        fields: 'titulo,objetivo,alcance',
        sortby: 'fecha_creacion',
        order: 'desc',
        limit: '10',
        offset: '0',
        populate: 'false',
      };

      const countSpy = jest
        .spyOn(auditoriaModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(3),
        } as any);

      const result = await auditoriaService.count(complexFilterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(3);
    });
  });
});
