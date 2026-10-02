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
import { HallazgoRemisionService } from './hallazgo-remision.service';
import { HallazgoRemisionDTO } from './dto/hallazgo-remision.dto';
import { FilterDto } from '../filters/filters.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../pipes/parse-object-id/parse-object-id.pipe';

@ApiTags('hallazgo-remision')
@Controller('hallazgo-remision')
export class HallazgoRemisionController {
  constructor(
    private readonly hallazgoRemisionService: HallazgoRemisionService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva remisión de hallazgo' })
  @ApiBody({ type: HallazgoRemisionDTO })
  @ApiResponse({
    status: 201,
    description: 'La remisión de hallazgo ha sido creada exitosamente.',
    type: HallazgoRemisionDTO,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(
    @Res() res,
    @Body(new ParseObjectIdPipe(['hallazgo_id']))
    hallazgoRemisionDTO: HallazgoRemisionDTO,
  ) {
    try {
      const hallazgoRemision =
        await this.hallazgoRemisionService.post(hallazgoRemisionDTO);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: hallazgoRemision,
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
  @ApiOperation({ summary: 'Obtener todas las remisiones de hallazgos' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todas las remisiones de hallazgos.',
    type: [HallazgoRemisionDTO],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const hallazgosRemision =
        await this.hallazgoRemisionService.getAll(filterDto);
      const counts = await this.hallazgoRemisionService.count(filterDto);

      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: hallazgosRemision,
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
  @ApiOperation({ summary: 'Obtener una remisión de hallazgo por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve la remisión de hallazgo.',
    type: HallazgoRemisionDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Remisión de hallazgo no encontrada.',
  })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const hallazgoRemision = await this.hallazgoRemisionService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: hallazgoRemision,
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
  @ApiOperation({ summary: 'Actualizar una remisión de hallazgo' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: HallazgoRemisionDTO })
  @ApiResponse({
    status: 200,
    description: 'La remisión de hallazgo ha sido actualizada exitosamente.',
    type: HallazgoRemisionDTO,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({
    status: 404,
    description: 'Remisión de hallazgo no encontrada.',
  })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body(new ParseObjectIdPipe(['hallazgo_id']))
    hallazgoRemisionDTO: HallazgoRemisionDTO,
  ) {
    try {
      const hallazgoRemision = await this.hallazgoRemisionService.put(
        id,
        hallazgoRemisionDTO,
      );
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: hallazgoRemision,
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
  @ApiOperation({ summary: 'Eliminar una remisión de hallazgo' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'La remisión de hallazgo ha sido eliminada exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Remisión de hallazgo no encontrada.',
  })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.hallazgoRemisionService.delete(id);
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
          'Error en el servicio Delete: la peticion contiene parametros incorrectos',
        Data: error.message,
      });
    }
  }
}
