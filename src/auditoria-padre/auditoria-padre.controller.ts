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
import { AuditoriaPadreService } from './auditoria-padre.service';
import { AuditoriaPadreDTO } from './dto/auditoria-padre.dto';
import { FilterDto } from '../filters/filters.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../pipes/parse-object-id/parse-object-id.pipe';
import { GenerarAuditoriaDto } from './dto/generar-auditoria.dto';

@ApiTags('auditoria-padre')
@Controller('auditoria-padre')
export class AuditoriaPadreController {
  constructor(private AuditoriaPadreService: AuditoriaPadreService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva auditoria padre' })
  @ApiBody({ type: AuditoriaPadreDTO })
  @ApiResponse({
    status: 201,
    description: 'La auditoria padre ha sido creada exitosamente.',
    type: AuditoriaPadreDTO,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(
    @Res() res,
    @Body(new ParseObjectIdPipe(['plan_auditoria_id']))
    auditoriaPadreDTO: AuditoriaPadreDTO,
  ) {
    try {
      const auditoriaPadre =
        await this.AuditoriaPadreService.post(auditoriaPadreDTO);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: auditoriaPadre,
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
  @ApiOperation({ summary: 'Obtener todas las auditorias padre' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todas las auditorias padre.',
    type: [AuditoriaPadreDTO],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const auditoriasPadre =
        await this.AuditoriaPadreService.getAll(filterDto);
      const counts = await this.AuditoriaPadreService.count(filterDto);

      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: auditoriasPadre,
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
  @ApiOperation({ summary: 'Obtener una auditoria padre por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve la auditoria padre.',
    type: AuditoriaPadreDTO,
  })
  @ApiResponse({ status: 404, description: 'Auditoria padre no encontrada.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const auditoriaPadre = await this.AuditoriaPadreService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: auditoriaPadre,
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
  @ApiOperation({ summary: 'Actualizar una auditoria padre' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: AuditoriaPadreDTO })
  @ApiResponse({
    status: 200,
    description: 'La auditoria padre ha sido actualizada exitosamente.',
    type: AuditoriaPadreDTO,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Auditoria padre no encontrada.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body(new ParseObjectIdPipe(['plan_auditoria_id']))
    auditoriaPadreDTO: AuditoriaPadreDTO,
  ) {
    try {
      const auditoriaPadre = await this.AuditoriaPadreService.put(
        id,
        auditoriaPadreDTO,
      );
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: auditoriaPadre,
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
  @ApiOperation({ summary: 'Eliminar una auditoria padre' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'La auditoria padre ha sido eliminada exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Auditoria padre no encontrada.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.AuditoriaPadreService.delete(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: {
          _id: id,
        },
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

  @Post('/:id/generar-auditorias')
  @ApiOperation({
    summary:
      'Generar auditorías hija hasta completar la cantidad_auditoria especificada.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: GenerarAuditoriaDto })
  @ApiResponse({
    status: 201,
    description: 'Las auditorías hija han sido generadas exitosamente.',
    type: [GenerarAuditoriaDto],
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Auditoría padre no encontrada.' })
  async generarAuditorias(
    @Res() res,
    @Param('id') id: string,
    @Body(new ParseObjectIdPipe(['auditoria_id']))
    generarAuditoriaDto: GenerarAuditoriaDto,
  ) {
    console.log('generarAuditoriasDto:', generarAuditoriaDto);
    try {
      const auditoriasGeneradas =
        await this.AuditoriaPadreService.generarAuditorias(
          id,
          generarAuditoriaDto,
        );
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Auditorías generadas exitosamente',
        Data: auditoriasGeneradas,
      });
    } catch (error: any) {
      let status = HttpStatus.BAD_REQUEST;
      let message =
        'Error en servicio generarAuditorias: la solicitud contiene un tipo de dato incorrecto o un parámetro invalido';

      if (error.message.includes('no existe')) {
        status = HttpStatus.NOT_FOUND;
        message =
          'Error en servicio generarAuditorias: el plan de auditoria no existe';
      } else {
        console.error('Error en servicio generarAuditorias:', error);
      }

      res.status(status).json({
        Success: false,
        Status: status,
        Message: message,
        Data: error.message,
      });
    }
  }

  @Post('/:id/generar-auditoria')
  @ApiOperation({
    summary:
      'Generar una auditoría hija si el número de auditorías hijas existentes es menor que la cantidad_auditoria especificada en la auditoría padre.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: GenerarAuditoriaDto })
  @ApiResponse({
    status: 201,
    description: 'Las auditoría hija ha sido generada exitosamente.',
    type: [GenerarAuditoriaDto],
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Auditoría padre no encontrada.' })
  async generarUnaAuditorias(
    @Res() res,
    @Param('id') id: string,
    @Body(new ParseObjectIdPipe(['auditoria_id']))
    generarAuditoriaDto: GenerarAuditoriaDto,
  ) {
    try {
      const auditoriaGenerada =
        await this.AuditoriaPadreService.generarUnaAuditoria(
          id,
          generarAuditoriaDto,
        );
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Auditoría generada exitosamente',
        Data: auditoriaGenerada,
      });
    } catch (error: any) {
      let status = HttpStatus.BAD_REQUEST;
      let message =
        'Error en servicio generarUnaAuditoria: la solicitud contiene un tipo de dato incorrecto o un parámetro invalido';

      if (error.message.includes('no existe')) {
        status = HttpStatus.NOT_FOUND;
        message =
          'Error en servicio generarUnaAuditoria: el plan de auditoria no existe';
      } else {
        console.error('Error en servicio generarUnaAuditoria:', error);
      }

      res.status(status).json({
        Success: false,
        Status: status,
        Message: message,
        Data: error.message,
      });
    }
  }
}
