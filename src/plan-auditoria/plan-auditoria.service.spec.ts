import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PlanAuditoriaService } from './plan-auditoria.service';
import { PlanAuditoria } from './schemas/plan-auditoria.schema';
import { PlanAuditoriaDTO } from './dto/plan-auditoria.dto';
import { FilterDto } from '../filters/filters.dto';
import { AuditoriaPadreService } from 'src/auditoria-padre/auditoria-padre.service';
import { GenerarAuditoriaDto } from '../auditoria-padre/dto/generar-auditoria.dto';

const mockPlanAuditoriaDTO: PlanAuditoriaDTO = {
  objetivo: 'Evaluar la eficiencia de los procesos administrativos',
  alcance: 'Departamento de recursos humanos y finanzas',
  criterio: 'Normativa ISO 9001 y procedimientos internos',
  recurso: 'Equipo de 5 auditores, software de análisis',
  creado_por_id: 10,
  vigencia_id: 2024,
  aprobado_jefe_dependencia: true,
  jefe_dependencia_id: 5541,
  aprobado_secretario_tecnico: true,
  secretario_tecnico_id: 278,
  auditorias: [
    new Types.ObjectId('67197dda3416d2a85e5d6d90'),
    new Types.ObjectId('67197dda3416d2a85e5d6d91'),
  ],
  activo: true,
  fecha_creacion: new Date('2024-01-15'),
  fecha_modificacion: new Date('2024-01-15'),
};

const mockPlanAuditoria = {
  ...mockPlanAuditoriaDTO,
  _id: '67197dda3416d2a85e5d6d8f',
};

describe('PlanAuditoriaService', () => {
  let planAuditoriaService: PlanAuditoriaService;
  let planAuditoriaModel: Model<PlanAuditoria>;
  let auditoriaPadreService: AuditoriaPadreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanAuditoriaService,
        {
          provide: getModelToken(PlanAuditoria.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: AuditoriaPadreService,
          useValue: {
            getAll: jest.fn(),
            generarAuditorias: jest.fn(),
          },
        },
      ],
    }).compile();

    planAuditoriaService =
      module.get<PlanAuditoriaService>(PlanAuditoriaService);
    planAuditoriaModel = module.get<Model<PlanAuditoria>>(
      getModelToken(PlanAuditoria.name),
    );
    auditoriaPadreService = module.get<AuditoriaPadreService>(
      AuditoriaPadreService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debería estar definido', () => {
    expect(planAuditoriaService).toBeDefined();
    expect(planAuditoriaModel).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver un plan de auditoría cuando los datos son válidos', async () => {
      const findOneSpy = jest
        .spyOn(planAuditoriaModel, 'findOne')
        .mockResolvedValue(null);

      const createSpy = jest
        .spyOn(planAuditoriaModel, 'create')
        .mockResolvedValue(mockPlanAuditoria as any);

      const result = await planAuditoriaService.post(mockPlanAuditoriaDTO);

      expect(findOneSpy).toHaveBeenCalledWith({
        vigencia_id: mockPlanAuditoriaDTO.vigencia_id,
        activo: true,
      });
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          objetivo: mockPlanAuditoriaDTO.objetivo,
          vigencia_id: mockPlanAuditoriaDTO.vigencia_id,
          activo: true,
          fecha_creacion: expect.any(Date),
          fecha_modificacion: expect.any(Date),
        }),
      );
      expect(result).toEqual(mockPlanAuditoria);
    });

    it('Debería establecer activo en true automáticamente', async () => {
      jest.spyOn(planAuditoriaModel, 'findOne').mockResolvedValue(null);

      const createSpy = jest
        .spyOn(planAuditoriaModel, 'create')
        .mockResolvedValue(mockPlanAuditoria as any);

      await planAuditoriaService.post(mockPlanAuditoriaDTO);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activo: true,
        }),
      );
    });

    it('Debería establecer fecha_creacion automáticamente', async () => {
      jest.spyOn(planAuditoriaModel, 'findOne').mockResolvedValue(null);

      const createSpy = jest
        .spyOn(planAuditoriaModel, 'create')
        .mockResolvedValue(mockPlanAuditoria as any);

      await planAuditoriaService.post(mockPlanAuditoriaDTO);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          fecha_creacion: expect.any(Date),
        }),
      );
    });

    it('Debería establecer fecha_modificacion automáticamente', async () => {
      jest.spyOn(planAuditoriaModel, 'findOne').mockResolvedValue(null);

      const createSpy = jest
        .spyOn(planAuditoriaModel, 'create')
        .mockResolvedValue(mockPlanAuditoria as any);

      await planAuditoriaService.post(mockPlanAuditoriaDTO);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          fecha_modificacion: expect.any(Date),
        }),
      );
    });

    it('Debería lanzar un error cuando ya existe un plan activo para la vigencia', async () => {
      const existingPlan = {
        ...mockPlanAuditoria,
        _id: 'existing-plan-id',
      };

      const findOneSpy = jest
        .spyOn(planAuditoriaModel, 'findOne')
        .mockResolvedValue(existingPlan as any);

      await expect(
        planAuditoriaService.post(mockPlanAuditoriaDTO),
      ).rejects.toThrow(
        `Ya existe un plan de auditoría activo para la vigencia ${mockPlanAuditoriaDTO.vigencia_id}`,
      );

      expect(findOneSpy).toHaveBeenCalledWith({
        vigencia_id: mockPlanAuditoriaDTO.vigencia_id,
        activo: true,
      });
    });

    it('Debería verificar unicidad de vigencia antes de crear', async () => {
      const findOneSpy = jest
        .spyOn(planAuditoriaModel, 'findOne')
        .mockResolvedValue(null);

      jest
        .spyOn(planAuditoriaModel, 'create')
        .mockResolvedValue(mockPlanAuditoria as any);

      await planAuditoriaService.post(mockPlanAuditoriaDTO);

      expect(findOneSpy).toHaveBeenCalledTimes(1);
      expect(findOneSpy).toHaveBeenCalledWith({
        vigencia_id: mockPlanAuditoriaDTO.vigencia_id,
        activo: true,
      });
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error');
      jest.spyOn(planAuditoriaModel, 'findOne').mockRejectedValue(mockError);

      await expect(
        planAuditoriaService.post(mockPlanAuditoriaDTO),
      ).rejects.toThrow('Database error');
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'activo:true',
      fields: 'objetivo,vigencia_id',
      sortby: 'fecha_creacion',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'false',
    };

    const mockPlanAuditorias = [
      {
        ...mockPlanAuditoria,
        _id: '67197dda3416d2a85e5d6d8f',
        vigencia_id: 2024,
      },
      {
        ...mockPlanAuditoria,
        _id: '67197f9a3416d2a85e5d6d93',
        vigencia_id: 2023,
      },
    ];

    it('Debería retornar todos los planes de auditoría con filtros aplicados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPlanAuditorias),
      };

      const findSpy = jest
        .spyOn(planAuditoriaModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await planAuditoriaService.getAll(mockFilterDto);

      expect(findSpy).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalled();
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual(mockPlanAuditorias);
    });

    it('Debería retornar un array vacío cuando no hay resultados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(planAuditoriaModel, 'find').mockReturnValue(mockQuery as any);

      const result = await planAuditoriaService.getAll(mockFilterDto);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('Debería manejar errores de la base de datos', async () => {
      const mockError = new Error('Database error');
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(mockError),
      };

      jest.spyOn(planAuditoriaModel, 'find').mockReturnValue(mockQuery as any);

      await expect(planAuditoriaService.getAll(mockFilterDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getById', () => {
    it('Debería retornar un plan de auditoría por su ID cuando existe', async () => {
      const findByIdSpy = jest
        .spyOn(planAuditoriaModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
        } as any);

      const result = await planAuditoriaService.getById(mockPlanAuditoria._id);

      expect(findByIdSpy).toHaveBeenCalledWith(mockPlanAuditoria._id);
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPlanAuditoria);
    });

    it('Debería lanzar un error si el plan de auditoría no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      const findByIdSpy = jest
        .spyOn(planAuditoriaModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(planAuditoriaService.getById(nonExistentId)).rejects.toThrow(
        `${nonExistentId} no existe`,
      );

      expect(findByIdSpy).toHaveBeenCalledWith(nonExistentId);
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database connection failed');
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(
        planAuditoriaService.getById(mockPlanAuditoria._id),
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('put', () => {
    const updateDto: PlanAuditoriaDTO = {
      ...mockPlanAuditoriaDTO,
      objetivo: 'Objetivo actualizado',
      vigencia_id: 2025,
    };

    it('Debería actualizar un plan de auditoría existente', async () => {
      const updatedPlanAuditoria = { ...mockPlanAuditoria, ...updateDto };

      const findOneSpy = jest
        .spyOn(planAuditoriaModel, 'findOne')
        .mockResolvedValue(null);

      const updateSpy = jest
        .spyOn(planAuditoriaModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedPlanAuditoria),
        } as any);

      const result = await planAuditoriaService.put(
        mockPlanAuditoria._id,
        updateDto,
      );

      expect(findOneSpy).toHaveBeenCalledWith({
        vigencia_id: updateDto.vigencia_id,
        _id: { $ne: mockPlanAuditoria._id },
        activo: true,
      });
      expect(updateSpy).toHaveBeenCalledWith(
        mockPlanAuditoria._id,
        expect.objectContaining({
          objetivo: updateDto.objetivo,
          vigencia_id: updateDto.vigencia_id,
          fecha_modificacion: expect.any(Date),
        }),
        { new: true },
      );
      expect(result).toEqual(updatedPlanAuditoria);
    });

    it('Debería actualizar fecha_modificacion automáticamente', async () => {
      jest.spyOn(planAuditoriaModel, 'findOne').mockResolvedValue(null);

      const updateSpy = jest
        .spyOn(planAuditoriaModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
        } as any);

      await planAuditoriaService.put(mockPlanAuditoria._id, updateDto);

      const calledDto = updateSpy.mock.calls[0][1];
      expect(calledDto.fecha_modificacion).toBeInstanceOf(Date);
    });

    it('Debería eliminar fecha_creacion si está presente en el DTO', async () => {
      const dtoWithFechaCreacion = {
        ...updateDto,
        fecha_creacion: new Date('2024-01-01'),
      };

      jest.spyOn(planAuditoriaModel, 'findOne').mockResolvedValue(null);

      const updateSpy = jest
        .spyOn(planAuditoriaModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
        } as any);

      await planAuditoriaService.put(
        mockPlanAuditoria._id,
        dtoWithFechaCreacion,
      );

      const calledDto = updateSpy.mock.calls[0][1];
      expect(calledDto).not.toHaveProperty('fecha_creacion');
    });

    it('Debería lanzar un error si el plan de auditoría no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      jest.spyOn(planAuditoriaModel, 'findOne').mockResolvedValue(null);

      const updateSpy = jest
        .spyOn(planAuditoriaModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(
        planAuditoriaService.put(nonExistentId, updateDto),
      ).rejects.toThrow(`${nonExistentId} no existe`);

      expect(updateSpy).toHaveBeenCalledWith(
        nonExistentId,
        expect.any(Object),
        { new: true },
      );
    });

    it('Debería lanzar un error cuando ya existe otro plan activo para la vigencia', async () => {
      const existingPlan = {
        ...mockPlanAuditoria,
        _id: 'otro-plan-id',
        vigencia_id: updateDto.vigencia_id,
      };

      const findOneSpy = jest
        .spyOn(planAuditoriaModel, 'findOne')
        .mockResolvedValue(existingPlan as any);

      await expect(
        planAuditoriaService.put(mockPlanAuditoria._id, updateDto),
      ).rejects.toThrow(
        `Ya existe un plan de auditoría activo para la vigencia ${updateDto.vigencia_id}`,
      );

      expect(findOneSpy).toHaveBeenCalledWith({
        vigencia_id: updateDto.vigencia_id,
        _id: { $ne: mockPlanAuditoria._id },
        activo: true,
      });
    });

    it('Debería verificar unicidad de vigencia antes de actualizar (excluyendo el mismo plan)', async () => {
      const findOneSpy = jest
        .spyOn(planAuditoriaModel, 'findOne')
        .mockResolvedValue(null);

      jest.spyOn(planAuditoriaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);

      await planAuditoriaService.put(mockPlanAuditoria._id, updateDto);

      expect(findOneSpy).toHaveBeenCalledWith({
        vigencia_id: updateDto.vigencia_id,
        _id: { $ne: mockPlanAuditoria._id },
        activo: true,
      });
    });

    it('NO debería verificar unicidad si vigencia_id no está presente', async () => {
      const dtoSinVigencia = { ...mockPlanAuditoriaDTO };
      delete dtoSinVigencia.vigencia_id;

      const findOneSpy = jest
        .spyOn(planAuditoriaModel, 'findOne')
        .mockResolvedValue(null);

      jest.spyOn(planAuditoriaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);

      await planAuditoriaService.put(mockPlanAuditoria._id, dtoSinVigencia);

      expect(findOneSpy).not.toHaveBeenCalled();
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error');
      jest.spyOn(planAuditoriaModel, 'findOne').mockRejectedValue(mockError);

      await expect(
        planAuditoriaService.put(mockPlanAuditoria._id, updateDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    it('Debería marcar un plan de auditoría como inactivo (soft delete)', async () => {
      const deletedPlanAuditoria = { ...mockPlanAuditoria, activo: false };

      const deleteSpy = jest
        .spyOn(planAuditoriaModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(deletedPlanAuditoria),
        } as any);

      const result = await planAuditoriaService.delete(mockPlanAuditoria._id);

      expect(deleteSpy).toHaveBeenCalledWith(
        mockPlanAuditoria._id,
        { activo: false },
        { new: true },
      );
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deletedPlanAuditoria);
      expect(result.activo).toBe(false);
    });

    it('Debería lanzar un error si el plan de auditoría no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      const deleteSpy = jest
        .spyOn(planAuditoriaModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(planAuditoriaService.delete(nonExistentId)).rejects.toThrow(
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

      jest.spyOn(planAuditoriaModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(
        planAuditoriaService.delete(mockPlanAuditoria._id),
      ).rejects.toThrow('Database error during delete');
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

    it('Debería retornar la cantidad de planes de auditoría que coinciden con el filtro', async () => {
      const expectedCount = 5;

      const countSpy = jest
        .spyOn(planAuditoriaModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(expectedCount),
        } as any);

      const result = await planAuditoriaService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(countSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedCount);
    });

    it('Debería retornar 0 cuando no hay planes de auditoría que coincidan', async () => {
      const countSpy = jest
        .spyOn(planAuditoriaModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(0),
        } as any);

      const result = await planAuditoriaService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      const mockError = new Error('Error al contar documentos');

      jest.spyOn(planAuditoriaModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(planAuditoriaService.count(filterDto)).rejects.toThrow(
        'Error al contar documentos',
      );
    });

    it('Debería aplicar correctamente los filtros del FilterDto', async () => {
      const complexFilterDto: FilterDto = {
        query: 'activo:true,vigencia_id:2024',
        fields: 'objetivo,vigencia_id',
        sortby: 'fecha_creacion',
        order: 'desc',
        limit: '10',
        offset: '0',
        populate: 'false',
      };

      const countSpy = jest
        .spyOn(planAuditoriaModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(3),
        } as any);

      const result = await planAuditoriaService.count(complexFilterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(3);
    });
  });

  describe('generarAuditorias', () => {
    const planId = 'plan-1';
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

    it('Debería delegar la generación por cada auditoría padre y consolidar el resultado', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);

      const auditoriasPadre = [{ _id: 'padre-1' }, { _id: 'padre-2' }];
      const getAllSpy = jest
        .spyOn(auditoriaPadreService, 'getAll')
        .mockResolvedValue(auditoriasPadre as any);

      const generarAuditoriasSpy = jest
        .spyOn(auditoriaPadreService, 'generarAuditorias')
        .mockResolvedValueOnce([{ _id: 'a1' }] as any)
        .mockResolvedValueOnce([{ _id: 'a2' }, { _id: 'a3' }] as any);

      const result = await planAuditoriaService.generarAuditorias(
        planId,
        generarAuditoriaDto,
      );

      expect(getAllSpy).toHaveBeenCalledWith({
        fields: undefined,
        sortby: undefined,
        order: undefined,
        populate: undefined,
        query: `plan_auditoria_id:${planId},activo:true,estado_id:${generarAuditoriaDto.estado_id_padre_actual}`,
        limit: '0',
        offset: '0',
      });
      expect(generarAuditoriasSpy).toHaveBeenNthCalledWith(
        1,
        'padre-1',
        generarAuditoriaDto,
      );
      expect(generarAuditoriasSpy).toHaveBeenNthCalledWith(
        2,
        'padre-2',
        generarAuditoriaDto,
      );
      expect(result).toEqual([{ _id: 'a1' }, { _id: 'a2' }, { _id: 'a3' }]);
    });

    it('Debería retornar array vacío cuando no hay auditorías padre elegibles', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);

      jest.spyOn(auditoriaPadreService, 'getAll').mockResolvedValue([] as any);
      const generarAuditoriasSpy = jest.spyOn(
        auditoriaPadreService,
        'generarAuditorias',
      );

      const result = await planAuditoriaService.generarAuditorias(
        planId,
        generarAuditoriaDto,
      );

      expect(generarAuditoriasSpy).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('Debería propagar error cuando el plan no existe', async () => {
      const missingId = 'no-existe';
      jest
        .spyOn(planAuditoriaService, 'getById')
        .mockRejectedValue(new Error(`${missingId} no existe`));

      const getAllSpy = jest.spyOn(auditoriaPadreService, 'getAll');

      await expect(
        planAuditoriaService.generarAuditorias(missingId, generarAuditoriaDto),
      ).rejects.toThrow(new Error(`${missingId} no existe`));

      expect(getAllSpy).not.toHaveBeenCalled();
    });

    it('Debería propagar error cuando falla la consulta de auditorías padre', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);

      const mockError = new Error('error consultando auditorías padre');
      jest.spyOn(auditoriaPadreService, 'getAll').mockRejectedValue(mockError);

      await expect(
        planAuditoriaService.generarAuditorias(planId, generarAuditoriaDto),
      ).rejects.toThrow(mockError);
    });

    it('Debería propagar error cuando falla generar auditorías de una auditoría padre', async () => {
      jest.spyOn(planAuditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlanAuditoria),
      } as any);

      jest
        .spyOn(auditoriaPadreService, 'getAll')
        .mockResolvedValue([{ _id: 'padre-1' }, { _id: 'padre-2' }] as any);

      const mockError = new Error('falló la generación para padre-2');
      const generarAuditoriasSpy = jest
        .spyOn(auditoriaPadreService, 'generarAuditorias')
        .mockResolvedValueOnce([{ _id: 'a1' }] as any)
        .mockRejectedValueOnce(mockError);

      await expect(
        planAuditoriaService.generarAuditorias(planId, generarAuditoriaDto),
      ).rejects.toThrow(mockError);

      expect(generarAuditoriasSpy).toHaveBeenCalledTimes(2);
    });
  });
});
