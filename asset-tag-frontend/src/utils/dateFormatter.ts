/**
 * Centralized date formatting utilities
 * 
 * Provides consistent date formatting across the application
 */

export type DateFormat = 
  | "short"           // 12/31/2023
  | "medium"          // Dec 31, 2023
  | "long"            // December 31, 2023
  | "full"            // Sunday, December 31, 2023
  | "time"            // 2:30 PM
  | "datetime"        // Dec 31, 2023 at 2:30 PM
  | "datetime-short"  // 12/31/2023 2:30 PM
  | "relative"        // 2 hours ago, 3 days ago
  | "iso"             // 2023-12-31T14:30:00.000Z
  | "date-only"       // 2023-12-31
  | "time-only";      // 14:30

/**
 * Format a date string or Date object using the specified format
 */
export function formatDate(
  date: string | Date | null | undefined,
  format: DateFormat = "datetime"
): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }

  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  switch (format) {
    case "short":
      return dateObj.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      });

    case "medium":
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    case "long":
      return dateObj.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

    case "full":
      return dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });

    case "time":
      return dateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

    case "datetime":
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) + " at " + dateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

    case "datetime-short":
      return dateObj.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      }) + " " + dateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

    case "relative":
      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
      if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
      if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7);
        return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
      }
      if (diffInDays < 365) {
        const months = Math.floor(diffInDays / 30);
        return `${months} month${months === 1 ? "" : "s"} ago`;
      }
      const years = Math.floor(diffInDays / 365);
      return `${years} year${years === 1 ? "" : "s"} ago`;

    case "iso":
      return dateObj.toISOString();

    case "date-only":
      return dateObj.toISOString().split("T")[0];

    case "time-only":
      return dateObj.toTimeString().split(" ")[0].substring(0, 5);

    default:
      return dateObj.toLocaleString();
  }
}

/**
 * Format a date for display in audit logs
 */
export function formatAuditDate(date: string | Date): string {
  return formatDate(date, "datetime");
}

/**
 * Format a date for display in tables
 */
export function formatTableDate(date: string | Date): string {
  return formatDate(date, "medium");
}

/**
 * Format a date for display in forms
 */
export function formatFormDate(date: string | Date): string {
  return formatDate(date, "date-only");
}

/**
 * Format a date for display in tooltips or small spaces
 */
export function formatCompactDate(date: string | Date): string {
  return formatDate(date, "short");
}

/**
 * Format a date for relative display (e.g., "2 hours ago")
 */
export function formatRelativeDate(date: string | Date): string {
  return formatDate(date, "relative");
}

/**
 * Check if a date is today
 */
export function isToday(date: string | Date): boolean {
  if (!date) return false;
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  
  return dateObj.getDate() === today.getDate() &&
         dateObj.getMonth() === today.getMonth() &&
         dateObj.getFullYear() === today.getFullYear();
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(date: string | Date): boolean {
  if (!date) return false;
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return dateObj.getDate() === yesterday.getDate() &&
         dateObj.getMonth() === yesterday.getMonth() &&
         dateObj.getFullYear() === yesterday.getFullYear();
}

/**
 * Get a human-readable date range
 */
export function formatDateRange(startDate: string | Date, endDate: string | Date): string {
  const start = formatDate(startDate, "medium");
  const end = formatDate(endDate, "medium");
  
  if (start === end) {
    return start;
  }
  
  return `${start} - ${end}`;
}
