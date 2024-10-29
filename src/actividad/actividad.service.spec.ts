import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ActividadService } from './actividad.service';
import {ActividadDTO} from './dto/actividad.dto'
import {Actividad} from './schemas/actividad.schema'
import { Model } from 'mongoose';
import {Auditoria} from '../auditoria/schemas/auditoria.schema'
import { FilterDto } from '../filters/filters.dto';

const mockActividadDto: ActividadDTO = {
  auditoriaId: "671aa963064222e6583d56e4",
  titulo: 'string',
  fechaInicio: new Date(),
  fechaFin: new Date(),
  referencia: 'string',
  descripcion: 'string',
  folio: 0,
  medioId: 0,
  carpeta: 'string',
  activo: true,
  fechaCreacion: new Date(),
  fechaModificacion: new Date(),
};
const mockActividad = {
  ...mockActividadDto,
  _id: '671aaf35d779a09e092cb732',
};

const mockAuditoria = {
  _id: '671aa963064222e6583d56e4',
  titulo: ''
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

  it('Debería estar definido', () => {
    expect(ActividadService).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver una alerta modal', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditoria),
      } as any);
      jest
        .spyOn(actividadModel, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockActividadDto as any));

      const result = await actividadService.post(mockActividadDto);
      expect(result).toEqual(mockActividadDto);
    });

    it('Debería lanzar un error si el Auditoria no existe', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(actividadService.post(mockActividadDto)).rejects.toThrow(
        `Auditoria with id ${mockActividadDto.auditoriaId} doesn't exist`,
      );
    });
  });

  describe('getAll', () => {
    it('Debería retornar todas las alertas modales con filtros aplicados', async () => {
      const mockActividads = [
        mockActividad,
        {
          _id: '671aaf35d779a09e092cb732',
          auditoriaId: "67197dda3416d2a85e5d6d8f",
          titulo: 'string',
          fechaInicio: new Date(),
          fechaFin: new Date(),
          referencia: 'string',
          descripcion: 'string',
          folio: 0,
          medio_id: 0,
          carpeta: 'string',
          activo: true,
          fecha_creacion: new Date(),
          fecha_modificacion: new Date(),
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
        exec: jest.fn().mockResolvedValue(mockActividads),
      };

      jest.spyOn(actividadModel, 'find').mockReturnValue(mockQuery as any);

      const result = await actividadService.getAll(mockFilterDto);

      expect(result).toEqual(mockActividads);
    });
  });

  describe('getById', () => {
    it('Debería retornar una alerta modal por su ID', async () => {
      jest.spyOn(actividadModel, 'findById').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockActividad as unknown as Actividad),
      } as any);

      const result = await actividadService.getById(mockActividad._id);

      expect(actividadModel.findById).toHaveBeenCalledWith(
        mockActividad._id,
      );
      expect(result).toEqual(mockActividad);
    });

    it('Debería lanzar un error si la alerta modal no existe', async () => {
      jest.spyOn(actividadModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        actividadService.getById(mockActividad._id),
      ).rejects.toThrow(`${mockActividad._id} doesn't exist`);

      expect(actividadModel.findById).toHaveBeenCalledWith(
        mockActividad._id,
      );
    });
  });

  describe('put', () => {
    it('Debería actualizar una alerta modal', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditoria),
      } as any);
      jest.spyOn(actividadModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockActividadDto as unknown as Actividad),
      } as any);

      const result = await actividadService.put(
        mockActividad._id,
        mockActividadDto,
      );

      expect(actividadModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockActividad._id,
        mockActividadDto,
        { new: true },
      );
      expect(result).toEqual(mockActividadDto);
    });

    it('Debería lanzar un error si la alerta modal no existe', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditoria),
      } as any);
      jest.spyOn(actividadModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        actividadService.put(mockActividad._id, mockActividadDto),
      ).rejects.toThrow(`${mockActividad._id} doesn't exist`);

      expect(actividadModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockActividad._id,
        mockActividadDto,
        { new: true },
      );
    });

    it('Debería lanzar un error si el Auditoria relacionado no existe', async () => {
      jest.spyOn(auditoriaModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        actividadService.put(mockActividad._id, mockActividadDto),
      ).rejects.toThrow(
        `Auditoria with id ${mockActividadDto.auditoriaId} doesn't exist`,
      );
    });
  });

  describe('delete', () => {
    it('Debería marcar una alerta modal como inactiva', async () => {
      jest.spyOn(actividadModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(mockActividadDto as unknown as Actividad),
      } as any);

      const result = await actividadService.delete(mockActividad._id);

      expect(result).toEqual(mockActividadDto);
    });

    it('Debería lanzar un error si la alerta modal no existe', async () => {
      jest.spyOn(actividadModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        actividadService.delete(mockActividad._id),
      ).rejects.toThrow(`${mockActividad._id} doesn't exist`);
    });
  });
});