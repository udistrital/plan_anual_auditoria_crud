import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { AuditoriaExternaController } from './auditoria-externa.controller';
import { AuditoriaExternaService } from './auditoria-externa.service';
import {
  AUDITORIA_EXTERNA_ID,
  crearAuditoriaExterna,
  crearAuditoriaExternaDto,
} from '../../test/fixtures/auditoria-externa';

function respuesta() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('AuditoriaExternaController', () => {
  let controller: AuditoriaExternaController;
  let service: AuditoriaExternaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditoriaExternaController],
      providers: [
        {
          provide: AuditoriaExternaService,
          useValue: {
            post: jest.fn(),
            getAll: jest.fn(),
            count: jest.fn(),
            getById: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuditoriaExternaController);
    service = module.get(AuditoriaExternaService);
  });

  afterEach(() => jest.clearAllMocks());

  it('post responde 201 con la auditoría creada', async () => {
    jest
      .spyOn(service, 'post')
      .mockResolvedValue(crearAuditoriaExterna() as any);
    const res = respuesta();

    await controller.post(res, crearAuditoriaExternaDto());

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      Success: true,
      Status: HttpStatus.CREATED,
      Message: 'Registro Exitoso',
      Data: crearAuditoriaExterna(),
    });
  });

  it('post responde 400 si el servicio falla', async () => {
    jest.spyOn(service, 'post').mockRejectedValue(new Error('DB error'));
    const res = respuesta();

    await controller.post(res, crearAuditoriaExternaDto());

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ Success: false, Data: 'DB error' }),
    );
  });

  it('getAll responde 200 con el conteo en MetaData', async () => {
    jest
      .spyOn(service, 'getAll')
      .mockResolvedValue([crearAuditoriaExterna()] as any);
    jest.spyOn(service, 'count').mockResolvedValue(1);
    const res = respuesta();

    await controller.getAll(res, {} as any);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        Data: [crearAuditoriaExterna()],
        MetaData: { Count: 1 },
      }),
    );
  });

  it('getAll responde 404 si el servicio falla', async () => {
    jest.spyOn(service, 'getAll').mockRejectedValue(new Error('filtro'));
    const res = respuesta();

    await controller.getAll(res, {} as any);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('getById responde 200 y 404', async () => {
    const getById = jest.spyOn(service, 'getById');
    getById.mockResolvedValueOnce(crearAuditoriaExterna() as any);
    const ok = respuesta();
    await controller.getById(ok, AUDITORIA_EXTERNA_ID);
    expect(ok.status).toHaveBeenCalledWith(HttpStatus.OK);

    getById.mockRejectedValueOnce(new Error('no existe'));
    const falla = respuesta();
    await controller.getById(falla, AUDITORIA_EXTERNA_ID);
    expect(falla.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('put responde 200 y 400', async () => {
    const put = jest.spyOn(service, 'put');
    put.mockResolvedValueOnce(crearAuditoriaExterna() as any);
    const ok = respuesta();
    await controller.put(ok, AUDITORIA_EXTERNA_ID, crearAuditoriaExternaDto());
    expect(ok.status).toHaveBeenCalledWith(HttpStatus.OK);

    put.mockRejectedValueOnce(new Error('no existe'));
    const falla = respuesta();
    await controller.put(
      falla,
      AUDITORIA_EXTERNA_ID,
      crearAuditoriaExternaDto(),
    );
    expect(falla.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('delete responde 200 y 404', async () => {
    const borrar = jest.spyOn(service, 'delete');
    borrar.mockResolvedValueOnce(
      crearAuditoriaExterna({ activo: false }) as any,
    );
    const ok = respuesta();
    await controller.delete(ok, AUDITORIA_EXTERNA_ID);
    expect(ok.status).toHaveBeenCalledWith(HttpStatus.OK);

    borrar.mockRejectedValueOnce(new Error('no existe'));
    const falla = respuesta();
    await controller.delete(falla, AUDITORIA_EXTERNA_ID);
    expect(falla.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });
});
