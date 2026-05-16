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
import { PlanMejoramientoAuditorService } from './plan-mejoramiento-auditor.service';
import { PlanMejoramientoAuditorDto } from './dto/plan-mejoramiento-auditor.dto';

@ApiTags('plan-mejoramiento-auditor')
@Controller('plan-mejoramiento-auditor')
export class PlanMejoramientoAuditorController {
  constructor(
    private planMejoramientoAuditorService: PlanMejoramientoAuditorService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo auditor de plan de mejoramiento' })
  @ApiBody({ type: PlanMejoramientoAuditorDto })
  @ApiResponse({
    status: 201,
    description: 'Auditor creado exitosamente.',
    type: PlanMejoramientoAuditorDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(
    @Res() res,
    @Body(new ParseObjectIdPipe(['plan_mejoramiento_id']))
    dto: PlanMejoramientoAuditorDto,
  ) {
    try {
      const auditor = await this.planMejoramientoAuditorService.post(dto);
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
  @ApiOperation({
    summary: 'Obtener todos los auditores de plan de mejoramiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todos los auditores.',
    type: [PlanMejoramientoAuditorDto],
  })
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const auditores =
        await this.planMejoramientoAuditorService.getAll(filterDto);
      const counts = await this.planMejoramientoAuditorService.count(filterDto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Peticion Exitosa',
        Data: auditores,
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
  @ApiOperation({
    summary: 'Obtener un auditor de plan de mejoramiento por Id',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el auditor.',
    type: PlanMejoramientoAuditorDto,
  })
  @ApiResponse({ status: 404, description: 'Auditor no encontrado.' })
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const auditor = await this.planMejoramientoAuditorService.getById(id);
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
  @ApiOperation({ summary: 'Actualizar un auditor de plan de mejoramiento' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: PlanMejoramientoAuditorDto })
  @ApiResponse({
    status: 200,
    description: 'Auditor actualizado exitosamente.',
    type: PlanMejoramientoAuditorDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Auditor no encontrado.' })
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body(new ParseObjectIdPipe(['plan_mejoramiento_id']))
    dto: PlanMejoramientoAuditorDto,
  ) {
    try {
      const auditor = await this.planMejoramientoAuditorService.put(id, dto);
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
  @ApiOperation({ summary: 'Eliminar un auditor de plan de mejoramiento' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Auditor eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Auditor no encontrado.' })
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.planMejoramientoAuditorService.delete(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Eliminacion Exitosa',
        Data: { _id: id },
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
