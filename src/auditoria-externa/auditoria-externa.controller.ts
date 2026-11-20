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
import { AuditoriaExternaService } from './auditoria-externa.service';
import { AuditoriaExternaDto } from './dto/auditoria-externa.dto';

@ApiTags('auditoria-externa')
@Controller('auditoria-externa')
export class AuditoriaExternaController {
  constructor(private auditoriaExternaService: AuditoriaExternaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una auditoría externa' })
  @ApiBody({ type: AuditoriaExternaDto })
  @ApiResponse({
    status: 201,
    description: 'Auditoría externa creada exitosamente.',
    type: AuditoriaExternaDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(@Res() res, @Body() dto: AuditoriaExternaDto) {
    try {
      const auditoria = await this.auditoriaExternaService.post(dto);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: auditoria,
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
  @ApiOperation({ summary: 'Obtener las auditorías externas' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve las auditorías externas.',
    type: [AuditoriaExternaDto],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const auditorias = await this.auditoriaExternaService.getAll(filterDto);
      const counts = await this.auditoriaExternaService.count(filterDto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: auditorias,
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
  @ApiOperation({ summary: 'Obtener una auditoría externa por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve la auditoría externa.',
    type: AuditoriaExternaDto,
  })
  @ApiResponse({ status: 404, description: 'Auditoría externa no encontrada.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const auditoria = await this.auditoriaExternaService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: auditoria,
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
  @ApiOperation({ summary: 'Actualizar una auditoría externa' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: AuditoriaExternaDto })
  @ApiResponse({
    status: 200,
    description: 'Auditoría externa actualizada exitosamente.',
    type: AuditoriaExternaDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body() dto: AuditoriaExternaDto,
  ) {
    try {
      const auditoria = await this.auditoriaExternaService.put(id, dto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: auditoria,
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
    summary: 'Eliminar (borrado lógico) una auditoría externa',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Auditoría externa eliminada exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Auditoría externa no encontrada.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      const auditoria = await this.auditoriaExternaService.delete(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: auditoria,
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
