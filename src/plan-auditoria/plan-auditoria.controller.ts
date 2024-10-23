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
  import {PlanAuditoriaService}from './plan-auditoria.service';
  import{PlanAuditoriaDTO} from './dto/plan-auditoria.dto'
import{FilterDto }from '../filters/filters.dto'
@Controller('plan-auditoria')
export class PlanAuditoriaController {
  constructor(private planAuditoriaService: PlanAuditoriaService) {}

  @Post()
  async post(@Res() res, @Body() PlanAuditoriaDTO: PlanAuditoriaDTO) {
    try {
      const planAuditoria = await this.planAuditoriaService.post(PlanAuditoriaDTO);
      res.status(HttpStatus.CREATED).json({
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Registration successful',
        Data: planAuditoria,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error service Post: The request contains an incorrect data type or an invalid parameter',
        Data: error.message,
      });
    }
  }

  @Get()
  async getAll(@Res() res, @Query() filterDto: FilterDto) {
    try {
      const planAuditorias = await this.planAuditoriaService.getAll(filterDto);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Request successful',
        Data: planAuditorias,
      });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error service GetAll: The request contains an incorrect parameter or no record exist',
        Data: error.message,
      });
    }
  }

  @Get('/:id')
  async getById(@Res() res, @Param('id') id: string) {
    try {
      const planAuditorias = await this.planAuditoriaService.getById(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Request successful',
        Data: planAuditorias,
      });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message:
          'Error service GetOne: The request contains an incorrect parameter or no record exist',
        Data: error.message,
      });
    }
  }

  @Put('/:id')
  async put(
    @Res() res,
    @Param('id') id: string,
    @Body() PlanAuditoriaDTO: PlanAuditoriaDTO,
  ) {
    try {
      const planAuditorias = await this.planAuditoriaService.put(id, PlanAuditoriaDTO);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Update successful',
        Data: planAuditorias,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        Success: false,
        Status: HttpStatus.BAD_REQUEST,
        Message:
          'Error service Put: The request contains an incorrect data type or an invalid parameter',
        Data: error.message,
      });
    }
  }

  @Delete('/:id')
  async delete(@Res() res, @Param('id') id: string) {
    try {
      await this.planAuditoriaService.delete(id);
      res.status(HttpStatus.OK).json({
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Delete successful',
        Data: {
          _id: id,
        },
      });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Error service Delete: Request contains incorrect parameter',
        Data: error.message,
      });
    }
  }
}
