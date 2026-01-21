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
import { TemaDTO } from './dto/tema.dto';
import { SubtemaDTO } from './dto/subtema.dto';
import { HallazgoDTO } from './dto/hallazgo.dto';
import { FilterDto } from '../filters/filters.dto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';

@ApiTags('tema')
@Controller('tema')
export class TemaController {
    constructor(private temaService: TemaService) { }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo tema' })
    @ApiBody({ type: TemaDTO })
    @ApiResponse({
        status: 201,
        description: 'El tema ha sido creado exitosamente.',
        type: TemaDTO,
    })
    @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
    async post(@Res() res, @Body() TemaDTO: TemaDTO) {
        try {
            const tema = await this.temaService.post(TemaDTO);
            res.status(HttpStatus.CREATED).json({
                Success: true,
                Status: HttpStatus.CREATED,
                Message: 'Registro Exitoso',
                Data: tema,
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
    @ApiOperation({ summary: 'Actualizar un tema' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiBody({ type: TemaDTO })
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
        @Body() TemaDTO: TemaDTO,
    ) {
        try {
            const tema = await this.temaService.put(id, TemaDTO);
            res.status(HttpStatus.OK).json({
                Success: true,
                Status: HttpStatus.OK,
                Message: 'Actualizacion Exitosa',
                Data: tema,
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
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).json({
                Success: false,
                Status: HttpStatus.NOT_FOUND,
                Message: 'Error en el servicio Delete: la peticion contiene parametros incorrectos',
                Data: error.message,
            });
        }
    }

    @Post('/:temaId/subtemas')
    @ApiOperation({ summary: 'Agregar un subtema a un tema' })
    @ApiParam({ name: 'temaId', type: 'string' })
    @ApiBody({ type: SubtemaDTO })
    @ApiResponse({
        status: 201,
        description: 'El subtema ha sido agregado exitosamente.',
    })
    @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
    async agregarSubtema(
        @Res() res,
        @Param('temaId') temaId: string,
        @Body() SubtemaDTO: SubtemaDTO
    ) {
        try {
            const tema = await this.temaService.agregarSubtema(temaId, SubtemaDTO);
            res.status(HttpStatus.CREATED).json({
                Success: true,
                Status: HttpStatus.CREATED,
                Message: 'Subtema agregado exitosamente',
                Data: tema,
            });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({
                Success: false,
                Status: HttpStatus.BAD_REQUEST,
                Message: 'Error al agregar subtema',
                Data: error.message,
            });
        }
    }

    @Put('/:temaId/subtemas/:subtemaId')
    @ApiOperation({ summary: 'Actualizar un subtema' })
    @ApiParam({ name: 'temaId', type: 'string' })
    @ApiParam({ name: 'subtemaId', type: 'string' })
    @ApiBody({ type: SubtemaDTO })
    @ApiResponse({
        status: 200,
        description: 'El subtema ha sido actualizado exitosamente.',
    })
    async actualizarSubtema(
        @Res() res,
        @Param('temaId') temaId: string,
        @Param('subtemaId') subtemaId: string,
        @Body() SubtemaDTO: SubtemaDTO
    ) {
        try {
            const tema = await this.temaService.actualizarSubtema(temaId, subtemaId, SubtemaDTO);
            res.status(HttpStatus.OK).json({
                Success: true,
                Status: HttpStatus.OK,
                Message: 'Subtema actualizado exitosamente',
                Data: tema,
            });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({
                Success: false,
                Status: HttpStatus.BAD_REQUEST,
                Message: 'Error al actualizar subtema',
                Data: error.message,
            });
        }
    }

    @Delete('/:temaId/subtemas/:subtemaId')
    @ApiOperation({ summary: 'Eliminar un subtema' })
    @ApiParam({ name: 'temaId', type: 'string' })
    @ApiParam({ name: 'subtemaId', type: 'string' })
    @ApiResponse({
        status: 200,
        description: 'El subtema ha sido eliminado exitosamente.',
    })
    async eliminarSubtema(
        @Res() res,
        @Param('temaId') temaId: string,
        @Param('subtemaId') subtemaId: string
    ) {
        try {
            const tema = await this.temaService.eliminarSubtema(temaId, subtemaId);
            res.status(HttpStatus.OK).json({
                Success: true,
                Status: HttpStatus.OK,
                Message: 'Subtema eliminado exitosamente',
                Data: tema,
            });
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).json({
                Success: false,
                Status: HttpStatus.NOT_FOUND,
                Message: 'Error al eliminar subtema',
                Data: error.message,
            });
        }
    }

    @Post('/:temaId/subtemas/:subtemaId/hallazgos')
    @ApiOperation({ summary: 'Agregar un hallazgo a un subtema' })
    @ApiParam({ name: 'temaId', type: 'string' })
    @ApiParam({ name: 'subtemaId', type: 'string' })
    @ApiBody({ type: HallazgoDTO })
    @ApiResponse({
        status: 201,
        description: 'El hallazgo ha sido agregado exitosamente.',
    })
    @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
    async agregarHallazgo(
        @Res() res,
        @Param('temaId') temaId: string,
        @Param('subtemaId') subtemaId: string,
        @Body() HallazgoDTO: HallazgoDTO
    ) {
        try {
            const tema = await this.temaService.agregarHallazgo(temaId, subtemaId, HallazgoDTO);
            res.status(HttpStatus.CREATED).json({
                Success: true,
                Status: HttpStatus.CREATED,
                Message: 'Hallazgo agregado exitosamente',
                Data: tema,
            });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({
                Success: false,
                Status: HttpStatus.BAD_REQUEST,
                Message: 'Error al agregar hallazgo',
                Data: error.message,
            });
        }
    }

    @Put('/:temaId/subtemas/:subtemaId/hallazgos/:hallazgoId')
    @ApiOperation({ summary: 'Actualizar un hallazgo' })
    @ApiParam({ name: 'temaId', type: 'string' })
    @ApiParam({ name: 'subtemaId', type: 'string' })
    @ApiParam({ name: 'hallazgoId', type: 'string' })
    @ApiBody({ type: HallazgoDTO })
    @ApiResponse({
        status: 200,
        description: 'El hallazgo ha sido actualizado exitosamente.',
    })
    async actualizarHallazgo(
        @Res() res,
        @Param('temaId') temaId: string,
        @Param('subtemaId') subtemaId: string,
        @Param('hallazgoId') hallazgoId: string,
        @Body() HallazgoDTO: HallazgoDTO
    ) {
        try {
            const tema = await this.temaService.actualizarHallazgo(
                temaId,
                subtemaId,
                hallazgoId,
                HallazgoDTO
            );
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

    @Delete('/:temaId/subtemas/:subtemaId/hallazgos/:hallazgoId')
    @ApiOperation({ summary: 'Eliminar un hallazgo' })
    @ApiParam({ name: 'temaId', type: 'string' })
    @ApiParam({ name: 'subtemaId', type: 'string' })
    @ApiParam({ name: 'hallazgoId', type: 'string' })
    @ApiResponse({
        status: 200,
        description: 'El hallazgo ha sido eliminado exitosamente.',
    })
    async eliminarHallazgo(
        @Res() res,
        @Param('temaId') temaId: string,
        @Param('subtemaId') subtemaId: string,
        @Param('hallazgoId') hallazgoId: string
    ) {
        try {
            const tema = await this.temaService.eliminarHallazgo(temaId, subtemaId, hallazgoId);
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