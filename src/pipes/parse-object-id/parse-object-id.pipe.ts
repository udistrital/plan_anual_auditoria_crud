import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

type AnyObj = Record<string, any>;

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  constructor(private readonly _fields: string[]) {}

  transform(value: AnyObj) {
    if (!value || typeof value !== 'object') return value;

    for (const field of this._fields) {
      const v = value[field];
      if (v === undefined || v === null) continue;

      // Soporta: string, array de strings
      if (Array.isArray(v)) {
        value[field] = v.map((item) => this._toObjectId(item, field));
      } else {
        value[field] = this._toObjectId(v, field);
      }
    }

    return value;
  }

  private _toObjectId(v: any, field: string): Types.ObjectId {
    if (v instanceof Types.ObjectId) return v;
    if (typeof v === 'string' && Types.ObjectId.isValid(v)) return new Types.ObjectId(v);
    throw new BadRequestException(`Field "${field}" must be a valid ObjectId`);
  }
}
