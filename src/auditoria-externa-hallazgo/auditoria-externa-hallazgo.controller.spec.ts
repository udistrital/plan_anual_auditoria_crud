import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { AuditoriaExternaHallazgoController } from './auditoria-externa-hallazgo.controller';
import { AuditoriaExternaHallazgoService } from './auditoria-externa-hallazgo.service';
import {
  HALLAZGO_EXTERNO_ID,
  crearHallazgoExterno,
  crearHallazgoExternoDto,
  crearLoteHallazgos,
} from '../../test/fixtures/auditoria-externa-hallazgo';

function respuesta() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('AuditoriaExternaHallazgoController', () => {
  let controller: AuditoriaExternaHallazgoController;
  let service: AuditoriaExternaHallazgoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditoriaExternaHallazgoController],
      providers: [
        {
          provide: AuditoriaExternaHallazgoService,
          useValue: {
            post: jest.fn(),
            postLote: jest.fn(),
            getAll: jest.fn(),
            count: jest.fn(),
            getById: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuditoriaExternaHallazgoController);
    service = module.get(AuditoriaExternaHallazgoService);
  });

  afterEach(() => jest.clearAllMocks());

  it('post responde 201 y 400', async () => {
    const post = jest.spyOn(service, 'post');
    post.mockResolvedValueOnce(crearHallazgoExterno() as any);
    const ok = respuesta();
    await controller.post(ok, crearHallazgoExternoDto());
    expect(ok.status).toHaveBeenCalledWith(HttpStatus.CREATED);

    post.mockRejectedValueOnce(new Error('E11000 duplicate key'));
    const falla = respuesta();
    await controller.post(falla, crearHallazgoExternoDto());
    expect(falla.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(falla.json).toHaveBeenCalledWith(
      expect.objectContaining({ Data: 'E11000 duplicate key' }),
    );
  });

  it('postLote responde 201 con el conteo y 400 si falla', async () => {
    const postLote = jest.spyOn(service, 'postLote');
    postLote.mockResolvedValueOnce([
      crearHallazgoExterno(),
      crearHallazgoExterno(),
    ] as any);
    const ok = respuesta();
    await controller.postLote(ok, crearLoteHallazgos(2));
    expect(ok.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    expect(ok.json).toHaveBeenCalledWith(
      expect.objectContaining({ MetaData: { Count: 2 } }),
    );

    postLote.mockRejectedValueOnce(new Error('El lote supera el máximo'));
    const falla = respuesta();
    await controller.postLote(falla, crearLoteHallazgos(2));
    expect(falla.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('getAll responde 200 con el conteo y 404 si falla', async () => {
    jest
      .spyOn(service, 'getAll')
      .mockResolvedValueOnce([crearHallazgoExterno()] as any);
    jest.spyOn(service, 'count').mockResolvedValueOnce(1);
    const ok = respuesta();
    await controller.getAll(ok, {} as any);
    expect(ok.json).toHaveBeenCalledWith(
      expect.objectContaining({ MetaData: { Count: 1 } }),
    );

    jest.spyOn(service, 'getAll').mockRejectedValueOnce(new Error('filtro'));
    const falla = respuesta();
    await controller.getAll(falla, {} as any);
    expect(falla.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('getById, put y delete responden éxito y error', async () => {
    jest
      .spyOn(service, 'getById')
      .mockRejectedValueOnce(new Error('no existe'));
    const uno = respuesta();
    await controller.getById(uno, HALLAZGO_EXTERNO_ID);
    expect(uno.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);

    jest
      .spyOn(service, 'put')
      .mockResolvedValueOnce(crearHallazgoExterno() as any);
    const put = respuesta();
    await controller.put(put, HALLAZGO_EXTERNO_ID, crearHallazgoExternoDto());
    expect(put.status).toHaveBeenCalledWith(HttpStatus.OK);

    jest
      .spyOn(service, 'delete')
      .mockResolvedValueOnce(crearHallazgoExterno() as any);
    const borrar = respuesta();
    await controller.delete(borrar, HALLAZGO_EXTERNO_ID);
    expect(borrar.json).toHaveBeenCalledWith(
      expect.objectContaining({ Message: 'Eliminacion Exitosa' }),
    );
  });
});
