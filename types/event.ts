export interface TechEvent {
  id: string;
  title: string;
  organizer: string;
  location: string;
  date: string;
  time: string;
  isPaid: boolean;
  price: string;
  summary: string;
  link?: string;
  ticketsConfirmed?: boolean;
}
