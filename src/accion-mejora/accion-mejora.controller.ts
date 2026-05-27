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
import { AccionMejoraService } from './accion-mejora.service';
import { AccionMejoraDto } from './dto/accion-mejora.dto';

@ApiTags('accion-mejora')
@Controller('accion-mejora')
export class AccionMejoraController {
  constructor(private accionMejoraService: AccionMejoraService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva acción de mejora' })
  @ApiBody({ type: AccionMejoraDto })
  @ApiResponse({
    status: 201,
    description: 'Acción de mejora creada exitosamente.',
    type: AccionMejoraDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(
    @Res() res,
    @Body(new ParseObjectIdPipe(['plan_mejoramiento_id', 'hallazgo_id']))
    dto: AccionMejoraDto,
  ) {
    try {
      const accion = await this.accionMejoraService.post(dto);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: accion,
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
  @ApiOperation({ summary: 'Obtener todas las acciones de mejora' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todas las acciones de mejora.',
    type: [AccionMejoraDto],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const acciones = await this.accionMejoraService.getAll(filterDto);
      const counts = await this.accionMejoraService.count(filterDto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: acciones,
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
  @ApiOperation({ summary: 'Obtener una acción de mejora por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve la acción de mejora.',
    type: AccionMejoraDto,
  })
  @ApiResponse({ status: 404, description: 'Acción de mejora no encontrada.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const accion = await this.accionMejoraService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: accion,
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
  @ApiOperation({ summary: 'Actualizar una acción de mejora' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: AccionMejoraDto })
  @ApiResponse({
    status: 200,
    description: 'Acción de mejora actualizada exitosamente.',
    type: AccionMejoraDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Acción de mejora no encontrada.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body(new ParseObjectIdPipe(['plan_mejoramiento_id', 'hallazgo_id']))
    dto: AccionMejoraDto,
  ) {
    try {
      const accion = await this.accionMejoraService.put(id, dto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: accion,
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
  @ApiOperation({ summary: 'Eliminar una acción de mejora' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Acción de mejora eliminada exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Acción de mejora no encontrada.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.accionMejoraService.delete(id);
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
