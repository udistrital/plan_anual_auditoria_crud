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
            case 'in':
              const list = tup[1].split('|');
              queryObj[key[0]] = { $in: [...list.map((v) => castValue(v))] };
              break;
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
        } else {
          if (key[0].endsWith('id')) {
            queryObj[key[0]] = {
              $in: [
                tup[1],
                Types.ObjectId.isValid(tup[1]) ? new Types.ObjectId(tup[1]) : null,
              ].filter(Boolean),
            };
          } else {
            queryObj[key[0]] = castValue(tup[1]);
          }
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
    //Filtro de ordenamiento
    const sortbyArray = [];
    if (this.filterDto.sortby) {
      const sortbyProperties = this.filterDto.sortby.split(',');
      if (this.filterDto.order) {
        const orderProperties = this.filterDto.order.split(',');
        if (orderProperties.length == 1) {
          //Si order solo contiene un valor ordena todos los campos de acuerdo al mismo
          const orderTerm = this.filterDto.order == 'desc' ? -1 : 1;
          sortbyProperties.forEach(function (property) {
            sortbyArray.push([property, orderTerm]);
          });
        } else if (sortbyProperties.length == orderProperties.length) {
          //Si order y sortby tienen el mismo tamaño, se ordena cada campo de acuerdo al orden específico
          for (let i = 0; i < sortbyProperties.length; i++) {
            sortbyArray.push([
              sortbyProperties[i],
              orderProperties[i] == 'desc' ? -1 : 1,
            ]);
          }
        } else {
          //Si order y sortby tienen tamaños diferentes, se ignora el orden definido y se ordena de forma ascendente
          sortbyProperties.forEach(function (property) {
            sortbyArray.push([property, 1]);
          });
        }
      } else {
        //Si order no está definido, por defecto todos los campos son ordenados ascendentemente
        sortbyProperties.forEach(function (property) {
          sortbyArray.push([property, 1]);
        });
      }
    }
    return sortbyArray;
  }

  getLimitAndOffset(): object {
    return {
      skip: parseInt(
        this.filterDto.offset !== undefined ? this.filterDto.offset : '0',
      ),
      limit: parseInt(
        this.filterDto.limit !== undefined ? this.filterDto.limit : '10',
      ),
    };
  }

  isPopulated(): boolean {
    return this.filterDto.populate === 'true';
  }
}

function castValue(value: string): any {
  if (value) {
    const datatype = value.match(/<[^>]+>/);
    if (datatype === null) {
      return value;
    } else {
      const val = value.slice(0, value.length - 3);
      switch (datatype[0][1]) {
        case 'n':
          return Number(val);
          break;
        case 'd':
          return new Date(val);
          break;
        case 'b':
          return value.toLowerCase() === 'true';
          break;
        default:
          break;
      }
    }
  } else {
    return null;
  }
}