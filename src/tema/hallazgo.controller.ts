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
import { CreateHallazgoDTO, UpdateHallazgoDTO } from './dto/hallazgo.dto';
import { FilterDto } from '../filters/filters.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../pipes/parse-object-id/parse-object-id.pipe';

@ApiTags('hallazgo')
@Controller('hallazgo')
export class HallazgoController {
  constructor(private temaService: TemaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo hallazgo' })
  @ApiBody({ type: CreateHallazgoDTO })
  @ApiResponse({
    status: 201,
    description: 'El hallazgo ha sido creado exitosamente.',
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async create(
    @Res() res,
    @Body(new ParseObjectIdPipe(['subtema_id']))
    createHallazgoDTO: CreateHallazgoDTO,
  ) {
    try {
      const tema = await this.temaService.agregarHallazgo(
        createHallazgoDTO.subtema_id,
        createHallazgoDTO,
      );
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Hallazgo creado exitosamente',
        Data: tema,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message: 'Error al crear hallazgo',
        Data: error.message,
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los hallazgos' })
  @ApiQuery({
    name: 'query',
    required: false,
    description:
      'Filtros en formato query. Ejemplo: subtema_id:507f1f77bcf86cd799439011',
    example: 'subtema_id:507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todos los hallazgos filtrados.',
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const hallazgos = await this.temaService.getAllHallazgos(filterDto);
      const counts = await this.temaService.countHallazgos(filterDto);

      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: hallazgos,
        MetaData: { Count: counts },
      });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Error al obtener hallazgos',
        Data: error.message,
      });
    }
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Obtener un hallazgo por su ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID del hallazgo' })
  @ApiResponse({
    status: 200,
    description:
      'Devuelve el hallazgo con información del subtema y tema padre.',
  })
  @ApiResponse({ status: 404, description: 'Hallazgo no encontrado.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const hallazgo = await this.temaService.getHallazgoById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: hallazgo,
      });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Hallazgo no encontrado',
        Data: error.message,
      });
    }
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Actualizar un hallazgo por su ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID del hallazgo' })
  @ApiBody({ type: UpdateHallazgoDTO })
  @ApiResponse({
    status: 200,
    description: 'El hallazgo ha sido actualizado exitosamente.',
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Hallazgo no encontrado.' })
  async update(
    @Res() res,
    @Param('id') id: string,
    @Body() updateHallazgoDTO: UpdateHallazgoDTO,
  ) {
    try {
      const tema = await this.temaService.updateHallazgo(id, updateHallazgoDTO);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Hallazgo actualizado exitosamente',
        Data: tema,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message: 'Error al actualizar hallazgo',
        Data: error.message,
      });
    }
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Eliminar un hallazgo por su ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID del hallazgo' })
  @ApiResponse({
    status: 200,
    description: 'El hallazgo ha sido eliminado exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Hallazgo no encontrado.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      const tema = await this.temaService.deleteHallazgo(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Hallazgo eliminado exitosamente',
        Data: tema,
      });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Error al eliminar hallazgo',
        Data: error.message,
      });
    }
  }
}
