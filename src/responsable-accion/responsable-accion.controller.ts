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
import { ResponsableAccionService } from './responsable-accion.service';
import { ResponsableAccionDto } from './dto/responsable-accion.dto';

@ApiTags('responsable-accion')
@Controller('responsable-accion')
export class ResponsableAccionController {
  constructor(private responsableAccionService: ResponsableAccionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo responsable de acción de mejora' })
  @ApiBody({ type: ResponsableAccionDto })
  @ApiResponse({
    status: 201,
    description: 'Responsable creado exitosamente.',
    type: ResponsableAccionDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(
    @Res() res,
    @Body(new ParseObjectIdPipe(['accion_mejora_id']))
    dto: ResponsableAccionDto,
  ) {
    try {
      const responsable = await this.responsableAccionService.post(dto);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: responsable,
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
  @ApiOperation({
    summary: 'Obtener todos los responsables de acción de mejora',
  })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todos los responsables.',
    type: [ResponsableAccionDto],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const responsables =
        await this.responsableAccionService.getAll(filterDto);
      const counts = await this.responsableAccionService.count(filterDto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: responsables,
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
  @ApiOperation({ summary: 'Obtener un responsable por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el responsable.',
    type: ResponsableAccionDto,
  })
  @ApiResponse({ status: 404, description: 'Responsable no encontrado.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const responsable = await this.responsableAccionService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: responsable,
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
  @ApiOperation({ summary: 'Actualizar un responsable de acción de mejora' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: ResponsableAccionDto })
  @ApiResponse({
    status: 200,
    description: 'Responsable actualizado exitosamente.',
    type: ResponsableAccionDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Responsable no encontrado.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body(new ParseObjectIdPipe(['accion_mejora_id']))
    dto: ResponsableAccionDto,
  ) {
    try {
      const responsable = await this.responsableAccionService.put(id, dto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: responsable,
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
  @ApiOperation({ summary: 'Eliminar un responsable de acción de mejora' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Responsable eliminado exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Responsable no encontrado.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.responsableAccionService.delete(id);
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
