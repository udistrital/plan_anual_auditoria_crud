import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { FilterDto } from '../filters/filters.dto';
import { ComentarioAccionService } from './comentario-accion.service';
import { ComentarioAccionController } from './comentario-accion.controller';
import {
  COMENTARIO_ID,
  crearComentario,
  crearComentarioDto,
} from '../../test/fixtures/comentario-accion';

describe('ComentarioAccionController', () => {
  let controller: ComentarioAccionController;
  let service: ComentarioAccionService;

  const respuesta = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComentarioAccionController],
      providers: [
        {
          provide: ComentarioAccionService,
          useValue: {
            post: jest.fn(),
            getAll: jest.fn(),
            getById: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(ComentarioAccionController);
    service = module.get(ComentarioAccionService);
  });

  afterEach(() => jest.clearAllMocks());

  it('Debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('post', () => {
    it('Debería responder 201 con el comentario creado', async () => {
      jest.spyOn(service, 'post').mockResolvedValue(crearComentario() as any);
      const res = respuesta();

      await controller.post(res, crearComentarioDto());

      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: crearComentario(),
      });
    });

    it('Debería responder 400 si la acción relacionada no existe', async () => {
      const error = new Error(
        'Acción de mejora relacionada con id 672d3050f7814a9a0c5261d4 no existe',
      );
      jest.spyOn(service, 'post').mockRejectedValue(error);
      const res = respuesta();

      await controller.post(res, crearComentarioDto());

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error servicio Post: la solicitud contiene un tipo de dato incorrecto o un parametro invalido',
        Data: error.message,
      });
    });
  });

  describe('getAll', () => {
    const filtro = {
      query: 'accion_mejora_id:672d3050f7814a9a0c5261d4,activo:true',
      sortby: 'fecha_creacion',
      order: 'desc',
      limit: '20',
      offset: '0',
    } as FilterDto;

    it('Debería responder 200 con los comentarios y MetaData.Count', async () => {
      jest
        .spyOn(service, 'getAll')
        .mockResolvedValue([crearComentario()] as any);
      jest.spyOn(service, 'count').mockResolvedValue(25);
      const res = respuesta();

      await controller.getAll(res, filtro);

      expect(service.getAll).toHaveBeenCalledWith(filtro);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: [crearComentario()],
        MetaData: { Count: 25 },
      });
    });

    it('Debería responder 200 con Data vacía si no hay comentarios', async () => {
      jest.spyOn(service, 'getAll').mockResolvedValue([]);
      jest.spyOn(service, 'count').mockResolvedValue(0);
      const res = respuesta();

      await controller.getAll(res, filtro);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ Data: [], MetaData: { Count: 0 } }),
      );
    });

    it('Debería responder 404 si la consulta falla', async () => {
      jest
        .spyOn(service, 'getAll')
        .mockRejectedValue(new Error('query inválida'));
      const res = respuesta();

      await controller.getAll(res, filtro);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ Success: false, Data: 'query inválida' }),
      );
    });
  });

  describe('getById', () => {
    it('Debería responder 200 con el comentario', async () => {
      jest
        .spyOn(service, 'getById')
        .mockResolvedValue(crearComentario() as any);
      const res = respuesta();

      await controller.getById(res, COMENTARIO_ID);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('Debería responder 404 si no existe', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(new Error(`${COMENTARIO_ID} no existe`));
      const res = respuesta();

      await controller.getById(res, COMENTARIO_ID);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });
  });

  describe('put', () => {
    it('Debería responder 200 con el comentario actualizado', async () => {
      jest.spyOn(service, 'put').mockResolvedValue(crearComentario() as any);
      const res = respuesta();

      await controller.put(res, COMENTARIO_ID, crearComentarioDto());

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ Message: 'Actualizacion Exitosa' }),
      );
    });

    it('Debería responder 400 si falla la actualización', async () => {
      jest
        .spyOn(service, 'put')
        .mockRejectedValue(new Error(`${COMENTARIO_ID} no existe`));
      const res = respuesta();

      await controller.put(res, COMENTARIO_ID, crearComentarioDto());

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('delete', () => {
    it('Debería responder 200 con el _id eliminado', async () => {
      jest
        .spyOn(service, 'delete')
        .mockResolvedValue(crearComentario({ activo: false }) as any);
      const res = respuesta();

      await controller.delete(res, COMENTARIO_ID);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: { _id: COMENTARIO_ID },
      });
    });

    it('Debería responder 404 si no existe', async () => {
      jest
        .spyOn(service, 'delete')
        .mockRejectedValue(new Error(`${COMENTARIO_ID} no existe`));
      const res = respuesta();

      await controller.delete(res, COMENTARIO_ID);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });
  });
});
