export interface EventModel {
  id: string;
  title: string;
  description?: string;
  date: Date;
  location: string;
  price: number;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}
