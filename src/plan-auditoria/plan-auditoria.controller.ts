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
import { PlanAuditoriaService } from './plan-auditoria.service';
import { PlanAuditoriaDTO } from './dto/plan-auditoria.dto';
import { FilterDto } from '../filters/filters.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { GenerarAuditoriaDto } from '../auditoria-padre/dto/generar-auditoria.dto';

@ApiTags('plan-auditoria')
@Controller('plan-auditoria')
export class PlanAuditoriaController {
  constructor(private planAuditoriaService: PlanAuditoriaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo plan de auditoria' })
  @ApiBody({ type: PlanAuditoriaDTO })
  @ApiResponse({
    status: 201,
    description: 'El plan de auditoria ha sido creado exitosamente.',
    type: PlanAuditoriaDTO,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(@Res() res, @Body() PlanAuditoriaDTO: PlanAuditoriaDTO) {
    try {
      const planAuditoria =
        await this.planAuditoriaService.post(PlanAuditoriaDTO);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: planAuditoria,
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
  @ApiOperation({ summary: 'Obtener todos los planes de auditoria' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todos los planes de auditoria.',
    type: [PlanAuditoriaDTO],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const planAuditorias = await this.planAuditoriaService.getAll(filterDto);
      const counts = await this.planAuditoriaService.count(filterDto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: planAuditorias,
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
  @ApiOperation({ summary: 'Obtener un plan de auditoria por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el plan de auditoria.',
    type: PlanAuditoriaDTO,
  })
  @ApiResponse({ status: 404, description: 'Plan de auditoria no encontrado.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const planAuditorias = await this.planAuditoriaService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: planAuditorias,
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
  @ApiOperation({ summary: 'Actualizar un plan de auditoria' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: PlanAuditoriaDTO })
  @ApiResponse({
    status: 200,
    description: 'El plan de auditoria ha sido actualizado exitosamente.',
    type: PlanAuditoriaDTO,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Plan de auditoria no encontrado.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body() PlanAuditoriaDTO: PlanAuditoriaDTO,
  ) {
    try {
      const planAuditorias = await this.planAuditoriaService.put(
        id,
        PlanAuditoriaDTO,
      );
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: planAuditorias,
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
  @ApiOperation({ summary: 'Eliminar un plan de auditoria' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'El plan de auditoria ha sido eliminado exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Plan de auditoria no encontrado.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.planAuditoriaService.delete(id);
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

  @Post('/:id/generar-auditorias')
  @ApiOperation({
    summary:
      'Generar auditorías hija a partir de auditorías padre registradas en el plan.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: GenerarAuditoriaDto })
  @ApiResponse({
    status: 201,
    description: 'Las auditorías hija han sido generadas exitosamente.',
    type: [GenerarAuditoriaDto],
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Plan de auditoria no encontrado.' })
  async generarAuditorias(
    @Res() res,
    @Param('id') id: string,
    @Body() generarAuditoriaDto: GenerarAuditoriaDto,
  ) {
    try {
      const auditoriasGeneradas =
        await this.planAuditoriaService.generarAuditorias(
          id,
          generarAuditoriaDto,
        );
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Auditorías generadas exitosamente',
        Data: auditoriasGeneradas,
      });
    } catch (error) {
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
}
