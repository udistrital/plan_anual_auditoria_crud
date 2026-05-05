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
import { ObservacionService } from './observacion.service';
import { CreateObservacionDTO, UpdateObservacionDTO } from './dto/observacion.dto';
import { FilterDto } from '../filters/filters.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../pipes/parse-object-id/parse-object-id.pipe';

@ApiTags('observacion')
@Controller('observacion')
export class ObservacionController {
  constructor(private observacionService: ObservacionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva observación' })
  @ApiBody({ type: CreateObservacionDTO })
  @ApiResponse({
    status: 201,
    description: 'La observación ha sido creada exitosamente.',
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async create(
    @Res() res,
    @Body(new ParseObjectIdPipe(['hallazgo_id']))
    createObservacionDTO: CreateObservacionDTO,
  ) {
    try {
      const observacion =
        await this.observacionService.agregarObservacion(createObservacionDTO);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Observación creada exitosamente',
        Data: observacion,
      });
    } catch (error: unknown) {
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message: 'Error al crear observación',
        Data: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las observaciones' })
  @ApiQuery({
    name: 'query',
    required: false,
    description:
      'Filtros en formato query. Ejemplo: hallazgo_id:507f1f77bcf86cd799439011',
    example: 'hallazgo_id:507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todas las observaciones filtradas.',
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const observaciones =
        await this.observacionService.getAllObservaciones(filterDto);
      const counts =
        await this.observacionService.countObservaciones(filterDto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: observaciones,
        MetaData: { Count: counts },
      });
    } catch (error: unknown) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Error al obtener observaciones',
        Data: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Obtener una observación por su ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID de la observación' })
  @ApiResponse({ status: 200, description: 'Devuelve la observación.' })
  @ApiResponse({ status: 404, description: 'Observación no encontrada.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const observacion = await this.observacionService.getObservacionById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: observacion,
      });
    } catch (error: unknown) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Observación no encontrada',
        Data: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Actualizar una observación por su ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID de la observación' })
  @ApiBody({ type: UpdateObservacionDTO })
  @ApiResponse({
    status: 200,
    description: 'La observación ha sido actualizada exitosamente.',
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Observación no encontrada.' })
  async update(
    @Res() res,
    @Param('id') id: string,
    @Body() updateObservacionDTO: UpdateObservacionDTO,
  ) {
    try {
      const observacion = await this.observacionService.updateObservacion(
        id,
        updateObservacionDTO,
      );
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Observación actualizada exitosamente',
        Data: observacion,
      });
    } catch (error: unknown) {
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message: 'Error al actualizar observación',
        Data: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Eliminar una observación por su ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID de la observación' })
  @ApiResponse({
    status: 200,
    description: 'La observación ha sido eliminada exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Observación no encontrada.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      const observacion = await this.observacionService.deleteObservacion(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Observación eliminada exitosamente',
        Data: observacion,
      });
    } catch (error: unknown) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Error al eliminar observación',
        Data: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
