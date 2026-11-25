import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditoriaExternaService } from './auditoria-externa.service';
import { AuditoriaExterna } from './schema/auditoria-externa.schema';
import { FilterDto } from '../filters/filters.dto';
import {
  AUDITORIA_EXTERNA_ID,
  crearAuditoriaExterna,
  crearAuditoriaExternaDto,
} from '../../test/fixtures/auditoria-externa';

function consultaMock(resultado: any) {
  return {
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(resultado),
  };
}

describe('AuditoriaExternaService', () => {
  let service: AuditoriaExternaService;
  let modelo: Model<AuditoriaExterna>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriaExternaService,
        {
          provide: getModelToken(AuditoriaExterna.name),
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

    service = module.get(AuditoriaExternaService);
    modelo = module.get(getModelToken(AuditoriaExterna.name));
  });

  afterEach(() => jest.clearAllMocks());

  it('Debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear con activo=true y la misma fecha de creación y modificación', async () => {
      const createSpy = jest
        .spyOn(modelo, 'create')
        .mockResolvedValue(crearAuditoriaExterna() as any);

      const result = await service.post(
        crearAuditoriaExternaDto({ activo: false }),
      );

      const data = createSpy.mock.calls[0][0] as any;
      expect(data.activo).toBe(true);
      expect(data.fecha_creacion).toBeInstanceOf(Date);
      expect(data.fecha_modificacion).toBe(data.fecha_creacion);
      expect(data.dependencia_id).toEqual([101, 102]);
      expect(result).toEqual(crearAuditoriaExterna());
    });

    it('Debería propagar errores de la base de datos', async () => {
      jest.spyOn(modelo, 'create').mockRejectedValue(new Error('DB error'));

      await expect(service.post(crearAuditoriaExternaDto())).rejects.toThrow(
        'DB error',
      );
    });
  });

  describe('getAll', () => {
    const filtro: FilterDto = {
      query: 'vigencia_id:6772,activo:true',
      fields: '',
      sortby: 'fecha_creacion',
      order: 'desc',
      limit: '20',
      offset: '0',
      populate: 'false',
    };

    it('Debería filtrar por vigencia, paginar y ordenar', async () => {
      const consulta = consultaMock([crearAuditoriaExterna()]);
      const findSpy = jest
        .spyOn(modelo, 'find')
        .mockReturnValue(consulta as any);

      const result = await service.getAll(filtro);

      const [query, , paginacion] = findSpy.mock.calls[0] as any[];
      expect(JSON.stringify(query)).toContain('6772');
      expect(paginacion).toEqual(
        expect.objectContaining({ limit: 20, skip: 0 }),
      );
      expect(consulta.sort).toHaveBeenCalledWith([['fecha_creacion', -1]]);
      expect(result).toEqual([crearAuditoriaExterna()]);
    });

    it('Debería retornar un arreglo vacío si no hay registros', async () => {
      jest.spyOn(modelo, 'find').mockReturnValue(consultaMock([]) as any);

      await expect(service.getAll(filtro)).resolves.toEqual([]);
    });
  });

  describe('getById', () => {
    it('Debería retornar la auditoría', async () => {
      jest.spyOn(modelo, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(crearAuditoriaExterna()),
      } as any);

      await expect(service.getById(AUDITORIA_EXTERNA_ID)).resolves.toEqual(
        crearAuditoriaExterna(),
      );
    });

    it('Debería lanzar error si no existe', async () => {
      jest.spyOn(modelo, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.getById(AUDITORIA_EXTERNA_ID)).rejects.toThrow(
        `${AUDITORIA_EXTERNA_ID} no existe`,
      );
    });
  });

  describe('put', () => {
    it('Debería actualizar, renovar la modificación y no sobrescribir la creación', async () => {
      const updateSpy = jest
        .spyOn(modelo, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(crearAuditoriaExterna()),
        } as any);

      await service.put(AUDITORIA_EXTERNA_ID, crearAuditoriaExternaDto());

      const [, dto] = updateSpy.mock.calls[0] as any[];
      expect(dto.fecha_creacion).toBeUndefined();
      expect(dto.fecha_modificacion).toBeInstanceOf(Date);
    });

    it('Debería lanzar error si no existe', async () => {
      jest.spyOn(modelo, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        service.put(AUDITORIA_EXTERNA_ID, crearAuditoriaExternaDto()),
      ).rejects.toThrow(`${AUDITORIA_EXTERNA_ID} no existe`);
    });
  });

  describe('delete', () => {
    it('Debería hacer borrado lógico', async () => {
      const updateSpy = jest
        .spyOn(modelo, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest
            .fn()
            .mockResolvedValue(crearAuditoriaExterna({ activo: false })),
        } as any);

      await service.delete(AUDITORIA_EXTERNA_ID);

      const [, cambios] = updateSpy.mock.calls[0] as any[];
      expect(cambios.activo).toBe(false);
      expect(cambios.fecha_modificacion).toBeInstanceOf(Date);
    });

    it('Debería lanzar error si no existe', async () => {
      jest.spyOn(modelo, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.delete(AUDITORIA_EXTERNA_ID)).rejects.toThrow(
        `${AUDITORIA_EXTERNA_ID} no existe`,
      );
    });
  });

  describe('count', () => {
    it('Debería contar con el mismo filtro', async () => {
      jest.spyOn(modelo, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(3),
      } as any);

      await expect(
        service.count({ query: 'activo:true' } as any),
      ).resolves.toBe(3);
    });
  });
});
