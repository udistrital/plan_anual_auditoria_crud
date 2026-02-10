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
import { EstadoAuditoriaService } from './auditoria-estado.service';
import { AuditoriaEstadoDto } from './dto/auditoria-estado.dto';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id/parse-object-id.pipe';

@ApiTags('auditoria-estado')
@Controller('auditoria-estado')
export class EstadoAuditoriaController {
  constructor(private estadoAuditoriaService: EstadoAuditoriaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo estado de auditoria' })
  @ApiBody({ type: AuditoriaEstadoDto })
  @ApiResponse({
    status: 201,
    description: 'El estado de auditoria ha sido creado exitosamente.',
    type: AuditoriaEstadoDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(@Res() res, @Body(new ParseObjectIdPipe(['auditoria_id'])) auditoriaEstadoDto: AuditoriaEstadoDto) {
    try {
      const estadoPlan =
        await this.estadoAuditoriaService.post(auditoriaEstadoDto);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: estadoPlan,
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
  @ApiOperation({ summary: 'Obtener todos los estados de auditoria' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todos los estados de auditoria.',
    type: [AuditoriaEstadoDto],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const estadoAuditoria =
        await this.estadoAuditoriaService.getAll(filterDto);
      const counts = await this.estadoAuditoriaService.count(filterDto);

      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: estadoAuditoria,
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
  @ApiOperation({ summary: 'Obtener un estado de auditoria por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el estado de auditoria.',
    type: AuditoriaEstadoDto,
  })
  @ApiResponse({ status: 404, description: 'Estado no encontrado.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const estadoPlan = await this.estadoAuditoriaService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: estadoPlan,
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
  @ApiOperation({ summary: 'Actualizar un estado de auditoria' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: AuditoriaEstadoDto })
  @ApiResponse({
    status: 200,
    description: 'El estado de auditoria ha sido actualizada exitosamente.',
    type: AuditoriaEstadoDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrado.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body() AuditoriaEstadoDto: AuditoriaEstadoDto,
  ) {
    try {
      const estadoPlan = await this.estadoAuditoriaService.put(
        id,
        AuditoriaEstadoDto,
      );
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: estadoPlan,
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
  @ApiOperation({ summary: 'Eliminar un estado de auditoria' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'El estado de auditoria ha sido eliminada exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Estado no encontrada.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.estadoAuditoriaService.delete(id);
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
