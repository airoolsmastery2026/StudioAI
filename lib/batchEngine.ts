import { Job, JobStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const createBatchJobs = (
  count: number,
  topicId: string,
  templateId: string,
  modelId: string,
  basePrompt: string
): Job[] => {
  const jobs: Job[] = [];
  
  for (let i = 0; i < count; i++) {
    jobs.push({
      id: uuidv4(),
      createdAt: Date.now(),
      status: 'pending',
      topicId,
      templateId,
      modelId,
      finalPrompt: basePrompt, // In a real app, we might vary this slightly per job
    });
  }
  
  return jobs;
};

export const getNextPendingJob = (jobs: Job[]): Job | undefined => {
  return jobs.find(j => j.status === 'pending');
};
