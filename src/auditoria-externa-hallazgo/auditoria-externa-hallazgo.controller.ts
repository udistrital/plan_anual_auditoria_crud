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
import { AuditoriaExternaHallazgoService } from './auditoria-externa-hallazgo.service';
import {
  AuditoriaExternaHallazgoDto,
  AuditoriaExternaHallazgoLoteDto,
} from './dto/auditoria-externa-hallazgo.dto';

@ApiTags('auditoria-externa-hallazgo')
@Controller('auditoria-externa-hallazgo')
export class AuditoriaExternaHallazgoController {
  constructor(private hallazgoService: AuditoriaExternaHallazgoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un hallazgo de una auditoría externa' })
  @ApiBody({ type: AuditoriaExternaHallazgoDto })
  @ApiResponse({
    status: 201,
    description: 'Hallazgo creado exitosamente.',
    type: AuditoriaExternaHallazgoDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(
    @Res() res,
    @Body(new ParseObjectIdPipe(['auditoria_externa_id']))
    dto: AuditoriaExternaHallazgoDto,
  ) {
    try {
      const hallazgo = await this.hallazgoService.post(dto);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: hallazgo,
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

  @Post('/lote')
  @ApiOperation({
    summary:
      'Crear varios hallazgos de una misma auditoría externa en una sola llamada (máximo 500)',
    description:
      'Si uno falla (por ejemplo, un número de hallazgo repetido) responde 400 y pueden quedar creados los anteriores: quien invoca compensa con borrado lógico.',
  })
  @ApiBody({ type: AuditoriaExternaHallazgoLoteDto })
  @ApiResponse({
    status: 201,
    description: 'Hallazgos creados exitosamente.',
    type: [AuditoriaExternaHallazgoDto],
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async postLote(
    @Res() res,
    @Body(new ParseObjectIdPipe(['auditoria_externa_id']))
    dto: AuditoriaExternaHallazgoLoteDto,
  ) {
    try {
      const hallazgos = await this.hallazgoService.postLote(dto);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: hallazgos,
        MetaData: { Count: hallazgos.length },
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
  @ApiOperation({ summary: 'Obtener los hallazgos de auditorías externas' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve los hallazgos.',
    type: [AuditoriaExternaHallazgoDto],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const hallazgos = await this.hallazgoService.getAll(filterDto);
      const counts = await this.hallazgoService.count(filterDto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: hallazgos,
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
  @ApiOperation({ summary: 'Obtener un hallazgo de auditoría externa por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el hallazgo.',
    type: AuditoriaExternaHallazgoDto,
  })
  @ApiResponse({ status: 404, description: 'Hallazgo no encontrado.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const hallazgo = await this.hallazgoService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: hallazgo,
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
  @ApiOperation({ summary: 'Actualizar un hallazgo de auditoría externa' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: AuditoriaExternaHallazgoDto })
  @ApiResponse({
    status: 200,
    description: 'Hallazgo actualizado exitosamente.',
    type: AuditoriaExternaHallazgoDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body(new ParseObjectIdPipe(['auditoria_externa_id']))
    dto: AuditoriaExternaHallazgoDto,
  ) {
    try {
      const hallazgo = await this.hallazgoService.put(id, dto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: hallazgo,
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
    summary: 'Eliminar (borrado lógico) un hallazgo de auditoría externa',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Hallazgo eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Hallazgo no encontrado.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      const hallazgo = await this.hallazgoService.delete(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: hallazgo,
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
