import { FilterDto } from './filters.dto';
import { Types } from 'mongoose';

export class FiltersService {
  constructor(private readonly filterDto: FilterDto) {}

  getQuery(): object {
    //Filtro de consulta campo:valor (selección)
    const queryObj = {};
    if (this.filterDto.query) {
      const queryProperties = this.filterDto.query.split(',');
      queryProperties.forEach(function (property) {
        const tup = property.split(/:(.+)/);
        const key = tup[0].split(/__(.+)/);
        if (key[1]) {
          switch (key[1]) {
            case 'icontains':
              queryObj[key[0]] = { $regex: new RegExp(tup[1], 'i') };
              break;
            case 'contains':
              queryObj[key[0]] = { $regex: new RegExp(tup[1]) };
              break;
            case 'gt':
              queryObj[key[0]] = { $gt: castValue(tup[1]) };
              break;
            case 'gte':
              queryObj[key[0]] = { $gte: castValue(tup[1]) };
              break;
            case 'lt':
              queryObj[key[0]] = { $lt: castValue(tup[1]) };
              break;
            case 'lte':
              queryObj[key[0]] = { $lte: castValue(tup[1]) };
              break;
            case 'in': {
              const list = tup[1].split('|');
              if (key[0].endsWith('id')) {
                queryObj[key[0]] = {
                  $in: [...list.map((v) => parseObjectId(v))],
                };
              } else {
                queryObj[key[0]] = { $in: [...list.map((v) => castValue(v))] };
              }
              break;
            }
            case 'not':
              queryObj[key[0]] = { $ne: castValue(tup[1]) };
              break;
            case 'inarray':
              queryObj[key[0]] = { $in: [castValue(tup[1])] };
              break;
            case 'isnull':
              if (tup[1].toLowerCase() === 'true') {
                queryObj[key[0]] = null;
              } else {
                queryObj[key[0]] = { $ne: null };
              }
              break;
            default:
              break;
          }
        } else if (key[0].endsWith('id')) {
          queryObj[key[0]] = {
            $in: [tup[1], parseObjectId(tup[1])].filter(Boolean),
          };
        } else {
          queryObj[key[0]] = castValue(tup[1]);
        }
      });
    }
    return queryObj;
  }

  getFields(): object {
    //Filtro de consulta por campo (proyección)
    const fieldsObj = {};
    if (this.filterDto.fields) {
      const fieldsProperties = this.filterDto.fields.split(',');
      fieldsProperties.forEach(function (property) {
        fieldsObj[property] = 1;
      });
    }
    return fieldsObj;
  }

  getSortBy(): any[] {
    const sortbyArray: any[] = [];

    const sortby = this.filterDto.sortby;
    if (!sortby) return sortbyArray;

    const sortbyProperties = sortby.split(',');

    const order = this.filterDto.order;
    const orderProperties = order ? order.split(',') : [];

    // Caso 1: sin order => ascendente por defecto
    if (!order) {
      return this.buildDefaultSort(sortbyProperties);
    }

    // Caso 2: un solo orden para todos
    if (orderProperties.length === 1) {
      const orderValue = order === 'desc' ? -1 : 1;
      return sortbyProperties.map((prop) => [prop, orderValue]);
    }

    // Caso 3: match 1 a 1
    if (sortbyProperties.length === orderProperties.length) {
      return sortbyProperties.map((prop, i) => [
        prop,
        orderProperties[i] === 'desc' ? -1 : 1,
      ]);
    }

    // Caso 4: mismatch => default asc
    return this.buildDefaultSort(sortbyProperties);
  }

  private buildDefaultSort(properties: string[]): any[] {
    return properties.map((prop) => [prop, 1]);
  }

  getLimitAndOffset(): object {
    return {
      skip: parseInt(this.filterDto.offset ?? '0'),
      limit: parseInt(this.filterDto.limit ?? '10'),
    };
  }

  isPopulated(): boolean {
    return this.filterDto.populate === 'true';
  }
}

function parseObjectId(id: string) {
  return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : castValue(id);
}

function castValue(value: string): any {
  if (!value) {
    return null;
  }

  const start = value.indexOf('<');
  const end = value.indexOf('>');

  if (start === -1 || end === -1 || end <= start + 1) {
    return value;
  }

  const datatype = value.slice(start + 1, end);
  const val = value.slice(0, start);

  switch (datatype[0]) {
    case 'n':
      return Number(val);

    case 'b':
      return val === 'true';

    case 's':
      return String(val);

    default:
      return value;
  }
}
