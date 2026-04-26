import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripPrice } from './entities/trip-price.entity';
import { TripPriceService } from './trip-price.service';
import { TripPriceController } from './trip-price.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TripPrice])],
  controllers: [TripPriceController],
  providers: [TripPriceService],
  exports: [TripPriceService],
})
export class TripPriceModule {}
