import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizeFirstWord',
  standalone: true,
  pure: true
})
export class CapitalizeFirstWordPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';
    const words = value.split(' ');
    const first = words[0];
    const capitalizedFirst = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
    if (words.length > 1) {
      return `${capitalizedFirst} ${words.slice(1).join(' ')}`;
    }
    return capitalizedFirst;
  }

}
