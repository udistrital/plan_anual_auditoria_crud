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
  import {ActividadService}from './actividad.service';
  import{ActividadDTO} from './dto/actividad.dto'
  import{Actividad, ActividadSchema}from './schemas/actividad.schema'
  import{FilterDto }from '../filters/filters.dto'
  import { ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody, } from '@nestjs/swagger';

@ApiTags('actividad')
@Controller('actividad')
export class ActividadController {
  constructor(private actividadervice: ActividadService) {}

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
        Message: 'Registration successful',
        Data: actividad,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error service Post: The request contains an incorrect data type or an invalid parameter',
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
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Request successful',
        Data: actividad,
      });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error service GetAll: The request contains an incorrect parameter or no record exist',
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
        Message: 'Request successful',
        Data: actividad,
      });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error service GetOne: The request contains an incorrect parameter or no record exist',
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
        Message: 'Update successful',
        Data: actividad,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error service Put: The request contains an incorrect data type or an invalid parameter',
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
        Message: 'Delete successful',
        Data: {
          _id: id,
        },
      });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Error service Delete: Request contains incorrect parameter',
        Data: error.message,
      });
    }
  }
}
