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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { FilterDto } from '../filters/filters.dto';
import { ParseObjectIdPipe } from '../pipes/parse-object-id/parse-object-id.pipe';
import { CalificacionAccionService } from './calificacion-accion.service';
import { CalificacionAccionDto } from './dto/calificacion-accion.dto';

@ApiTags('calificacion-accion')
@Controller('calificacion-accion')
export class CalificacionAccionController {
  constructor(private calificacionAccionService: CalificacionAccionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva calificación de acción de mejora' })
  @ApiBody({ type: CalificacionAccionDto })
  @ApiResponse({
    status: 201,
    description: 'Calificación creada exitosamente.',
    type: CalificacionAccionDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(
    @Res() res,
    @Body(new ParseObjectIdPipe(['accion_mejora_id']))
    dto: CalificacionAccionDto,
  ) {
    try {
      const calificacion = await this.calificacionAccionService.post(dto);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: calificacion,
      });
    } catch (error: any) {
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
  @ApiOperation({
    summary: 'Obtener todas las calificaciones de acción de mejora',
  })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todas las calificaciones.',
    type: [CalificacionAccionDto],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const calificaciones =
        await this.calificacionAccionService.getAll(filterDto);
      const counts = await this.calificacionAccionService.count(filterDto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: calificaciones,
        MetaData: { Count: counts },
      });
    } catch (error: any) {
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
  @ApiOperation({ summary: 'Obtener una calificación por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve la calificación.',
    type: CalificacionAccionDto,
  })
  @ApiResponse({ status: 404, description: 'Calificación no encontrada.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const calificacion = await this.calificacionAccionService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: calificacion,
      });
    } catch (error: any) {
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
  @ApiOperation({ summary: 'Actualizar una calificación de acción de mejora' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: CalificacionAccionDto })
  @ApiResponse({
    status: 200,
    description: 'Calificación actualizada exitosamente.',
    type: CalificacionAccionDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Calificación no encontrada.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body(new ParseObjectIdPipe(['accion_mejora_id']))
    dto: CalificacionAccionDto,
  ) {
    try {
      const calificacion = await this.calificacionAccionService.put(id, dto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: calificacion,
      });
    } catch (error: any) {
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
  @ApiOperation({ summary: 'Eliminar una calificación de acción de mejora' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Calificación eliminada exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Calificación no encontrada.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.calificacionAccionService.delete(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: { _id: id },
      });
    } catch (error: any) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en el servicio Delete: la peticion contiene parametros incorrectos',
        Data: error.message,
      });
    }
  }
}
