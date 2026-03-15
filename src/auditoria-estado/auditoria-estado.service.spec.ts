import { Test, TestingModule } from '@nestjs/testing';
import { EstadoAuditoriaService } from './auditoria-estado.service';
import { getModelToken } from '@nestjs/mongoose';
import { AuditoriaEstado } from './schema/auditoria-estado.schema';
import { AuditoriaEstadoDto } from './dto/auditoria-estado.dto';
import { Auditoria } from '../auditoria/schemas/auditoria.schema';
import { Model, Types } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockAuditoriaEstadoDto: AuditoriaEstadoDto = {
  auditoria_id: new Types.ObjectId('672d3050f7814a9a0c5261d4'),
  usuario_id: 76767,
  usuario_rol: 'AUDITOR',
  observacion: 'Estado inicial de la auditoría',
  actual: true,
  estado_id: 2552,
  fase_id: 'PROGRAMACION',
  fecha_ejecucion_estado: new Date('2024-01-15'),
  activo: true,
};

const mockEstadoAuditoria = {
  ...mockAuditoriaEstadoDto,
  _id: '672d36737e962bcac5ce9beb',
};

const mockAuditoria = {
  _id: '672d3050f7814a9a0c5261d4',
  titulo: 'Auditoría de prueba',
  descripcion: 'Descripción de auditoría',
};

describe('EstadoAuditoriaService', () => {
  let estadoAuditoriaService: EstadoAuditoriaService;
  let auditoriaEstadoModel: Model<AuditoriaEstado>;
  let auditoriaModel: Model<Auditoria>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstadoAuditoriaService,
        {
          provide: getModelToken(AuditoriaEstado.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
            updateMany: jest.fn(),
          },
        },
        {
          provide: getModelToken(Auditoria.name),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockAuditoria),
            }),
          },
        },
      ],
    }).compile();

    estadoAuditoriaService = module.get<EstadoAuditoriaService>(
      EstadoAuditoriaService,
    );
    auditoriaEstadoModel = module.get<Model<AuditoriaEstado>>(
      getModelToken(AuditoriaEstado.name),
    );
    auditoriaModel = module.get<Model<Auditoria>>(
      getModelToken(Auditoria.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debería estar definido', () => {
    expect(estadoAuditoriaService).toBeDefined();
    expect(auditoriaEstadoModel).toBeDefined();
    expect(auditoriaModel).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver un estado de auditoría cuando los datos son válidos', async () => {
      const findSpy = jest
        .spyOn(auditoriaEstadoModel, 'find')
        .mockResolvedValue([] as any);

      const createSpy = jest
        .spyOn(auditoriaEstadoModel, 'create')
        .mockResolvedValue(mockEstadoAuditoria as any);

      const result = await estadoAuditoriaService.post(mockAuditoriaEstadoDto);

      expect(findSpy).toHaveBeenCalledWith({
        auditoria_id: mockAuditoriaEstadoDto.auditoria_id,
        actual: true,
      });
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockAuditoriaEstadoDto,
          actual: true,
          activo: true,
          fecha_ejecucion_estado: expect.any(Date),
        }),
      );
      expect(result).toEqual(mockEstadoAuditoria);
    });

    it('Debería desactivar estados anteriores cuando ya existe un estado actual', async () => {
      const estadosAnteriores = [
        { ...mockEstadoAuditoria, _id: 'estado1', actual: true },
        { ...mockEstadoAuditoria, _id: 'estado2', actual: true },
      ];

      const findSpy = jest
        .spyOn(auditoriaEstadoModel, 'find')
        .mockResolvedValue(estadosAnteriores as any);

      const updateManySpy = jest
        .spyOn(auditoriaEstadoModel, 'updateMany')
        .mockResolvedValue({ modifiedCount: 2 } as any);

      const createSpy = jest
        .spyOn(auditoriaEstadoModel, 'create')
        .mockResolvedValue(mockEstadoAuditoria as any);

      await estadoAuditoriaService.post(mockAuditoriaEstadoDto);

      expect(findSpy).toHaveBeenCalledWith({
        auditoria_id: mockAuditoriaEstadoDto.auditoria_id,
        actual: true,
      });
      expect(updateManySpy).toHaveBeenCalledWith(
        {
          auditoria_id: mockAuditoriaEstadoDto.auditoria_id,
          actual: true,
        },
        { $set: { actual: false } },
      );
      expect(createSpy).toHaveBeenCalled();
    });

    it('Debería establecer actual en true, activo en true y fecha automáticamente', async () => {
      jest.spyOn(auditoriaEstadoModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      } as any);

      const createSpy = jest
        .spyOn(auditoriaEstadoModel, 'create')
        .mockResolvedValue(mockEstadoAuditoria as any);

      await estadoAuditoriaService.post(mockAuditoriaEstadoDto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          actual: true,
          activo: true,
          fecha_ejecucion_estado: expect.any(Date),
        }),
      );
    });

    it('Debería manejar errores durante la creación', async () => {
      const mockError = new Error('Database error');

      jest.spyOn(auditoriaEstadoModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      } as any);

      jest.spyOn(auditoriaEstadoModel, 'create').mockRejectedValue(mockError);

      await expect(
        estadoAuditoriaService.post(mockAuditoriaEstadoDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'activo:true',
      fields: 'estado_id,fase_id,observacion',
      sortby: 'fecha_ejecucion_estado',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'false',
    };

    const mockEstados = [
      {
        ...mockEstadoAuditoria,
        _id: '1',
        estado_id: 2552,
      },
      {
        ...mockEstadoAuditoria,
        _id: '2',
        estado_id: 2553,
      },
    ];

    it('Debería retornar todos los estados con filtros aplicados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockEstados),
      };

      const findSpy = jest
        .spyOn(auditoriaEstadoModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await estadoAuditoriaService.getAll(mockFilterDto);

      expect(findSpy).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalled();
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual(mockEstados);
    });

    it('Debería aplicar populate cuando populate es "true"', async () => {
      const filterWithPopulate = { ...mockFilterDto, populate: 'true' };
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockEstados),
      };

      jest
        .spyOn(auditoriaEstadoModel, 'find')
        .mockReturnValue(mockQuery as any);

      await estadoAuditoriaService.getAll(filterWithPopulate);

      expect(mockQuery.populate).toHaveBeenCalledWith([
        { path: 'auditoria_id' },
      ]);
    });

    it('Debería NO aplicar populate cuando populate es "false"', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockEstados),
      };

      jest
        .spyOn(auditoriaEstadoModel, 'find')
        .mockReturnValue(mockQuery as any);

      await estadoAuditoriaService.getAll(mockFilterDto);

      expect(mockQuery.populate).toHaveBeenCalledWith([]);
    });

    it('Debería retornar un array vacío cuando no hay resultados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest
        .spyOn(auditoriaEstadoModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await estadoAuditoriaService.getAll(mockFilterDto);

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

      jest
        .spyOn(auditoriaEstadoModel, 'find')
        .mockReturnValue(mockQuery as any);

      await expect(
        estadoAuditoriaService.getAll(mockFilterDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('Debería retornar un estado de auditoría por su ID cuando existe', async () => {
      const findByIdSpy = jest
        .spyOn(auditoriaEstadoModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEstadoAuditoria),
        } as any);

      const result = await estadoAuditoriaService.getById(
        mockEstadoAuditoria._id,
      );

      expect(findByIdSpy).toHaveBeenCalledWith(mockEstadoAuditoria._id);
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockEstadoAuditoria);
    });

    it('Debería lanzar un error si el estado no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      const findByIdSpy = jest
        .spyOn(auditoriaEstadoModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(
        estadoAuditoriaService.getById(nonExistentId),
      ).rejects.toThrow(`${nonExistentId} no existe`);

      expect(findByIdSpy).toHaveBeenCalledWith(nonExistentId);
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database connection failed');
      jest.spyOn(auditoriaEstadoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(
        estadoAuditoriaService.getById(mockEstadoAuditoria._id),
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('put', () => {
    const updateDto: AuditoriaEstadoDto = {
      ...mockAuditoriaEstadoDto,
      observacion: 'Observación actualizada',
      estado_id: 2553,
      actual: false,
    };

    it('Debería actualizar un estado de auditoría existente', async () => {
      const updatedEstado = { ...mockEstadoAuditoria, ...updateDto };

      const auditoriaFindSpy = jest
        .spyOn(auditoriaModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAuditoria),
        } as any);

      const updateSpy = jest
        .spyOn(auditoriaEstadoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedEstado),
        } as any);

      const result = await estadoAuditoriaService.put(
        mockEstadoAuditoria._id,
        updateDto,
      );

      expect(auditoriaFindSpy).toHaveBeenCalledWith(updateDto.auditoria_id);
      expect(updateSpy).toHaveBeenCalledWith(
        mockEstadoAuditoria._id,
        updateDto,
        { new: true },
      );
      expect(result).toEqual(updatedEstado);
    });

    it('Debería lanzar un error si el estado no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditoria),
      } as any);

      const updateSpy = jest
        .spyOn(auditoriaEstadoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(
        estadoAuditoriaService.put(nonExistentId, updateDto),
      ).rejects.toThrow(`${nonExistentId} no existe`);

      expect(updateSpy).toHaveBeenCalledWith(nonExistentId, updateDto, {
        new: true,
      });
    });

    it('Debería lanzar un error si la Auditoria relacionada no existe', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        estadoAuditoriaService.put(mockEstadoAuditoria._id, updateDto),
      ).rejects.toThrow(
        `Plan auditoria relacionada con id ${updateDto.auditoria_id} no existe`,
      );

      expect(auditoriaEstadoModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('Debería actualizar sin verificar Auditoria si no se proporciona auditoria_id', async () => {
      const dtoSinAuditoria = { ...updateDto, auditoria_id: undefined };

      const updateSpy = jest
        .spyOn(auditoriaEstadoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEstadoAuditoria),
        } as any);

      await estadoAuditoriaService.put(
        mockEstadoAuditoria._id,
        dtoSinAuditoria,
      );

      expect(auditoriaModel.findById).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('Debería marcar un estado como inactivo (soft delete)', async () => {
      const deletedEstado = { ...mockEstadoAuditoria, activo: false };

      const deleteSpy = jest
        .spyOn(auditoriaEstadoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(deletedEstado),
        } as any);

      const result = await estadoAuditoriaService.delete(
        mockEstadoAuditoria._id,
      );

      expect(deleteSpy).toHaveBeenCalledWith(
        mockEstadoAuditoria._id,
        { activo: false },
        { new: true },
      );
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deletedEstado);
      expect(result.activo).toBe(false);
    });

    it('Debería lanzar un error si el estado no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      const deleteSpy = jest
        .spyOn(auditoriaEstadoModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(
        estadoAuditoriaService.delete(nonExistentId),
      ).rejects.toThrow(`${nonExistentId} no existe`);

      expect(deleteSpy).toHaveBeenCalledWith(
        nonExistentId,
        { activo: false },
        { new: true },
      );
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error during delete');

      jest.spyOn(auditoriaEstadoModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(
        estadoAuditoriaService.delete(mockEstadoAuditoria._id),
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

    it('Debería retornar la cantidad de documentos que coinciden con el filtro', async () => {
      const expectedCount = 5;

      const countSpy = jest
        .spyOn(auditoriaEstadoModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(expectedCount),
        } as any);

      const result = await estadoAuditoriaService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(countSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedCount);
    });

    it('Debería retornar 0 cuando no hay documentos que coincidan', async () => {
      const countSpy = jest
        .spyOn(auditoriaEstadoModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(0),
        } as any);

      const result = await estadoAuditoriaService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      const mockError = new Error('Error al contar documentos');

      jest.spyOn(auditoriaEstadoModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(estadoAuditoriaService.count(filterDto)).rejects.toThrow(
        'Error al contar documentos',
      );
    });

    it('Debería aplicar correctamente los filtros del FilterDto', async () => {
      const complexFilterDto: FilterDto = {
        query: 'activo:true,actual:true',
        fields: 'estado_id,fase_id',
        sortby: 'fecha_ejecucion_estado',
        order: 'desc',
        limit: '10',
        offset: '0',
        populate: 'false',
      };

      const countSpy = jest
        .spyOn(auditoriaEstadoModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(3),
        } as any);

      const result = await estadoAuditoriaService.count(complexFilterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(3);
    });
  });
});
