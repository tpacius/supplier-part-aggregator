import { Controller, Get, Param } from '@nestjs/common';
import { PartService } from './part.service';

@Controller('part')
export class PartController {
  constructor(private readonly partsService: PartService) {}

  @Get(':partName')
  findOne(@Param('partName') partName: string) {
    return this.partsService.findOne(partName);
  }
}
