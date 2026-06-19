import { Test, TestingModule } from '@nestjs/testing';
import { HallazgoRemisionService } from './hallazgo-remision.service';
import { getModelToken } from '@nestjs/mongoose';
import { HallazgoRemision } from './schema/hallazgo-remision.schema';
import { HallazgoRemisionDTO } from './dto/hallazgo-remision.dto';
import { Hallazgo } from '../hallazgo/schemas/hallazgo.schema';
import { Model, Types } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';

const mockHallazgoRemisionDTO: Partial<HallazgoRemisionDTO> = {
  hallazgo_id: new Types.ObjectId('67197dda3416d2a85e5d6d8f'),
  dependencia_origen_id: 123,
  dependencia_destino_id: [456],
  usuario_id: 789,
  usuario_rol: 'Auditor',
  observacion: 'Se remite por competencia',
  estado: 'pendiente',
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
  fecha_modificacion: new Date('2024-01-01'),
};

const mockHallazgoRemision = {
  ...mockHallazgoRemisionDTO,
  _id: '671aa963064222e6583d56e4',
};

const mockHallazgo = {
  _id: '67197dda3416d2a85e5d6d8f',
  titulo: 'Hallazgo de prueba',
  descripcion: 'Descripción del hallazgo',
};

describe('HallazgoRemisionService', () => {
  let hallazgoRemisionService: HallazgoRemisionService;
  let hallazgoRemisionModel: Model<HallazgoRemision>;
  let hallazgoModel: Model<Hallazgo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HallazgoRemisionService,
        {
          provide: getModelToken(HallazgoRemision.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: getModelToken(Hallazgo.name),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    hallazgoRemisionService = module.get<HallazgoRemisionService>(
      HallazgoRemisionService,
    );
    hallazgoRemisionModel = module.get<Model<HallazgoRemision>>(
      getModelToken(HallazgoRemision.name),
    );
    hallazgoModel = module.get<Model<Hallazgo>>(getModelToken(Hallazgo.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debería estar definido', () => {
    expect(hallazgoRemisionService).toBeDefined();
    expect(hallazgoRemisionModel).toBeDefined();
    expect(hallazgoModel).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear y devolver una remisión de hallazgo cuando los datos son válidos', async () => {
      const hallazgoFindSpy = jest
        .spyOn(hallazgoModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockHallazgo),
        } as any);

      const createSpy = jest
        .spyOn(hallazgoRemisionModel, 'create')
        .mockResolvedValue(mockHallazgoRemision as any);

      const result = await hallazgoRemisionService.post(
        mockHallazgoRemisionDTO as HallazgoRemisionDTO,
      );

      expect(hallazgoFindSpy).toHaveBeenCalledWith(
        mockHallazgoRemisionDTO.hallazgo_id,
      );
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          hallazgo_id: expect.any(Object),
          dependencia_origen_id: mockHallazgoRemisionDTO.dependencia_origen_id,
          dependencia_destino_id:
            mockHallazgoRemisionDTO.dependencia_destino_id,
          usuario_id: mockHallazgoRemisionDTO.usuario_id,
          observacion: mockHallazgoRemisionDTO.observacion,
          estado: mockHallazgoRemisionDTO.estado,
          activo: true,
          fecha_creacion: expect.any(Date),
          fecha_modificacion: expect.any(Date),
        }),
      );
      expect(result).toEqual(mockHallazgoRemision);
    });

    it('Debería lanzar un error si el Hallazgo no existe', async () => {
      const hallazgoFindSpy = jest
        .spyOn(hallazgoModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(
        hallazgoRemisionService.post(
          mockHallazgoRemisionDTO as HallazgoRemisionDTO,
        ),
      ).rejects.toThrow(
        `Hallazgo relacionado con id ${mockHallazgoRemisionDTO.hallazgo_id} no existe`,
      );

      expect(hallazgoFindSpy).toHaveBeenCalledWith(
        mockHallazgoRemisionDTO.hallazgo_id,
      );
      expect(hallazgoRemisionModel.create).not.toHaveBeenCalled();
    });

    it('Debería establecer activo en true y fechas automáticamente', async () => {
      jest.spyOn(hallazgoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockHallazgo),
      } as any);

      const createSpy = jest
        .spyOn(hallazgoRemisionModel, 'create')
        .mockResolvedValue(mockHallazgoRemision as any);

      await hallazgoRemisionService.post(
        mockHallazgoRemisionDTO as HallazgoRemisionDTO,
      );

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activo: true,
          fecha_creacion: expect.any(Date),
          fecha_modificacion: expect.any(Date),
        }),
      );
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'activo:true',
      fields: 'observacion,estado',
      sortby: 'fecha_creacion',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'false',
    };

    const mockRemisiones = [
      {
        ...mockHallazgoRemision,
        _id: '671aa963064222e6583d56e4',
      },
      {
        ...mockHallazgoRemision,
        _id: '671aaa8a064222e6583d56e7',
      },
    ];

    it('Debería retornar todas las remisiones con filtros aplicados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRemisiones),
      };

      const findSpy = jest
        .spyOn(hallazgoRemisionModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await hallazgoRemisionService.getAll(mockFilterDto);

      expect(findSpy).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalled();
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual(mockRemisiones);
    });

    it('Debería aplicar populate cuando populate es "true"', async () => {
      const filterWithPopulate = { ...mockFilterDto, populate: 'true' };
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRemisiones),
      };

      jest
        .spyOn(hallazgoRemisionModel, 'find')
        .mockReturnValue(mockQuery as any);

      await hallazgoRemisionService.getAll(filterWithPopulate);

      expect(mockQuery.populate).toHaveBeenCalledWith([
        { path: 'hallazgo_id' },
      ]);
    });

    it('Debería retornar un array vacío cuando no hay resultados', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      jest
        .spyOn(hallazgoRemisionModel, 'find')
        .mockReturnValue(mockQuery as any);

      const result = await hallazgoRemisionService.getAll(mockFilterDto);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getById', () => {
    it('Debería retornar una remisión por su ID cuando existe', async () => {
      const findByIdSpy = jest
        .spyOn(hallazgoRemisionModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockHallazgoRemision),
        } as any);

      const result = await hallazgoRemisionService.getById(
        mockHallazgoRemision._id,
      );

      expect(findByIdSpy).toHaveBeenCalledWith(mockHallazgoRemision._id);
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockHallazgoRemision);
    });

    it('Debería lanzar un error si la remisión no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      const findByIdSpy = jest
        .spyOn(hallazgoRemisionModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(
        hallazgoRemisionService.getById(nonExistentId),
      ).rejects.toThrow(`${nonExistentId} no existe`);

      expect(findByIdSpy).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('put', () => {
    const updateDto: Partial<HallazgoRemisionDTO> = {
      ...mockHallazgoRemisionDTO,
      observacion: 'Observación actualizada',
      estado: 'aceptada',
    };

    it('Debería actualizar una remisión existente', async () => {
      const updatedRemision = { ...mockHallazgoRemision, ...updateDto };

      const hallazgoFindSpy = jest
        .spyOn(hallazgoModel, 'findById')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockHallazgo),
        } as any);

      const updateSpy = jest
        .spyOn(hallazgoRemisionModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedRemision),
        } as any);

      const result = await hallazgoRemisionService.put(
        mockHallazgoRemision._id,
        updateDto as HallazgoRemisionDTO,
      );

      expect(hallazgoFindSpy).toHaveBeenCalledWith(updateDto.hallazgo_id);
      expect(updateSpy).toHaveBeenCalledWith(
        mockHallazgoRemision._id,
        expect.objectContaining({
          ...updateDto,
          fecha_modificacion: expect.any(Date),
        }),
        { new: true },
      );
      expect(result).toEqual(updatedRemision);
    });

    it('Debería eliminar fecha_creacion del DTO antes de actualizar', async () => {
      const dtoWithCreationDate = {
        ...updateDto,
        fecha_creacion: new Date('2024-01-01'),
      };

      jest.spyOn(hallazgoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockHallazgo),
      } as any);

      const updateSpy = jest
        .spyOn(hallazgoRemisionModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockHallazgoRemision),
        } as any);

      await hallazgoRemisionService.put(
        mockHallazgoRemision._id,
        dtoWithCreationDate as HallazgoRemisionDTO,
      );

      const calledWith = updateSpy.mock.calls[0][1];
      expect(calledWith).not.toHaveProperty('fecha_creacion');
      expect(calledWith).toHaveProperty('fecha_modificacion');
    });

    it('Debería lanzar un error si la remisión no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      jest.spyOn(hallazgoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockHallazgo),
      } as any);

      const updateSpy = jest
        .spyOn(hallazgoRemisionModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(
        hallazgoRemisionService.put(
          nonExistentId,
          updateDto as HallazgoRemisionDTO,
        ),
      ).rejects.toThrow(`${nonExistentId} no existe`);

      expect(updateSpy).toHaveBeenCalledWith(
        nonExistentId,
        expect.any(Object),
        { new: true },
      );
    });

    it('Debería lanzar un error si el Hallazgo relacionado no existe', async () => {
      jest.spyOn(hallazgoModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        hallazgoRemisionService.put(
          mockHallazgoRemision._id,
          updateDto as HallazgoRemisionDTO,
        ),
      ).rejects.toThrow(
        `Hallazgo relacionado con id ${updateDto.hallazgo_id} no existe`,
      );

      expect(hallazgoRemisionModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('Debería marcar una remisión como inactiva (soft delete)', async () => {
      const deletedRemision = { ...mockHallazgoRemision, activo: false };

      const deleteSpy = jest
        .spyOn(hallazgoRemisionModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(deletedRemision),
        } as any);

      const result = await hallazgoRemisionService.delete(
        mockHallazgoRemision._id,
      );

      expect(deleteSpy).toHaveBeenCalledWith(
        mockHallazgoRemision._id,
        { activo: false },
        { new: true },
      );
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deletedRemision);
      expect(result.activo).toBe(false);
    });

    it('Debería lanzar un error si la remisión no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';

      const deleteSpy = jest
        .spyOn(hallazgoRemisionModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        } as any);

      await expect(
        hallazgoRemisionService.delete(nonExistentId),
      ).rejects.toThrow(`${nonExistentId} no existe`);

      expect(deleteSpy).toHaveBeenCalledWith(
        nonExistentId,
        { activo: false },
        { new: true },
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
        .spyOn(hallazgoRemisionModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(expectedCount),
        } as any);

      const result = await hallazgoRemisionService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(countSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedCount);
    });

    it('Debería retornar 0 cuando no hay documentos que coincidan', async () => {
      const countSpy = jest
        .spyOn(hallazgoRemisionModel, 'countDocuments')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(0),
        } as any);

      const result = await hallazgoRemisionService.count(filterDto);

      expect(countSpy).toHaveBeenCalled();
      expect(result).toBe(0);
    });
  });
});
