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
import { EjecutorPlanService } from './ejecutor-plan.service';
import { EjecutorPlanDto } from './dto/ejecutor-plan.dto';

@ApiTags('ejecutor-plan')
@Controller('ejecutor-plan')
export class EjecutorPlanController {
  constructor(private ejecutorPlanService: EjecutorPlanService) {}

  @Post()
  @ApiOperation({
    summary: 'Asignar un plan de mejoramiento a un ejecutor de la dependencia',
  })
  @ApiBody({ type: EjecutorPlanDto })
  @ApiResponse({
    status: 201,
    description: 'Plan asignado exitosamente.',
    type: EjecutorPlanDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(
    @Res() res,
    @Body(
      new ParseObjectIdPipe([
        'ejecutor_dependencia_id',
        'plan_mejoramiento_id',
      ]),
    )
    dto: EjecutorPlanDto,
  ) {
    try {
      const ejecutorPlan = await this.ejecutorPlanService.post(dto);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: ejecutorPlan,
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
  @ApiOperation({ summary: 'Obtener todas las asignaciones ejecutor-plan' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todas las asignaciones.',
    type: [EjecutorPlanDto],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const data = await this.ejecutorPlanService.getAll(filterDto);
      const counts = await this.ejecutorPlanService.count(filterDto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: data,
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
  @ApiOperation({ summary: 'Obtener una asignación ejecutor-plan por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve la asignación.',
    type: EjecutorPlanDto,
  })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const data = await this.ejecutorPlanService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: data,
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
  @ApiOperation({ summary: 'Actualizar una asignación ejecutor-plan' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: EjecutorPlanDto })
  @ApiResponse({
    status: 200,
    description: 'Asignación actualizada exitosamente.',
    type: EjecutorPlanDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body(
      new ParseObjectIdPipe([
        'ejecutor_dependencia_id',
        'plan_mejoramiento_id',
      ]),
    )
    dto: EjecutorPlanDto,
  ) {
    try {
      const data = await this.ejecutorPlanService.put(id, dto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: data,
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
    summary: 'Eliminar (lógico) una asignación ejecutor-plan',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Asignación eliminada exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.ejecutorPlanService.delete(id);
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
