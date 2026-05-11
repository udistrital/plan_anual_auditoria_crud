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
import { TemaService } from './tema.service';
import { TemaDTO, UpdateTemaDTO } from './dto/tema.dto';
import { FilterDto } from '../filters/filters.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../pipes/parse-object-id/parse-object-id.pipe';

@ApiTags('tema')
@Controller('tema')
export class TemaController {
  constructor(private readonly temaService: TemaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tema' })
  @ApiBody({ type: TemaDTO })
  @ApiResponse({
    status: 201,
    description: 'El tema ha sido creado exitosamente.',
    type: TemaDTO,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(
    @Res() res,
    @Body(new ParseObjectIdPipe(['informe_id'])) TemaDTO: TemaDTO,
  ) {
    try {
      const tema = await this.temaService.post(TemaDTO);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: tema,
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
  @ApiOperation({ summary: 'Obtener todos los temas' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todos los temas.',
    type: [TemaDTO],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const tema = await this.temaService.getAll(filterDto);
      const counts = await this.temaService.count(filterDto);

      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: tema,
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
  @ApiOperation({ summary: 'Obtener un tema por Id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el tema.',
    type: TemaDTO,
  })
  @ApiResponse({ status: 404, description: 'Tema no encontrado.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const tema = await this.temaService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: tema,
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
  @ApiOperation({ summary: 'Actualizar un tema' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateTemaDTO })
  @ApiResponse({
    status: 200,
    description: 'El tema ha sido actualizado exitosamente.',
    type: TemaDTO,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Tema no encontrado.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body() updateTemaDTO: UpdateTemaDTO,
  ) {
    try {
      const tema = await this.temaService.put(id, updateTemaDTO);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualizacion Exitosa',
        Data: tema,
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
  @ApiOperation({ summary: 'Eliminar un tema' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'El tema ha sido eliminado exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Tema no encontrado.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.temaService.delete(id);
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
