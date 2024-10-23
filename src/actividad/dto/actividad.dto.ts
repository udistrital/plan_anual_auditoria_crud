import { ApiProperty } from '@nestjs/swagger';

export class ActividadDTO{
    @ApiProperty()
    readonly auditoria_id:number;

    @ApiProperty()
    readonly titulo:string;
    
    @ApiProperty()
    readonly fechaInicio:Date;

    @ApiProperty()
    readonly fechaFin:Date;

    @ApiProperty()
    readonly referencia:string;

    @ApiProperty()
    readonly descripcion:string;

    @ApiProperty()
    readonly folio:number;

    @ApiProperty()
    readonly medio_id:number;

    @ApiProperty()
    readonly carpeta:string;

    @ApiProperty()
    activo: boolean;

   @ApiProperty()
    fecha_creacion: Date;

   @ApiProperty()
    fecha_modificacion: Date;

}