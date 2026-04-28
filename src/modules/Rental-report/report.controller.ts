import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AtGuard } from 'src/common/guards/at.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { ReportService } from './report.service';
import { GetCustomerReportSerialize } from './serialize/get-customer-report.serialize';

@Controller('reports')
@UseGuards(AtGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // ၁။ Single Trip Invoice (အရင်လုပ်ခဲ့သည့် အပိုင်း)
  @Get('customer-invoice/:tripId')
  @Serialize(GetCustomerReportSerialize)
  async getCustomerInvoice(@Param('tripId') tripId: string) {
    return await this.reportService.getCustomerTripInvoiceInfo(tripId);
  }

  @Get('vehicle/:vehicleId')
  // မှတ်ချက်: ဤ API သည် Service မှ တွက်ချက်ပြီးသား JSON ကို တိုက်ရိုက်ထုတ်ပေးမည်ဖြစ်၍ Serializer ထပ်မလိုပါ။
  async getVehicleReport(
    @Param('vehicleId') vehicleId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.reportService.getVehiclePerformanceReport(
      vehicleId,
      startDate,
      endDate,
    );
  }

  // ၃။ Driver Report (ယာဉ်မောင်းတစ်ဦးချင်းစီ၏ Performance)
  @Get('driver/:driverId')
  async getDriverReport(
    @Param('driverId') driverId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.reportService.getDriverPerformanceReport(
      driverId,
      startDate,
      endDate,
    );
  }

  // ၄။ Detailed Vehicle Log ( Odo, Battery, Charging အကုန်ပါသော မှတ်တမ်း)
  @Get('vehicle-log/:vehicleId')
  async getDetailedVehicleLog(
    @Param('vehicleId') vehicleId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.reportService.getDetailedVehicleLog(
      vehicleId,
      startDate,
      endDate,
    );
  }

  // ၅။ Daily Fleet Income (နေ့စဉ် ကားအားလုံး၏ အုံနာကြေးချုပ်)
  @Get('daily-fleet-income')
  async getDailyFleetIncome(@Query('date') date: string) {
    if (!date) {
      return {
        error:
          'Please provide a date query parameter. Example: ?date=2026-01-25',
      };
    }
    return await this.reportService.getDailyFleetIncomeReport(date);
  }
}
