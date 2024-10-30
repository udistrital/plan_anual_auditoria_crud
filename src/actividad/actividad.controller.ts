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
import { ActividadService } from './actividad.service';
import { ActividadDTO } from './dto/actividad.dto'
import { FilterDto } from '../filters/filters.dto'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('actividad')
@Controller('actividad')
export class ActividadController {
  constructor(private actividadervice: ActividadService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nueva actividad' })
  @ApiBody({ type: ActividadDTO })
  @ApiResponse({
    status: 201,
    description: 'El actividad ha sido creado exitosamente.',
    type: ActividadDTO,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(@Res() res, @Body() ActividadDTO: ActividadDTO) {
    try {
      const actividad = await this.actividadervice.post(ActividadDTO);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: actividad,
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
  @ApiOperation({ summary: 'Obtener todas las actividades' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todas las actividades.',
    type: [ActividadDTO],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const actividad = await this.actividadervice.getAll(filterDto);
      const counts = await this.actividadervice.count();

      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: actividad,
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
  @ApiOperation({ summary: 'Obtener un actividad por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve la actividad.',
    type: ActividadDTO,
  })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const actividad = await this.actividadervice.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: actividad,
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
  @ApiOperation({ summary: 'Actualizar una actividad' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: ActividadDTO })
  @ApiResponse({
    status: 200,
    description: 'La actividad ha sido actualizada exitosamente.',
    type: ActividadDTO,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrado.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body() ActividadDTO: ActividadDTO,
  ) {
    try {
      const actividad = await this.actividadervice.put(id, ActividadDTO);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: actividad,
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
  @ApiOperation({ summary: 'Eliminar una actividad' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'La actividad ha sido eliminada exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.actividadervice.delete(id);
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
        Message: 'Error en el servicio Delete: la peticion contiene paratros incorrectos',
        Data: error.message,
      });
    }
  }
}
