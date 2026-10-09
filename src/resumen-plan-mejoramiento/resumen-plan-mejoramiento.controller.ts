import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResumenPlanMejoramientoService } from './resumen-plan-mejoramiento.service';
import { ResumenPlanMejoramientoQueryDto } from './dto/resumen-plan-mejoramiento.dto';

@ApiTags('resumen-plan-mejoramiento')
@Controller('resumen-plan-mejoramiento')
export class ResumenPlanMejoramientoController {
  constructor(
    private readonly resumenPlanMejoramientoService: ResumenPlanMejoramientoService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Cuenta las auditorías agrupadas por el estado de su plan de mejoramiento, filtrando opcionalmente por dependencias o por auditor',
  })
  @ApiResponse({
    status: 200,
    description: 'Devuelve los conteos por estado del plan.',
  })
  @ApiResponse({ status: 404, description: 'Parámetros incorrectos.' })
  async getResumen(
    @Res() res,
    @Query() query: ResumenPlanMejoramientoQueryDto,
  ) {
    try {
      const resumen = await this.resumenPlanMejoramientoService.getResumen({
        vigencia_id: Number(query.vigencia_id),
        tipo_evaluacion_id: Number(query.tipo_evaluacion_id),
        estado_auditoria_id: Number(query.estado_auditoria_id),
        // Ausente: sin filtro de dependencias; presente y vacío: ninguna auditoría
        dependencia_ids:
          query.dependencia_ids === undefined
            ? undefined
            : String(query.dependencia_ids)
                .split('|')
                .filter(Boolean)
                .map(Number),
        auditor_id: query.auditor_id ? Number(query.auditor_id) : undefined,
      });
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: resumen,
      });
    } catch (error: any) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en servicio GetResumen: la peticion contiene un parametro incorrecto',
        Data: error.message,
      });
    }
  }
}
