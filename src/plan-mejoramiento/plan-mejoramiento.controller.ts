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
import { PlanMejoramientoService } from './plan-mejoramiento.service';
import { PlanMejoramientoDto } from './dto/plan-mejoramiento.dto';

@ApiTags('plan-mejoramiento')
@Controller('plan-mejoramiento')
export class PlanMejoramientoController {
  constructor(private planMejoramientoService: PlanMejoramientoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo plan de mejoramiento' })
  @ApiBody({ type: PlanMejoramientoDto })
  @ApiResponse({
    status: 201,
    description: 'Plan de mejoramiento creado exitosamente.',
    type: PlanMejoramientoDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(
    @Res() res,
    @Body(new ParseObjectIdPipe(['auditoria_id']))
    planMejoramientoDto: PlanMejoramientoDto,
  ) {
    try {
      const plan = await this.planMejoramientoService.post(planMejoramientoDto);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: plan,
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
  @ApiOperation({ summary: 'Obtener todos los planes de mejoramiento' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todos los planes de mejoramiento.',
    type: [PlanMejoramientoDto],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const planes = await this.planMejoramientoService.getAll(filterDto);
      const counts = await this.planMejoramientoService.count(filterDto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: planes,
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
  @ApiOperation({ summary: 'Obtener un plan de mejoramiento por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el plan de mejoramiento.',
    type: PlanMejoramientoDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Plan de mejoramiento no encontrado.',
  })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const plan = await this.planMejoramientoService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: plan,
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
  @ApiOperation({ summary: 'Actualizar un plan de mejoramiento' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: PlanMejoramientoDto })
  @ApiResponse({
    status: 200,
    description: 'Plan de mejoramiento actualizado exitosamente.',
    type: PlanMejoramientoDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({
    status: 404,
    description: 'Plan de mejoramiento no encontrado.',
  })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body(new ParseObjectIdPipe(['auditoria_id']))
    planMejoramientoDto: PlanMejoramientoDto,
  ) {
    try {
      const plan = await this.planMejoramientoService.put(
        id,
        planMejoramientoDto,
      );
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: plan,
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
  @ApiOperation({ summary: 'Eliminar un plan de mejoramiento' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Plan de mejoramiento eliminado exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Plan de mejoramiento no encontrado.',
  })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.planMejoramientoService.delete(id);
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
