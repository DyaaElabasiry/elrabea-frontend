export interface Session {
  id: number;
  paidInThisSession: number;
  notes?: string;
  date: string;
  operationId: number;
  operation?: {
    id: number;
    operationName: string;
    price: number;
    paid: number;
    remainder: number;
    date: string;
    patientId: number;
    patient?: {
      id: number;
      name: string;
      phone: string;
      age: number;
      address: string;
    };
  };
}
