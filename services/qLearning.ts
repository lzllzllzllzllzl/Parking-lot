import { ParkingDataPoint, QTableEntry, WeatherCondition, DayType, PredictionResult } from '../types';

// Hyperparameters
const ALPHA = 0.1; // Learning rate
const GAMMA = 0.9; // Discount factor
const EPSILON = 0.1; // Exploration rate

// Actions for the Parking Management System
// 0: Maintain Rate (Neutral)
// 1: Increase Rate (Discourage parking to free up spots)
// 2: Decrease Rate (Encourage parking to fill spots)
export enum Action {
  Maintain = 0,
  Increase = 1,
  Decrease = 2
}

export class QLearningAgent {
  private qTable: Map<string, number[]>;

  constructor() {
    this.qTable = new Map();
  }

  // Helper to generate state key
  private getStateKey(timeBlock: number, weather: WeatherCondition, dayType: DayType): string {
    return `${timeBlock}-${weather}-${dayType}`;
  }

  private getTimeBlock(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 4 + Math.floor(m / 15);
  }

  // Initialize Q-Table with 0s
  public initialize(data: ParkingDataPoint[]) {
    data.forEach(point => {
      const block = this.getTimeBlock(point.time);
      const key = this.getStateKey(block, point.weather, point.dayType);
      if (!this.qTable.has(key)) {
        this.qTable.set(key, [0, 0, 0]); // Init values for 3 actions
      }
    });
    console.log(`Q-Table initialized with ${this.qTable.size} states.`);
  }

  // The Reward Function based on "Maximizing Utilization and Satisfaction"
  // Optimal utilization is often considered 85-95%. 
  // If > 95% full (avail < 5%), reward is low (congestion).
  // If < 50% full (avail > 50%), reward is low (wasted resources).
  private calculateReward(availability: number, total: number, action: Action): number {
    const utilization = (total - availability) / total;
    let reward = 0;

    // Ideal utilization target: 0.85
    const deviation = Math.abs(utilization - 0.85);
    reward = 1.0 - deviation; 

    // Penalty for wrong actions
    // If empty and we increase price -> Bad
    // If full and we decrease price -> Bad
    if (utilization < 0.5 && action === Action.Increase) reward -= 0.5;
    if (utilization > 0.95 && action === Action.Decrease) reward -= 0.5;

    return reward;
  }

  // Core Training Loop using the User's Formula:
  // Q(s,a) <- (1-alpha)*Q(s,a) + alpha * { R + gamma * max Q(s', a') }
  public train(history: ParkingDataPoint[]) {
    // Sort by time to ensure s(t) and s(t+1) logic holds
    const sortedData = [...history].sort((a, b) => a.timestamp - b.timestamp);

    for (let i = 0; i < sortedData.length - 1; i++) {
      const current = sortedData[i];
      const next = sortedData[i + 1];

      const currentBlock = this.getTimeBlock(current.time);
      const nextBlock = this.getTimeBlock(next.time);

      const stateKey = this.getStateKey(currentBlock, current.weather, current.dayType);
      const nextStateKey = this.getStateKey(nextBlock, next.weather, next.dayType);

      // Ensure states exist
      if (!this.qTable.has(stateKey)) this.qTable.set(stateKey, [0, 0, 0]);
      if (!this.qTable.has(nextStateKey)) this.qTable.set(nextStateKey, [0, 0, 0]);

      const qValues = this.qTable.get(stateKey)!;
      const nextQValues = this.qTable.get(nextStateKey)!;

      // Choose action (Epsilon-Greedy for training)
      let action: Action;
      if (Math.random() < EPSILON) {
        action = Math.floor(Math.random() * 3);
      } else {
        action = qValues.indexOf(Math.max(...qValues));
      }

      // Calculate Reward
      const reward = this.calculateReward(current.availability, current.totalSpots, action);

      // Max Q for next state
      const maxNextQ = Math.max(...nextQValues);

      // Update Formula
      const currentQ = qValues[action];
      const newQ = (1 - ALPHA) * currentQ + ALPHA * (reward + GAMMA * maxNextQ);

      // Update Table
      qValues[action] = newQ;
      this.qTable.set(stateKey, qValues);
    }
    console.log("Training complete.");
  }

  public getPrediction(timeStr: string, weather: WeatherCondition, dayType: DayType): PredictionResult {
    const block = this.getTimeBlock(timeStr);
    const key = this.getStateKey(block, weather, dayType);
    
    // Default if unseen state
    const qValues = this.qTable.get(key) || [0.5, 0.5, 0.5];
    const bestActionIdx = qValues.indexOf(Math.max(...qValues));
    
    // Interpret Q-Value as "Predicted Ease of Parking"
    // Higher max Q-value implies a state where we can manage the lot well -> likely good outcomes.
    // However, for the user display, we need "Predicted Spots".
    // We will use the max Q-Value to scale a base estimation.
    // (In a real ML system, we'd use a separate Regression Head, but here we adapt Q-values).
    const maxQ = Math.max(...qValues);
    
    // Mapping Q (-1 to 1 usually) to Availability (0 to 200)
    // This is a heuristic mapping for the demo
    const predictedAvailability = Math.min(200, Math.max(0, Math.floor(100 + (maxQ * 50))));

    return {
      predictedAvailability: predictedAvailability,
      confidence: 0.85,
      qValue: maxQ,
      recommendedAction: bestActionIdx === 0 ? 'Maintain Rate' : bestActionIdx === 1 ? 'Increase Rate' : 'Decrease Rate'
    };
  }
  
  public getQTableSize() {
    return this.qTable.size;
  }
}