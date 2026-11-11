import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ComentarioAccionService } from './comentario-accion.service';
import { ComentarioAccion } from './schema/comentario-accion.schema';
import { AccionMejora } from '../accion-mejora/schema/accion-mejora.schema';
import { FilterDto } from '../filters/filters.dto';
import {
  COMENTARIO_ID,
  crearAccion,
  crearComentario,
  crearComentarioDto,
} from '../../test/fixtures/comentario-accion';

function consultaMock(resultado: any) {
  return {
    sort: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(resultado),
  };
}

describe('ComentarioAccionService', () => {
  let service: ComentarioAccionService;
  let comentarioModel: Model<ComentarioAccion>;
  let accionModel: Model<AccionMejora>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComentarioAccionService,
        {
          provide: getModelToken(ComentarioAccion.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: getModelToken(AccionMejora.name),
          useValue: { findById: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(ComentarioAccionService);
    comentarioModel = module.get(getModelToken(ComentarioAccion.name));
    accionModel = module.get(getModelToken(AccionMejora.name));
  });

  afterEach(() => jest.clearAllMocks());

  const accionExiste = (accion: any = crearAccion()) =>
    jest.spyOn(accionModel, 'findById').mockReturnValue({
      exec: jest.fn().mockResolvedValue(accion),
    } as any);

  it('Debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear el comentario con activo=true y la misma fecha de creación y modificación', async () => {
      accionExiste();
      const createSpy = jest
        .spyOn(comentarioModel, 'create')
        .mockResolvedValue(crearComentario() as any);

      const result = await service.post(crearComentarioDto());

      const data = createSpy.mock.calls[0][0] as any;
      expect(data.activo).toBe(true);
      expect(data.fecha_creacion).toBeInstanceOf(Date);
      expect(data.fecha_modificacion).toBe(data.fecha_creacion);
      expect(data.mensaje).toBe(crearComentarioDto().mensaje);
      expect(result).toEqual(crearComentario());
    });

    it('Debería guardar la dependencia del autor cuando llega', async () => {
      accionExiste();
      const createSpy = jest
        .spyOn(comentarioModel, 'create')
        .mockResolvedValue(crearComentario() as any);

      await service.post(
        crearComentarioDto({
          usuario_rol: 'JEFE_DEPENDENCIA',
          dependencia_id: 14,
        }),
      );

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          dependencia_id: 14,
          usuario_rol: 'JEFE_DEPENDENCIA',
        }),
      );
    });

    it('Debería lanzar error si la acción de mejora no existe', async () => {
      accionExiste(null);
      const dto = crearComentarioDto();

      await expect(service.post(dto)).rejects.toThrow(
        `Acción de mejora relacionada con id ${dto.accion_mejora_id} no existe`,
      );
      expect(comentarioModel.create).not.toHaveBeenCalled();
    });

    it('Debería propagar errores de la base de datos', async () => {
      accionExiste();
      jest
        .spyOn(comentarioModel, 'create')
        .mockRejectedValue(new Error('DB error'));

      await expect(service.post(crearComentarioDto())).rejects.toThrow(
        'DB error',
      );
    });
  });

  describe('getAll', () => {
    const filtro: FilterDto = {
      query: `accion_mejora_id:${crearAccion()._id},activo:true`,
      fields: '',
      sortby: 'fecha_creacion',
      order: 'desc',
      limit: '20',
      offset: '0',
      populate: 'false',
    };

    it('Debería consultar los comentarios de la acción ordenados por fecha', async () => {
      const consulta = consultaMock([crearComentario()]);
      const findSpy = jest
        .spyOn(comentarioModel, 'find')
        .mockReturnValue(consulta as any);

      const result = await service.getAll(filtro);

      const [query, , paginacion] = findSpy.mock.calls[0] as any[];
      // FiltersService acepta el id como texto o como ObjectId
      expect(query.accion_mejora_id.$in.map(String)).toContain(
        crearAccion()._id,
      );
      // El casteo a booleano lo hace Mongoose con el schema
      expect(String(query.activo)).toBe('true');
      expect(paginacion).toEqual(
        expect.objectContaining({ limit: 20, skip: 0 }),
      );
      expect(consulta.sort).toHaveBeenCalledWith([['fecha_creacion', -1]]);
      expect(consulta.populate).toHaveBeenCalledWith([]);
      expect(result).toEqual([crearComentario()]);
    });

    it('Debería poblar la acción cuando populate es "true"', async () => {
      const consulta = consultaMock([]);
      jest.spyOn(comentarioModel, 'find').mockReturnValue(consulta as any);

      await service.getAll({ ...filtro, populate: 'true' });

      expect(consulta.populate).toHaveBeenCalledWith([
        { path: 'accion_mejora_id' },
      ]);
    });

    it('Debería retornar un arreglo vacío si la acción no tiene comentarios', async () => {
      jest
        .spyOn(comentarioModel, 'find')
        .mockReturnValue(consultaMock([]) as any);

      await expect(service.getAll(filtro)).resolves.toEqual([]);
    });
  });

  describe('getById', () => {
    it('Debería retornar el comentario', async () => {
      jest.spyOn(comentarioModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(crearComentario()),
      } as any);

      await expect(service.getById(COMENTARIO_ID)).resolves.toEqual(
        crearComentario(),
      );
    });

    it('Debería lanzar error si no existe', async () => {
      jest.spyOn(comentarioModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.getById(COMENTARIO_ID)).rejects.toThrow(
        `${COMENTARIO_ID} no existe`,
      );
    });
  });

  describe('put', () => {
    it('Debería actualizar sin sobrescribir la fecha de creación', async () => {
      accionExiste();
      const updateSpy = jest
        .spyOn(comentarioModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(crearComentario()),
        } as any);

      await service.put(COMENTARIO_ID, crearComentarioDto());

      const cambios = updateSpy.mock.calls[0][1] as any;
      expect(cambios.fecha_creacion).toBeUndefined();
      expect(cambios.fecha_modificacion).toBeInstanceOf(Date);
    });

    it('Debería lanzar error si el comentario no existe', async () => {
      accionExiste();
      jest
        .spyOn(comentarioModel, 'findByIdAndUpdate')
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);

      await expect(
        service.put(COMENTARIO_ID, crearComentarioDto()),
      ).rejects.toThrow(`${COMENTARIO_ID} no existe`);
    });
  });

  describe('delete', () => {
    it('Debería hacer borrado lógico y actualizar la fecha de modificación', async () => {
      const updateSpy = jest
        .spyOn(comentarioModel, 'findByIdAndUpdate')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue(crearComentario({ activo: false })),
        } as any);

      const result = await service.delete(COMENTARIO_ID);

      expect(updateSpy).toHaveBeenCalledWith(
        COMENTARIO_ID,
        { activo: false, fecha_modificacion: expect.any(Date) },
        { new: true },
      );
      expect(result.activo).toBe(false);
    });

    it('Debería lanzar error si no existe', async () => {
      jest
        .spyOn(comentarioModel, 'findByIdAndUpdate')
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);

      await expect(service.delete(COMENTARIO_ID)).rejects.toThrow(
        `${COMENTARIO_ID} no existe`,
      );
    });
  });

  describe('count', () => {
    it('Debería contar los comentarios con el filtro', async () => {
      jest.spyOn(comentarioModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(3),
      } as any);

      await expect(
        service.count({ query: 'activo:true' } as FilterDto),
      ).resolves.toBe(3);
    });
  });
});
