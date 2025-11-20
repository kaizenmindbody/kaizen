import { google } from 'googleapis';

interface CalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: Array<{
    email: string;
    displayName?: string;
  }>;
  reminders: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

interface BookingData {
  practitioner: {
    email: string;
    full_name: string;
  };
  patient: {
    email: string;
    full_name: string;
  };
  date: string;
  time: string;
  service_type: string;
  reason?: string;
}

export class GoogleCalendarService {
  private calendar: any;

  constructor() {
    // Initialize OAuth2 client
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials if available
    if (process.env.GOOGLE_ACCESS_TOKEN && process.env.GOOGLE_REFRESH_TOKEN) {
      auth.setCredentials({
        access_token: process.env.GOOGLE_ACCESS_TOKEN,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      });
    }

    this.calendar = google.calendar({ version: 'v3', auth });
  }

  private formatDateTime(date: string, time: string): { start: string; end: string } {
    const [hours, minutes] = time.split(':').map(Number);
    const startDate = new Date(date);
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(hours + 1, minutes, 0, 0); // 1-hour appointment

    return {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    };
  }

  async createBookingEvent(bookingData: BookingData): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
      const { start, end } = this.formatDateTime(bookingData.date, bookingData.time);

      const event: CalendarEvent = {
        summary: `Medical Appointment - ${bookingData.service_type}`,
        description: `
Medical Appointment Details:
- Practitioner: ${bookingData.practitioner.full_name}
- Patient: ${bookingData.patient.full_name}
- Service: ${bookingData.service_type}
- Date: ${bookingData.date}
- Time: ${bookingData.time}
${bookingData.reason ? `- Reason: ${bookingData.reason}` : ''}

This appointment was created through the Kaizen medical platform.
        `.trim(),
        start: {
          dateTime: start,
          timeZone: 'America/New_York', // You can make this configurable
        },
        end: {
          dateTime: end,
          timeZone: 'America/New_York',
        },
        attendees: [
          {
            email: bookingData.practitioner.email,
            displayName: bookingData.practitioner.full_name,
          },
          {
            email: bookingData.patient.email,
            displayName: bookingData.patient.full_name,
          },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        sendUpdates: 'all', // Send email invitations to all attendees
      });

      return {
        success: true,
        eventId: response.data.id,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create calendar event',
      };
    }
  }

  async updateBookingEvent(eventId: string, bookingData: BookingData): Promise<{ success: boolean; error?: string }> {
    try {
      const { start, end } = this.formatDateTime(bookingData.date, bookingData.time);

      const event: CalendarEvent = {
        summary: `Medical Appointment - ${bookingData.service_type}`,
        description: `
Medical Appointment Details:
- Practitioner: ${bookingData.practitioner.full_name}
- Patient: ${bookingData.patient.full_name}
- Service: ${bookingData.service_type}
- Date: ${bookingData.date}
- Time: ${bookingData.time}
${bookingData.reason ? `- Reason: ${bookingData.reason}` : ''}

This appointment was updated through the Kaizen medical platform.
        `.trim(),
        start: {
          dateTime: start,
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: end,
          timeZone: 'America/New_York',
        },
        attendees: [
          {
            email: bookingData.practitioner.email,
            displayName: bookingData.practitioner.full_name,
          },
          {
            email: bookingData.patient.email,
            displayName: bookingData.patient.full_name,
          },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
      };

      await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
        sendUpdates: 'all',
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update calendar event',
      };
    }
  }

  async deleteBookingEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all', // Notify attendees of cancellation
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete calendar event',
      };
    }
  }
}

// Utility function to create a Google Calendar service instance
export const createGoogleCalendarService = () => {
  return new GoogleCalendarService();
};