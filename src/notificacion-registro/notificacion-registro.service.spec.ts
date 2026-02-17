import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotificacionRegistroService } from './notificacion-registro.service';
import { NotificacionRegistroDTO } from './dto/notificacion-registro.dto';
import { NotificacionRegistro } from './schema/notificacion-registro.schema';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockNotificacionRegistroDto: NotificacionRegistroDTO = {
  destinatario: 'usuario@correo.gov.co',
  fecha_envio: new Date('2024-06-01T10:00:00Z'),
  metadatos: { tipo: 'aprobacion_paa' },
  referencia_id: '671aaa8a064222e6583d56e7',
};

const mockNotificacionRegistro = {
  ...mockNotificacionRegistroDto,
  _id: '671aaf35d779a09e092cb800',
};

describe('NotificacionRegistroService', () => {
  let notificacionRegistroService: NotificacionRegistroService;
  let notificacionRegistroModel: Model<NotificacionRegistro>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacionRegistroService,
        {
          provide: getModelToken(NotificacionRegistro.name),
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

    notificacionRegistroService = module.get<NotificacionRegistroService>(
      NotificacionRegistroService,
    );
    notificacionRegistroModel = module.get<Model<NotificacionRegistro>>(
      getModelToken(NotificacionRegistro.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debería estar definido', () => {
    expect(notificacionRegistroService).toBeDefined();
    expect(notificacionRegistroModel).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver un registro de notificación cuando los datos son válidos', async () => {
      const createSpy = jest
        .spyOn(notificacionRegistroModel, 'create')
        .mockResolvedValue(mockNotificacionRegistro as any);

      const result = await notificacionRegistroService.post(
        mockNotificacionRegistroDto,
      );

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockNotificacionRegistroDto,
          activo: true,
          fecha_creacion: expect.any(Date),
          fecha_modificacion: expect.any(Date),
        }),
      );
      expect(result).toEqual(mockNotificacionRegistro);
    });

    it('Debería establecer activo en true automáticamente', async () => {
      const createSpy = jest
        .spyOn(notificacionRegistroModel, 'create')
        .mockResolvedValue(mockNotificacionRegistro as any);

      await notificacionRegistroService.post(mockNotificacionRegistroDto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({ activo: true }),
      );
    });

    it('Debería establecer fecha_creacion y fecha_modificacion automáticamente', async () => {
      const createSpy = jest
        .spyOn(notificacionRegistroModel, 'create')
        .mockResolvedValue(mockNotificacionRegistro as any);

      const dateBefore = new Date();
      await notificacionRegistroService.post(mockNotificacionRegistroDto);
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

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error');
      jest
        .spyOn(notificacionRegistroModel, 'create')
        .mockRejectedValue(mockError);

      await expect(
        notificacionRegistroService.post(mockNotificacionRegistroDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'activo:true',
      fields: 'destinatario,fecha_envio',
      sortby: 'fecha_creacion',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'false',
    };

    const mockNotificaciones = [
      { ...mockNotificacionRegistro, _id: '1', destinatario: 'user1@correo.gov.co' },
      { ...mockNotificacionRegistro, _id: '2', destinatario: 'user2@correo.gov.co' },
    ];

    it('Debería retornar todos los registros con filtros aplicados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockNotificaciones),
      };

      const findSpy = jest
        .spyOn(notificacionRegistroModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await notificacionRegistroService.getAll(mockFilterDto);

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

      jest
        .spyOn(notificacionRegistroModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await notificacionRegistroService.getAll(mockFilterDto);

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

      jest
        .spyOn(notificacionRegistroModel, 'find')
        .mockReturnValue(mockQuery as any);

      await expect(
        notificacionRegistroService.getAll(mockFilterDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('Debería retornar un registro por su ID cuando existe', async () => {
      const findByIdSpy = jest
        .spyOn(notificacionRegistroModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockNotificacionRegistro),
        } as any);

      const result = await notificacionRegistroService.getById(
        mockNotificacionRegistro._id,
      );

      expect(findByIdSpy).toHaveBeenCalledWith(mockNotificacionRegistro._id);
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockNotificacionRegistro);
    });

    it('Debería lanzar un error si el registro no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      const findByIdSpy = jest
        .spyOn(notificacionRegistroModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(
        notificacionRegistroService.getById(nonExistentId),
      ).rejects.toThrow(`${nonExistentId} no existe`);

      expect(findByIdSpy).toHaveBeenCalledWith(nonExistentId);
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database connection failed');
      jest
        .spyOn(notificacionRegistroModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockRejectedValue(mockError),
        } as any);

      await expect(
        notificacionRegistroService.getById(mockNotificacionRegistro._id),
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('put', () => {
    const updateDto: NotificacionRegistroDTO = {
      ...mockNotificacionRegistroDto,
      destinatario: 'nuevo@correo.gov.co',
      metadatos: { tipo: 'aprobacion_programa' },
      referencia_id: '671aaa8a064222e6583d56e8',
    };

    it('Debería actualizar un registro existente', async () => {
      const updatedNotificacion = {
        ...mockNotificacionRegistro,
        ...updateDto,
      };

      const updateSpy = jest
        .spyOn(notificacionRegistroModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedNotificacion),
        } as any);

      const result = await notificacionRegistroService.put(
        mockNotificacionRegistro._id,
        updateDto,
      );

      expect(updateSpy).toHaveBeenCalledWith(
        mockNotificacionRegistro._id,
        expect.objectContaining({
          ...updateDto,
          fecha_modificacion: expect.any(Date),
        }),
        { new: true },
      );
      expect(result).toEqual(updatedNotificacion);
    });

    it('No debería incluir activo, fecha_creacion en la actualización', async () => {
      const updateSpy = jest
        .spyOn(notificacionRegistroModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockNotificacionRegistro),
        } as any);

      await notificacionRegistroService.put(
        mockNotificacionRegistro._id,
        updateDto,
      );

      const calledWith = updateSpy.mock.calls[0][1];
      expect(calledWith).not.toHaveProperty('activo');
      expect(calledWith).not.toHaveProperty('fecha_creacion');
      expect(calledWith).toHaveProperty('fecha_modificacion');
    });

    it('Debería actualizar fecha_modificacion automáticamente', async () => {
      const updateSpy = jest
        .spyOn(notificacionRegistroModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockNotificacionRegistro),
        } as any);

      const dateBefore = new Date();
      await notificacionRegistroService.put(
        mockNotificacionRegistro._id,
        updateDto,
      );
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

      jest
        .spyOn(notificacionRegistroModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(
        notificacionRegistroService.put(nonExistentId, updateDto),
      ).rejects.toThrow(`${nonExistentId} no existe`);
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error');
      jest
        .spyOn(notificacionRegistroModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockRejectedValue(mockError),
        } as any);

      await expect(
        notificacionRegistroService.put(
          mockNotificacionRegistro._id,
          updateDto,
        ),
      ).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    it('Debería marcar un registro como inactivo (soft delete)', async () => {
      const deletedNotificacion = {
        ...mockNotificacionRegistro,
        activo: false,
      };

      const deleteSpy = jest
        .spyOn(notificacionRegistroModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(deletedNotificacion),
        } as any);

      const result = await notificacionRegistroService.delete(
        mockNotificacionRegistro._id,
      );

      expect(deleteSpy).toHaveBeenCalledWith(
        mockNotificacionRegistro._id,
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
        .spyOn(notificacionRegistroModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(
        notificacionRegistroService.delete(nonExistentId),
      ).rejects.toThrow(`${nonExistentId} no existe`);

      expect(deleteSpy).toHaveBeenCalledWith(
        nonExistentId,
        { activo: false },
        { new: true },
      );
    });

    it('Debería propagar errores de la base de datos', async () => {
      const mockError = new Error('Database error during delete');

      jest
        .spyOn(notificacionRegistroModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockRejectedValue(mockError),
        } as any);

      await expect(
        notificacionRegistroService.delete(mockNotificacionRegistro._id),
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
        .spyOn(notificacionRegistroModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(expectedCount),
        } as any);

      const result = await notificacionRegistroService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(countSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedCount);
    });

    it('Debería retornar 0 cuando no hay documentos que coincidan', async () => {
      const countSpy = jest
        .spyOn(notificacionRegistroModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(0),
        } as any);

      const result = await notificacionRegistroService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('Debería lanzar un error si countDocuments falla', async () => {
      const mockError = new Error('Error al contar documentos');

      jest
        .spyOn(notificacionRegistroModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockRejectedValue(mockError),
        } as any);

      await expect(
        notificacionRegistroService.count(filterDto),
      ).rejects.toThrow('Error al contar documentos');
    });

    it('Debería aplicar correctamente los filtros del FilterDto', async () => {
      const complexFilterDto: FilterDto = {
        query: 'activo:true,destinatario:usuario@correo.gov.co',
        fields: 'destinatario,fecha_envio',
        sortby: 'fecha_creacion',
        order: 'desc',
        limit: '10',
        offset: '0',
        populate: 'false',
      };

      const countSpy = jest
        .spyOn(notificacionRegistroModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(3),
        } as any);

      const result = await notificacionRegistroService.count(complexFilterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(3);
    });
  });
});