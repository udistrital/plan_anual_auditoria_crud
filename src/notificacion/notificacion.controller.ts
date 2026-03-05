import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { NotificacionService } from './notificacion.service';
import { NotificacionDTO } from './dto/notificacion.dto';
import { FilterDto } from '../filters/filters.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('notificacion')
@Controller('notificacion')
export class NotificacionController {
  constructor(
    private notificacionService: NotificacionService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo registro de notificación' })
  @ApiBody({ type: NotificacionDTO })
  @ApiResponse({
    status: 201,
    description: 'El registro de notificación ha sido creado exitosamente.',
    type: NotificacionDTO,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(
    @Res() res,
    @Body() notificacionDTO: NotificacionDTO,
  ) {
    try {
      const notificacion = await this.notificacionService.post(
        notificacionDTO,
      );
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: notificacion,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error servicio Post: la solicitud contiene un tipo de dato incorrecto o un parametro invalido',
        Data: error.message,
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los registros de notificación' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todos los registros de notificación.',
    type: [NotificacionDTO],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const notificaciones =
        await this.notificacionService.getAll(filterDto);
      const counts = await this.notificacionService.count(filterDto);

      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: notificaciones,
        MetaData: { Count: counts },
      });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en servicio GetAll: la peticion contiene un parametro incorrecto o no existe un registro',
        Data: error.message,
      });
    }
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Obtener un registro de notificación por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el registro de notificación.',
    type: NotificacionDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Registro de notificación no encontrado.',
  })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const notificacion = await this.notificacionService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: notificacion,
      });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en servicio GetOne: la peticion contiene un parametro incorrecto o no existe un registro',
        Data: error.message,
      });
    }
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Actualizar un registro de notificación' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: NotificacionDTO })
  @ApiResponse({
    status: 200,
    description:
      'El registro de notificación ha sido actualizado exitosamente.',
    type: NotificacionDTO,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({
    status: 404,
    description: 'Registro de notificación no encontrado.',
  })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body() notificacionDTO: NotificacionDTO,
  ) {
    try {
      const notificacion = await this.notificacionService.put(
        id,
        notificacionDTO,
      );
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: notificacion,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error en servicio Put: la peticion contiene un tipo de dato incorrecto o un parametro invalido',
        Data: error.message,
      });
    }
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Eliminar un registro de notificación' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'El registro de notificación ha sido eliminado exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Registro de notificación no encontrado.',
  })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.notificacionService.delete(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: {
          _id: id,
        },
      });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en el servicio Delete: la peticion contiene paratros incorrectos',
        Data: error.message,
      });
    }
  }
}