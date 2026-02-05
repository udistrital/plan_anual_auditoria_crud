import { 
  Body, 
  Controller, 
  HttpStatus, 
  Post, 
  Put, 
  Param, 
  Res, 
} from '@nestjs/common';
import { 
  ApiBody, 
  ApiOperation, 
  ApiParam, 
  ApiResponse, 
  ApiTags 
} from '@nestjs/swagger';
import { AuditoriaGestionService } from './auditoria-gestion.service';
import { CreateAuditoriaGestionDto } from './dto/create-auditoria-gestion.dto';
import { AuditoriaEstadoDto } from 'src/auditoria-estado/dto/auditoria-estado.dto';

@ApiTags('auditoria-gestion')
@Controller('auditoria-gestion')
export class AuditoriaGestionController {
  constructor(private readonly auditoriaGestionService: AuditoriaGestionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva auditoria junto con su estado inicial' })
  @ApiBody({ type: CreateAuditoriaGestionDto })
  @ApiResponse({
    status: 201,
    description: 'La auditoria ha sido creada exitosamente.',
    type: CreateAuditoriaGestionDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async post(@Res() res, @Body() createAuditoriaGestionDto: CreateAuditoriaGestionDto) {
    try {
      const auditoria = 
        await this.auditoriaGestionService.post(createAuditoriaGestionDto);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registro Exitoso',
        Data: auditoria,
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

  @Put('/:id')
  @ApiOperation({ summary: 'Actualizar los estados de las auditorias existentes en un plan' })
  @ApiParam({ name: 'id', type: String, description: 'ID del plan de auditorias a actualizar' })
  @ApiBody({ type: AuditoriaEstadoDto })
  @ApiResponse({
    status: 200,
    description: 'Los estados de las auditorias han sido actualizados exitosamente.',
    type: AuditoriaEstadoDto,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Plan de Auditorias no encontrado.' })
  async put(@Res() res, @Param('id') id: string, @Body() auditoriaEstado: AuditoriaEstadoDto) {
    try {
      const auditoria = this.auditoriaGestionService.put(id, auditoriaEstado);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actualización Exitosa',
        Data: auditoria,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error servicio Update: la solicitud contiene un tipo de dato incorrecto o un parametro invalido',
        Data: error.message,
      });
    }
  }

}
