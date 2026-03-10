import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuditorService } from './auditor.service';
import { AuditorDTO } from './dto/auditor.dto';
import { Auditor } from './schemas/auditor.schema';
import { Model, Types } from 'mongoose';
import { Auditoria } from '../auditoria/schemas/auditoria.schema';
import { FilterDto } from '../filters/filters.dto';

const mockAuditorDto: AuditorDTO = {
  auditoria_id: new Types.ObjectId('671aa963064222e6583d56e4'),
  auditor_id: 12345,
  asignado: true,
  asignado_por_id: 67890,
  auditor_lider: true,
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_modificacion: new Date('2024-01-01'),
};

const mockAuditor = {
  ...mockAuditorDto,
  _id: '671aaf35d779a09e092cb732',
};

const mockAuditoria = {
  _id: '671aa963064222e6583d56e4',
  titulo: 'Auditoría de prueba',
  descripcion: 'Descripción de auditoría',
};

describe('AuditorService', () => {
  let auditorService: AuditorService;
  let auditorModel: Model<Auditor>;
  let auditoriaModel: Model<Auditoria>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditorService,
        {
          provide: getModelToken(Auditor.name),
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

    auditorService = module.get<AuditorService>(AuditorService);
    auditorModel = module.get<Model<Auditor>>(getModelToken(Auditor.name));
    auditoriaModel = module.get<Model<Auditoria>>(
      getModelToken(Auditoria.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debería estar definido', () => {
    expect(auditorService).toBeDefined();
    expect(auditorModel).toBeDefined();
    expect(auditoriaModel).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver un auditor cuando los datos son válidos', async () => {
      const auditoriaFindSpy = jest
        .spyOn(auditoriaModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAuditoria),
        } as any);

      const createSpy = jest
        .spyOn(auditorModel, 'create')
        .mockResolvedValue(mockAuditor as any);

      const result = await auditorService.post(mockAuditorDto);

      expect(auditoriaFindSpy).toHaveBeenCalledWith(
        mockAuditorDto.auditoria_id,
      );
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockAuditorDto,
          activo: true,
          fechaCreacion: expect.any(Date),
          fechaModificacion: expect.any(Date),
        }),
      );
      expect(result).toEqual(mockAuditor);
    });

    it('Debería lanzar un error si la Auditoria no existe', async () => {
      const auditoriaFindSpy = jest
        .spyOn(auditoriaModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(auditorService.post(mockAuditorDto)).rejects.toThrow(
        `Auditoria relacionada con id ${mockAuditorDto.auditoria_id} no existe`,
      );

      expect(auditoriaFindSpy).toHaveBeenCalledWith(
        mockAuditorDto.auditoria_id,
      );
      expect(auditorModel.create).not.toHaveBeenCalled();
    });

    it('Debería crear un auditor incluso sin auditoria_id', async () => {
      const dtoSinAuditoria = { ...mockAuditorDto, auditoria_id: undefined };
      const createSpy = jest
        .spyOn(auditorModel, 'create')
        .mockResolvedValue(mockAuditor as any);

      const result = await auditorService.post(dtoSinAuditoria);

      expect(auditoriaModel.findById).not.toHaveBeenCalled();
      expect(createSpy).toHaveBeenCalled();
      expect(result).toEqual(mockAuditor);
    });

    it('Debería establecer activo en true y fechas automáticamente', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditoria),
      } as any);

      const createSpy = jest
        .spyOn(auditorModel, 'create')
        .mockResolvedValue(mockAuditor as any);

      await auditorService.post(mockAuditorDto);

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
      fields: 'auditor_id,auditor_lider',
      sortby: 'fecha_creacion',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'false',
    };

    const mockAuditores = [
      {
        ...mockAuditor,
        _id: '1',
        auditor_id: 12345,
      },
      {
        ...mockAuditor,
        _id: '2',
        auditor_id: 67890,
      },
    ];

    it('Debería retornar todos los auditores con filtros aplicados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAuditores),
      };

      const findSpy = jest
        .spyOn(auditorModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await auditorService.getAll(mockFilterDto);

      expect(findSpy).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalled();
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual(mockAuditores);
    });

    it('Debería aplicar populate cuando populate es "true"', async () => {
      const filterWithPopulate = { ...mockFilterDto, populate: 'true' };
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAuditores),
      };

      jest.spyOn(auditorModel, 'find').mockReturnValue(mockQuery as any);

      await auditorService.getAll(filterWithPopulate);

      expect(mockQuery.populate).toHaveBeenCalledWith([
        { path: 'auditoria_id' },
      ]);
    });

    it('Debería NO aplicar populate cuando populate es "false"', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAuditores),
      };

      jest.spyOn(auditorModel, 'find').mockReturnValue(mockQuery as any);

      await auditorService.getAll(mockFilterDto);

      expect(mockQuery.populate).toHaveBeenCalledWith([]);
    });

    it('Debería retornar un array vacío cuando no hay resultados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(auditorModel, 'find').mockReturnValue(mockQuery as any);

      const result = await auditorService.getAll(mockFilterDto);

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

      jest.spyOn(auditorModel, 'find').mockReturnValue(mockQuery as any);

      await expect(auditorService.getAll(mockFilterDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getById', () => {
    it('Debería retornar un auditor por su ID cuando existe', async () => {
      const findByIdSpy = jest.spyOn(auditorModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditor),
      } as any);

      const result = await auditorService.getById(mockAuditor._id);

      expect(findByIdSpy).toHaveBeenCalledWith(mockAuditor._id);
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAuditor);
    });

    it('Debería lanzar un error si el auditor no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      const findByIdSpy = jest.spyOn(auditorModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(auditorService.getById(nonExistentId)).rejects.toThrow(
        `${nonExistentId} no existe`,
      );

      expect(findByIdSpy).toHaveBeenCalledWith(nonExistentId);
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database connection failed');
      jest.spyOn(auditorModel, 'findById').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(auditorService.getById(mockAuditor._id)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('put', () => {
    const updateDto: AuditorDTO = {
      ...mockAuditorDto,
      auditor_lider: false,
      asignado: false,
    };

    it('Debería actualizar un auditor existente', async () => {
      const updatedAuditor = { ...mockAuditor, ...updateDto };

      const auditoriaFindSpy = jest
        .spyOn(auditoriaModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAuditoria),
        } as any);

      const updateSpy = jest
        .spyOn(auditorModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedAuditor),
        } as any);

      const result = await auditorService.put(mockAuditor._id, updateDto);

      expect(auditoriaFindSpy).toHaveBeenCalledWith(updateDto.auditoria_id);
      expect(updateSpy).toHaveBeenCalledWith(
        mockAuditor._id,
        expect.objectContaining({
          ...updateDto,
          fecha_modificacion: expect.any(Date),
        }),
        { new: true },
      );
      expect(result).toEqual(updatedAuditor);
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
        .spyOn(auditorModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAuditor),
        } as any);

      await auditorService.put(mockAuditor._id, dtoWithCreationDate);

      const calledWith = updateSpy.mock.calls[0][1];
      expect(calledWith).not.toHaveProperty('fecha_creacion');
      expect(calledWith).toHaveProperty('fecha_modificacion');
    });

    it('Debería lanzar un error si el auditor no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditoria),
      } as any);

      const updateSpy = jest
        .spyOn(auditorModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(
        auditorService.put(nonExistentId, updateDto),
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
        auditorService.put(mockAuditor._id, updateDto),
      ).rejects.toThrow(
        `Auditoria relacionada con id ${updateDto.auditoria_id} no existe`,
      );

      expect(auditorModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('Debería actualizar sin verificar Auditoria si no se proporciona auditoria_id', async () => {
      const dtoSinAuditoria = { ...updateDto, auditoria_id: undefined };

      const updateSpy = jest
        .spyOn(auditorModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAuditor),
        } as any);

      await auditorService.put(mockAuditor._id, dtoSinAuditoria);

      expect(auditoriaModel.findById).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalled();
    });

    it('Debería actualizar fecha_modificacion automáticamente', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditoria),
      } as any);

      const updateSpy = jest
        .spyOn(auditorModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAuditor),
        } as any);

      const dateBefore = new Date();
      await auditorService.put(mockAuditor._id, updateDto);
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
    it('Debería marcar un auditor como inactivo (soft delete)', async () => {
      const deletedAuditor = { ...mockAuditor, activo: false };

      const deleteSpy = jest
        .spyOn(auditorModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(deletedAuditor),
        } as any);

      const result = await auditorService.delete(mockAuditor._id);

      expect(deleteSpy).toHaveBeenCalledWith(
        mockAuditor._id,
        { activo: false },
        { new: true },
      );
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deletedAuditor);
      expect(result.activo).toBe(false);
    });

    it('Debería lanzar un error si el auditor no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      const deleteSpy = jest
        .spyOn(auditorModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(auditorService.delete(nonExistentId)).rejects.toThrow(
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

      jest.spyOn(auditorModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(auditorService.delete(mockAuditor._id)).rejects.toThrow(
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
        .spyOn(auditorModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(expectedCount),
        } as any);

      const result = await auditorService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(countSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedCount);
    });

    it('Debería retornar 0 cuando no hay documentos que coincidan', async () => {
      const countSpy = jest
        .spyOn(auditorModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(0),
        } as any);

      const result = await auditorService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      const mockError = new Error('Error al contar documentos');

      jest.spyOn(auditorModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(auditorService.count(filterDto)).rejects.toThrow(
        'Error al contar documentos',
      );
    });

    it('Debería aplicar correctamente los filtros del FilterDto', async () => {
      const complexFilterDto: FilterDto = {
        query: 'activo:true,auditor_lider:true',
        fields: 'auditor_id,auditor_lider',
        sortby: 'fecha_creacion',
        order: 'desc',
        limit: '10',
        offset: '0',
        populate: 'false',
      };

      const countSpy = jest
        .spyOn(auditorModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(3),
        } as any);

      const result = await auditorService.count(complexFilterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(3);
    });
  });
});
