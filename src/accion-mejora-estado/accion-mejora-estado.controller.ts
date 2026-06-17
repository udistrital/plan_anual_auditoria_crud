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
import { AccionMejoraEstadoService } from './accion-mejora-estado.service';
import { AccionMejoraEstadoDto } from './dto/accion-mejora-estado.dto';

@ApiTags('accion-mejora-estado')
@Controller('accion-mejora-estado')
export class AccionMejoraEstadoController {
  constructor(private accionMejoraEstadoService: AccionMejoraEstadoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo estado de acción de mejora' })
  @ApiBody({ type: AccionMejoraEstadoDto })
  @ApiResponse({
    status: 201,
    description: 'Estado creado exitosamente.',
    type: AccionMejoraEstadoDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(
    @Res() res,
    @Body(new ParseObjectIdPipe(['accion_mejora_id']))
    dto: AccionMejoraEstadoDto,
  ) {
    try {
      const estado = await this.accionMejoraEstadoService.post(dto);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: estado,
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
  @ApiOperation({ summary: 'Obtener todos los estados de acción de mejora' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todos los estados.',
    type: [AccionMejoraEstadoDto],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const estados = await this.accionMejoraEstadoService.getAll(filterDto);
      const counts = await this.accionMejoraEstadoService.count(filterDto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: estados,
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
  @ApiOperation({ summary: 'Obtener un estado de acción de mejora por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el estado.',
    type: AccionMejoraEstadoDto,
  })
  @ApiResponse({ status: 404, description: 'Estado no encontrado.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const estado = await this.accionMejoraEstadoService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: estado,
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
  @ApiOperation({ summary: 'Actualizar un estado de acción de mejora' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: AccionMejoraEstadoDto })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente.',
    type: AccionMejoraEstadoDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Estado no encontrado.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body(new ParseObjectIdPipe(['accion_mejora_id']))
    dto: AccionMejoraEstadoDto,
  ) {
    try {
      const estado = await this.accionMejoraEstadoService.put(id, dto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: estado,
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
  @ApiOperation({ summary: 'Eliminar un estado de acción de mejora' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Estado eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Estado no encontrado.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.accionMejoraEstadoService.delete(id);
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
