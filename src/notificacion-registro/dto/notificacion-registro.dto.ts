import { ApiProperty } from '@nestjs/swagger';

export class NotificacionRegistroDTO {
  @ApiProperty()
  readonly destinatario: string;

  @ApiProperty()
  readonly fecha_envio: Date;

  @ApiProperty()
  readonly metadatos: object;

  @ApiProperty({
    description: 'ObjectId del documento referenciado',
    example: '671aaa8a064222e6583d56e7',
  })
  readonly referencia_id: string;
}