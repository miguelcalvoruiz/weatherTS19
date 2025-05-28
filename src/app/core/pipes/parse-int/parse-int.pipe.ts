import { Pipe, PipeTransform } from '@angular/core';

/**
 * Convierte un valor a entero utilizando parseInt.
 */
@Pipe({
  name: 'parseInt'
})
export class ParseIntPipe implements PipeTransform {

  transform(value: any): number {
    return parseInt(value, 10);
  }

}
