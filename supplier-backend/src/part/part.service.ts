import { Injectable } from '@nestjs/common';
import { createAggregatedPart, AggregatedPart } from '../aggregate-data';

@Injectable()
export class PartService {
  private readonly parts: AggregatedPart[] = [];

  findOne(partName: string): AggregatedPart {
    if (this.parts.length === 0) {
        this.parts.push(createAggregatedPart());
    }
    // if (partName == '0510210200') {
    //   return createAggregatedPart();
    // } else {
      return this.parts.find((x => x.name === partName));
    // }
  }
}
