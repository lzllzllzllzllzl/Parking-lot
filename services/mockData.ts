import { ParkingDataPoint, WeatherCondition, DayType, ParkingLot } from '../types';

// Constants for simulation
const TOTAL_SPOTS = 200;
const START_DATE = new Date('2023-01-01');
const DAYS_TO_SIMULATE = 60;

export const MOCK_PARKING_LOTS: ParkingLot[] = [
  { id: '1', name: 'Central Plaza Garage', lat: 30, lng: 10, totalSpots: 200, currentAvailable: 45, baseRate: 10 },
  { id: '2', name: 'Tech Park Zone A', lat: 60, lng: 40, totalSpots: 150, currentAvailable: 120, baseRate: 8 },
  { id: '3', name: 'Riverside Walk', lat: 20, lng: 70, totalSpots: 80, currentAvailable: 5, baseRate: 15 },
];

export const generateHistoricalData = (): ParkingDataPoint[] => {
  const data: ParkingDataPoint[] = [];
  
  for (let d = 0; d < DAYS_TO_SIMULATE; d++) {
    const currentDate = new Date(START_DATE.getTime() + d * 24 * 60 * 60 * 1000);
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dayType = isWeekend ? DayType.Weekend : DayType.Weekday;
    
    // Simulate weather pattern (simple Markov-ish chain)
    let weather = Math.random() > 0.7 ? WeatherCondition.Rainy : WeatherCondition.Sunny;
    if (Math.random() > 0.9) weather = WeatherCondition.Stormy;

    // 15-minute intervals = 96 blocks
    for (let i = 0; i < 96; i++) {
      const hour = Math.floor(i / 4);
      const minute = (i % 4) * 15;
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Base demand pattern (Peak at 9am and 6pm for weekdays)
      let demandFactor = 0;
      if (dayType === DayType.Weekday) {
        if (hour >= 8 && hour <= 9) demandFactor = 0.9; // Morning rush
        else if (hour >= 17 && hour <= 19) demandFactor = 0.8; // Evening rush
        else if (hour >= 10 && hour <= 16) demandFactor = 0.7; // Work day
        else demandFactor = 0.1; // Night
      } else {
        if (hour >= 11 && hour <= 20) demandFactor = 0.6; // Weekend shopping
        else demandFactor = 0.2;
      }

      // Weather impact: Bad weather increases demand (people drive instead of walk/transit)
      // HOWEVER, the prompt says "Paper finds severe weather increases availability". 
      // Let's follow the prompt's specific academic finding: Bad weather -> Higher Availability (People stay home).
      if (weather === WeatherCondition.Rainy || weather === WeatherCondition.Stormy) {
        demandFactor *= 0.7; // Reduce demand, increase availability
      }

      // Random noise
      const noise = (Math.random() - 0.5) * 0.1;
      
      const occupied = Math.floor(TOTAL_SPOTS * (demandFactor + noise));
      const available = Math.max(0, TOTAL_SPOTS - occupied);

      data.push({
        date: currentDate.toISOString().split('T')[0],
        time: timeStr,
        timestamp: currentDate.getTime() + i * 15 * 60 * 1000,
        availability: available,
        totalSpots: TOTAL_SPOTS,
        weather,
        dayType,
        rate: 10 // Base rate
      });
    }
  }
  return data;
};