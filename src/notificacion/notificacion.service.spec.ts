import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotificacionService } from './notificacion.service';
import { NotificacionDTO } from './dto/notificacion.dto';
import { Notificacion } from './schema/notificacion.schema';
import { Model, Types } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockNotificacionDto: NotificacionDTO = {
  plantilla: 'SISIFO_PLANTILLA_SOLICITUD',
  fecha_envio: new Date('2024-06-01T10:00:00Z'),
  metadato: {
    tipo_notificacion: 'solicitud_aprobacion_paa',
    vigencia: '2025',
    destinatarios_to: ['jefe@correo.gov.co'],
    destinatarios_cc: [],
    destinatarios_bcc: [],
  },
  referencia_id: new Types.ObjectId('671aaa8a064222e6583d56e7'),
  referencia_tipo: 'PAA',
  activo: true,
};

const mockNotificacion = {
  ...mockNotificacionDto,
  _id: '671aaf35d779a09e092cb800',
};

describe('NotificacionService', () => {
  let notificacionService: NotificacionService;
  let notificacionModel: Model<Notificacion>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacionService,
        {
          provide: getModelToken(Notificacion.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
      ],
    }).compile();

    notificacionService = module.get<NotificacionService>(NotificacionService);
    notificacionModel = module.get<Model<Notificacion>>(
      getModelToken(Notificacion.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debería estar definido', () => {
    expect(notificacionService).toBeDefined();
    expect(notificacionModel).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver un registro de notificación cuando los datos son válidos', async () => {
      const createSpy = jest
        .spyOn(notificacionModel, 'create')
        .mockResolvedValue(mockNotificacion as any);

      const result = await notificacionService.post(mockNotificacionDto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockNotificacionDto,
          activo: true,
          fecha_creacion: expect.any(Date),
          fecha_modificacion: expect.any(Date),
        }),
      );
      expect(result).toEqual(mockNotificacion);
    });

    it('Debería establecer activo en true automáticamente', async () => {
      const createSpy = jest
        .spyOn(notificacionModel, 'create')
        .mockResolvedValue(mockNotificacion as any);

      await notificacionService.post(mockNotificacionDto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({ activo: true }),
      );
    });

    it('Debería establecer fecha_creacion y fecha_modificacion automáticamente', async () => {
      const createSpy = jest
        .spyOn(notificacionModel, 'create')
        .mockResolvedValue(mockNotificacion as any);

      const dateBefore = new Date();
      await notificacionService.post(mockNotificacionDto);
      const dateAfter = new Date();

      const calledWith = createSpy.mock.calls[0][0] as any;
      expect(calledWith.fecha_creacion).toBeInstanceOf(Date);
      expect(calledWith.fecha_creacion.getTime()).toBeGreaterThanOrEqual(
        dateBefore.getTime(),
      );
      expect(calledWith.fecha_creacion.getTime()).toBeLessThanOrEqual(
        dateAfter.getTime(),
      );
      expect(calledWith.fecha_modificacion).toBeInstanceOf(Date);
    });

    it('Debería almacenar el campo plantilla correctamente', async () => {
      const createSpy = jest
        .spyOn(notificacionModel, 'create')
        .mockResolvedValue(mockNotificacion as any);

      await notificacionService.post(mockNotificacionDto);

      const calledWith = createSpy.mock.calls[0][0] as any;
      expect(calledWith.plantilla).toBe('SISIFO_PLANTILLA_SOLICITUD');
      expect(calledWith).not.toHaveProperty('destinatario');
    });

    it('Debería almacenar referencia_tipo correctamente', async () => {
      const createSpy = jest
        .spyOn(notificacionModel, 'create')
        .mockResolvedValue(mockNotificacion as any);

      await notificacionService.post(mockNotificacionDto);

      const calledWith = createSpy.mock.calls[0][0] as any;
      expect(calledWith.referencia_tipo).toBe('PAA');
    });

    it('Debería almacenar los destinatarios como listas dentro de metadato', async () => {
      const createSpy = jest
        .spyOn(notificacionModel, 'create')
        .mockResolvedValue(mockNotificacion as any);

      await notificacionService.post(mockNotificacionDto);

      const calledWith = createSpy.mock.calls[0][0] as any;
      expect(calledWith.metadato).toHaveProperty('destinatarios_to');
      expect(calledWith.metadato).toHaveProperty('destinatarios_cc');
      expect(calledWith.metadato).toHaveProperty('destinatarios_bcc');
      expect(Array.isArray(calledWith.metadato.destinatarios_to)).toBe(true);
      expect(Array.isArray(calledWith.metadato.destinatarios_cc)).toBe(true);
      expect(Array.isArray(calledWith.metadato.destinatarios_bcc)).toBe(true);
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error');
      jest.spyOn(notificacionModel, 'create').mockRejectedValue(mockError);

      await expect(
        notificacionService.post(mockNotificacionDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'activo:true',
      fields: 'plantilla,fecha_envio',
      sortby: 'fecha_creacion',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'false',
    };

    const mockNotificaciones = [
      {
        ...mockNotificacion,
        _id: '1',
        plantilla: 'SISIFO_PLANTILLA_SOLICITUD',
      },
      { ...mockNotificacion, _id: '2', plantilla: 'SISIFO_PLANTILLA_RECHAZO' },
    ];

    it('Debería retornar todos los registros con filtros aplicados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockNotificaciones),
      };

      const findSpy = jest
        .spyOn(notificacionModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await notificacionService.getAll(mockFilterDto);

      expect(findSpy).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalled();
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual(mockNotificaciones);
    });

    it('Debería retornar un array vacío cuando no hay resultados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(notificacionModel, 'find').mockReturnValue(mockQuery as any);

      const result = await notificacionService.getAll(mockFilterDto);

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

      jest.spyOn(notificacionModel, 'find').mockReturnValue(mockQuery as any);

      await expect(notificacionService.getAll(mockFilterDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getById', () => {
    it('Debería retornar un registro por su ID cuando existe', async () => {
      const findByIdSpy = jest
        .spyOn(notificacionModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockNotificacion),
        } as any);

      const result = await notificacionService.getById(mockNotificacion._id);

      expect(findByIdSpy).toHaveBeenCalledWith(mockNotificacion._id);
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockNotificacion);
    });

    it('Debería lanzar un error si el registro no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      const findByIdSpy = jest
        .spyOn(notificacionModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(notificacionService.getById(nonExistentId)).rejects.toThrow(
        `${nonExistentId} no existe`,
      );

      expect(findByIdSpy).toHaveBeenCalledWith(nonExistentId);
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database connection failed');
      jest.spyOn(notificacionModel, 'findById').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(
        notificacionService.getById(mockNotificacion._id),
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('put', () => {
    const updateDto: NotificacionDTO = {
      ...mockNotificacionDto,
      plantilla: 'SISIFO_PLANTILLA_RECHAZO',
      referencia_tipo: 'SOLICITUD',
      metadato: {
        tipo_notificacion: 'rechazo_paa',
        vigencia: '2025',
        destinatarios_to: ['auditor@correo.gov.co'],
        destinatarios_cc: [],
        destinatarios_bcc: [],
      },
      referencia_id: new Types.ObjectId('671aaa8a064222e6583d56e8'),
    };

    it('Debería actualizar un registro existente', async () => {
      const updatedNotificacion = { ...mockNotificacion, ...updateDto };

      const updateSpy = jest
        .spyOn(notificacionModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedNotificacion),
        } as any);

      const result = await notificacionService.put(
        mockNotificacion._id,
        updateDto,
      );

      expect(updateSpy).toHaveBeenCalledWith(
        mockNotificacion._id,
        expect.objectContaining({
          ...updateDto,
          fecha_modificacion: expect.any(Date),
        }),
        { new: true },
      );
      expect(result).toEqual(updatedNotificacion);
    });

    it('No debería incluir activo ni fecha_creacion en la actualización', async () => {
      const updateSpy = jest
        .spyOn(notificacionModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockNotificacion),
        } as any);

      // Se envía un DTO con activo y fecha_creacion para verificar que el service los elimina
      const dtoConCamposProtegidos = {
        ...updateDto,
        activo: false,
        fecha_creacion: new Date('2020-01-01'),
      } as any;

      await notificacionService.put(
        mockNotificacion._id,
        dtoConCamposProtegidos,
      );

      const calledWith = updateSpy.mock.calls[0][1];
      expect(calledWith).not.toHaveProperty('activo');
      expect(calledWith).not.toHaveProperty('fecha_creacion');
      expect(calledWith).toHaveProperty('fecha_modificacion');
    });

    it('Debería actualizar referencia_tipo correctamente', async () => {
      const updateSpy = jest
        .spyOn(notificacionModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest
            .fn()
            .mockResolvedValue({ ...mockNotificacion, ...updateDto }),
        } as any);

      await notificacionService.put(mockNotificacion._id, updateDto);

      const calledWith = updateSpy.mock.calls[0][1];
      expect(calledWith.referencia_tipo).toBe('SOLICITUD');
    });

    it('Debería actualizar fecha_modificacion automáticamente', async () => {
      const updateSpy = jest
        .spyOn(notificacionModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockNotificacion),
        } as any);

      const dateBefore = new Date();
      await notificacionService.put(mockNotificacion._id, updateDto);
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

    it('Debería lanzar un error si el registro no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      jest.spyOn(notificacionModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        notificacionService.put(nonExistentId, updateDto),
      ).rejects.toThrow(`${nonExistentId} no existe`);
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error');
      jest.spyOn(notificacionModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(
        notificacionService.put(mockNotificacion._id, updateDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    it('Debería marcar un registro como inactivo (soft delete)', async () => {
      const deletedNotificacion = { ...mockNotificacion, activo: false };

      const deleteSpy = jest
        .spyOn(notificacionModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(deletedNotificacion),
        } as any);

      const result = await notificacionService.delete(mockNotificacion._id);

      expect(deleteSpy).toHaveBeenCalledWith(
        mockNotificacion._id,
        { activo: false },
        { new: true },
      );
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deletedNotificacion);
      expect(result.activo).toBe(false);
    });

    it('Debería lanzar un error si el registro no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      const deleteSpy = jest
        .spyOn(notificacionModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(notificacionService.delete(nonExistentId)).rejects.toThrow(
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

      jest.spyOn(notificacionModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(
        notificacionService.delete(mockNotificacion._id),
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
        .spyOn(notificacionModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(expectedCount),
        } as any);

      const result = await notificacionService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(countSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedCount);
    });

    it('Debería retornar 0 cuando no hay documentos que coincidan', async () => {
      const countSpy = jest
        .spyOn(notificacionModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(0),
        } as any);

      const result = await notificacionService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      const mockError = new Error('Error al contar documentos');

      jest.spyOn(notificacionModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(notificacionService.count(filterDto)).rejects.toThrow(
        'Error al contar documentos',
      );
    });

    it('Debería aplicar correctamente los filtros del FilterDto', async () => {
      const complexFilterDto: FilterDto = {
        query: 'activo:true,plantilla:SISIFO_PLANTILLA_SOLICITUD',
        fields: 'plantilla,fecha_envio',
        sortby: 'fecha_creacion',
        order: 'desc',
        limit: '10',
        offset: '0',
        populate: 'false',
      };

      const countSpy = jest
        .spyOn(notificacionModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(3),
        } as any);

      const result = await notificacionService.count(complexFilterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(3);
    });
  });
});
