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
  import {AuditoriaService}from './auditoria.service';
  import{AuditoriaDTO} from './dto/auditoria.dto'
  import{FilterDto }from '../filters/filters.dto'
  import {  ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody, } from '@nestjs/swagger';

@ApiTags('auditoria')
@Controller('auditoria')
export class AuditoriaController {
  constructor(private AuditoriaService: AuditoriaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nueva aditoria' })
  @ApiBody({ type: AuditoriaDTO })
  @ApiResponse({
    status: 201,
    description: 'La aditoria ha sido creada exitosamente.',
    type: AuditoriaDTO,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(@Res() res, @Body() AuditoriaDTO: AuditoriaDTO) {
    try {
      const auditoria = await this.AuditoriaService.post(AuditoriaDTO);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registration successful',
        Data: auditoria,
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
  @ApiOperation({ summary: 'Obtener todas las aditorias' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todas las aditorias.',
    type: [AuditoriaDTO],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const auditorias = await this.AuditoriaService.getAll(filterDto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Request successful',
        Data: auditorias,
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
  @ApiOperation({ summary: 'Obtener una auditoria por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve la auditoria.',
    type: AuditoriaDTO,
  })
  @ApiResponse({ status: 404, description: 'Auditoria no encontrada.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const auditorias = await this.AuditoriaService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Request successful',
        Data: auditorias,
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
  @ApiOperation({ summary: 'Actualizar una auditoria' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: AuditoriaDTO })
  @ApiResponse({
    status: 200,
    description: 'La auditoria ha sido actualizada exitosamente.',
    type: AuditoriaDTO,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Contratista no encontrado.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body() AuditoriaDTO: AuditoriaDTO,
  ) {
    try {
      const auditorias = await this.AuditoriaService.put(id, AuditoriaDTO);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Update successful',
        Data: auditorias,
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
  @ApiOperation({ summary: 'Eliminar una auditoria' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'La auuditoria ha sido eliminada exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Auditoria no encontrada.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.AuditoriaService.delete(id);
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
