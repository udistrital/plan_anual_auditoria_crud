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
import { AuditoriaExternaEstadoService } from './auditoria-externa-estado.service';
import { AuditoriaExternaEstadoDto } from './dto/auditoria-externa-estado.dto';

@ApiTags('auditoria-externa-estado')
@Controller('auditoria-externa-estado')
export class AuditoriaExternaEstadoController {
  constructor(private estadoService: AuditoriaExternaEstadoService) {}

  @Post()
  @ApiOperation({
    summary:
      'Registrar un estado de una auditoría externa (queda como vigente)',
  })
  @ApiBody({ type: AuditoriaExternaEstadoDto })
  @ApiResponse({
    status: 201,
    description: 'Estado registrado exitosamente.',
    type: AuditoriaExternaEstadoDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(
    @Res() res,
    @Body(new ParseObjectIdPipe(['auditoria_externa_id']))
    dto: AuditoriaExternaEstadoDto,
  ) {
    try {
      const estado = await this.estadoService.post(dto);
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
  @ApiOperation({ summary: 'Obtener los estados de auditorías externas' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve los estados.',
    type: [AuditoriaExternaEstadoDto],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const estados = await this.estadoService.getAll(filterDto);
      const counts = await this.estadoService.count(filterDto);
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
  @ApiOperation({ summary: 'Obtener un estado de auditoría externa por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el estado.',
    type: AuditoriaExternaEstadoDto,
  })
  @ApiResponse({ status: 404, description: 'Estado no encontrado.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const estado = await this.estadoService.getById(id);
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
  @ApiOperation({ summary: 'Actualizar un estado de auditoría externa' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: AuditoriaExternaEstadoDto })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente.',
    type: AuditoriaExternaEstadoDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body(new ParseObjectIdPipe(['auditoria_externa_id']))
    dto: AuditoriaExternaEstadoDto,
  ) {
    try {
      const estado = await this.estadoService.put(id, dto);
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
  @ApiOperation({
    summary: 'Eliminar (borrado lógico) un estado de auditoría externa',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Estado eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Estado no encontrado.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      const estado = await this.estadoService.delete(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: estado,
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
