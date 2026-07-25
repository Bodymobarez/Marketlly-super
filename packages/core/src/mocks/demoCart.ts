import { SEED_LISTINGS } from "./seed";

type DemoLine = {
  ref: string;
  providerId: string;
  providerName: string;
  externalId: string;
  listingId?: number;
  title: string;
  price: number;
  image: string;
  vertical: "cars" | "villas" | "yachts";
  quantity: number;
};

/** Demo enquiry cart — Madinah-first + multi-source split preview */
export function demoCartSnapshot(): { lines: DemoLine[]; updatedAt: number } {
  const byId = (id: number) => SEED_LISTINGS.find((l) => l.id === id)!;
  const madinahCar = byId(1);
  const madinahVilla = byId(5);
  const dubaiYacht = byId(22);

  return {
    updatedAt: Date.now(),
    lines: [
      {
        ref: `marketly::${madinahCar.id}`,
        providerId: "marketly",
        providerName: "Marketly",
        externalId: String(madinahCar.id),
        listingId: madinahCar.id,
        title: madinahCar.title,
        price: madinahCar.price,
        image: madinahCar.img,
        vertical: "cars",
        quantity: 1,
      },
      {
        ref: `marketly::${madinahVilla.id}`,
        providerId: "marketly",
        providerName: "Marketly",
        externalId: String(madinahVilla.id),
        listingId: madinahVilla.id,
        title: madinahVilla.title,
        price: madinahVilla.price,
        image: madinahVilla.img,
        vertical: "villas",
        quantity: 1,
      },
      {
        ref: "royalgarage::rg-car-madinah-1",
        providerId: "royalgarage",
        providerName: "Royal Garage",
        externalId: "rg-car-madinah-1",
        title: "Rolls-Royce Cullinan — Madinah",
        price: 2350000,
        image: madinahCar.img,
        vertical: "cars",
        quantity: 1,
      },
      {
        ref: `marketly::${dubaiYacht.id}`,
        providerId: "marketly",
        providerName: "Marketly",
        externalId: String(dubaiYacht.id),
        listingId: dubaiYacht.id,
        title: dubaiYacht.title,
        price: dubaiYacht.price,
        image: dubaiYacht.img,
        vertical: "yachts",
        quantity: 1,
      },
    ],
  };
}
