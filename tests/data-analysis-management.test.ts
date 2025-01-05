import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let taskCount = 0;
let resultCount = 0;
const tasks = new Map();
const results = new Map();

// Simulated contract functions
function createTask(description: string, deadline: number, creator: string) {
  const taskId = ++taskCount;
  tasks.set(taskId, {
    creator,
    description,
    status: "open",
    assignedTo: null,
    deadline
  });
  return taskId;
}

function assignTask(taskId: number, analyst: string) {
  const task = tasks.get(taskId);
  if (!task || task.status !== "open") throw new Error('Invalid task');
  task.status = "assigned";
  task.assignedTo = analyst;
  tasks.set(taskId, task);
  return true;
}

function submitResult(taskId: number, data: string, analyst: string) {
  const task = tasks.get(taskId);
  if (!task || task.assignedTo !== analyst) throw new Error('Not authorized');
  const resultId = ++resultCount;
  results.set(resultId, {
    taskId,
    analyst,
    data,
    timestamp: Date.now(),
    verified: false
  });
  return resultId;
}

function verifyResult(resultId: number, isValid: boolean, verifier: string) {
  const result = results.get(resultId);
  if (!result) throw new Error('Invalid result');
  const task = tasks.get(result.taskId);
  if (task.creator !== verifier) throw new Error('Not authorized');
  result.verified = isValid;
  results.set(resultId, result);
  return true;
}

describe('Data Analysis Management Contract', () => {
  beforeEach(() => {
    taskCount = 0;
    resultCount = 0;
    tasks.clear();
    results.clear();
  });
  
  it('should create a new task', () => {
    const id = createTask('Analyze CMB quadrupole', Date.now() + 86400000, 'researcher1');
    expect(id).toBe(1);
    const task = tasks.get(id);
    expect(task.description).toBe('Analyze CMB quadrupole');
    expect(task.status).toBe('open');
  });
  
  it('should assign a task', () => {
    const taskId = createTask('Analyze CMB octupole', Date.now() + 86400000, 'researcher2');
    expect(assignTask(taskId, 'analyst1')).toBe(true);
    const task = tasks.get(taskId);
    expect(task.status).toBe('assigned');
    expect(task.assignedTo).toBe('analyst1');
  });
  
  it('should submit a result', () => {
    const taskId = createTask('Analyze CMB power spectrum', Date.now() + 86400000, 'researcher3');
    assignTask(taskId, 'analyst2');
    const resultId = submitResult(taskId, 'Power spectrum analysis data...', 'analyst2');
    expect(resultId).toBe(1);
    const result = results.get(resultId);
    expect(result.analyst).toBe('analyst2');
    expect(result.verified).toBe(false);
  });
  
  it('should verify a result', () => {
    const taskId = createTask('Analyze CMB temperature fluctuations', Date.now() + 86400000, 'researcher4');
    assignTask(taskId, 'analyst3');
    const resultId = submitResult(taskId, 'Temperature fluctuation data...', 'analyst3');
    expect(verifyResult(resultId, true, 'researcher4')).toBe(true);
    const result = results.get(resultId);
    expect(result.verified).toBe(true);
  });
  
  it('should not allow unauthorized result submissions', () => {
    const taskId = createTask('Analyze CMB polarization', Date.now() + 86400000, 'researcher5');
    assignTask(taskId, 'analyst4');
    expect(() => submitResult(taskId, 'Unauthorized data...', 'hacker')).toThrow('Not authorized');
  });
  
  it('should not allow unauthorized result verifications', () => {
    const taskId = createTask('Analyze CMB anisotropies', Date.now() + 86400000, 'researcher6');
    assignTask(taskId, 'analyst5');
    const resultId = submitResult(taskId, 'Anisotropy data...', 'analyst5');
    expect(() => verifyResult(resultId, true, 'unauthorized_user')).toThrow('Not authorized');
  });
});

