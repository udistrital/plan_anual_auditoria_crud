import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class NotificacionDTO {
  @ApiProperty({
    description: 'Nombre de la plantilla de correo utilizada para el envío',
    example: 'SISIFO_PLANTILLA_SOLICITUD',
  })
  readonly plantilla: string;

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
  readonly metadato: object;

  @ApiProperty({
    description: 'ObjectId del documento referenciado',
    example: '671aaa8a064222e6583d56e7',
    type: Types.ObjectId,
  })
  readonly referencia_id: Types.ObjectId;

  @ApiProperty({
    description: 'Tipo del documento referenciado',
    example: 'PAA',
  })
  readonly referencia_tipo: string;
}