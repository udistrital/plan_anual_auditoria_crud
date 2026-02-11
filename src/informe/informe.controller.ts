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
import { InformeService } from './informe.service';
import { InformeDTO } from './dto/informe.dto';
import { FilterDto } from '../filters/filters.dto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';
import { InformeEstadoService } from '../informe-estado/informe-estado.service';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id/parse-object-id.pipe';

@ApiTags('informe')
@Controller('informe')
export class InformeController {
    constructor(private informeService: InformeService,
        private informeEstadoService: InformeEstadoService
    ) { }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo informe' })
    @ApiBody({ type: InformeDTO })
    @ApiResponse({
        status: 201,
        description: 'El informe ha sido creado exitosamente.',
        type: InformeDTO,
    })
    @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
    async post(@Res() res, @Body(new ParseObjectIdPipe(['auditoria_id'])) InformeDTO: InformeDTO) {
        try {
            const informe = await this.informeService.post(InformeDTO);
            res.status(HttpStatus.CREATED).json({
                Success: true,
                Status: HttpStatus.CREATED,
                Message: 'Registro Exitoso',
                Data: informe,
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
    @ApiOperation({ summary: 'Obtener todos los informes' })
    @ApiResponse({
        status: 200,
        description: 'Devuelve todos los informes.',
        type: [InformeDTO],
    })
    async getAll(@Res() res, @Query() filterDto: FilterDto) {
        try {
            const informe = await this.informeService.getAll(filterDto);
            const counts = await this.informeService.count(filterDto);

            res.status(HttpStatus.OK).json({
                Success: true,
                Status: HttpStatus.OK,
                Message: 'Peticion Exitosa',
                Data: informe,
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
    @ApiOperation({ summary: 'Obtener un informe por Id' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({
        status: 200,
        description: 'Devuelve el informe.',
        type: InformeDTO,
    })
    @ApiResponse({ status: 404, description: 'Informe no encontrado.' })
    async getById(@Res() res, @Param('id') id: string) {
        try {
            const informe = await this.informeService.getById(id);
            res.status(HttpStatus.OK).json({
                Success: true,
                Status: HttpStatus.OK,
                Message: 'Peticion Exitosa',
                Data: informe,
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
    @ApiOperation({ summary: 'Actualizar un informe' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiBody({ type: InformeDTO })
    @ApiResponse({
        status: 200,
        description: 'El informe ha sido actualizado exitosamente.',
        type: InformeDTO,
    })
    @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
    @ApiResponse({ status: 404, description: 'Informe no encontrado.' })
    async put(
        @Res() res,
        @Param('id') id: string,
        @Body() InformeDTO: InformeDTO,
    ) {
        try {
            const informe = await this.informeService.put(id, InformeDTO);
            res.status(HttpStatus.OK).json({
                Success: true,
                Status: HttpStatus.OK,
                Message: 'Actualizacion Exitosa',
                Data: informe,
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
    @ApiOperation({ summary: 'Eliminar un informe' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({
        status: 200,
        description: 'El informe ha sido eliminado exitosamente.',
    })
    @ApiResponse({ status: 404, description: 'Informe no encontrado.' })
    async delete(@Res() res, @Param('id') id: string) {
        try {
            await this.informeService.delete(id);
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
                Message: 'Error en el servicio Delete: la peticion contiene parametros incorrectos',
                Data: error.message,
            });
        }
    }

    @Get('/:informeId/tema')
    @ApiOperation({ summary: 'Obtener temas, subtemas y hallazgos activos de un informe' })
    @ApiParam({ name: 'informeId', type: 'string', description: 'ID del informe' })
    @ApiResponse({
        status: 200,
        description: 'Devuelve los temas activos con sus subtemas y hallazgos activos.',
    })
    @ApiResponse({ status: 404, description: 'Informe no encontrado.' })
    async getTemasActivos(
        @Res() res,
        @Param('informeId') informeId: string
    ) {
        try {
            const temas = await this.informeService.getTemasActivosByInforme(informeId);
            res.status(HttpStatus.OK).json({
                Success: true,
                Status: HttpStatus.OK,
                Message: 'Peticion Exitosa',
                Data: temas,
                MetaData: { Count: temas.length },
            });
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).json({
                Success: false,
                Status: HttpStatus.NOT_FOUND,
                Message: 'Error al obtener temas activos del informe',
                Data: error.message,
            });
        }
    }

    @Get('/:id/hallazgos')
    @ApiOperation({ summary: 'Obtener todos los hallazgos de un informe (estructura plana)' })
    @ApiParam({ name: 'id', type: 'string', description: 'ID del informe' })
    @ApiResponse({
        status: 200,
        description: 'Devuelve todos los hallazgos del informe en estructura plana.',
    })
    @ApiResponse({ status: 404, description: 'Informe no encontrado o sin hallazgos.' })
    async getHallazgos(
        @Res() res,
        @Param('id') id: string
    ) {
        try {
            const hallazgos = await this.informeService.getHallazgosByInforme(id);
            res.status(HttpStatus.OK).json({
                Success: true,
                Status: HttpStatus.OK,
                Message: 'Peticion Exitosa',
                Data: hallazgos,
                MetaData: { Count: hallazgos.length },
            });
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).json({
                Success: false,
                Status: HttpStatus.NOT_FOUND,
                Message: 'Error al obtener hallazgos del informe',
                Data: error.message,
            });
        }
    }

    @Get('/:id/estados')
  @ApiOperation({ summary: 'Obtener todos los estados de un informe (historial completo)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID del informe' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todos los estados del informe.',
  })
  @ApiResponse({ status: 404, description: 'Informe no encontrado o sin estados.' })
  async getEstados(
    @Res() res,
    @Param('id') id: string
  ) {
    try {
      await this.informeService.getById(id);
      
      const filterDto = {
        query: `informe_id:${id}`,
        fields: '',
        sortby: 'fecha_ejecucion_estado',
        order: 'desc',
        limit: '100',
        offset: '0',
        populate: 'false',
      };
      
      const estados = await this.informeEstadoService.getAll(filterDto);
      
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: estados,
        MetaData: { Count: estados.length },
      });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Error al obtener estados del informe',
        Data: error.message,
      });
    }
  }

  @Get('/:id/estado-actual')
  @ApiOperation({ summary: 'Obtener el estado actual de un informe' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID del informe' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el estado actual del informe.',
  })
  @ApiResponse({ status: 404, description: 'Informe no encontrado o sin estado actual.' })
  async getEstadoActual(
    @Res() res,
    @Param('id') id: string
  ) {
    try {
      await this.informeService.getById(id);
      
      const filterDto = {
        query: `informe_id:${id},actual:true`,
        fields: '',
        sortby: 'fecha_ejecucion_estado',
        order: 'desc',
        limit: '1',
        offset: '0',
        populate: 'false',
      };
      
      const estados = await this.informeEstadoService.getAll(filterDto);
      
      if (estados.length === 0) {
        throw new Error('El informe no tiene un estado actual');
      }
      
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: estados[0],
      });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Error al obtener estado actual del informe',
        Data: error.message,
      });
    }
  }
}