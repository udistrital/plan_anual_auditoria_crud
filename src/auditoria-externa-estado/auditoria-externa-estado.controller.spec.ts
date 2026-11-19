import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { AuditoriaExternaEstadoController } from './auditoria-externa-estado.controller';
import { AuditoriaExternaEstadoService } from './auditoria-externa-estado.service';
import {
  ESTADO_EXTERNA_ID,
  crearEstadoExterna,
  crearEstadoExternaDto,
} from '../../test/fixtures/auditoria-externa-estado';

function respuesta() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('AuditoriaExternaEstadoController', () => {
  let controller: AuditoriaExternaEstadoController;
  let service: AuditoriaExternaEstadoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditoriaExternaEstadoController],
      providers: [
        {
          provide: AuditoriaExternaEstadoService,
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

    controller = module.get(AuditoriaExternaEstadoController);
    service = module.get(AuditoriaExternaEstadoService);
  });

  afterEach(() => jest.clearAllMocks());

  it('post responde 201 y 400 si la auditoría no existe', async () => {
    const post = jest.spyOn(service, 'post');
    post.mockResolvedValueOnce(crearEstadoExterna() as any);
    const ok = respuesta();
    await controller.post(ok, crearEstadoExternaDto());
    expect(ok.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    expect(ok.json).toHaveBeenCalledWith(
      expect.objectContaining({ Message: 'Registro Exitoso' }),
    );

    post.mockRejectedValueOnce(new Error('no existe'));
    const falla = respuesta();
    await controller.post(falla, crearEstadoExternaDto());
    expect(falla.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('getAll responde 200 con el conteo y 404 si falla', async () => {
    jest
      .spyOn(service, 'getAll')
      .mockResolvedValueOnce([crearEstadoExterna()] as any);
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
      .mockResolvedValueOnce(crearEstadoExterna() as any);
    const uno = respuesta();
    await controller.getById(uno, ESTADO_EXTERNA_ID);
    expect(uno.status).toHaveBeenCalledWith(HttpStatus.OK);

    jest.spyOn(service, 'put').mockRejectedValueOnce(new Error('no existe'));
    const put = respuesta();
    await controller.put(put, ESTADO_EXTERNA_ID, crearEstadoExternaDto());
    expect(put.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);

    jest
      .spyOn(service, 'delete')
      .mockResolvedValueOnce(crearEstadoExterna() as any);
    const borrar = respuesta();
    await controller.delete(borrar, ESTADO_EXTERNA_ID);
    expect(borrar.json).toHaveBeenCalledWith(
      expect.objectContaining({ Message: 'Eliminacion Exitosa' }),
    );
  });
});
