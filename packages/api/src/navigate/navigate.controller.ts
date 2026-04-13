import {
  Controller,
  Get,
  Post,
  Query,
  Body,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public';
import { NavigateService } from './navigate.service';

@Controller('navigate')
export class NavigateController {
  constructor(private readonly navigateService: NavigateService) {}

  @Public()
  @Get('chargers')
  searchChargers(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('maxResults') maxResults?: string,
    @Query('connectorType') connectorType?: string,
    @Query('minPower') minPower?: string,
  ) {
    return this.navigateService.searchChargers({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: radius ? parseFloat(radius) : undefined,
      maxResults: maxResults ? parseInt(maxResults, 10) : undefined,
      connectorType,
      minPower: minPower ? parseFloat(minPower) : undefined,
    });
  }

  @Public()
  @Post('route')
  planRoute(
    @Body()
    body: {
      vehicleId: string;
      origin: { lat: number; lng: number };
      destination: { lat: number; lng: number };
      startSoc: number;
    },
  ) {
    return this.navigateService.planRoute(body);
  }

  @Public()
  @Get('vehicles')
  listVehicles(@Query('search') search?: string) {
    return this.navigateService.listVehicles(search);
  }
}
