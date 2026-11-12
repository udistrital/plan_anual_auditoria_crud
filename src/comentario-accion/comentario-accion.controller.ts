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
import { ComentarioAccionService } from './comentario-accion.service';
import { ComentarioAccionDto } from './dto/comentario-accion.dto';

@ApiTags('comentario-accion')
@Controller('comentario-accion')
export class ComentarioAccionController {
  constructor(private comentarioAccionService: ComentarioAccionService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un comentario en el foro de una acción de mejora',
  })
  @ApiBody({ type: ComentarioAccionDto })
  @ApiResponse({
    status: 201,
    description: 'Comentario creado exitosamente.',
    type: ComentarioAccionDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(
    @Res() res,
    @Body(new ParseObjectIdPipe(['accion_mejora_id']))
    dto: ComentarioAccionDto,
  ) {
    try {
      const comentario = await this.comentarioAccionService.post(dto);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: comentario,
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
  @ApiOperation({ summary: 'Obtener los comentarios de acciones de mejora' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve los comentarios.',
    type: [ComentarioAccionDto],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const comentarios = await this.comentarioAccionService.getAll(filterDto);
      const counts = await this.comentarioAccionService.count(filterDto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: comentarios,
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
  @ApiOperation({ summary: 'Obtener un comentario por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el comentario.',
    type: ComentarioAccionDto,
  })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const comentario = await this.comentarioAccionService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: comentario,
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
  @ApiOperation({ summary: 'Actualizar un comentario de acción de mejora' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: ComentarioAccionDto })
  @ApiResponse({
    status: 200,
    description: 'Comentario actualizado exitosamente.',
    type: ComentarioAccionDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body(new ParseObjectIdPipe(['accion_mejora_id']))
    dto: ComentarioAccionDto,
  ) {
    try {
      const comentario = await this.comentarioAccionService.put(id, dto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: comentario,
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
  @ApiOperation({
    summary: 'Eliminar (borrado lógico) un comentario de acción de mejora',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Comentario eliminado exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.comentarioAccionService.delete(id);
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
