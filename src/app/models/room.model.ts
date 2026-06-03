export interface Room {
  roomId: number;
  roomNumber: string;
  capacity: number;
  pricePerNight: number;
  status: string;
  booking?: {
    guestName: string;
    checkInDate: string;
    checkOutDate: string;
  };
}
