export interface Operation {
  id: number;
  price: number;
  paid: number;
  remainder: number;
  date: string;
  patientId: number;
  notes?: string;
  operationName: string;
  patient?: {
    id: number;
    name: string;
    phone: string;
    age: number;
    address: string;
  };
}
