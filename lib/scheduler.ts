export interface Process {
  id: number;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  remainingTime: number;
  waitingTime: number;
  turnaroundTime: number;
  completionTime: number;
  startTime: number;
  memoryRequired: number;
  ioOperations: number;
}

export interface SchedulingResult {
  processes: Process[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  cpuUtilization: number;
  throughput: number;
  ganttChart: { processId: number; startTime: number; endTime: number }[];
}

export class JobScheduler {
  private processes: Process[];
  private currentTime: number;

  constructor(processes: Process[]) {
    this.processes = JSON.parse(JSON.stringify(processes));
    this.currentTime = 0;
  }

  // First Come First Served
  fcfs(): SchedulingResult {
    const processes = JSON.parse(JSON.stringify(this.processes));
    processes.sort((a: Process, b: Process) => a.arrivalTime - b.arrivalTime);

    let currentTime = 0;
    const ganttChart: { processId: number; startTime: number; endTime: number }[] = [];

    processes.forEach((process: Process) => {
      if (currentTime < process.arrivalTime) {
        currentTime = process.arrivalTime;
      }

      process.startTime = currentTime;
      process.waitingTime = currentTime - process.arrivalTime;
      currentTime += process.burstTime;
      process.completionTime = currentTime;
      process.turnaroundTime = process.completionTime - process.arrivalTime;

      ganttChart.push({
        processId: process.id,
        startTime: process.startTime,
        endTime: process.completionTime
      });
    });

    return this.calculateMetrics(processes, ganttChart);
  }

  // Shortest Job First (Non-preemptive)
  sjf(): SchedulingResult {
    const processes = JSON.parse(JSON.stringify(this.processes));
    const completed: Process[] = [];
    const ganttChart: { processId: number; startTime: number; endTime: number }[] = [];
    let currentTime = 0;
    let completedCount = 0;

    while (completedCount < processes.length) {
      const availableProcesses = processes.filter(
        (p: Process) => p.arrivalTime <= currentTime && p.completionTime === 0
      );

      if (availableProcesses.length === 0) {
        currentTime++;
        continue;
      }

      availableProcesses.sort((a: Process, b: Process) => a.burstTime - b.burstTime);
      const process = availableProcesses[0];

      process.startTime = currentTime;
      process.waitingTime = currentTime - process.arrivalTime;
      currentTime += process.burstTime;
      process.completionTime = currentTime;
      process.turnaroundTime = process.completionTime - process.arrivalTime;

      ganttChart.push({
        processId: process.id,
        startTime: process.startTime,
        endTime: process.completionTime
      });

      completed.push(process);
      completedCount++;
    }

    return this.calculateMetrics(processes, ganttChart);
  }

  // Round Robin
  roundRobin(timeQuantum: number = 2): SchedulingResult {
    const processes = JSON.parse(JSON.stringify(this.processes));
    processes.forEach((p: Process) => (p.remainingTime = p.burstTime));

    const ganttChart: { processId: number; startTime: number; endTime: number }[] = [];
    const queue: Process[] = [];
    let currentTime = 0;
    let completedCount = 0;

    // Add processes that arrive at time 0
    processes.forEach((p: Process) => {
      if (p.arrivalTime === 0) queue.push(p);
    });

    while (completedCount < processes.length) {
      if (queue.length === 0) {
        currentTime++;
        processes.forEach((p: Process) => {
          if (p.arrivalTime === currentTime && p.remainingTime > 0 && !queue.includes(p)) {
            queue.push(p);
          }
        });
        continue;
      }

      const process = queue.shift()!;

      if (process.startTime === 0 && process.remainingTime === process.burstTime) {
        process.startTime = currentTime;
      }

      const executionTime = Math.min(timeQuantum, process.remainingTime);
      const startTime = currentTime;

      ganttChart.push({
        processId: process.id,
        startTime: startTime,
        endTime: startTime + executionTime
      });

      process.remainingTime -= executionTime;
      currentTime += executionTime;

      // Add newly arrived processes
      processes.forEach((p: Process) => {
        if (p.arrivalTime <= currentTime && p.remainingTime > 0 && !queue.includes(p) && p !== process) {
          queue.push(p);
        }
      });

      if (process.remainingTime > 0) {
        queue.push(process);
      } else {
        process.completionTime = currentTime;
        process.turnaroundTime = process.completionTime - process.arrivalTime;
        process.waitingTime = process.turnaroundTime - process.burstTime;
        completedCount++;
      }
    }

    return this.calculateMetrics(processes, ganttChart);
  }

  // Priority Scheduling (Non-preemptive)
  priorityScheduling(): SchedulingResult {
    const processes = JSON.parse(JSON.stringify(this.processes));
    const completed: Process[] = [];
    const ganttChart: { processId: number; startTime: number; endTime: number }[] = [];
    let currentTime = 0;
    let completedCount = 0;

    while (completedCount < processes.length) {
      const availableProcesses = processes.filter(
        (p: Process) => p.arrivalTime <= currentTime && p.completionTime === 0
      );

      if (availableProcesses.length === 0) {
        currentTime++;
        continue;
      }

      availableProcesses.sort((a: Process, b: Process) => a.priority - b.priority);
      const process = availableProcesses[0];

      process.startTime = currentTime;
      process.waitingTime = currentTime - process.arrivalTime;
      currentTime += process.burstTime;
      process.completionTime = currentTime;
      process.turnaroundTime = process.completionTime - process.arrivalTime;

      ganttChart.push({
        processId: process.id,
        startTime: process.startTime,
        endTime: process.completionTime
      });

      completed.push(process);
      completedCount++;
    }

    return this.calculateMetrics(processes, ganttChart);
  }

  // AI-Enhanced Scheduling
  aiScheduling(predictedBurstTimes: number[]): SchedulingResult {
    const processes = JSON.parse(JSON.stringify(this.processes));

    // Use predicted burst times for scheduling decisions
    processes.forEach((p: Process, i: number) => {
      if (predictedBurstTimes[i]) {
        p.burstTime = Math.round(predictedBurstTimes[i]);
      }
    });

    // Hybrid approach: Priority + predicted burst time
    const completed: Process[] = [];
    const ganttChart: { processId: number; startTime: number; endTime: number }[] = [];
    let currentTime = 0;
    let completedCount = 0;

    while (completedCount < processes.length) {
      const availableProcesses = processes.filter(
        (p: Process) => p.arrivalTime <= currentTime && p.completionTime === 0
      );

      if (availableProcesses.length === 0) {
        currentTime++;
        continue;
      }

      // Score based on priority and burst time
      availableProcesses.forEach((p: Process) => {
        (p as any).score = p.priority * 0.4 + p.burstTime * 0.3 + p.memoryRequired * 0.2 + p.ioOperations * 0.1;
      });

      availableProcesses.sort((a: any, b: any) => a.score - b.score);
      const process = availableProcesses[0];

      process.startTime = currentTime;
      process.waitingTime = currentTime - process.arrivalTime;
      currentTime += process.burstTime;
      process.completionTime = currentTime;
      process.turnaroundTime = process.completionTime - process.arrivalTime;

      ganttChart.push({
        processId: process.id,
        startTime: process.startTime,
        endTime: process.completionTime
      });

      completed.push(process);
      completedCount++;
    }

    return this.calculateMetrics(processes, ganttChart);
  }

  private calculateMetrics(processes: Process[], ganttChart: any[]): SchedulingResult {
    const totalWaitingTime = processes.reduce((sum, p) => sum + p.waitingTime, 0);
    const totalTurnaroundTime = processes.reduce((sum, p) => sum + p.turnaroundTime, 0);
    const avgWaitingTime = totalWaitingTime / processes.length;
    const avgTurnaroundTime = totalTurnaroundTime / processes.length;

    const maxCompletionTime = Math.max(...processes.map(p => p.completionTime));
    const totalBurstTime = processes.reduce((sum, p) => sum + p.burstTime, 0);
    const cpuUtilization = (totalBurstTime / maxCompletionTime) * 100;
    const throughput = processes.length / maxCompletionTime;

    return {
      processes,
      avgWaitingTime,
      avgTurnaroundTime,
      cpuUtilization,
      throughput,
      ganttChart
    };
  }
}

export function generateRandomProcesses(count: number): Process[] {
  const processes: Process[] = [];

  for (let i = 0; i < count; i++) {
    processes.push({
      id: i + 1,
      name: `P${i + 1}`,
      arrivalTime: Math.floor(Math.random() * 10),
      burstTime: Math.floor(Math.random() * 10) + 1,
      priority: Math.floor(Math.random() * 10) + 1,
      remainingTime: 0,
      waitingTime: 0,
      turnaroundTime: 0,
      completionTime: 0,
      startTime: 0,
      memoryRequired: Math.floor(Math.random() * 100) + 10,
      ioOperations: Math.floor(Math.random() * 5)
    });
  }

  return processes;
}
