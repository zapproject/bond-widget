import { Pipe, PipeTransform } from '@angular/core';
import { formatPrice } from '../shared/utils';

@Pipe({
  name: 'formatPrice'
})
export class FormatPricePipe implements PipeTransform {

  transform(value: any): any {
    return formatPrice(value);
  }

}
