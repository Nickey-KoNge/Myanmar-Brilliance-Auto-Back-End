import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { RentalOperation } from '../master-rental/rental-operation/entities/rental-operation.entity';

export interface ReportableTrip extends RentalOperation {
  report_generated_at?: Date;
}

export interface VehicleWithPlate {
  plate_number?: string;
  vehicle_name?: string;
}

export interface DriverWithName {
  driver_name?: string;
  phone?: string;
}

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(RentalOperation)
    private readonly rentalOpRepo: Repository<RentalOperation>,
  ) {}

  async getCustomerTripInvoiceInfo(
    rentalOpId: string,
  ): Promise<ReportableTrip> {
    const tripRecord = await this.rentalOpRepo.findOne({
      where: { id: rentalOpId },
      relations: [
        'route',
        'vehicle',
        'vehicle.vehicle_model',
        'driver',
        'station',
        'station.branch',
        'trip_finances',
      ],
    });

    if (!tripRecord) {
      throw new NotFoundException(
        `Trip data with ID ${rentalOpId} not found for reporting.`,
      );
    }

    const reportableTrip = tripRecord as ReportableTrip;
    reportableTrip.report_generated_at = new Date();

    return reportableTrip;
  }

  async getVehiclePerformanceReport(
    vehicleId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const whereClause: FindOptionsWhere<RentalOperation> = {
      vehicle_id: vehicleId,
      trip_status: 'Completed',
    };

    if (startDate && endDate) {
      whereClause.start_time = Between(
        new Date(startDate),
        new Date(`${endDate} 23:59:59`),
      );
    }

    const trips = await this.rentalOpRepo.find({
      where: whereClause,
      relations: ['route', 'driver', 'vehicle', 'trip_finances'],
      order: { start_time: 'ASC' },
    });

    if (!trips.length) {
      throw new NotFoundException(
        'No completed trips found for this vehicle in the selected date range.',
      );
    }

    let totalBaseIncome = 0;
    let totalOvertime = 0;
    let totalRefund = 0;
    let totalChargingCost = 0;
    let totalDistance = 0;

    const formattedTrips = trips.map((trip) => {
      const finance = trip.trip_finances?.[0];
      const base = Number(finance?.rental_amount || 0);
      const ot = Number(finance?.overtime_amount || 0);
      const refund = Number(finance?.refund_amount || 0);
      const chargeCost = Number(trip.amount || 0);
      const distance = Number(
        trip.distance || Number(trip.end_odo) - Number(trip.start_odo) || 0,
      );

      totalBaseIncome += base;
      totalOvertime += ot;
      totalRefund += refund;
      totalChargingCost += chargeCost;
      totalDistance += distance;

      // Safe casting ဖြင့် driver_name ကို ခေါ်ယူခြင်း
      const driverData = trip.driver as unknown as DriverWithName;

      return {
        trip_id: trip.id,
        date: trip.start_time,
        route: trip.route?.route_name,
        driver: driverData?.driver_name,
        distance_km: distance,
        income: base + ot - refund,
        charging_cost: chargeCost,
      };
    });

    const grossRevenue = totalBaseIncome + totalOvertime;
    const netProfit = grossRevenue - totalChargingCost - totalRefund;

    // Safe casting ဖြင့် plate_number ကို ခေါ်ယူခြင်း
    const vehicleData = trips[0].vehicle as unknown as VehicleWithPlate;

    return {
      report_type: 'Vehicle Performance & Financial Report',
      vehicle_info: {
        plate_number: vehicleData?.plate_number,
        vehicle_name: vehicleData?.vehicle_name,
      },
      period: { start: startDate || 'All Time', end: endDate || 'All Time' },
      summary: {
        total_trips: trips.length,
        total_distance_km: totalDistance,
        financials: {
          gross_revenue: grossRevenue,
          total_charging_expense: totalChargingCost,
          total_refunds: totalRefund,
          net_profit: netProfit,
        },
      },
      trip_details: formattedTrips,
    };
  }

  // ၂။ ယာဉ်မောင်း ID ဖြင့် လုပ်ဆောင်ချက် ဆွဲထုတ်ခြင်း (Driver Performance Report)
  async getDriverPerformanceReport(
    driverId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const whereClause: FindOptionsWhere<RentalOperation> = {
      driver_id: driverId,
      trip_status: 'Completed',
    };

    if (startDate && endDate) {
      whereClause.start_time = Between(
        new Date(startDate),
        new Date(`${endDate} 23:59:59`),
      );
    }

    const trips = await this.rentalOpRepo.find({
      where: whereClause,
      relations: ['route', 'vehicle', 'driver', 'trip_finances'],
      order: { start_time: 'ASC' },
    });

    if (!trips.length) {
      throw new NotFoundException(
        'No completed trips found for this driver in the selected date range.',
      );
    }

    let totalIncomeGenerated = 0;
    let totalDistance = 0;

    const formattedTrips = trips.map((trip) => {
      const finance = trip.trip_finances?.[0];
      const income =
        Number(finance?.rental_amount || 0) +
        Number(finance?.overtime_amount || 0) -
        Number(finance?.refund_amount || 0);
      const distance = Number(
        trip.distance || Number(trip.end_odo) - Number(trip.start_odo) || 0,
      );

      totalIncomeGenerated += income;
      totalDistance += distance;

      const vehicleData = trip.vehicle as unknown as VehicleWithPlate;

      return {
        trip_id: trip.id,
        date: trip.start_time,
        route: trip.route?.route_name,
        vehicle: vehicleData?.plate_number,
        distance_km: distance,
        income_generated: income,
      };
    });

    const driverData = trips[0].driver as unknown as DriverWithName;

    return {
      report_type: 'Driver Performance Report',
      driver_info: {
        name: driverData?.driver_name,
        phone: driverData?.phone,
      },
      period: { start: startDate || 'All Time', end: endDate || 'All Time' },
      summary: {
        total_trips_driven: trips.length,
        total_distance_km: totalDistance,
        total_income_generated: totalIncomeGenerated,
      },
      trip_details: formattedTrips,
    };
  }

  // ----------------------------------------------------------------------------------
  // ၃။ ကားတစ်စီးချင်းစီ၏ အသေးစိတ်မှတ်တမ်း (ပုံ ၁ - Log Sheet ပုံစံ - Odo, Battery, Charging, ညအိပ် အစုံပါသည်)
  // ----------------------------------------------------------------------------------
  async getDetailedVehicleLog(
    vehicleId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const whereClause: FindOptionsWhere<RentalOperation> = {
      vehicle_id: vehicleId,
      trip_status: 'Completed',
    };

    if (startDate && endDate) {
      whereClause.start_time = Between(
        new Date(startDate),
        new Date(`${endDate} 23:59:59`),
      );
    }

    const trips = await this.rentalOpRepo.find({
      where: whereClause,
      relations: ['vehicle', 'driver', 'trip_finances'],
      order: { start_time: 'ASC' }, // နေ့စွဲအလိုက် အစဉ်လိုက်စီရန်
    });

    if (!trips.length) {
      throw new NotFoundException('No log records found for this vehicle.');
    }

    const vehicleData = trips[0].vehicle as unknown as VehicleWithPlate;

    const logSheet = trips.map((trip) => {
      const finance = trip.trip_finances?.[0];
      const ownerFee = Number(finance?.rental_amount || 0); // အုံနာကြေး

      return {
        trip_id: trip.id,
        date: trip.start_time?.toISOString().split('T')[0], // ဥပမာ: 2026-02-01

        // အချိန်မှတ်တမ်း
        start_time: trip.start_time,
        end_time: trip.end_time,

        // ကီလိုမီတာ (Odo)
        start_km: trip.start_odo || '-',
        end_km: trip.end_odo || '-',
        distance:
          trip.distance || Number(trip.end_odo) - Number(trip.start_odo) || 0,

        // ဘက်ထရီ
        start_battery_percent: trip.start_battery || '-',
        end_battery_percent: trip.end_battery || '-',

        // အားသွင်းမှု (Charging)
        charging_kw: trip.kw || '-',
        charging_amount: trip.amount || '-', // အားသွင်းခ

        // အုံနာကြေးနှင့် အခြား
        owner_fee: ownerFee,
        overnight_stay:
          trip.overnight_count && Number(trip.overnight_count) > 0
            ? `Yes (${trip.overnight_count} night)`
            : 'No', // ညအိပ်လား / ပြန်လား
        remark: trip.description || '-',
      };
    });

    return {
      report_type: 'Detailed Vehicle Log Sheet',
      vehicle_plate: vehicleData?.plate_number || 'Unknown',
      period: { start: startDate || 'All Time', end: endDate || 'All Time' },
      total_records: trips.length,
      logs: logSheet,
    };
  }

  // ----------------------------------------------------------------------------------
  // ၄။ နေ့စဉ် ကားအားလုံး၏ အုံနာကြေး စာရင်းချုပ် (ပုံ ၂ နှင့် ၃ - Daily Fleet Income Summary)
  // ----------------------------------------------------------------------------------
  async getDailyFleetIncomeReport(targetDate: string) {
    // သတ်မှတ်ထားသော နေ့တစ်နေ့တည်းရှိ Trip များကိုသာ ရှာမည်
    const startOfDay = new Date(`${targetDate} 00:00:00`);
    const endOfDay = new Date(`${targetDate} 23:59:59`);

    const trips = await this.rentalOpRepo.find({
      where: {
        start_time: Between(startOfDay, endOfDay),
        trip_status: 'Completed',
      },
      relations: ['vehicle', 'trip_finances'],
      order: {
        vehicle: {
          id: 'ASC',
        },
      },
    });

    if (!trips.length) {
      throw new NotFoundException(`No trips found for the date: ${targetDate}`);
    }

    let grandTotalOwnerFee = 0;

    const fleetList = trips.map((trip, index) => {
      const finance = trip.trip_finances?.[0];
      const ownerFee = Number(finance?.rental_amount || 0); // အုံနာကြေး

      grandTotalOwnerFee += ownerFee;

      const vehicleData = trip.vehicle as unknown as VehicleWithPlate;

      return {
        no: index + 1,
        plate_number: vehicleData?.plate_number || 'Unknown',
        owner_fee: ownerFee, // ဥပမာ - 90000 (သို့) 100000
        remark: trip.description || '', // မှတ်ချက် (ဥပမာ - နား၊ ဝပ်ရှော့)
      };
    });

    return {
      report_type: 'Daily Fleet Income (Owner Fee) Summary',
      date: targetDate, // ဥပမာ ( 25 . 1 . 26 )
      total_vehicles_operated: fleetList.length,
      grand_total_income: grandTotalOwnerFee, // စုစုပေါင်း အုံနာကြေး (ဥပမာ - 2000000)
      details: fleetList,
    };
  }
}
