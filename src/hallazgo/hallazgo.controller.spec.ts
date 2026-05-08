import { Test, TestingModule } from '@nestjs/testing';
import { HallazgoService } from './hallazgo.service';
import { HttpStatus } from '@nestjs/common';
import { FilterDto } from '../filters/filters.dto';
import { CreateHallazgoDTO, UpdateHallazgoDTO } from './dto/hallazgo.dto';

jest.mock('../pipes/parse-object-id/parse-object-id.pipe.ts');

import { HallazgoController } from './hallazgo.controller';

const mockCreateHallazgoDto: CreateHallazgoDTO = {
  auditoria_id: '507f1f77bcf86cd799439010',
  informe_id: '507f1f77bcf86cd799439011',
  subtema_id: '507f1f77bcf86cd799439013',
  titulo: 'Falta de documentación',
  criterio: 'Norma ISO 9001',
  descripcion: 'No se encontró evidencia de los registros requeridos',
  rechazado: false,
  activo: true,
};

const mockHallazgo = {
  ...mockCreateHallazgoDto,
  _id: '507f1f77bcf86cd799439012',
};

describe('HallazgoController', () => {
  let controller: HallazgoController;
  let service: HallazgoService;

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HallazgoController],
      providers: [
        {
          provide: HallazgoService,
          useValue: {
            agregarHallazgo: jest.fn(),
            getAllHallazgos: jest.fn(),
            countHallazgos: jest.fn(),
            getHallazgoById: jest.fn(),
            updateHallazgo: jest.fn(),
            deleteHallazgo: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HallazgoController>(HallazgoController);
    service = module.get<HallazgoService>(HallazgoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('Debería crear un hallazgo y retornar CREATED (201)', async () => {
      const spy = jest
        .spyOn(service, 'agregarHallazgo')
        .mockResolvedValue(mockHallazgo as any);
      const res = mockResponse();

      await controller.create(res, mockCreateHallazgoDto);

      expect(spy).toHaveBeenCalledWith(mockCreateHallazgoDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Hallazgo creado exitosamente',
        Data: mockHallazgo,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando el servicio lanza un error', async () => {
      const mockError = new Error('Subtema 507f1f77bcf86cd799439013 no existe');
      jest.spyOn(service, 'agregarHallazgo').mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.create(res, mockCreateHallazgoDto);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message: 'Error al crear hallazgo',
        Data: mockError.message,
      });
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'activo:true',
      fields: '',
      sortby: '',
      order: '',
      limit: '10',
      offset: '0',
      populate: '',
    };

    const mockHallazgos = [
      mockHallazgo,
      { ...mockHallazgo, _id: '507f1f77bcf86cd799439099' },
    ];

    it('Debería retornar OK (200) con todos los hallazgos y metadata', async () => {
      jest
        .spyOn(service, 'getAllHallazgos')
        .mockResolvedValue(mockHallazgos as any);
      jest.spyOn(service, 'countHallazgos').mockResolvedValue(2);
      const res = mockResponse();

      await controller.getAll(res, mockFilterDto);

      expect(service.getAllHallazgos).toHaveBeenCalledWith(mockFilterDto);
      expect(service.countHallazgos).toHaveBeenCalledWith(mockFilterDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockHallazgos,
        MetaData: { Count: 2 },
      });
    });

    it('Debería retornar OK (200) con array vacío cuando no hay resultados', async () => {
      jest.spyOn(service, 'getAllHallazgos').mockResolvedValue([]);
      jest.spyOn(service, 'countHallazgos').mockResolvedValue(0);
      const res = mockResponse();

      await controller.getAll(res, mockFilterDto);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: [],
        MetaData: { Count: 0 },
      });
    });

    it('Debería retornar NOT_FOUND (404) cuando el servicio lanza un error', async () => {
      const mockError = new Error('Error en el filtro de búsqueda');
      jest.spyOn(service, 'getAllHallazgos').mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.getAll(res, mockFilterDto);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Error al obtener hallazgos',
        Data: mockError.message,
      });
    });
  });

  describe('getById', () => {
    it('Debería retornar OK (200) con el hallazgo cuando el ID es válido', async () => {
      jest
        .spyOn(service, 'getHallazgoById')
        .mockResolvedValue(mockHallazgo as any);
      const res = mockResponse();

      await controller.getById(res, mockHallazgo._id);

      expect(service.getHallazgoById).toHaveBeenCalledWith(mockHallazgo._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockHallazgo,
      });
    });

    it('Debería retornar NOT_FOUND (404) cuando el ID no existe', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';
      const mockError = new Error(`Hallazgo ${nonExistentId} no existe`);
      jest.spyOn(service, 'getHallazgoById').mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.getById(res, nonExistentId);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Hallazgo no encontrado',
        Data: mockError.message,
      });
    });
  });

  describe('update', () => {
    const updateDto: UpdateHallazgoDTO = {
      titulo: 'Falta de documentación actualizada',
      criterio: 'Norma ISO 9001 v2',
      descripcion: 'Descripción actualizada',
    };

    it('Debería actualizar y retornar OK (200)', async () => {
      const updatedHallazgo = { ...mockHallazgo, ...updateDto };
      jest
        .spyOn(service, 'updateHallazgo')
        .mockResolvedValue(updatedHallazgo as any);
      const res = mockResponse();

      await controller.update(res, mockHallazgo._id, updateDto);

      expect(service.updateHallazgo).toHaveBeenCalledWith(
        mockHallazgo._id,
        updateDto,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Hallazgo actualizado exitosamente',
        Data: updatedHallazgo,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando el hallazgo no existe', async () => {
      const mockError = new Error(`Hallazgo ${mockHallazgo._id} no existe`);
      jest.spyOn(service, 'updateHallazgo').mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.update(res, mockHallazgo._id, updateDto);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message: 'Error al actualizar hallazgo',
        Data: mockError.message,
      });
    });
  });

  describe('delete', () => {
    it('Debería marcar como inactivo y retornar OK (200)', async () => {
      const deletedHallazgo = { ...mockHallazgo, activo: false };
      jest
        .spyOn(service, 'deleteHallazgo')
        .mockResolvedValue(deletedHallazgo as any);
      const res = mockResponse();

      await controller.delete(res, mockHallazgo._id);

      expect(service.deleteHallazgo).toHaveBeenCalledWith(mockHallazgo._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Hallazgo eliminado exitosamente',
        Data: deletedHallazgo,
      });
    });

    it('Debería retornar NOT_FOUND (404) cuando el hallazgo no existe', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';
      const mockError = new Error(`Hallazgo ${nonExistentId} no existe`);
      jest.spyOn(service, 'deleteHallazgo').mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.delete(res, nonExistentId);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Error al eliminar hallazgo',
        Data: mockError.message,
      });
    });
  });
});
