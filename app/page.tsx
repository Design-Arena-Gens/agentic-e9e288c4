'use client';

import { useState, useEffect } from 'react';
import { JobScheduler, generateRandomProcesses, Process, SchedulingResult } from '@/lib/scheduler';
import { MLPredictor } from '@/lib/ml-predictor';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, RefreshCw, Plus, Trash2, Cpu, Clock, Zap, BarChart3 } from 'lucide-react';

export default function Home() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [results, setResults] = useState<Record<string, SchedulingResult>>({});
  const [activeTab, setActiveTab] = useState('scheduler');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('fcfs');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [mlPredictor] = useState(() => new MLPredictor());
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    setProcesses(generateRandomProcesses(5));
  }, []);

  const runScheduler = (algorithm: string) => {
    const scheduler = new JobScheduler(processes);
    let result: SchedulingResult;

    switch (algorithm) {
      case 'fcfs':
        result = scheduler.fcfs();
        break;
      case 'sjf':
        result = scheduler.sjf();
        break;
      case 'rr':
        result = scheduler.roundRobin(timeQuantum);
        break;
      case 'priority':
        result = scheduler.priorityScheduling();
        break;
      case 'ai':
        const predictions = mlPredictor.predictBurstTimes(processes);
        result = scheduler.aiScheduling(predictions);
        break;
      default:
        result = scheduler.fcfs();
    }

    setResults({ ...results, [algorithm]: result });
  };

  const runAllSchedulers = () => {
    const algorithms = ['fcfs', 'sjf', 'rr', 'priority', 'ai'];
    const newResults: Record<string, SchedulingResult> = {};

    algorithms.forEach(algo => {
      const scheduler = new JobScheduler(processes);
      let result: SchedulingResult;

      switch (algo) {
        case 'fcfs':
          result = scheduler.fcfs();
          break;
        case 'sjf':
          result = scheduler.sjf();
          break;
        case 'rr':
          result = scheduler.roundRobin(timeQuantum);
          break;
        case 'priority':
          result = scheduler.priorityScheduling();
          break;
        case 'ai':
          const predictions = mlPredictor.predictBurstTimes(processes);
          result = scheduler.aiScheduling(predictions);
          break;
        default:
          result = scheduler.fcfs();
      }

      newResults[algo] = result;
    });

    setResults(newResults);
  };

  const trainMLModel = () => {
    setIsTraining(true);
    setTimeout(() => {
      mlPredictor.train();
      setIsTraining(false);
      alert('ML model trained successfully!');
    }, 1000);
  };

  const addProcess = () => {
    const newProcess: Process = {
      id: processes.length + 1,
      name: `P${processes.length + 1}`,
      arrivalTime: 0,
      burstTime: 5,
      priority: 5,
      remainingTime: 0,
      waitingTime: 0,
      turnaroundTime: 0,
      completionTime: 0,
      startTime: 0,
      memoryRequired: 50,
      ioOperations: 1
    };
    setProcesses([...processes, newProcess]);
  };

  const removeProcess = (id: number) => {
    setProcesses(processes.filter(p => p.id !== id));
  };

  const updateProcess = (id: number, field: keyof Process, value: number) => {
    setProcesses(processes.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const generateNewProcesses = () => {
    setProcesses(generateRandomProcesses(5));
    setResults({});
  };

  const comparisonData = Object.keys(results).map(algo => ({
    name: algo.toUpperCase(),
    'Avg Waiting Time': results[algo].avgWaitingTime.toFixed(2),
    'Avg Turnaround Time': results[algo].avgTurnaroundTime.toFixed(2),
    'CPU Utilization': results[algo].cpuUtilization.toFixed(2),
    'Throughput': (results[algo].throughput * 10).toFixed(2)
  }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AI-Based Job Scheduler
          </h1>
          <p className="text-gray-300 text-lg">
            Intelligent Operating System Scheduling with Machine Learning
          </p>
        </header>

        <div className="flex gap-4 mb-6 justify-center flex-wrap">
          <button
            onClick={() => setActiveTab('scheduler')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'scheduler'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Cpu className="inline mr-2" size={20} />
            Scheduler
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'comparison'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <BarChart3 className="inline mr-2" size={20} />
            Comparison
          </button>
          <button
            onClick={() => setActiveTab('ml')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'ml'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Zap className="inline mr-2" size={20} />
            ML Predictor
          </button>
        </div>

        {activeTab === 'scheduler' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Process Management</h2>
                <div className="flex gap-2">
                  <button
                    onClick={addProcess}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition flex items-center"
                  >
                    <Plus size={20} className="mr-2" />
                    Add Process
                  </button>
                  <button
                    onClick={generateNewProcesses}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition flex items-center"
                  >
                    <RefreshCw size={20} className="mr-2" />
                    Generate Random
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Arrival Time</th>
                      <th className="p-3">Burst Time</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Memory (MB)</th>
                      <th className="p-3">I/O Ops</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processes.map(process => (
                      <tr key={process.id} className="border-b border-gray-700">
                        <td className="p-3">{process.name}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={process.arrivalTime}
                            onChange={(e) => updateProcess(process.id, 'arrivalTime', parseInt(e.target.value))}
                            className="w-20 bg-gray-700 rounded px-2 py-1"
                            min="0"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={process.burstTime}
                            onChange={(e) => updateProcess(process.id, 'burstTime', parseInt(e.target.value))}
                            className="w-20 bg-gray-700 rounded px-2 py-1"
                            min="1"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={process.priority}
                            onChange={(e) => updateProcess(process.id, 'priority', parseInt(e.target.value))}
                            className="w-20 bg-gray-700 rounded px-2 py-1"
                            min="1"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={process.memoryRequired}
                            onChange={(e) => updateProcess(process.id, 'memoryRequired', parseInt(e.target.value))}
                            className="w-20 bg-gray-700 rounded px-2 py-1"
                            min="1"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={process.ioOperations}
                            onChange={(e) => updateProcess(process.id, 'ioOperations', parseInt(e.target.value))}
                            className="w-20 bg-gray-700 rounded px-2 py-1"
                            min="0"
                          />
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => removeProcess(process.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Run Scheduling Algorithm</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2">Select Algorithm:</label>
                  <select
                    value={selectedAlgorithm}
                    onChange={(e) => setSelectedAlgorithm(e.target.value)}
                    className="w-full bg-gray-700 rounded px-4 py-2"
                  >
                    <option value="fcfs">First Come First Served (FCFS)</option>
                    <option value="sjf">Shortest Job First (SJF)</option>
                    <option value="rr">Round Robin (RR)</option>
                    <option value="priority">Priority Scheduling</option>
                    <option value="ai">AI-Enhanced Scheduling</option>
                  </select>
                </div>
                {selectedAlgorithm === 'rr' && (
                  <div>
                    <label className="block mb-2">Time Quantum:</label>
                    <input
                      type="number"
                      value={timeQuantum}
                      onChange={(e) => setTimeQuantum(parseInt(e.target.value))}
                      className="w-full bg-gray-700 rounded px-4 py-2"
                      min="1"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => runScheduler(selectedAlgorithm)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition flex items-center"
                >
                  <Play size={20} className="mr-2" />
                  Run Algorithm
                </button>
                <button
                  onClick={runAllSchedulers}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition flex items-center"
                >
                  <Play size={20} className="mr-2" />
                  Run All & Compare
                </button>
              </div>
            </div>

            {results[selectedAlgorithm] && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Results - {selectedAlgorithm.toUpperCase()}</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Avg Waiting Time</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {results[selectedAlgorithm].avgWaitingTime.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Avg Turnaround Time</div>
                    <div className="text-2xl font-bold text-green-400">
                      {results[selectedAlgorithm].avgTurnaroundTime.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">CPU Utilization</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {results[selectedAlgorithm].cpuUtilization.toFixed(2)}%
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Throughput</div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {results[selectedAlgorithm].throughput.toFixed(3)}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3">Gantt Chart</h3>
                  <div className="bg-gray-700 rounded-lg p-4 overflow-x-auto">
                    <div className="flex gap-1 min-w-max">
                      {results[selectedAlgorithm].ganttChart.map((item, index) => {
                        const duration = item.endTime - item.startTime;
                        const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-pink-500'];
                        return (
                          <div
                            key={index}
                            className={`${colors[(item.processId - 1) % colors.length]} px-4 py-2 rounded text-center`}
                            style={{ width: `${duration * 40}px`, minWidth: '60px' }}
                          >
                            <div className="font-bold">P{item.processId}</div>
                            <div className="text-xs">{item.startTime}-{item.endTime}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Process Details</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="p-3">Process</th>
                          <th className="p-3">Arrival</th>
                          <th className="p-3">Burst</th>
                          <th className="p-3">Start</th>
                          <th className="p-3">Completion</th>
                          <th className="p-3">Waiting</th>
                          <th className="p-3">Turnaround</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results[selectedAlgorithm].processes.map(process => (
                          <tr key={process.id} className="border-b border-gray-700">
                            <td className="p-3">{process.name}</td>
                            <td className="p-3">{process.arrivalTime}</td>
                            <td className="p-3">{process.burstTime}</td>
                            <td className="p-3">{process.startTime}</td>
                            <td className="p-3">{process.completionTime}</td>
                            <td className="p-3">{process.waitingTime}</td>
                            <td className="p-3">{process.turnaroundTime}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Algorithm Comparison</h2>
            {Object.keys(results).length > 0 ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Performance Metrics</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                      <Legend />
                      <Bar dataKey="Avg Waiting Time" fill="#3B82F6" />
                      <Bar dataKey="Avg Turnaround Time" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">CPU Utilization & Throughput</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                      <Legend />
                      <Line type="monotone" dataKey="CPU Utilization" stroke="#A855F7" strokeWidth={2} />
                      <Line type="monotone" dataKey="Throughput" stroke="#EAB308" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="p-3">Algorithm</th>
                        <th className="p-3">Avg Waiting Time</th>
                        <th className="p-3">Avg Turnaround Time</th>
                        <th className="p-3">CPU Utilization (%)</th>
                        <th className="p-3">Throughput</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(results).map(algo => (
                        <tr key={algo} className="border-b border-gray-700">
                          <td className="p-3 font-semibold">{algo.toUpperCase()}</td>
                          <td className="p-3">{results[algo].avgWaitingTime.toFixed(2)}</td>
                          <td className="p-3">{results[algo].avgTurnaroundTime.toFixed(2)}</td>
                          <td className="p-3">{results[algo].cpuUtilization.toFixed(2)}%</td>
                          <td className="p-3">{results[algo].throughput.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No comparison data available. Run multiple algorithms to see comparison.</p>
                <button
                  onClick={runAllSchedulers}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                >
                  Run All Algorithms
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ml' && (
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Machine Learning Predictor</h2>

            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-3">Model Information</h3>
                <p className="text-gray-300 mb-4">
                  This module uses a Random Forest algorithm to predict process burst times based on:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Arrival Time</li>
                  <li>Priority Level</li>
                  <li>Memory Requirements</li>
                  <li>I/O Operations Count</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={trainMLModel}
                  disabled={isTraining}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {isTraining ? 'Training...' : 'Train Model'}
                </button>
                <button
                  onClick={() => runScheduler('ai')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                >
                  Run AI Scheduler
                </button>
              </div>

              {processes.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Burst Time Predictions</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="p-3">Process</th>
                          <th className="p-3">Actual Burst Time</th>
                          <th className="p-3">Predicted Burst Time</th>
                          <th className="p-3">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processes.map(process => {
                          const predicted = mlPredictor.predictBurstTime(process);
                          const error = Math.abs(predicted - process.burstTime);
                          return (
                            <tr key={process.id} className="border-b border-gray-700">
                              <td className="p-3">{process.name}</td>
                              <td className="p-3">{process.burstTime}</td>
                              <td className="p-3">{predicted}</td>
                              <td className="p-3">
                                <span className={error <= 2 ? 'text-green-400' : error <= 4 ? 'text-yellow-400' : 'text-red-400'}>
                                  {error.toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-3">How AI Scheduling Works</h3>
                <p className="text-gray-300 mb-2">
                  The AI-enhanced scheduler combines multiple factors to make optimal scheduling decisions:
                </p>
                <ol className="list-decimal list-inside text-gray-300 space-y-2">
                  <li>Predicts burst times using trained Random Forest model</li>
                  <li>Calculates a composite score based on priority (40%), predicted burst time (30%), memory (20%), and I/O operations (10%)</li>
                  <li>Schedules processes with lowest composite scores first</li>
                  <li>Adapts to workload patterns through continuous learning</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
