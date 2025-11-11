import { Process } from './scheduler';

export class MLPredictor {
  private trainingData: Array<{
    features: number[];
    label: number;
  }> = [];

  // Simple Random Forest implementation for burst time prediction
  private trees: any[] = [];
  private readonly numTrees = 10;

  constructor() {
    this.initializeTrainingData();
  }

  private initializeTrainingData() {
    // Generate synthetic training data
    // Features: [arrivalTime, priority, memoryRequired, ioOperations]
    // Label: burstTime
    for (let i = 0; i < 100; i++) {
      const arrivalTime = Math.floor(Math.random() * 10);
      const priority = Math.floor(Math.random() * 10) + 1;
      const memoryRequired = Math.floor(Math.random() * 100) + 10;
      const ioOperations = Math.floor(Math.random() * 5);

      // Simulated relationship: burst time correlates with priority and memory
      const burstTime = Math.floor(
        priority * 0.5 +
        memoryRequired * 0.05 +
        ioOperations * 0.8 +
        Math.random() * 3
      );

      this.trainingData.push({
        features: [arrivalTime, priority, memoryRequired, ioOperations],
        label: Math.max(1, Math.min(20, burstTime))
      });
    }
  }

  // Simple decision tree node
  private buildDecisionTree(data: any[], depth: number = 0, maxDepth: number = 5): any {
    if (depth >= maxDepth || data.length < 3) {
      const avgLabel = data.reduce((sum, d) => sum + d.label, 0) / data.length;
      return { type: 'leaf', value: avgLabel };
    }

    // Random feature selection
    const featureIndex = Math.floor(Math.random() * 4);
    const values = data.map(d => d.features[featureIndex]);
    const threshold = values[Math.floor(values.length / 2)];

    const leftData = data.filter(d => d.features[featureIndex] <= threshold);
    const rightData = data.filter(d => d.features[featureIndex] > threshold);

    if (leftData.length === 0 || rightData.length === 0) {
      const avgLabel = data.reduce((sum, d) => sum + d.label, 0) / data.length;
      return { type: 'leaf', value: avgLabel };
    }

    return {
      type: 'node',
      featureIndex,
      threshold,
      left: this.buildDecisionTree(leftData, depth + 1, maxDepth),
      right: this.buildDecisionTree(rightData, depth + 1, maxDepth)
    };
  }

  private predictWithTree(tree: any, features: number[]): number {
    if (tree.type === 'leaf') {
      return tree.value;
    }

    if (features[tree.featureIndex] <= tree.threshold) {
      return this.predictWithTree(tree.left, features);
    } else {
      return this.predictWithTree(tree.right, features);
    }
  }

  train() {
    // Build random forest
    this.trees = [];
    for (let i = 0; i < this.numTrees; i++) {
      // Bootstrap sampling
      const bootstrapData = [];
      for (let j = 0; j < this.trainingData.length; j++) {
        const randomIndex = Math.floor(Math.random() * this.trainingData.length);
        bootstrapData.push(this.trainingData[randomIndex]);
      }
      this.trees.push(this.buildDecisionTree(bootstrapData));
    }
  }

  predictBurstTime(process: Process): number {
    const features = [
      process.arrivalTime,
      process.priority,
      process.memoryRequired,
      process.ioOperations
    ];

    if (this.trees.length === 0) {
      this.train();
    }

    // Average predictions from all trees
    const predictions = this.trees.map(tree => this.predictWithTree(tree, features));
    const avgPrediction = predictions.reduce((sum, p) => sum + p, 0) / predictions.length;

    return Math.max(1, Math.round(avgPrediction));
  }

  predictBurstTimes(processes: Process[]): number[] {
    return processes.map(p => this.predictBurstTime(p));
  }

  // Calculate accuracy metrics
  evaluateModel(testProcesses: Process[]): { mse: number; mae: number } {
    let totalSquaredError = 0;
    let totalAbsoluteError = 0;

    testProcesses.forEach(process => {
      const predicted = this.predictBurstTime(process);
      const actual = process.burstTime;
      const error = predicted - actual;

      totalSquaredError += error * error;
      totalAbsoluteError += Math.abs(error);
    });

    const mse = totalSquaredError / testProcesses.length;
    const mae = totalAbsoluteError / testProcesses.length;

    return { mse, mae };
  }

  // Add new training samples
  addTrainingData(process: Process, actualBurstTime: number) {
    this.trainingData.push({
      features: [
        process.arrivalTime,
        process.priority,
        process.memoryRequired,
        process.ioOperations
      ],
      label: actualBurstTime
    });

    // Retrain if we have enough new data
    if (this.trainingData.length % 20 === 0) {
      this.train();
    }
  }
}

export class ReinforcementLearning {
  private qTable: Map<string, Map<string, number>> = new Map();
  private learningRate = 0.1;
  private discountFactor = 0.9;
  private epsilon = 0.1; // Exploration rate

  private getStateKey(process: Process): string {
    return `${process.priority}_${Math.floor(process.burstTime / 2)}_${Math.floor(process.memoryRequired / 20)}`;
  }

  selectAction(process: Process): string {
    const stateKey = this.getStateKey(process);

    // Epsilon-greedy strategy
    if (Math.random() < this.epsilon) {
      // Explore: random action
      const actions = ['high', 'medium', 'low'];
      return actions[Math.floor(Math.random() * actions.length)];
    }

    // Exploit: best known action
    if (!this.qTable.has(stateKey)) {
      this.qTable.set(stateKey, new Map([
        ['high', 0],
        ['medium', 0],
        ['low', 0]
      ]));
    }

    const actions = this.qTable.get(stateKey)!;
    let bestAction = 'medium';
    let bestValue = -Infinity;

    actions.forEach((value, action) => {
      if (value > bestValue) {
        bestValue = value;
        bestAction = action;
      }
    });

    return bestAction;
  }

  updateQValue(process: Process, action: string, reward: number, nextProcess?: Process) {
    const stateKey = this.getStateKey(process);

    if (!this.qTable.has(stateKey)) {
      this.qTable.set(stateKey, new Map([
        ['high', 0],
        ['medium', 0],
        ['low', 0]
      ]));
    }

    const actions = this.qTable.get(stateKey)!;
    const currentQ = actions.get(action) || 0;

    let maxNextQ = 0;
    if (nextProcess) {
      const nextStateKey = this.getStateKey(nextProcess);
      if (this.qTable.has(nextStateKey)) {
        const nextActions = this.qTable.get(nextStateKey)!;
        maxNextQ = Math.max(...Array.from(nextActions.values()));
      }
    }

    const newQ = currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);
    actions.set(action, newQ);
  }

  calculateReward(waitingTime: number, turnaroundTime: number): number {
    // Reward based on low waiting and turnaround times
    return 100 - waitingTime * 2 - turnaroundTime * 0.5;
  }
}
