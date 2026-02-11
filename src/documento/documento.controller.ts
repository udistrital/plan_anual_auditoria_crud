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
  import {  DocumentoService } from './documento.service';
  import { DocumentoDTO } from './dto/documento.dto'
  import { FilterDto } from '../filters/filters.dto'
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
  } from '@nestjs/swagger';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id/parse-object-id.pipe';

@ApiTags('documento')
@Controller('documento')
export class DocumentoController {
    constructor(private documentoService: DocumentoService) { }

    @Post()
    @ApiOperation({ summary: 'Crear un nueva documento' })
    @ApiBody({ type: DocumentoDTO })
    @ApiResponse({
      status: 201,
      description: 'El documento ha sido creado exitosamente.',
      type: DocumentoDTO,
    })
    @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
    async post(@Res() res, @Body(new ParseObjectIdPipe(['referencia_id'])) DocumentoDTO: DocumentoDTO) {
      try {
        const documento = await this.documentoService.post(DocumentoDTO);
        res.status(HttpStatus.CREATED).json({
          Success: true,
          Status: HttpStatus.CREATED,
          Message: 'Registro Exitoso',
          Data: documento,
        });
      } catch (error) {
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
      type: [DocumentoDTO],
    })
    async getAll(@Res() res, @Query() filterDto: FilterDto) {
      try {
        const documento = await this.documentoService.getAll(filterDto);
        const counts = await this.documentoService.count(filterDto);
  
        res.status(HttpStatus.OK).json({
          Success: true,
          Status: HttpStatus.OK,
          Message: 'Peticion Exitosa',
          Data: documento,
          MetaData: { Count: counts },
  
        });
      } catch (error) {
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
    @ApiOperation({ summary: 'Obtener un documento por Id' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({
      status: 200,
      description: 'Devuelve la documento.',
      type: DocumentoDTO,
    })
    @ApiResponse({ status: 404, description: 'Documento no encontrada.' })
    async getById(@Res() res, @Param('id') id: string) {
      try {
        const documento = await this.documentoService.getById(id);
        res.status(HttpStatus.OK).json({
          Success: true,
          Status: HttpStatus.OK,
          Message: 'Peticion Exitosa',
          Data: documento,
        });
      } catch (error) {
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
    @ApiOperation({ summary: 'Actualizar una documento' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiBody({ type: DocumentoDTO })
    @ApiResponse({
      status: 200,
      description: 'La documento ha sido actualizada exitosamente.',
      type: DocumentoDTO,
    })
    @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
    @ApiResponse({ status: 404, description: 'Documento no encontrado.' })
    async put(
      @Res() res,
      @Param('id') id: string,
      @Body() DocumentoDTO: DocumentoDTO,
    ) {
      try {
        const documento = await this.documentoService.put(id, DocumentoDTO);
        res.status(HttpStatus.OK).json({
          Success: true,
          Status: HttpStatus.OK,
          Message: 'Actualizacion Exitosa',
          Data: documento,
        });
      } catch (error) {
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
    @ApiOperation({ summary: 'Eliminar una documento' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({
      status: 200,
      description: 'La documento ha sido eliminada exitosamente.',
    })
    @ApiResponse({ status: 404, description: 'Documento no encontrada.' })
    async delete(@Res() res, @Param('id') id: string) {
      try {
        await this.documentoService.delete(id);
        res.status(HttpStatus.OK).json({
          Success: true,
          Status: HttpStatus.OK,
          Message: 'Eliminacion Exitosa',
          Data: {
            _id: id,
          },
        });
      } catch (error) {
        res.status(HttpStatus.NOT_FOUND).json({
          Success: false,
          Status: HttpStatus.NOT_FOUND,
          Message: 'Error en el servicio Delete: la peticion contiene paratros incorrectos',
          Data: error.message,
        });
      }
    }
}
