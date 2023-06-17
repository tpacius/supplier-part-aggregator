import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PartController } from './part/part.controller';
import { PartService } from './part/part.service';
import { PartModule } from './part/part.module';

@Module({
  imports: [PartModule],
  controllers: [AppController, PartController],
  providers: [AppService, PartService],
})
export class AppModule {}
