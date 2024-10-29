import { ApiProperty } from '@nestjs/swagger';

export class ActividadDTO{
    @ApiProperty()
    readonly auditoriaId:string;

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
    readonly medioId:number;

    @ApiProperty()
    readonly carpeta:string;

    @ApiProperty()
    activo: boolean;

   @ApiProperty()
    fechaCreacion: Date;

   @ApiProperty()
    fechaModificacion: Date;

}