import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditoriaExternaEstadoService } from './auditoria-externa-estado.service';
import { AuditoriaExternaEstado } from './schema/auditoria-externa-estado.schema';
import { AuditoriaExterna } from '../auditoria-externa/schema/auditoria-externa.schema';
import {
  ESTADO_EXTERNA_ID,
  crearEstadoExterna,
  crearEstadoExternaDto,
} from '../../test/fixtures/auditoria-externa-estado';
import {
  AUDITORIA_EXTERNA_ID,
  crearAuditoriaExterna,
} from '../../test/fixtures/auditoria-externa';

const resuelve = (valor: any) => ({ exec: jest.fn().mockResolvedValue(valor) });

describe('AuditoriaExternaEstadoService', () => {
  let service: AuditoriaExternaEstadoService;
  let estadoModel: Model<AuditoriaExternaEstado>;
  let auditoriaModel: Model<AuditoriaExterna>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriaExternaEstadoService,
        {
          provide: getModelToken(AuditoriaExternaEstado.name),
          useValue: {
            create: jest.fn(),
            updateMany: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: getModelToken(AuditoriaExterna.name),
          useValue: { findById: jest.fn(), findByIdAndUpdate: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AuditoriaExternaEstadoService);
    estadoModel = module.get(getModelToken(AuditoriaExternaEstado.name));
    auditoriaModel = module.get(getModelToken(AuditoriaExterna.name));
  });

  afterEach(() => jest.clearAllMocks());

  const auditoriaExiste = (auditoria: any = crearAuditoriaExterna()) =>
    jest
      .spyOn(auditoriaModel, 'findById')
      .mockReturnValue(resuelve(auditoria) as any);

  describe('post', () => {
    it('Debería dejar los anteriores como históricos, crear el vigente y copiar el estado a la auditoría', async () => {
      auditoriaExiste();
      const updateMany = jest
        .spyOn(estadoModel, 'updateMany')
        .mockResolvedValue({} as any);
      const create = jest
        .spyOn(estadoModel, 'create')
        .mockResolvedValue(crearEstadoExterna() as any);
      const actualizarPadre = jest
        .spyOn(auditoriaModel, 'findByIdAndUpdate')
        .mockReturnValue(resuelve(crearAuditoriaExterna()) as any);

      const result = await service.post(
        crearEstadoExternaDto({ actual: false }),
      );

      expect(updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ actual: true }),
        { $set: { actual: false } },
      );
      const data = create.mock.calls[0][0] as any;
      expect(data.actual).toBe(true);
      expect(data.activo).toBe(true);
      expect(data.fecha_ejecucion_estado).toBeInstanceOf(Date);
      expect(actualizarPadre).toHaveBeenCalledWith(
        crearEstadoExterna().auditoria_externa_id,
        expect.objectContaining({ estado_id: 7500 }),
        { new: true },
      );
      expect(result).toEqual(crearEstadoExterna());
    });

    it('Debería lanzar error y no escribir si la auditoría externa no existe', async () => {
      auditoriaExiste(null);
      const dto = crearEstadoExternaDto();

      await expect(service.post(dto)).rejects.toThrow(
        `Auditoría externa relacionada con id ${dto.auditoria_externa_id} no existe`,
      );
      expect(estadoModel.updateMany).not.toHaveBeenCalled();
      expect(estadoModel.create).not.toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('Debería poblar la auditoría solo con populate=true', async () => {
      const consulta = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([crearEstadoExterna()]),
      };
      jest.spyOn(estadoModel, 'find').mockReturnValue(consulta as any);
      const filtro: any = {
        query: `auditoria_externa_id:${AUDITORIA_EXTERNA_ID},actual:true`,
        fields: '',
        sortby: '',
        order: '',
        limit: '10',
        offset: '0',
        populate: 'true',
      };

      await service.getAll(filtro);
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
        .spyOn(estadoModel, 'findById')
        .mockReturnValue(resuelve(null) as any);

      await expect(service.getById(ESTADO_EXTERNA_ID)).rejects.toThrow(
        `${ESTADO_EXTERNA_ID} no existe`,
      );
    });

    it('put actualiza validando la auditoría relacionada', async () => {
      auditoriaExiste();
      jest
        .spyOn(estadoModel, 'findByIdAndUpdate')
        .mockReturnValue(resuelve(crearEstadoExterna()) as any);

      await expect(
        service.put(ESTADO_EXTERNA_ID, crearEstadoExternaDto()),
      ).resolves.toEqual(crearEstadoExterna());
    });

    it('delete hace borrado lógico y falla si no existe', async () => {
      const update = jest.spyOn(estadoModel, 'findByIdAndUpdate');
      update.mockReturnValueOnce(
        resuelve(crearEstadoExterna({ activo: false })) as any,
      );
      await service.delete(ESTADO_EXTERNA_ID);
      expect(update).toHaveBeenCalledWith(
        ESTADO_EXTERNA_ID,
        { activo: false },
        { new: true },
      );

      update.mockReturnValueOnce(resuelve(null) as any);
      await expect(service.delete(ESTADO_EXTERNA_ID)).rejects.toThrow(
        `${ESTADO_EXTERNA_ID} no existe`,
      );
    });
  });
});
