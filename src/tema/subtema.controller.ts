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
import { CreateSubtemaDTO, UpdateSubtemaDTO } from './dto/subtema.dto';
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

@ApiTags('subtema')
@Controller('subtema')
export class SubtemaController {
  constructor(
    private readonly temaService: TemaService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo subtema' })
  @ApiBody({ type: CreateSubtemaDTO })
  @ApiResponse({
    status: 201,
    description: 'El subtema ha sido creado exitosamente.',
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async create(
    @Res() res,
    @Body(new ParseObjectIdPipe(['tema_id']))
    createSubtemaDTO: CreateSubtemaDTO,
  ) {
    try {
      const tema = await this.temaService.agregarSubtema(
        createSubtemaDTO.tema_id,
        createSubtemaDTO,
      );
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Subtema creado exitosamente',
        Data: tema,
      });
    } catch (error: any) {
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message: 'Error al crear subtema',
        Data: error.message,
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los subtemas' })
  @ApiQuery({
    name: 'query',
    required: false,
    description:
      'Filtros en formato query. Ejemplo: tema_id:507f1f77bcf86cd799439011',
    example: 'tema_id:507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todos los subtemas filtrados.',
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const subtemas = await this.temaService.getAllSubtemas(filterDto);
      const counts = await this.temaService.countSubtemas(filterDto);

      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: subtemas,
        MetaData: { Count: counts },
      });
    } catch (error: any) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Error al obtener subtemas',
        Data: error.message,
      });
    }
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Obtener un subtema por su ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID del subtema' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el subtema con información del tema padre.',
  })
  @ApiResponse({ status: 404, description: 'Subtema no encontrado.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const subtema = await this.temaService.getSubtemaById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: subtema,
      });
    } catch (error: any) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Subtema no encontrado',
        Data: error.message,
      });
    }
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Actualizar un subtema por su ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID del subtema' })
  @ApiBody({ type: UpdateSubtemaDTO })
  @ApiResponse({
    status: 200,
    description: 'El subtema ha sido actualizado exitosamente.',
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Subtema no encontrado.' })
  async update(
    @Res() res,
    @Param('id') id: string,
    @Body() updateSubtemaDTO: UpdateSubtemaDTO,
  ) {
    try {
      const tema = await this.temaService.updateSubtema(id, updateSubtemaDTO);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Subtema actualizado exitosamente',
        Data: tema,
      });
    } catch (error: any) {
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message: 'Error al actualizar subtema',
        Data: error.message,
      });
    }
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Eliminar un subtema por su ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID del subtema' })
  @ApiResponse({
    status: 200,
    description: 'El subtema ha sido eliminado exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Subtema no encontrado.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      const tema = await this.temaService.deleteSubtema(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Subtema eliminado exitosamente',
        Data: tema,
      });
    } catch (error: any) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Error al eliminar subtema',
        Data: error.message,
      });
    }
  }
}
