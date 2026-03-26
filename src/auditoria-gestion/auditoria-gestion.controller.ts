import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Post,
  Put,
  Param,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuditoriaGestionService } from './auditoria-gestion.service';
import { CreateAuditoriaGestionDto } from './dto/create-auditoria-gestion.dto';
import { AuditoriaPadreEstadoDto } from '../auditoria-padre-estado/dto/auditoria-padre-estado.dto';

@ApiTags('auditoria-gestion')
@Controller('auditoria-gestion')
export class AuditoriaGestionController {
  constructor(
    private readonly auditoriaGestionService: AuditoriaGestionService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Crear una nueva auditoria padre junto con su estado inicial',
  })
  @ApiBody({ type: CreateAuditoriaGestionDto })
  @ApiResponse({
    status: 201,
    description: 'La auditoria padre ha sido creada exitosamente.',
    type: CreateAuditoriaGestionDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(
    @Res() res,
    @Body() createAuditoriaGestionDto: CreateAuditoriaGestionDto,
  ) {
    try {
      const auditoria = await this.auditoriaGestionService.post(
        createAuditoriaGestionDto,
      );
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: auditoria,
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

  @Put('/:id')
  @ApiOperation({
    summary:
      'Actualizar los estados de las auditorias padre existentes en un plan',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del plan de auditorias a actualizar',
  })
  @ApiBody({ type: AuditoriaPadreEstadoDto })
  @ApiResponse({
    status: 200,
    description:
      'Los estados de las auditorias padre han sido actualizados exitosamente.',
    type: AuditoriaPadreEstadoDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({
    status: 404,
    description: 'Plan de Auditorias no encontrado.',
  })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body() auditoriaPadreEstado: AuditoriaPadreEstadoDto,
  ) {
    try {
      const auditoria = await this.auditoriaGestionService.put(
        id,
        auditoriaPadreEstado,
      );
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualización Exitosa',
        Data: auditoria,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error servicio Update: la solicitud contiene un tipo de dato incorrecto o un parametro invalido',
        Data: error.message,
      });
    }
  }

  @Delete('/:plan_id/auditoria-padre-borrador')
  @ApiOperation({
    summary:
      'Eliminar lógicamente auditorías padre en estado borrador de un plan',
  })
  @ApiParam({
    name: 'plan_id',
    type: String,
    description: 'ID del plan de auditorias',
  })
  @ApiResponse({
    status: 200,
    description:
      'Las auditorías padre en borrador han sido eliminadas exitosamente.',
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({
    status: 404,
    description: 'Plan de Auditorias no encontrado.',
  })
  async deleteMasivo(
    @Res() res,
    @Param('plan_id') planId: string,
  ) {
    try {
      const resultado =
        await this.auditoriaGestionService.deleteMasivo(planId);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminación Exitosa',
        Data: resultado,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error servicio Delete: la solicitud contiene un tipo de dato incorrecto o un parametro invalido',
        Data: error.message,
      });
    }
  }
}
