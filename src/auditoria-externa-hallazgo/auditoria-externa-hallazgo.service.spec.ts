import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AuditoriaExternaHallazgoService,
  MAXIMO_HALLAZGOS_LOTE,
} from './auditoria-externa-hallazgo.service';
import { AuditoriaExternaHallazgo } from './schema/auditoria-externa-hallazgo.schema';
import { AuditoriaExterna } from '../auditoria-externa/schema/auditoria-externa.schema';
import {
  HALLAZGO_EXTERNO_ID,
  crearHallazgoExterno,
  crearHallazgoExternoDto,
  crearLoteHallazgos,
} from '../../test/fixtures/auditoria-externa-hallazgo';
import { crearAuditoriaExterna } from '../../test/fixtures/auditoria-externa';

const resuelve = (valor: any) => ({ exec: jest.fn().mockResolvedValue(valor) });

describe('AuditoriaExternaHallazgoService', () => {
  let service: AuditoriaExternaHallazgoService;
  let hallazgoModel: Model<AuditoriaExternaHallazgo>;
  let auditoriaModel: Model<AuditoriaExterna>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriaExternaHallazgoService,
        {
          provide: getModelToken(AuditoriaExternaHallazgo.name),
          useValue: {
            create: jest.fn(),
            insertMany: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: getModelToken(AuditoriaExterna.name),
          useValue: { findById: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AuditoriaExternaHallazgoService);
    hallazgoModel = module.get(getModelToken(AuditoriaExternaHallazgo.name));
    auditoriaModel = module.get(getModelToken(AuditoriaExterna.name));
  });

  afterEach(() => jest.clearAllMocks());

  const auditoriaExiste = (auditoria: any = crearAuditoriaExterna()) =>
    jest
      .spyOn(auditoriaModel, 'findById')
      .mockReturnValue(resuelve(auditoria) as any);

  describe('post', () => {
    it('Debería crear con activo=true y fechas iguales, conservando varias dependencias', async () => {
      auditoriaExiste();
      const create = jest
        .spyOn(hallazgoModel, 'create')
        .mockResolvedValue(crearHallazgoExterno() as any);

      await service.post(
        crearHallazgoExternoDto({ activo: false, dependencia_id: [101, 102] }),
      );

      const data = create.mock.calls[0][0] as any;
      expect(data.activo).toBe(true);
      expect(data.fecha_modificacion).toBe(data.fecha_creacion);
      expect(data.dependencia_id).toEqual([101, 102]);
      expect(data.criterio).toBeUndefined();
    });

    it('Debería lanzar error si la auditoría externa no existe', async () => {
      auditoriaExiste(null);

      await expect(service.post(crearHallazgoExternoDto())).rejects.toThrow(
        'Auditoría externa relacionada con id',
      );
      expect(hallazgoModel.create).not.toHaveBeenCalled();
    });

    it('Debería propagar el error de número repetido (índice único)', async () => {
      auditoriaExiste();
      jest
        .spyOn(hallazgoModel, 'create')
        .mockRejectedValue(new Error('E11000 duplicate key'));

      await expect(service.post(crearHallazgoExternoDto())).rejects.toThrow(
        'E11000',
      );
    });
  });

  describe('postLote', () => {
    it('Debería crear todos los hallazgos con la auditoría y la trazabilidad', async () => {
      auditoriaExiste();
      const insertMany = jest
        .spyOn(hallazgoModel, 'insertMany')
        .mockResolvedValue([crearHallazgoExterno()] as any);
      const lote = crearLoteHallazgos(3);

      await service.postLote(lote);

      const [documentos, opciones] = insertMany.mock.calls[0] as any[];
      expect(documentos).toHaveLength(3);
      expect(documentos[0]).toEqual(
        expect.objectContaining({
          auditoria_externa_id: lote.auditoria_externa_id,
          numeral: '3.1.1.1',
          activo: true,
        }),
      );
      expect(documentos[2].fecha_creacion).toBe(documentos[0].fecha_creacion);
      expect(opciones).toEqual({ ordered: true });
    });

    it('Debería rechazar un lote vacío', async () => {
      await expect(service.postLote(crearLoteHallazgos(0))).rejects.toThrow(
        'al menos un hallazgo',
      );
      expect(hallazgoModel.insertMany).not.toHaveBeenCalled();
    });

    it('Debería aceptar exactamente el máximo y rechazar uno más', async () => {
      auditoriaExiste();
      jest.spyOn(hallazgoModel, 'insertMany').mockResolvedValue([] as any);

      await expect(
        service.postLote(crearLoteHallazgos(MAXIMO_HALLAZGOS_LOTE)),
      ).resolves.toEqual([]);
      await expect(
        service.postLote(crearLoteHallazgos(MAXIMO_HALLAZGOS_LOTE + 1)),
      ).rejects.toThrow(`máximo de ${MAXIMO_HALLAZGOS_LOTE}`);
    });

    it('Debería lanzar error si la auditoría no existe, sin insertar', async () => {
      auditoriaExiste(null);

      await expect(service.postLote(crearLoteHallazgos())).rejects.toThrow(
        'Auditoría externa relacionada con id',
      );
      expect(hallazgoModel.insertMany).not.toHaveBeenCalled();
    });

    it('Debería propagar el error de un número repetido en el lote', async () => {
      auditoriaExiste();
      jest
        .spyOn(hallazgoModel, 'insertMany')
        .mockRejectedValue(new Error('E11000 duplicate key'));

      await expect(service.postLote(crearLoteHallazgos())).rejects.toThrow(
        'E11000',
      );
    });
  });

  describe('getAll', () => {
    it('Debería consultar los hallazgos activos de la auditoría y poblarla solo con populate=true', async () => {
      const consulta = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([crearHallazgoExterno()]),
      };
      jest.spyOn(hallazgoModel, 'find').mockReturnValue(consulta as any);
      const filtro: any = {
        query: 'auditoria_externa_id:672d4a11f7814a9a0c5261e1,activo:true',
        fields: '',
        sortby: 'numeral',
        order: 'asc',
        limit: '0',
        offset: '0',
        populate: 'true',
      };

      await expect(service.getAll(filtro)).resolves.toEqual([
        crearHallazgoExterno(),
      ]);
      expect(consulta.populate).toHaveBeenCalledWith([
        { path: 'auditoria_externa_id' },
      ]);

      await service.getAll({ ...filtro, populate: 'false' });
      expect(consulta.populate).toHaveBeenLastCalledWith([]);
    });
  });

  describe('getById / put / delete', () => {
    it('getById lanza error si no existe', async () => {
      jest
        .spyOn(hallazgoModel, 'findById')
        .mockReturnValue(resuelve(null) as any);

      await expect(service.getById(HALLAZGO_EXTERNO_ID)).rejects.toThrow(
        `${HALLAZGO_EXTERNO_ID} no existe`,
      );
    });

    it('put no sobrescribe la creación y falla si no existe', async () => {
      auditoriaExiste();
      const update = jest.spyOn(hallazgoModel, 'findByIdAndUpdate');
      update.mockReturnValueOnce(resuelve(crearHallazgoExterno()) as any);

      await service.put(HALLAZGO_EXTERNO_ID, crearHallazgoExternoDto());
      const [, dto] = update.mock.calls[0] as any[];
      expect(dto.fecha_creacion).toBeUndefined();
      expect(dto.fecha_modificacion).toBeInstanceOf(Date);

      update.mockReturnValueOnce(resuelve(null) as any);
      await expect(
        service.put(HALLAZGO_EXTERNO_ID, crearHallazgoExternoDto()),
      ).rejects.toThrow(`${HALLAZGO_EXTERNO_ID} no existe`);
    });

    it('delete hace borrado lógico', async () => {
      const update = jest
        .spyOn(hallazgoModel, 'findByIdAndUpdate')
        .mockReturnValue(
          resuelve(crearHallazgoExterno({ activo: false })) as any,
        );

      await service.delete(HALLAZGO_EXTERNO_ID);

      const [, cambios] = update.mock.calls[0] as any[];
      expect(cambios.activo).toBe(false);
    });
  });
});
