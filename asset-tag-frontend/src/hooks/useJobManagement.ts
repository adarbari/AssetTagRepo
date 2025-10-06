import { useState, useEffect } from 'react';
import type {
  Job,
  CreateJobInput,
  UpdateJobInput,
  JobAlert,
} from '../types/job';
import { mockJobs, mockJobAlerts } from '../data/mockJobData';
import { updateMockAsset } from '../data/mockData';

/**
 * Custom hook for managing jobs
 * Handles all job-related operations including creation, updates, asset assignments, and alerts
 */
export function useJobManagement() {
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);

  // Load jobs on mount
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = () => {
    try {
      const saved = localStorage.getItem('jobs');
      if (saved) {
        setJobs(JSON.parse(saved));
      } else {
        // Load mock data if no saved data exists
        setJobs(mockJobs);
        localStorage.setItem('jobs', JSON.stringify(mockJobs));
      }

      const savedAlerts = localStorage.getItem('jobAlerts');
      if (savedAlerts) {
        setJobAlerts(JSON.parse(savedAlerts));
      } else {
        // Load mock alerts if no saved data exists
        setJobAlerts(mockJobAlerts);
        localStorage.setItem('jobAlerts', JSON.stringify(mockJobAlerts));
      }
    } catch (error) {
// console.error('Failed to load jobs:', error);
    }
  };

  const createJob = async (input: CreateJobInput) => {
    const jobNumber = `JOB-${new Date().getFullYear()}-${String(Object.keys(jobs).length + 1).padStart(3, '0')}`;

    const newJob: Job = {
      id: `job-${Date.now()}`,
      jobNumber,
      name: input.name,
      description: input.description,
      siteId: input.siteId,
      clientId: input.clientId,
      status: 'planning',
      priority: input.priority || 'medium',
      startDate: input.startDate,
      endDate: input.endDate,
      estimatedDuration: 0,
      assets: [],
      budget: input.budget,
      actualCosts: {
        total: 0,
        labor: 0,
        equipment: 0,
        materials: 0,
        other: 0,
        lastUpdated: new Date().toISOString(),
      },
      variance: input.budget.total,
      variancePercentage: 100,
      hasActiveAlerts: false,
      projectManager: input.projectManager,
      assignedTeam: [],
      groundStationGeofenceId: input.groundStationGeofenceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      notes: input.notes,
      tags: input.tags || [],
    };

    const updatedJobs = {
      ...jobs,
      [newJob.id]: newJob,
    };

    setJobs(updatedJobs);

    try {
      localStorage.setItem('jobs', JSON.stringify(updatedJobs));
      // TODO: Backend integration
      // await api.createJob(newJob);
      return { success: true, job: newJob };
    } catch (error) {
// console.error('Failed to create job:', error);
      return { success: false, error };
    }
  };

  const updateJob = async (jobId: string, input: UpdateJobInput) => {
    const existingJob = jobs[jobId];
    if (!existingJob) {
      return { success: false, error: 'Job not found' };
    }

    const updatedJob: Job = {
      ...existingJob,
      ...input,
      budget: input.budget
        ? { ...existingJob.budget, ...input.budget }
        : existingJob.budget,
      actualCosts: input.actualCosts
        ? { ...existingJob.actualCosts, ...input.actualCosts }
        : existingJob.actualCosts,
      vehicle: input.vehicle
        ? { ...existingJob.vehicle, ...input.vehicle }
        : existingJob.vehicle,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate variance
    updatedJob.variance =
      updatedJob.budget.total - updatedJob.actualCosts.total;
    updatedJob.variancePercentage =
      (updatedJob.variance / updatedJob.budget.total) * 100;

    const updatedJobs = {
      ...jobs,
      [jobId]: updatedJob,
    };

    setJobs(updatedJobs);

    try {
      localStorage.setItem('jobs', JSON.stringify(updatedJobs));
      // TODO: Backend integration
      // await api.updateJob(jobId, updatedJob);
      return { success: true, job: updatedJob };
    } catch (error) {
// console.error('Failed to update job:', error);
      return { success: false, error };
    }
  };

  const deleteJob = async (jobId: string) => {
    const { [jobId]: _removed, ...remaining } = jobs;

    setJobs(remaining);

    try {
      localStorage.setItem('jobs', JSON.stringify(remaining));
      // TODO: Backend integration
      // await api.deleteJob(jobId);
      return { success: true };
    } catch (error) {
// console.error('Failed to delete job:', error);
      return { success: false, error };
    }
  };

  const addAssetToJob = async (
    jobId: string,
    assetId: string,
    assetName: string,
    assetType: string,
    required: boolean = true,
    useFullJobDuration: boolean = true,
    customStartDate?: string,
    customEndDate?: string
  ) => {
    const job = jobs[jobId];
    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    // Determine assignment dates
    const assignmentStartDate = useFullJobDuration
      ? job.startDate
      : customStartDate || job.startDate;
    const assignmentEndDate = useFullJobDuration
      ? job.endDate
      : customEndDate || job.endDate;

    const newAsset = {
      assetId,
      assetName,
      assetType,
      required,
      loadedOnVehicle: false,
      assignmentStartDate,
      assignmentEndDate,
      useFullJobDuration,
    };

    const updatedJob: Job = {
      ...job,
      assets: [...job.assets, newAsset],
      updatedAt: new Date().toISOString(),
    };

    // Update the asset's availability status and job assignment
    updateMockAsset(assetId, {
      availability: 'assigned',
      assignedJobId: jobId,
      assignedJobName: job.name,
      assignmentStartDate,
      assignmentEndDate,
    });

    return updateJob(jobId, updatedJob);
  };

  const removeAssetFromJob = async (jobId: string, assetId: string) => {
    const job = jobs[jobId];
    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    const updatedJob: Job = {
      ...job,
      assets: job.assets.filter(a => a.assetId !== assetId),
      updatedAt: new Date().toISOString(),
    };

    // Update the asset's availability status back to available and clear job assignment
    updateMockAsset(assetId, {
      availability: 'available',
      assignedJobId: undefined,
      assignedJobName: undefined,
      assignmentStartDate: undefined,
      assignmentEndDate: undefined,
    });

    return updateJob(jobId, updatedJob);
  };

  const checkJobAssetCompliance = (jobId: string): string[] => {
    const job = jobs[jobId];
    if (!job || !job.vehicle) {
      return [];
    }

    const missingAssets = job.assets
      .filter(asset => asset.required && !asset.loadedOnVehicle)
      .map(asset => asset.assetId);

    return missingAssets;
  };

  const createJobAlert = (jobId: string, missingAssetIds: string[]) => {
    const job = jobs[jobId];
    if (!job) return;

    const missingAssetNames = job.assets
      .filter(a => missingAssetIds.includes(a.assetId))
      .map(a => a.assetName);

    const alert: JobAlert = {
      id: `job-alert-${Date.now()}`,
      jobId: job.id,
      jobName: job.name,
      type: 'missing-assets',
      severity: 'high',
      message: `Vehicle departed for ${job.name} without ${missingAssetIds.length} required asset(s)`,
      details: {
        vehicleId: job.vehicle?.vehicleId,
        vehicleName: job.vehicle?.vehicleName,
        missingAssets: missingAssetNames,
      },
      createdAt: new Date().toISOString(),
      active: true,
    };

    const updatedAlerts = [...jobAlerts, alert];
    setJobAlerts(updatedAlerts);

    // Update job to reflect active alerts
    updateJob(jobId, {
      hasActiveAlerts: true,
      missingAssets: missingAssetIds,
    });

    try {
      localStorage.setItem('jobAlerts', JSON.stringify(updatedAlerts));
    } catch (error) {
// console.error('Failed to save job alert:', error);
    }
  };

  const resolveJobAlert = (alertId: string) => {
    const updatedAlerts = jobAlerts.map(alert => {
      if (alert.id === alertId) {
        return {
          ...alert,
          active: false,
          resolvedAt: new Date().toISOString(),
        };
      }
      return alert;
    });

    setJobAlerts(updatedAlerts);

    try {
      localStorage.setItem('jobAlerts', JSON.stringify(updatedAlerts));
    } catch (error) {
// console.error('Failed to resolve job alert:', error);
    }
  };

  return {
    jobs,
    jobAlerts,
    createJob,
    updateJob,
    deleteJob,
    addAssetToJob,
    removeAssetFromJob,
    checkJobAssetCompliance,
    createJobAlert,
    resolveJobAlert,
  };
}
