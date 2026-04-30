import { Expose, Transform, Type } from 'class-transformer';

// Type definitions to avoid ESLint Errors
interface ReportRelationObj {
  id?: string;
  created_at?: Date;
  start_time?: Date;
  end_time?: Date;
  trip_status?: string;
  distance?: string;
  start_odo?: string;
  end_odo?: string;
  start_battery?: string;
  end_battery?: string;
  power_station_name?: string;
  kw?: string;
  amount?: string;
  route?: { route_name?: string };
  vehicle?: {
    plate_number?: string;
    vehicle_model?: { model_name?: string; daily_trip_rate?: string };
  };
  driver?: { driver_name?: string; phone?: string };
  station?: { station_name?: string; branch?: { branches_name?: string } };
  trip_finances?: Array<{
    id?: string;
    rental_amount?: string;
    overtime_amount?: string;
    refund_amount?: string;
    total?: string;
    payment_status?: string;
  }>;
}

// ------------------------------------------------------
// Sub-classes for Grouping Data (Clean & Max Output)
// ------------------------------------------------------
class TripSummaryDto {
  @Expose() route_name!: string | null;
  @Expose() trip_status!: string | null;
  @Expose() start_time!: Date | null;
  @Expose() end_time!: Date | null;
  @Expose() distance_km!: string | null;
  @Expose() duration_hours!: string | null;
}

class AssetSummaryDto {
  @Expose() vehicle_plate!: string | null;
  @Expose() driver_name!: string | null;
  @Expose() station_branch!: string | null;
}

class EvUsageDto {
  @Expose() battery_usage!: string | null;
  @Expose() charging_station!: string | null;
  @Expose() kw_used!: string | null;
  @Expose() charging_cost!: string | null;
}

class FinanceSummaryDto {
  @Expose() base_rental_fee!: number;
  @Expose() overtime_fee!: number;
  @Expose() refund_or_discount!: number;
  @Expose() charging_cost!: number; // EV Charging cost ပါပေါင်းပြရန်
  @Expose() grand_total_due!: number;
  @Expose() payment_status!: string | null;
}

// ------------------------------------------------------
// Main Serializer
// ------------------------------------------------------
export class GetCustomerReportSerialize {
  @Expose() id!: string;

  @Expose()
  @Type(() => Date)
  report_generated_at!: Date;

  // 1. ခရီးစဉ် အကျဉ်းချုပ် (Trip Info)
  @Expose()
  @Transform(({ obj }: { obj: ReportRelationObj }) => ({
    route_name: obj.route?.route_name || 'Unknown Route',
    trip_status: obj.trip_status,
    start_time: obj.start_time,
    end_time: obj.end_time,
    distance_km:
      obj.distance ||
      `${Number(obj.end_odo || 0) - Number(obj.start_odo || 0)}`,
    duration_hours:
      obj.start_time && obj.end_time
        ? (
            (new Date(obj.end_time).getTime() -
              new Date(obj.start_time).getTime()) /
            (1000 * 60 * 60)
          ).toFixed(2) + ' Hrs'
        : '-',
  }))
  trip_summary!: TripSummaryDto;

  // 2. ကားနှင့် ယာဉ်မောင်း အချက်အလက်
  @Expose()
  @Transform(({ obj }: { obj: ReportRelationObj }) => ({
    vehicle_plate: obj.vehicle?.plate_number || '-',
    driver_name: obj.driver?.driver_name || '-',
    station_branch: `${obj.station?.station_name || '-'} (${obj.station?.branch?.branches_name || '-'})`,
  }))
  asset_summary!: AssetSummaryDto;

  // 3. EV သုံးစွဲမှုနှင့် အားသွင်းမှု အခြေအနေ
  @Expose()
  @Transform(({ obj }: { obj: ReportRelationObj }) => ({
    battery_usage: `Start: ${obj.start_battery || '-'}% -> End: ${obj.end_battery || '-'}%`,
    charging_station: obj.power_station_name || 'No charging during trip',
    kw_used: obj.kw ? `${obj.kw} KW` : '0 KW',
    charging_cost: obj.amount || '0',
  }))
  ev_usage!: EvUsageDto;

  // 4. ငွေကြေးဆိုင်ရာ အကျဉ်းချုပ် (Finance - Max Output)
  @Expose()
  @Transform(({ obj }: { obj: ReportRelationObj }) => {
    const finance =
      obj.trip_finances && obj.trip_finances.length > 0
        ? obj.trip_finances[0]
        : null;

    const baseRental = Number(finance?.rental_amount || 0);
    const overtime = Number(finance?.overtime_amount || 0);
    const refund = Number(finance?.refund_amount || 0);
    const evCost = Number(obj.amount || 0); // လမ်းမှာအားသွင်းခဲ့တဲ့ စရိတ်

    // Total ကြည့်တဲ့အခါ EV အားသွင်းစရိတ်ပါ Customers ဆီက တောင်းမှာလား (သို့) ကုမ္ပဏီက ကျခံတာလားပေါ်မူတည်ပြီး ပြင်နိုင်ပါတယ်။
    // အောက်ပါ တွက်နည်းသည် စုစုပေါင်း Customer ပေးရမည့်ငွေ (Base + OT + EV - Refund) ဖြစ်ပါသည်။
    const grandTotal = baseRental + overtime + evCost - refund;

    return {
      base_rental_fee: baseRental,
      overtime_fee: overtime,
      refund_or_discount: refund,
      charging_cost: evCost,
      grand_total_due:
        grandTotal > 0 ? grandTotal : Number(finance?.total || 0),
      payment_status: finance?.payment_status || 'No Invoice Yet',
    };
  })
  finance_summary!: FinanceSummaryDto;
}
