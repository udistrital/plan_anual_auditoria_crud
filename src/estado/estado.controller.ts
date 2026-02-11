import { Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Res, } from '@nestjs/common';
    import { EstadoService } from './estado.service';
    import { PlanEstadoDto } from './dto/estado.dto'
    import { FilterDto } from '../filters/filters.dto'
    import {
      ApiTags,
      ApiOperation,
      ApiResponse,
      ApiParam,
      ApiBody,
    } from '@nestjs/swagger';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id/parse-object-id.pipe';
@ApiTags('estado-plan')
@Controller('estado')
export class EstadoController {
    constructor(private estadoService: EstadoService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo estado de plan' })
  @ApiBody({ type: PlanEstadoDto })
  @ApiResponse({
    status: 201,
    description: 'El estado de plan ha sido creado exitosamente.',
    type: PlanEstadoDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(@Res() res, @Body(new ParseObjectIdPipe(['plan_auditoria_id'])) PlanEstadoDto: PlanEstadoDto) {
    try {
      const estadoPlan = await this.estadoService.post(PlanEstadoDto);
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
  @ApiOperation({ summary: 'Obtener todos los estados de plan' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todos los estados de plan.',
    type: [PlanEstadoDto],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const estadoPlan = await this.estadoService.getAll(filterDto);
      const counts = await this.estadoService.count(filterDto);

      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: estadoPlan,
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
  @ApiOperation({ summary: 'Obtener un estado de plan por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el estado de plan.',
    type: PlanEstadoDto,
  })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const estadoPlan = await this.estadoService.getById(id);
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
  @ApiOperation({ summary: 'Actualizar un estado de plan' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: PlanEstadoDto })
  @ApiResponse({
    status: 200,
    description: 'El estado de plan ha sido actualizada exitosamente.',
    type: PlanEstadoDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrado.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body() PlanEstadoDto: PlanEstadoDto,
  ) {
    try {
      const estadoPlan = await this.estadoService.put(id, PlanEstadoDto);
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
  @ApiOperation({ summary: 'Eliminar un estado de plan' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'El estado de plan ha sido eliminada exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.estadoService.delete(id);
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
        Message: 'Error en el servicio Delete: la peticion contiene parametros incorrectos',
        Data: error.message,
      });
    }
  }
}
