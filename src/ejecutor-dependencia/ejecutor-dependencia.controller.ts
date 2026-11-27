import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
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
import { EjecutorDependenciaService } from './ejecutor-dependencia.service';
import { EjecutorDependenciaDto } from './dto/ejecutor-dependencia.dto';

@ApiTags('ejecutor-dependencia')
@Controller('ejecutor-dependencia')
export class EjecutorDependenciaController {
  constructor(private ejecutorDependenciaService: EjecutorDependenciaService) {}

  @Post()
  @ApiOperation({ summary: 'Asignar un ejecutor a una dependencia' })
  @ApiBody({ type: EjecutorDependenciaDto })
  @ApiResponse({
    status: 201,
    description: 'Ejecutor asignado exitosamente.',
    type: EjecutorDependenciaDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(@Res() res, @Body() dto: EjecutorDependenciaDto) {
    try {
      const ejecutor = await this.ejecutorDependenciaService.post(dto);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: ejecutor,
      });
    } catch (error: any) {
      // Los errores de negocio (cupo, exclusividad, duplicado) ya traen un
      // mensaje apto para el usuario; se devuelve tal cual. El resto se trata
      // como error técnico con el mensaje genérico.
      const mensajeNegocio = this.mensajeNegocio(error);
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          mensajeNegocio ??
          'Error servicio Post: la solicitud contiene un tipo de dato incorrecto o un parametro invalido',
        Data: mensajeNegocio ?? error.message,
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las asignaciones de ejecutor' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todas las asignaciones.',
    type: [EjecutorDependenciaDto],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const ejecutores =
        await this.ejecutorDependenciaService.getAll(filterDto);
      const counts = await this.ejecutorDependenciaService.count(filterDto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: ejecutores,
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

  @Patch('/desactivar-vencidos')
  @ApiOperation({
    summary:
      'Job de vigencia: desactiva las asignaciones de ejecutor cuya habilitación venció (fecha_fin <= ahora). Idempotente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cantidad de asignaciones desactivadas.',
  })
  async desactivarVencidos(@Res() res) {
    try {
      const resultado =
        await this.ejecutorDependenciaService.desactivarVencidos();
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Desactivacion de vencidos Exitosa',
        Data: resultado,
      });
    } catch (error: any) {
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message: 'Error en servicio desactivarVencidos',
        Data: error.message,
      });
    }
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Obtener una asignación de ejecutor por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve la asignación.',
    type: EjecutorDependenciaDto,
  })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const ejecutor = await this.ejecutorDependenciaService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: ejecutor,
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
  @ApiOperation({ summary: 'Actualizar una asignación de ejecutor' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: EjecutorDependenciaDto })
  @ApiResponse({
    status: 200,
    description: 'Asignación actualizada exitosamente.',
    type: EjecutorDependenciaDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body() dto: EjecutorDependenciaDto,
  ) {
    try {
      const ejecutor = await this.ejecutorDependenciaService.put(id, dto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: ejecutor,
      });
    } catch (error: any) {
      const mensajeNegocio = this.mensajeNegocio(error);
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          mensajeNegocio ??
          'Error en servicio Put: la peticion contiene un tipo de dato incorrecto o un parametro invalido',
        Data: mensajeNegocio ?? error.message,
      });
    }
  }

  /**
   * Devuelve el mensaje de una regla de negocio (BadRequestException lanzada por
   * el service) apto para mostrar al usuario, o null si el error es técnico.
   */
  private mensajeNegocio(error: any): string | null {
    if (error instanceof BadRequestException) {
      const respuesta: any = error.getResponse();
      return typeof respuesta === 'string'
        ? respuesta
        : (respuesta?.message ?? error.message);
    }
    return null;
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Eliminar (lógico) una asignación de ejecutor' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Asignación eliminada exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.ejecutorDependenciaService.delete(id);
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
