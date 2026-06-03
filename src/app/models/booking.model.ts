export interface Booking {
  bookingId: number;
  customerName: string;
  customerPhone: string;
  customerId: number;
  roomNumber: string;
  roomId: number;
  roomPrice: number;
  checkinTime: string;
  checkoutTime: string;
  noOfPeople: number;
  paymentMode: string;
  amount: number;
  amountPaid: number;
  paymentStatus: string;
  status: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}
