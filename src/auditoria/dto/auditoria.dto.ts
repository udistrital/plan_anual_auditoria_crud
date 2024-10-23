import { ApiProperty } from '@nestjs/swagger';
export class Auditoria extends Document {
    @ApiProperty()
      readonly plan_uditoria_id: number;
 
    @ApiProperty()
      readonly titulo: string;
 
    @ApiProperty()
      readonly tipo_evaluacion_id: number;
 
    @ApiProperty()
      readonly cronograma_actividad: string[] = [];;
 
    @ApiProperty()
      readonly estado_id: number;
 
    @ApiProperty()
      readonly no_auditoria: number;
 
    @ApiProperty()
      readonly consecutivo_OCI: string;
 
    @ApiProperty()
      readonly consecutivo_IE: string;
 
    @ApiProperty()
      readonly tipo_id: number;
 
    @ApiProperty()
      readonly macroproceso: number;
 
    @ApiProperty()
      readonly lider: number;
 
    @ApiProperty()
     readonly responsable: number;
 
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
     readonly rec_tecnologico:string;
 
     @ApiProperty()
     readonly rec_humano:string;
 
     @ApiProperty()
     readonly rec_fisico:string;
     
     @ApiProperty()
     activo: boolean;
 
     @ApiProperty()
     fecha_creacion: Date;
 
     @ApiProperty()
     fecha_modificacion: Date;
    
 }