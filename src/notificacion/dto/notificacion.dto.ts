import { ApiProperty } from '@nestjs/swagger';

export class NotificacionDTO {
  @ApiProperty({
    description: 'Nombre de la plantilla de correo utilizada para el envío',
    example: 'SISIFO_PLANTILLA_SOLICITUD',
  })
  readonly template: string;

  @ApiProperty()
  readonly fecha_envio: Date;

  @ApiProperty({
    description:
      'Metadatos del evento de notificación, incluye destinatarios_to, destinatarios_cc y destinatarios_bcc como listas',
    example: {
      tipo_notificacion: 'solicitud_aprobacion_paa',
      vigencia: '2025',
      destinatarios_to: ['jefe@udistrital.edu.co'],
      destinatarios_cc: [],
      destinatarios_bcc: [],
    },
  })
  readonly metadatos: object;

  @ApiProperty({
    description: 'ObjectId del documento referenciado',
    example: '671aaa8a064222e6583d56e7',
  })
  readonly referencia_id: string;
}