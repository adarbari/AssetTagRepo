/**
 * Dropdown Configuration Service
 *
 * This service provides a centralized way to access dropdown options
 * throughout the application. It's designed to be easily switched to
 * backend API calls when ready.
 *
 * Usage:
 * import { dropdownConfigService } from '../services/dropdownConfigService';
 * const assetTypes = await dropdownConfigService.getAssetTypes();
 */

import * as dropdownOptions from '../data/dropdownOptions';
import type { DropdownOption } from '../data/dropdownOptions';

export class DropdownConfigService {
  /**
   * Get all asset types
   */
  async getAssetTypes(): Promise<DropdownOption[]> {
    // TODO: Replace with API call when backend is ready
    // return await fetch('/api/config/asset-types').then(r => r.json());
    return Promise.resolve(dropdownOptions.assetTypes);
  }

  /**
   * Get all asset statuses
   */
  async getAssetStatuses(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.assetStatuses);
  }

  /**
   * Get all personnel/team members
   */
  async getPersonnel(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.assetOwners);
  }

  /**
   * Get all technicians
   */
  async getTechnicians(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.technicians);
  }

  /**
   * Get all drivers
   */
  async getDrivers(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.drivers);
  }

  /**
   * Get all project managers
   */
  async getProjectManagers(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.projectManagers);
  }

  /**
   * Get all clients
   */
  async getClients(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.clients);
  }

  /**
   * Get all projects
   */
  async getProjects(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.projects);
  }

  /**
   * Get all manufacturers
   */
  async getManufacturers(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.manufacturers);
  }

  /**
   * Get all alert types
   */
  async getAlertTypes(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.alertTypes);
  }

  /**
   * Get all alert severities
   */
  async getAlertSeverities(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.alertSeverities);
  }

  /**
   * Get all site types
   */
  async getSiteTypes(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.siteTypes);
  }

  /**
   * Get all geofence types
   */
  async getGeofenceTypes(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.geofenceTypes);
  }

  /**
   * Get all maintenance types
   */
  async getMaintenanceTypes(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.maintenanceTypes);
  }

  /**
   * Get all maintenance priorities
   */
  async getMaintenancePriorities(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.maintenancePriorities);
  }

  /**
   * Get all maintenance statuses
   */
  async getMaintenanceStatuses(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.maintenanceStatuses);
  }

  /**
   * Get all priority levels
   */
  async getPriorityLevels(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.priorityLevels);
  }

  /**
   * Get all issue types
   */
  async getIssueTypes(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.issueTypes);
  }

  /**
   * Get all issue severities
   */
  async getIssueSeverities(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.issueSeverities);
  }

  /**
   * Get all job priorities
   */
  async getJobPriorities(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.jobPriorities);
  }

  /**
   * Get all job statuses
   */
  async getJobStatuses(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.jobStatuses);
  }

  /**
   * Get all vehicle types
   */
  async getVehicleTypes(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.vehicleTypes);
  }

  /**
   * Get all notification channels
   */
  async getNotificationChannels(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.notificationChannels);
  }

  /**
   * Get all lost item mechanisms
   */
  async getLostItemMechanisms(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.lostItemMechanisms);
  }

  /**
   * Get all asset availability options
   */
  async getAssetAvailability(): Promise<DropdownOption[]> {
    return Promise.resolve(dropdownOptions.assetAvailability);
  }

  /**
   * Generic method to get any config by type
   */
  async getConfig(type: string): Promise<DropdownOption[]> {
    const methodMap: Record<string, () => Promise<DropdownOption[]>> = {
      'asset-types': this.getAssetTypes.bind(this),
      'asset-statuses': this.getAssetStatuses.bind(this),
      personnel: this.getPersonnel.bind(this),
      technicians: this.getTechnicians.bind(this),
      drivers: this.getDrivers.bind(this),
      'project-managers': this.getProjectManagers.bind(this),
      clients: this.getClients.bind(this),
      projects: this.getProjects.bind(this),
      manufacturers: this.getManufacturers.bind(this),
      'alert-types': this.getAlertTypes.bind(this),
      'alert-severities': this.getAlertSeverities.bind(this),
      'site-types': this.getSiteTypes.bind(this),
      'geofence-types': this.getGeofenceTypes.bind(this),
      'maintenance-types': this.getMaintenanceTypes.bind(this),
      'maintenance-priorities': this.getMaintenancePriorities.bind(this),
      'maintenance-statuses': this.getMaintenanceStatuses.bind(this),
      'priority-levels': this.getPriorityLevels.bind(this),
      'issue-types': this.getIssueTypes.bind(this),
      'issue-severities': this.getIssueSeverities.bind(this),
      'job-priorities': this.getJobPriorities.bind(this),
      'job-statuses': this.getJobStatuses.bind(this),
      'vehicle-types': this.getVehicleTypes.bind(this),
      'notification-channels': this.getNotificationChannels.bind(this),
      'lost-item-mechanisms': this.getLostItemMechanisms.bind(this),
      'asset-availability': this.getAssetAvailability.bind(this),
    };

    const method = methodMap[type];
    if (!method) {
// // // // // // console.warn(`Unknown config type: ${type}`);
      return [];
    }

    return method();
  }

  /**
   * Helper to get label from value
   */
  getLabel(options: DropdownOption[], value: string): string {
    return dropdownOptions.getOptionLabel(options, value);
  }

  /**
   * Helper to get value from label
   */
  getValue(options: DropdownOption[], label: string): string {
    return dropdownOptions.getOptionValue(options, label);
  }
}

// Export singleton instance
export const dropdownConfigService = new DropdownConfigService();
