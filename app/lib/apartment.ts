export type Apartment = {
  id: string;
  name: string;
  address: string;
  rent: number;
  beds: number;
  baths: number;
  sqft: number;
  commute: number; // minutes
  parking: boolean;
  parkingPrice: number; // $/month, 0 if included or no parking
  pets: boolean;
  laundry: boolean;
  notes: string;
  selected: boolean; // included in the comparison
};

export const money = (n: number) => `$${n.toLocaleString()}`;

// older saved apartments may not have parkingPrice
export const parkingCost = (a: Apartment) => (a.parking ? (a.parkingPrice ?? 0) : 0);

export const totalMonthly = (a: Apartment) => a.rent + parkingCost(a);

// older saved apartments may not have `selected`; treat them as compared
export const isCompared = (a: Apartment) => a.selected !== false;
