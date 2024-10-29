import { ApiProperty } from '@nestjs/swagger';

export class AuditoriaDTO {
    @ApiProperty()
      readonly planAuditoriaId: string;
 
    @ApiProperty()
      readonly titulo: string;
 
    @ApiProperty()
      readonly tipoEvaluacionId: number;
 
    @ApiProperty()
      readonly cronogramaId: number[] = [];;
 
    @ApiProperty()
      readonly estadoId: number;
 
    @ApiProperty()
      readonly noAuditoria: number;
 
    @ApiProperty()
      readonly consecutivoOCI: string;
 
    @ApiProperty()
      readonly consecutivoIE: string;
 
    @ApiProperty()
      readonly tipoId: number;
 
    @ApiProperty()
      readonly macroproceso: number;
 
    @ApiProperty()
      readonly liderId: number;
 
    @ApiProperty()
     readonly responsableId: number;
 
     @ApiProperty()
     readonly fechaInicio:Date;
 
     @ApiProperty()
     readonly fechaFin:Date;
 
     @ApiProperty()
     readonly objetivo:string;
 
     @ApiProperty()
     readonly alcance:string;
 
     @ApiProperty()
     readonly criterio:string;
 
     @ApiProperty()
     readonly recTecnologico:string;
 
     @ApiProperty()
     readonly recHumano:string;
 
     @ApiProperty()
     readonly recFisico:string;
     
     @ApiProperty()
     activo: boolean;
 
     @ApiProperty()
     fechaCreacion: Date;
 
     @ApiProperty()
     fechaModificacion: Date;
    
 }