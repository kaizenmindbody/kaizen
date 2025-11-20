interface CalendarIntegrationOptions {
  baseUrl?: string;
}

export class BookingCalendarIntegration {
  private baseUrl: string;

  constructor(options: CalendarIntegrationOptions = {}) {
    this.baseUrl = options.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  async createCalendarEventForBooking(bookingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create calendar event');
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create calendar event'
      };
    }
  }

  async updateCalendarEventForBooking(bookingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/calendar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update calendar event');
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update calendar event'
      };
    }
  }

  async deleteCalendarEventForBooking(bookingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/calendar?booking_id=${bookingId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete calendar event');
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete calendar event'
      };
    }
  }
}

// Utility functions for easy use
export const createCalendarEvent = (bookingId: string) => {
  const integration = new BookingCalendarIntegration();
  return integration.createCalendarEventForBooking(bookingId);
};

export const updateCalendarEvent = (bookingId: string) => {
  const integration = new BookingCalendarIntegration();
  return integration.updateCalendarEventForBooking(bookingId);
};

export const deleteCalendarEvent = (bookingId: string) => {
  const integration = new BookingCalendarIntegration();
  return integration.deleteCalendarEventForBooking(bookingId);
};