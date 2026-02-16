import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { FilterDto } from '../filters/filters.dto';
import { PlanAuditoriaDTO } from './dto/plan-auditoria.dto';
import { PlanAuditoriaService } from './plan-auditoria.service';
import { PlanAuditoriaController } from './plan-auditoria.controller';

const mockPlanAuditoriaDTO: PlanAuditoriaDTO = {
  objetivo: 'Evaluar la eficiencia de los procesos administrativos',
  alcance: 'Departamento de recursos humanos y finanzas',
  criterio: 'Normativa ISO 9001 y procedimientos internos',
  recurso: 'Equipo de 5 auditores, software de análisis',
  creado_por_id: 10,
  vigencia_id: 2024,
  aprobado_jefe_dependencia: true,
  jefe_dependencia_id: 5541,
  aprobado_secretario_tecnico: true,
  secretario_tecnico_id: 278,
  auditorias: ['67197dda3416d2a85e5d6d90', '67197dda3416d2a85e5d6d91'],
  activo: true,
  fecha_creacion: new Date('2024-01-15'),
  fecha_modificacion: new Date('2024-01-15'),
};

const mockPlanAuditoria = {
  ...mockPlanAuditoriaDTO,
  _id: '67197dda3416d2a85e5d6d8f',
};

describe('PlanAuditoriaController', () => {
  let controller: PlanAuditoriaController;
  let service: PlanAuditoriaService;

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanAuditoriaController],
      providers: [
        {
          provide: PlanAuditoriaService,
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

    controller = module.get<PlanAuditoriaController>(PlanAuditoriaController);
    service = module.get<PlanAuditoriaService>(PlanAuditoriaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('post', () => {
    it('Debería crear un plan de auditoría y retornar CREATED (201) con datos válidos', async () => {
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockResolvedValue(mockPlanAuditoria as any);
      const res = mockResponse();

      await controller.post(res, mockPlanAuditoriaDTO);

      expect(serviceSpy).toHaveBeenCalledWith(mockPlanAuditoriaDTO);
      expect(serviceSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: mockPlanAuditoria,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando la validación falla', async () => {
      const mockError = new Error(
        'PlanAuditoria validation failed: vigencia_id is required',
      );
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.post(res, mockPlanAuditoriaDTO);

      expect(serviceSpy).toHaveBeenCalledWith(mockPlanAuditoriaDTO);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error servicio Post: la solicitud contiene un tipo de dato incorrecto o un parametro invalido',
        Data: mockError.message,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando ya existe un plan activo para la vigencia', async () => {
      const mockError = new Error(
        `Ya existe un plan de auditoría activo para la vigencia ${mockPlanAuditoriaDTO.vigencia_id}`,
      );
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.post(res, mockPlanAuditoriaDTO);

      expect(serviceSpy).toHaveBeenCalledWith(mockPlanAuditoriaDTO);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error servicio Post: la solicitud contiene un tipo de dato incorrecto o un parametro invalido',
        Data: mockError.message,
      });
    });

    it('Debería manejar errores de base de datos', async () => {
      const mockError = new Error('Database connection failed');
      const serviceSpy = jest
        .spyOn(service, 'post')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.post(res, mockPlanAuditoriaDTO);

      expect(serviceSpy).toHaveBeenCalledWith(mockPlanAuditoriaDTO);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error servicio Post: la solicitud contiene un tipo de dato incorrecto o un parametro invalido',
        Data: mockError.message,
      });
    });
  });

  describe('getAll', () => {
    const mockFilterDto: FilterDto = {
      query: 'activo:true',
      fields: 'objetivo,vigencia_id',
      sortby: 'fecha_creacion',
      order: 'desc',
      limit: '10',
      offset: '0',
      populate: 'false',
    };

    const mockPlanAuditorias = [
      {
        ...mockPlanAuditoria,
        _id: '67197dda3416d2a85e5d6d8f',
        vigencia_id: 2024,
      },
      {
        ...mockPlanAuditoria,
        _id: '67197f9a3416d2a85e5d6d93',
        vigencia_id: 2023,
      },
    ];

    beforeEach(() => {
      jest.spyOn(service, 'count').mockResolvedValue(2);
    });

    it('Debería retornar OK (200) con todos los planes de auditoría y metadata', async () => {
      const getAllSpy = jest
        .spyOn(service, 'getAll')
        .mockResolvedValue(mockPlanAuditorias as any);
      const countSpy = jest.spyOn(service, 'count').mockResolvedValue(2);
      const res = mockResponse();

      await controller.getAll(res, mockFilterDto);

      expect(getAllSpy).toHaveBeenCalledWith(mockFilterDto);
      expect(getAllSpy).toHaveBeenCalledTimes(1);
      expect(countSpy).toHaveBeenCalledWith(mockFilterDto);
      expect(countSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockPlanAuditorias,
        MetaData: { Count: 2 },
      });
    });

    it('Debería retornar OK (200) con array vacío cuando no hay resultados', async () => {
      const getAllSpy = jest.spyOn(service, 'getAll').mockResolvedValue([]);
      const countSpy = jest.spyOn(service, 'count').mockResolvedValue(0);
      const res = mockResponse();

      await controller.getAll(res, mockFilterDto);

      expect(getAllSpy).toHaveBeenCalledWith(mockFilterDto);
      expect(countSpy).toHaveBeenCalledWith(mockFilterDto);
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
      const getAllSpy = jest
        .spyOn(service, 'getAll')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.getAll(res, mockFilterDto);

      expect(getAllSpy).toHaveBeenCalledWith(mockFilterDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en servicio GetAll: la peticion contiene un parametro incorrecto o no existe un registro',
        Data: mockError.message,
      });
    });

    it('Debería manejar errores de base de datos', async () => {
      const mockError = new Error('Database connection failed');
      const getAllSpy = jest
        .spyOn(service, 'getAll')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.getAll(res, mockFilterDto);

      expect(getAllSpy).toHaveBeenCalledWith(mockFilterDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en servicio GetAll: la peticion contiene un parametro incorrecto o no existe un registro',
        Data: mockError.message,
      });
    });
  });

  describe('getById', () => {
    it('Debería retornar OK (200) con el plan de auditoría cuando el ID es válido', async () => {
      const getByIdSpy = jest
        .spyOn(service, 'getById')
        .mockResolvedValue(mockPlanAuditoria as any);
      const res = mockResponse();

      await controller.getById(res, mockPlanAuditoria._id);

      expect(getByIdSpy).toHaveBeenCalledWith(mockPlanAuditoria._id);
      expect(getByIdSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: mockPlanAuditoria,
      });
    });

    it('Debería retornar NOT_FOUND (404) cuando el ID no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      const mockError = new Error(`${nonExistentId} no existe`);
      const getByIdSpy = jest
        .spyOn(service, 'getById')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.getById(res, nonExistentId);

      expect(getByIdSpy).toHaveBeenCalledWith(nonExistentId);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en servicio GetOne: la peticion contiene un parametro incorrecto o no existe un registro',
        Data: mockError.message,
      });
    });

    it('Debería manejar errores de formato de ID inválido', async () => {
      const invalidId = 'invalid-id-format';
      const mockError = new Error('Cast to ObjectId failed');
      const getByIdSpy = jest
        .spyOn(service, 'getById')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.getById(res, invalidId);

      expect(getByIdSpy).toHaveBeenCalledWith(invalidId);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en servicio GetOne: la peticion contiene un parametro incorrecto o no existe un registro',
        Data: mockError.message,
      });
    });
  });

  describe('put', () => {
    const updateDto: PlanAuditoriaDTO = {
      ...mockPlanAuditoriaDTO,
      objetivo: 'Objetivo actualizado',
      vigencia_id: 2025,
    };

    it('Debería actualizar y retornar OK (200) con datos válidos', async () => {
      const updatedPlanAuditoria = { ...mockPlanAuditoria, ...updateDto };
      const putSpy = jest
        .spyOn(service, 'put')
        .mockResolvedValue(updatedPlanAuditoria as any);
      const res = mockResponse();

      await controller.put(res, mockPlanAuditoria._id, updateDto);

      expect(putSpy).toHaveBeenCalledWith(mockPlanAuditoria._id, updateDto);
      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: updatedPlanAuditoria,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando los datos son inválidos', async () => {
      const mockError = new Error('Validation failed');
      const putSpy = jest.spyOn(service, 'put').mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.put(res, mockPlanAuditoria._id, updateDto);

      expect(putSpy).toHaveBeenCalledWith(mockPlanAuditoria._id, updateDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error en servicio Put: la peticion contiene un tipo de dato incorrecto o un parametro invalido',
        Data: mockError.message,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando el ID no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      const mockError = new Error(`${nonExistentId} no existe`);
      const putSpy = jest.spyOn(service, 'put').mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.put(res, nonExistentId, updateDto);

      expect(putSpy).toHaveBeenCalledWith(nonExistentId, updateDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error en servicio Put: la peticion contiene un tipo de dato incorrecto o un parametro invalido',
        Data: mockError.message,
      });
    });

    it('Debería retornar BAD_REQUEST (400) cuando ya existe un plan activo para la vigencia', async () => {
      const mockError = new Error(
        `Ya existe un plan de auditoría activo para la vigencia ${updateDto.vigencia_id}`,
      );
      const putSpy = jest.spyOn(service, 'put').mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.put(res, mockPlanAuditoria._id, updateDto);

      expect(putSpy).toHaveBeenCalledWith(mockPlanAuditoria._id, updateDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error en servicio Put: la peticion contiene un tipo de dato incorrecto o un parametro invalido',
        Data: mockError.message,
      });
    });
  });

  describe('delete', () => {
    it('Debería eliminar (desactivar) y retornar OK (200) con ID válido', async () => {
      const deleteSpy = jest
        .spyOn(service, 'delete')
        .mockResolvedValue(undefined);
      const res = mockResponse();

      await controller.delete(res, mockPlanAuditoria._id);

      expect(deleteSpy).toHaveBeenCalledWith(mockPlanAuditoria._id);
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: {
          _id: mockPlanAuditoria._id,
        },
      });
    });

    it('Debería retornar NOT_FOUND (404) cuando el ID no existe', async () => {
      const nonExistentId = '671aaf35d779a09e092cb999';
      const mockError = new Error(`${nonExistentId} no existe`);
      const deleteSpy = jest
        .spyOn(service, 'delete')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.delete(res, nonExistentId);

      expect(deleteSpy).toHaveBeenCalledWith(nonExistentId);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en el servicio Delete: la peticion contiene paratros incorrectos',
        Data: mockError.message,
      });
    });

    it('Debería manejar errores generales del servicio', async () => {
      const mockError = new Error('Database connection error');
      const deleteSpy = jest
        .spyOn(service, 'delete')
        .mockRejectedValue(mockError);
      const res = mockResponse();

      await controller.delete(res, mockPlanAuditoria._id);

      expect(deleteSpy).toHaveBeenCalledWith(mockPlanAuditoria._id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en el servicio Delete: la peticion contiene paratros incorrectos',
        Data: mockError.message,
      });
    });
  });
});
