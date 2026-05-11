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
import { HallazgoService } from './hallazgo.service';
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
  constructor(
    private readonly hallazgoService: HallazgoService
  ) {}

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
    @Body(new ParseObjectIdPipe(['auditoria_id', 'informe_id', 'subtema_id']))
    createHallazgoDTO: CreateHallazgoDTO,
  ) {
    try {
      const hallazgo =
        await this.hallazgoService.agregarHallazgo(createHallazgoDTO);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Hallazgo creado exitosamente',
        Data: hallazgo,
      });
    } catch (error: unknown) {
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message: 'Error al crear hallazgo',
        Data: error instanceof Error ? error.message : String(error),
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
      const hallazgos = await this.hallazgoService.getAllHallazgos(filterDto);
      const counts = await this.hallazgoService.countHallazgos(filterDto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: hallazgos,
        MetaData: { Count: counts },
      });
    } catch (error: unknown) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Error al obtener hallazgos',
        Data: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Obtener un hallazgo por su ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID del hallazgo' })
  @ApiResponse({ status: 200, description: 'Devuelve el hallazgo.' })
  @ApiResponse({ status: 404, description: 'Hallazgo no encontrado.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const hallazgo = await this.hallazgoService.getHallazgoById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: hallazgo,
      });
    } catch (error: unknown) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Hallazgo no encontrado',
        Data: error instanceof Error ? error.message : String(error),
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
      const hallazgo = await this.hallazgoService.updateHallazgo(
        id,
        updateHallazgoDTO,
      );
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Hallazgo actualizado exitosamente',
        Data: hallazgo,
      });
    } catch (error: unknown) {
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message: 'Error al actualizar hallazgo',
        Data: error instanceof Error ? error.message : String(error),
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
      const hallazgo = await this.hallazgoService.deleteHallazgo(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Hallazgo eliminado exitosamente',
        Data: hallazgo,
      });
    } catch (error: unknown) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Error al eliminar hallazgo',
        Data: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
