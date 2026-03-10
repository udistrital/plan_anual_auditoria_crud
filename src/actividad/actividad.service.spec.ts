import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ActividadService } from './actividad.service';
import { ActividadDTO } from './dto/actividad.dto';
import { Actividad } from './schemas/actividad.schema';
import { Model, Types } from 'mongoose';
import { Auditoria } from '../auditoria/schemas/auditoria.schema';
import { FilterDto } from '../filters/filters.dto';

const mockActividadDto: ActividadDTO = {
  auditoria_id: new Types.ObjectId('671aa963064222e6583d56e4'),
  titulo: 'Actividad de prueba',
  fecha_inicio: new Date('2024-01-01'),
  fecha_fin: new Date('2024-01-31'),
  referencia: 'REF-001',
  descripcion: 'Descripción de la actividad de prueba',
  observacion: 'Observaciones importantes',
  folio: 123,
  medio_id: 1,
  carpeta: 'carpeta-prueba',
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_modificacion: new Date('2024-01-01'),
};

const mockActividad = {
  ...mockActividadDto,
  _id: '671aaf35d779a09e092cb732',
};

const mockAuditoria = {
  _id: '671aa963064222e6583d56e4',
  titulo: 'Auditoría de prueba',
  descripcion: 'Descripción de auditoría',
};

describe('ActividadService', () => {
  let actividadService: ActividadService;
  let actividadModel: Model<Actividad>;
  let auditoriaModel: Model<Auditoria>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActividadService,
        {
          provide: getModelToken(Actividad.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: getModelToken(Auditoria.name),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    actividadService = module.get<ActividadService>(ActividadService);
    actividadModel = module.get<Model<Actividad>>(
      getModelToken(Actividad.name),
    );
    auditoriaModel = module.get<Model<Auditoria>>(
      getModelToken(Auditoria.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debería estar definido', () => {
    expect(actividadService).toBeDefined();
    expect(actividadModel).toBeDefined();
    expect(auditoriaModel).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver una actividad cuando los datos son válidos', async () => {
      const auditoriaFindSpy = jest
        .spyOn(auditoriaModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAuditoria),
        } as any);

      const createSpy = jest
        .spyOn(actividadModel, 'create')
        .mockResolvedValue(mockActividad as any);

      const result = await actividadService.post(mockActividadDto);

      expect(auditoriaFindSpy).toHaveBeenCalledWith(
        mockActividadDto.auditoria_id,
      );
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockActividadDto,
          activo: true,
          fechaCreacion: expect.any(Date),
          fechaModificacion: expect.any(Date),
        }),
      );
      expect(result).toEqual(mockActividad);
    });

    it('Debería lanzar un error si la Auditoria no existe', async () => {
      const auditoriaFindSpy = jest
        .spyOn(auditoriaModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(actividadService.post(mockActividadDto)).rejects.toThrow(
        `Auditoria relacionada con id ${mockActividadDto.auditoria_id} no existe`,
      );

      expect(auditoriaFindSpy).toHaveBeenCalledWith(
        mockActividadDto.auditoria_id,
      );
      expect(actividadModel.create).not.toHaveBeenCalled();
    });

    it('Debería crear una actividad incluso sin auditoria_id', async () => {
      const dtoSinAuditoria = { ...mockActividadDto, auditoria_id: undefined };
      const createSpy = jest
        .spyOn(actividadModel, 'create')
        .mockResolvedValue(mockActividad as any);

      const result = await actividadService.post(dtoSinAuditoria);

      expect(auditoriaModel.findById).not.toHaveBeenCalled();
      expect(createSpy).toHaveBeenCalled();
      expect(result).toEqual(mockActividad);
    });

    it('Debería establecer activo en true y fechas automáticamente', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditoria),
      } as any);

      const createSpy = jest
        .spyOn(actividadModel, 'create')
        .mockResolvedValue(mockActividad as any);

      await actividadService.post(mockActividadDto);

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
      fields: 'titulo,descripcion',
      sortby: 'fecha_creacion',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'false',
    };

    const mockActividades = [
      {
        ...mockActividad,
        _id: '1',
        titulo: 'actividad 1',
      },
      {
        ...mockActividad,
        _id: '2',
        titulo: 'actividad 2',
      },
    ];

    it('Debería retornar todas las actividades con filtros aplicados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockActividades),
      };

      const findSpy = jest
        .spyOn(actividadModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await actividadService.getAll(mockFilterDto);

      expect(findSpy).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalled();
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual(mockActividades);
    });

    it('Debería aplicar populate cuando populate es "true"', async () => {
      const filterWithPopulate = { ...mockFilterDto, populate: 'true' };
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockActividades),
      };

      jest.spyOn(actividadModel, 'find').mockReturnValue(mockQuery as any);

      await actividadService.getAll(filterWithPopulate);

      expect(mockQuery.populate).toHaveBeenCalledWith([
        { path: 'auditoria_id' },
      ]);
    });

    it('Debería NO aplicar populate cuando populate es "false"', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockActividades),
      };

      jest.spyOn(actividadModel, 'find').mockReturnValue(mockQuery as any);

      await actividadService.getAll(mockFilterDto);

      expect(mockQuery.populate).toHaveBeenCalledWith([]);
    });

    it('Debería retornar un array vacío cuando no hay resultados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(actividadModel, 'find').mockReturnValue(mockQuery as any);

      const result = await actividadService.getAll(mockFilterDto);

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

      jest.spyOn(actividadModel, 'find').mockReturnValue(mockQuery as any);

      await expect(actividadService.getAll(mockFilterDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getById', () => {
    it('Debería retornar una actividad por su ID cuando existe', async () => {
      const findByIdSpy = jest
        .spyOn(actividadModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockActividad),
        } as any);

      const result = await actividadService.getById(mockActividad._id);

      expect(findByIdSpy).toHaveBeenCalledWith(mockActividad._id);
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockActividad);
    });

    it('Debería lanzar un error si la actividad no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      const findByIdSpy = jest
        .spyOn(actividadModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(actividadService.getById(nonExistentId)).rejects.toThrow(
        `${nonExistentId} no existe`,
      );

      expect(findByIdSpy).toHaveBeenCalledWith(nonExistentId);
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database connection failed');
      jest.spyOn(actividadModel, 'findById').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(actividadService.getById(mockActividad._id)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('put', () => {
    const updateDto: ActividadDTO = {
      ...mockActividadDto,
      titulo: 'Actividad actualizada',
      descripcion: 'Descripción actualizada',
    };

    it('Debería actualizar una actividad existente', async () => {
      const updatedActividad = { ...mockActividad, ...updateDto };

      const auditoriaFindSpy = jest
        .spyOn(auditoriaModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAuditoria),
        } as any);

      const updateSpy = jest
        .spyOn(actividadModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedActividad),
        } as any);

      const result = await actividadService.put(mockActividad._id, updateDto);

      expect(auditoriaFindSpy).toHaveBeenCalledWith(updateDto.auditoria_id);
      expect(updateSpy).toHaveBeenCalledWith(
        mockActividad._id,
        expect.objectContaining({
          ...updateDto,
          fecha_modificacion: expect.any(Date),
        }),
        { new: true },
      );
      expect(result).toEqual(updatedActividad);
    });

    it('Debería eliminar fecha_creacion del DTO antes de actualizar', async () => {
      const dtoWithCreationDate = {
        ...updateDto,
        fecha_creacion: new Date('2024-01-01'),
      };

      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditoria),
      } as any);

      const updateSpy = jest
        .spyOn(actividadModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockActividad),
        } as any);

      await actividadService.put(mockActividad._id, dtoWithCreationDate);

      const calledWith = updateSpy.mock.calls[0][1];
      expect(calledWith).not.toHaveProperty('fecha_creacion');
      expect(calledWith).toHaveProperty('fecha_modificacion');
    });

    it('Debería lanzar un error si la actividad no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditoria),
      } as any);

      const updateSpy = jest
        .spyOn(actividadModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(
        actividadService.put(nonExistentId, updateDto),
      ).rejects.toThrow(`${nonExistentId} no existe`);

      expect(updateSpy).toHaveBeenCalledWith(
        nonExistentId,
        expect.any(Object),
        { new: true },
      );
    });

    it('Debería lanzar un error si la Auditoria relacionada no existe', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        actividadService.put(mockActividad._id, updateDto),
      ).rejects.toThrow(
        `Auditoria relacionada con id ${updateDto.auditoria_id} no existe`,
      );

      expect(actividadModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('Debería actualizar sin verificar Auditoria si no se proporciona auditoria_id', async () => {
      const dtoSinAuditoria = { ...updateDto, auditoria_id: undefined };

      const updateSpy = jest
        .spyOn(actividadModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockActividad),
        } as any);

      await actividadService.put(mockActividad._id, dtoSinAuditoria);

      expect(auditoriaModel.findById).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalled();
    });

    it('Debería actualizar fecha_modificacion automáticamente', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditoria),
      } as any);

      const updateSpy = jest
        .spyOn(actividadModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockActividad),
        } as any);

      const dateBefore = new Date();
      await actividadService.put(mockActividad._id, updateDto);
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
    it('Debería marcar una actividad como inactiva (soft delete)', async () => {
      const deletedActividad = { ...mockActividad, activo: false };

      const deleteSpy = jest
        .spyOn(actividadModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(deletedActividad),
        } as any);

      const result = await actividadService.delete(mockActividad._id);

      expect(deleteSpy).toHaveBeenCalledWith(
        mockActividad._id,
        { activo: false },
        { new: true },
      );
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deletedActividad);
      expect(result.activo).toBe(false);
    });

    it('Debería lanzar un error si la actividad no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      const deleteSpy = jest
        .spyOn(actividadModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(actividadService.delete(nonExistentId)).rejects.toThrow(
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

      jest.spyOn(actividadModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(actividadService.delete(mockActividad._id)).rejects.toThrow(
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
        .spyOn(actividadModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(expectedCount),
        } as any);

      const result = await actividadService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(countSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedCount);
    });

    it('Debería retornar 0 cuando no hay documentos que coincidan', async () => {
      const countSpy = jest
        .spyOn(actividadModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(0),
        } as any);

      const result = await actividadService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      const mockError = new Error('Error al contar documentos');

      jest.spyOn(actividadModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(actividadService.count(filterDto)).rejects.toThrow(
        'Error al contar documentos',
      );
    });

    it('Debería aplicar correctamente los filtros del FilterDto', async () => {
      const complexFilterDto: FilterDto = {
        query: 'activo:true,titulo:test',
        fields: 'titulo,descripcion',
        sortby: 'fecha_creacion',
        order: 'desc',
        limit: '10',
        offset: '0',
        populate: 'false',
      };

      const countSpy = jest
        .spyOn(actividadModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(3),
        } as any);

      const result = await actividadService.count(complexFilterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(3);
    });
  });
});
