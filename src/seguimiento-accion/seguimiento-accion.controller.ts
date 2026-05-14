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
import { SeguimientoAccionService } from './seguimiento-accion.service';
import { SeguimientoAccionDto } from './dto/seguimiento-accion.dto';

@ApiTags('seguimiento-accion')
@Controller('seguimiento-accion')
export class SeguimientoAccionController {
  constructor(private seguimientoAccionService: SeguimientoAccionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo seguimiento de acción de mejora' })
  @ApiBody({ type: SeguimientoAccionDto })
  @ApiResponse({ status: 201, description: 'Seguimiento creado exitosamente.', type: SeguimientoAccionDto })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(
    @Res() res,
    @Body(new ParseObjectIdPipe(['accion_mejora_id']))
    dto: SeguimientoAccionDto,
  ) {
    try {
      const seguimiento = await this.seguimientoAccionService.post(dto);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: seguimiento,
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
  @ApiOperation({ summary: 'Obtener todos los seguimientos de acción de mejora' })
  @ApiResponse({ status: 200, description: 'Devuelve todos los seguimientos.', type: [SeguimientoAccionDto] })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const seguimientos = await this.seguimientoAccionService.getAll(filterDto);
      const counts = await this.seguimientoAccionService.count(filterDto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: seguimientos,
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
  @ApiOperation({ summary: 'Obtener un seguimiento por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Devuelve el seguimiento.', type: SeguimientoAccionDto })
  @ApiResponse({ status: 404, description: 'Seguimiento no encontrado.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const seguimiento = await this.seguimientoAccionService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: seguimiento,
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
  @ApiOperation({ summary: 'Actualizar un seguimiento de acción de mejora' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: SeguimientoAccionDto })
  @ApiResponse({ status: 200, description: 'Seguimiento actualizado exitosamente.', type: SeguimientoAccionDto })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Seguimiento no encontrado.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body(new ParseObjectIdPipe(['accion_mejora_id']))
    dto: SeguimientoAccionDto,
  ) {
    try {
      const seguimiento = await this.seguimientoAccionService.put(id, dto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: seguimiento,
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
  @ApiOperation({ summary: 'Eliminar un seguimiento de acción de mejora' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Seguimiento eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Seguimiento no encontrado.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.seguimientoAccionService.delete(id);
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
