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
import { FilterDto } from '../filters/filters.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { EstadoAuditoriaPadreService } from './auditoria-padre-estado.service';
import { AuditoriaPadreEstadoDto } from './dto/auditoria-padre-estado.dto';
import { ParseObjectIdPipe } from '../pipes/parse-object-id/parse-object-id.pipe';

@ApiTags('auditoria-padre-estado')
@Controller('auditoria-padre-estado')
export class EstadoAuditoriaPadreController {
  constructor(private estadoAuditoriaPadreService: EstadoAuditoriaPadreService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo estado de auditoria padre' })
  @ApiBody({ type: AuditoriaPadreEstadoDto })
  @ApiResponse({
    status: 201,
    description: 'El estado de auditoria padre ha sido creado exitosamente.',
    type: AuditoriaPadreEstadoDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(
    @Res() res,
    @Body(new ParseObjectIdPipe(['auditoria_padre_id']))
    auditoriaPadreEstadoDto: AuditoriaPadreEstadoDto,
  ) {
    try {
      const estado =
        await this.estadoAuditoriaPadreService.post(auditoriaPadreEstadoDto);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: estado,
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
  @ApiOperation({ summary: 'Obtener todos los estados de auditoria padre' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todos los estados de auditoria padre.',
    type: [AuditoriaPadreEstadoDto],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const estados =
        await this.estadoAuditoriaPadreService.getAll(filterDto);
      const counts = await this.estadoAuditoriaPadreService.count(filterDto);

      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: estados,
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
  @ApiOperation({ summary: 'Obtener un estado de auditoria padre por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el estado de auditoria padre.',
    type: AuditoriaPadreEstadoDto,
  })
  @ApiResponse({ status: 404, description: 'Estado no encontrado.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const estado = await this.estadoAuditoriaPadreService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: estado,
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
  @ApiOperation({ summary: 'Actualizar un estado de auditoria padre' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: AuditoriaPadreEstadoDto })
  @ApiResponse({
    status: 200,
    description: 'El estado de auditoria padre ha sido actualizado exitosamente.',
    type: AuditoriaPadreEstadoDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Estado no encontrado.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body() auditoriaPadreEstadoDto: AuditoriaPadreEstadoDto,
  ) {
    try {
      const estado = await this.estadoAuditoriaPadreService.put(
        id,
        auditoriaPadreEstadoDto,
      );
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: estado,
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
  @ApiOperation({ summary: 'Eliminar un estado de auditoria padre' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'El estado de auditoria padre ha sido eliminado exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Estado no encontrado.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.estadoAuditoriaPadreService.delete(id);
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
          'Error en el servicio Delete: la peticion contiene parametros incorrectos',
        Data: error.message,
      });
    }
  }
}
