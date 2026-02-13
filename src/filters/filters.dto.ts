import { ApiProperty } from '@nestjs/swagger';

export class FilterDto {
  @ApiProperty({
    required: false,
    description: ` query-Filter.e.g.col1:v1,col2:v2… `,
  })
  readonly query: string;

  @ApiProperty({
    required: false,
    description: 'fields - Fields returned. e.g. col1,col2 …',
  })
  readonly fields: string;

  @ApiProperty({
    required: false,
    description: 'sortby - Sorted-by fields. e.g. col1,col2 …',
  })
  readonly sortby: string;

  @ApiProperty({
    required: false,
    description:
      'order - Order corresponding to each sortby field, if single value, apply to all sortby fields. e.g. desc,asc …',
  })
  readonly order: string;

  @ApiProperty({
    required: false,
    description: 'limit - Limit the size of result set. Must be an integer',
  })
  readonly limit: string;

  @ApiProperty({
    required: false,
    description: 'offset - Start position of result set. Must be an integer',
  })
  readonly offset: string;

  @ApiProperty({
    required: false,
    description: 'populate - show subqueries. Must be a boolean',
  })
  readonly populate: string;
}
