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
import { AuditorService } from './auditor.service';
import { AuditorDTO } from './dto/auditor.dto';
import { FilterDto } from '../filters/filters.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../pipes/parse-object-id/parse-object-id.pipe';

@ApiTags('auditor')
@Controller('auditor')
export class AuditorController {
  constructor(private readonly auditorService: AuditorService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nueva auditor' })
  @ApiBody({ type: AuditorDTO })
  @ApiResponse({
    status: 201,
    description: 'El auditor ha sido creado exitosamente.',
    type: AuditorDTO,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(
    @Res() res,
    @Body(new ParseObjectIdPipe(['auditoria_id'])) AuditorDTO: AuditorDTO,
  ) {
    try {
      const auditor = await this.auditorService.post(AuditorDTO);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: auditor,
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
  @ApiOperation({ summary: 'Obtener todas las actividades' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todas las actividades.',
    type: [AuditorDTO],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const auditor = await this.auditorService.getAll(filterDto);
      const counts = await this.auditorService.count(filterDto);

      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: auditor,
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
  @ApiOperation({ summary: 'Obtener un auditor por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el auditor.',
    type: AuditorDTO,
  })
  @ApiResponse({ status: 404, description: 'Auditor no encontrada.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const auditor = await this.auditorService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: auditor,
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
  @ApiOperation({ summary: 'Actualizar un auditor' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: AuditorDTO })
  @ApiResponse({
    status: 200,
    description: 'El auditor ha sido actualizada exitosamente.',
    type: AuditorDTO,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Auditor no encontrado.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body(new ParseObjectIdPipe(['auditoria_id'])) AuditorDTO: AuditorDTO,
  ) {
    try {
      const auditor = await this.auditorService.put(id, AuditorDTO);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: auditor,
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
  @ApiOperation({ summary: 'Eliminar un auditor' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'El auditor ha sido eliminada exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Auditor no encontrada.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.auditorService.delete(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: {
          _id: id,
        },
      });
    } catch (error: any) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error en el servicio Delete: la peticion contiene paratros incorrectos',
        Data: error.message,
      });
    }
  }
}
