export type EventCategory = 'hackathon' | 'palestra' | 'conferencia' | 'meetup' | 'workshop';
export type EventModality = 'Presencial' | 'Online' | 'Híbrido';

export interface TechEvent {
  id: string;
  title: string;
  name?: string;
  organizer: string;
  location: string;
  date: string;
  time: string;
  dateTime?: string;
  isPaid: boolean;
  summary: string;
  link?: string;
  ticketsConfirmed?: boolean;
  category?: EventCategory;
  tags?: string[];
  modality?: EventModality;
}
