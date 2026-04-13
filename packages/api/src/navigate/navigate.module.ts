import { Module } from '@nestjs/common';
import { NavigateController } from './navigate.controller';
import { NavigateService } from './navigate.service';

@Module({
  controllers: [NavigateController],
  providers: [NavigateService],
})
export class NavigateModule {}
