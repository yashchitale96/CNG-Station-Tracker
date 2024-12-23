export interface CNGStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  operatingHours: string;
  price: number;
  rating: number;
}

// Mock data for CNG stations
export const stations: CNGStation[] = [
  {
    id: '1',
    name: 'City CNG Station',
    latitude: 18.5204,
    longitude: 73.8567,
    address: 'FC Road, Pune',
    operatingHours: '24/7',
    price: 85.50,
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Highway CNG Point',
    latitude: 18.5714,
    longitude: 73.8746,
    address: 'Mumbai-Pune Highway, Pune',
    operatingHours: '6:00 AM - 11:00 PM',
    price: 86.00,
    rating: 4.2,
  },
  {
    id: '3',
    name: 'Green Fuel Station',
    latitude: 18.4908,
    longitude: 73.8271,
    address: 'Sinhagad Road, Pune',
    operatingHours: '24/7',
    price: 85.75,
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Express CNG Station',
    latitude: 18.5504,
    longitude: 73.8167,
    address: 'Paud Road, Pune',
    operatingHours: '24/7',
    price: 85.90,
    rating: 4.3,
  },
  {
    id: '5',
    name: 'Metro CNG Point',
    latitude: 18.5154,
    longitude: 73.8867,
    address: 'Nagar Road, Pune',
    operatingHours: '6:00 AM - 11:00 PM',
    price: 85.80,
    rating: 4.6,
  }
];
