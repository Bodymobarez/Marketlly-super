import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuctionStatus = "upcoming" | "live" | "ended-sold" | "ended-unsold";

/** Super Luxury verticals represented in the auction hub */
export type AuctionCategory = "boats" | "yachts" | "villas" | "palaces" | "chalets" | "cars";

export const AUCTION_CATEGORIES: AuctionCategory[] = [
  "boats", "yachts", "villas", "palaces", "chalets", "cars",
];

export type Bid = {
  id: string;
  bidderName: string;
  bidderId: string;
  amount: number;
  timestamp: number;
  isAdmin: boolean;
};

export type Auction = {
  id: string;
  title: string;
  /** Super Luxury category — drives filters & card meta */
  category: AuctionCategory;
  make: string;
  model: string;
  year: number;
  /** Cars: km · boats/yachts: engine hours · property: built area m² */
  mileage: number;
  color: string;
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  transmission: "Automatic" | "Manual";
  fuelType: "Petrol" | "Diesel" | "Electric" | "Hybrid";
  bodyType: string;
  vin: string;
  description: string;
  images: string[];
  location: string;
  startingPrice: number;
  reservePrice: number;
  minIncrement: number;
  currentBid: number;
  currentBidder: string | null;
  currentBidderId: string | null;
  bids: Bid[];
  startTime: number;
  endTime: number;
  manualEnded: boolean;
  featured: boolean;
  sellerId: string;
  sellerName: string;
  views: number;
  watchers: number;
};

/** Card / hero subtitle: year · measure · location */
export function auctionSpecSummary(a: Auction): string {
  const cat = a.category ?? "cars";
  const measure =
    cat === "cars"
      ? `${a.mileage.toLocaleString()} km`
      : cat === "boats" || cat === "yachts"
        ? `${a.mileage.toLocaleString()} h`
        : `${a.mileage.toLocaleString()} m²`;
  return `${a.year} · ${measure} · ${a.location}`;
}

export type NewAuctionDraft = Omit<Auction, "id" | "bids" | "currentBid" | "currentBidder" | "currentBidderId" | "views" | "watchers" | "manualEnded">;

// ─── Status Computation ───────────────────────────────────────────────────────

export function getStatus(a: Auction): AuctionStatus {
  if (a.manualEnded) return a.currentBid >= a.reservePrice ? "ended-sold" : "ended-unsold";
  const now = Date.now();
  if (now < a.startTime) return "upcoming";
  if (now >= a.endTime) return a.currentBid >= a.reservePrice ? "ended-sold" : "ended-unsold";
  return "live";
}

// ─── Countdown Hook ───────────────────────────────────────────────────────────

export function useCountdown(targetMs: number) {
  const [rem, setRem] = useState(() => Math.max(0, targetMs - Date.now()));
  useEffect(() => {
    const tick = () => setRem(Math.max(0, targetMs - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  const d = Math.floor(rem / 86_400_000);
  const h = Math.floor((rem % 86_400_000) / 3_600_000);
  const m = Math.floor((rem % 3_600_000) / 60_000);
  const s = Math.floor((rem % 60_000) / 1_000);
  return { days: d, hours: h, minutes: m, seconds: s, isExpired: rem === 0, remaining: rem };
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const NOW = Date.now();
const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

function mkBid(bidderId: string, bidderName: string, amount: number, minsAgo: number, isAdmin = false): Bid {
  return { id: `bid-${Math.random().toString(36).slice(2)}`, bidderName, bidderId, amount, timestamp: NOW - minsAgo * MIN, isAdmin };
}

const SEED: Auction[] = [
  // ── Cars (عربيات) ───────────────────────────────────────────────────────────
  {
    id: "a1",
    title: "2023 Ferrari 488 GTB – GCC Spec",
    category: "cars",
    make: "Ferrari", model: "488 GTB", year: 2023,
    mileage: 12400, color: "Rosso Corsa", condition: "Excellent",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "Coupe",
    vin: "ZFF79ALJ000242100",
    description: "One of the finest 488 GTBs available in the GCC market. Full Ferrari service history, single owner, never tracked. Pristine condition with all original parts. Comes with full warranty documentation and Ferrari certification. Delivered new through official UAE distributor.",
    images: [
      "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=1200",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200",
      "https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?w=1200",
    ],
    location: "Madinah",
    startingPrice: 580000, reservePrice: 620000, minIncrement: 5000,
    currentBid: 647000, currentBidder: "Ahmed Al Rashid", currentBidderId: "b1",
    bids: [
      mkBid("b3", "Khalid Al Mazrouei", 580000, 120),
      mkBid("b2", "Mohammed Al Farsi", 590000, 110),
      mkBid("b1", "Ahmed Al Rashid", 600000, 90),
      mkBid("b3", "Khalid Al Mazrouei", 610000, 70),
      mkBid("b5", "Fatima Al Kaabi", 625000, 55),
      mkBid("b1", "Ahmed Al Rashid", 637000, 40),
      mkBid("b2", "Mohammed Al Farsi", 642000, 25),
      mkBid("b1", "Ahmed Al Rashid", 647000, 8),
    ],
    startTime: NOW - 3 * HOUR, endTime: NOW + 47 * MIN,
    manualEnded: false, featured: true,
    sellerId: "s1", sellerName: "Elite Auto Madinah",
    views: 2847, watchers: 142,
  },
  {
    id: "a2",
    title: "2022 Lamborghini Urus – Pearl White",
    category: "cars",
    make: "Lamborghini", model: "Urus", year: 2022,
    mileage: 28000, color: "Pearl White", condition: "Excellent",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "SUV",
    vin: "ZPBUA1ZL4NLA12567",
    description: "Stunning Lamborghini Urus in Pearl White with full beige interior. GCC specs, service history at Al Tayer Motors. Original warranty transferable. Carbon ceramic brakes, panoramic roof, rear seat entertainment system, and 23-inch Taigete wheels.",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
    ],
    location: "Riyadh",
    startingPrice: 480000, reservePrice: 520000, minIncrement: 5000,
    currentBid: 532000, currentBidder: "Sara Al Hashimi", currentBidderId: "b4",
    bids: [
      mkBid("b6", "Omar Al Blooshi", 480000, 180),
      mkBid("b4", "Sara Al Hashimi", 490000, 150),
      mkBid("b7", "Hamdan Al Suwaidi", 505000, 120),
      mkBid("b4", "Sara Al Hashimi", 515000, 80),
      mkBid("b6", "Omar Al Blooshi", 522000, 45),
      mkBid("b4", "Sara Al Hashimi", 532000, 15),
    ],
    startTime: NOW - 5 * HOUR, endTime: NOW + 2 * HOUR + 18 * MIN,
    manualEnded: false, featured: true,
    sellerId: "s2", sellerName: "Prestige Motors UAE",
    views: 1923, watchers: 98,
  },
  {
    id: "a3",
    title: "2023 Porsche 911 GT3 RS – Touring Pkg",
    category: "cars",
    make: "Porsche", model: "911 GT3 RS", year: 2023,
    mileage: 5200, color: "Guards Red", condition: "Excellent",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "Coupe",
    vin: "WP0ZZZ99ZPS270123",
    description: "Rare GT3 RS with the Touring Package — no wing, subtle and sophisticated. Weissach Package with magnesium roof and carbon bonnet. Full cage prepared for track days. Never modified. Under manufacturer warranty until 2027.",
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200",
    ],
    location: "Jeddah",
    startingPrice: 680000, reservePrice: 740000, minIncrement: 5000,
    currentBid: 695000, currentBidder: "Khalid Al Mazrouei", currentBidderId: "b3",
    bids: [
      mkBid("b5", "Fatima Al Kaabi", 680000, 300),
      mkBid("b3", "Khalid Al Mazrouei", 695000, 200),
    ],
    startTime: NOW - 1 * HOUR, endTime: NOW + 8 * HOUR,
    manualEnded: false, featured: true,
    sellerId: "s3", sellerName: "Autostrada Premium",
    views: 1456, watchers: 76,
  },
  {
    id: "a4",
    title: "2021 Mercedes-AMG G63 – Designo Edition",
    category: "cars",
    make: "Mercedes-Benz", model: "AMG G63", year: 2021,
    mileage: 41000, color: "Obsidian Black", condition: "Good",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "SUV",
    vin: "WDC4632731X352198",
    description: "Iconic G63 in Designo Obsidian Black with exclusive AMG night package. Full AGMC service history, four new tyres fitted. Burmester sound system, sunroof, heated and cooled seats. Export-ready.",
    images: [
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=1200",
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200",
    ],
    location: "Doha",
    startingPrice: 320000, reservePrice: 360000, minIncrement: 2000,
    currentBid: 348000, currentBidder: "Omar Al Blooshi", currentBidderId: "b6",
    bids: [
      mkBid("b2", "Mohammed Al Farsi", 320000, 200),
      mkBid("b7", "Hamdan Al Suwaidi", 326000, 170),
      mkBid("b6", "Omar Al Blooshi", 334000, 120),
      mkBid("b2", "Mohammed Al Farsi", 340000, 80),
      mkBid("b6", "Omar Al Blooshi", 348000, 22),
    ],
    startTime: NOW - 6 * HOUR, endTime: NOW + 33 * MIN,
    manualEnded: false, featured: false,
    sellerId: "s1", sellerName: "Elite Auto Dubai",
    views: 3241, watchers: 187,
  },
  {
    id: "a5",
    title: "2023 Rolls-Royce Ghost – Templeside",
    category: "cars",
    make: "Rolls-Royce", model: "Ghost", year: 2023,
    mileage: 3100, color: "Midnight Sapphire", condition: "Excellent",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "Saloon",
    vin: "SCA664S54PUX12340",
    description: "Near-new Ghost with bespoke Templeside exterior. Shot-peened aluminium panels, Starlight Headliner with 1,340 fibre-optic stars, Shooting Star headlining. One of fewer than 10 in the Middle East.",
    images: [
      "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=1200",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200",
    ],
    location: "Madinah",
    startingPrice: 1200000, reservePrice: 1350000, minIncrement: 10000,
    currentBid: 1200000, currentBidder: null, currentBidderId: null,
    bids: [],
    startTime: NOW + 2 * HOUR, endTime: NOW + 2 * HOUR + 24 * HOUR,
    manualEnded: false, featured: true,
    sellerId: "s4", sellerName: "Rolls-Royce Motor Cars Madinah",
    views: 892, watchers: 54,
  },
  {
    id: "a6",
    title: "2023 BMW M4 Competition xDrive",
    category: "cars",
    make: "BMW", model: "M4 Competition", year: 2023,
    mileage: 8900, color: "Frozen Brooklyn Grey", condition: "Excellent",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "Coupe",
    vin: "WBS43AY06PCM12345",
    description: "Low-mileage M4 Competition in the sought-after Frozen Brooklyn Grey. Full M options: carbon ceramic brakes, M Drive Professional, Harman Kardon audio. Single owner, always dealer-serviced.",
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200",
    ],
    location: "Kuwait City",
    startingPrice: 295000, reservePrice: 330000, minIncrement: 2000,
    currentBid: 295000, currentBidder: null, currentBidderId: null,
    bids: [],
    startTime: NOW + 1 * DAY, endTime: NOW + 2 * DAY,
    manualEnded: false, featured: false,
    sellerId: "s2", sellerName: "Prestige Motors UAE",
    views: 634, watchers: 31,
  },
  {
    id: "a7",
    title: "2022 McLaren 720S Spider",
    category: "cars",
    make: "McLaren", model: "720S Spider", year: 2022,
    mileage: 19000, color: "Volcano Orange", condition: "Excellent",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "Convertible",
    vin: "SBM14DCH4NW001234",
    description: "Breathtaking 720S Spider in Volcano Orange. Carbon fibre pack, electrochromic roof, MSO Defined options. Full service history at McLaren Dubai. The retractable hardtop deploys in 11 seconds.",
    images: [
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200",
    ],
    location: "Manama",
    startingPrice: 720000, reservePrice: 800000, minIncrement: 5000,
    currentBid: 720000, currentBidder: null, currentBidderId: null,
    bids: [],
    startTime: NOW + 3 * DAY, endTime: NOW + 4 * DAY,
    manualEnded: false, featured: false,
    sellerId: "s5", sellerName: "Gulf Auto Trade",
    views: 421, watchers: 19,
  },
  {
    id: "a8",
    title: "2021 Range Rover Sport SVR",
    category: "cars",
    make: "Land Rover", model: "Range Rover Sport SVR", year: 2021,
    mileage: 52000, color: "Santorini Black", condition: "Good",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "SUV",
    vin: "SALWA2FE6MA234567",
    description: "Sought-after SVR model with supercharged V8. Full service history, MOT valid. Performance exhaust, panoramic roof, Meridian sound system.",
    images: [
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200",
    ],
    location: "Muscat",
    startingPrice: 245000, reservePrice: 270000, minIncrement: 2000,
    currentBid: 282000, currentBidder: "Hamdan Al Suwaidi", currentBidderId: "b7",
    bids: [
      mkBid("b1", "Ahmed Al Rashid", 245000, 3 * 24 * 60),
      mkBid("b3", "Khalid Al Mazrouei", 255000, 3 * 24 * 60 - 30),
      mkBid("b7", "Hamdan Al Suwaidi", 265000, 3 * 24 * 60 - 90),
      mkBid("b1", "Ahmed Al Rashid", 272000, 3 * 24 * 60 - 120),
      mkBid("b7", "Hamdan Al Suwaidi", 282000, 3 * 24 * 60 - 150),
    ],
    startTime: NOW - 3 * DAY, endTime: NOW - 1 * DAY,
    manualEnded: false, featured: false,
    sellerId: "s3", sellerName: "Autostrada Premium",
    views: 4102, watchers: 203,
  },
  {
    id: "a9",
    title: "2020 Bentley Continental GT V8",
    category: "cars",
    make: "Bentley", model: "Continental GT", year: 2020,
    mileage: 37000, color: "Cricket Ball Red", condition: "Good",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "Coupe",
    vin: "SCBCG2ZG2LCO99123",
    description: "The Continental GT V8 offers the perfect balance of performance and luxury. Full Naim audio, Mulliner Driving Specification, rotating display. Reserve not met at auction — relisted at starting price.",
    images: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200",
    ],
    location: "Dubai",
    startingPrice: 380000, reservePrice: 430000, minIncrement: 2000,
    currentBid: 398000, currentBidder: "Fatima Al Kaabi", currentBidderId: "b5",
    bids: [
      mkBid("b5", "Fatima Al Kaabi", 380000, 5 * 24 * 60),
      mkBid("b2", "Mohammed Al Farsi", 390000, 5 * 24 * 60 - 60),
      mkBid("b5", "Fatima Al Kaabi", 398000, 5 * 24 * 60 - 120),
    ],
    startTime: NOW - 5 * DAY, endTime: NOW - 2 * DAY,
    manualEnded: false, featured: false,
    sellerId: "s2", sellerName: "Prestige Motors UAE",
    views: 2156, watchers: 89,
  },
  {
    id: "a10",
    title: "2022 Audi RS6 Avant – Nardo Grey",
    category: "cars",
    make: "Audi", model: "RS6 Avant", year: 2022,
    mileage: 29000, color: "Nardo Grey", condition: "Excellent",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "Estate",
    vin: "WAUZZZ4G9NN045678",
    description: "The ultimate practical supercar — RS6 Avant in the definitive Nardo Grey. Carbon optics, sport exhaust, RS Sport Suspension Plus. Sold above reserve price.",
    images: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200",
    ],
    location: "Dubai",
    startingPrice: 330000, reservePrice: 360000, minIncrement: 2000,
    currentBid: 375000, currentBidder: "Mohammed Al Farsi", currentBidderId: "b2",
    bids: [
      mkBid("b4", "Sara Al Hashimi", 330000, 7 * 24 * 60),
      mkBid("b2", "Mohammed Al Farsi", 345000, 7 * 24 * 60 - 60),
      mkBid("b4", "Sara Al Hashimi", 358000, 7 * 24 * 60 - 120),
      mkBid("b2", "Mohammed Al Farsi", 375000, 7 * 24 * 60 - 180),
    ],
    startTime: NOW - 7 * DAY, endTime: NOW - 4 * DAY,
    manualEnded: false, featured: false,
    sellerId: "s1", sellerName: "Elite Auto Dubai",
    views: 3567, watchers: 178,
  },

  // ── Boats (مراكب) ───────────────────────────────────────────────────────────
  {
    id: "a11",
    title: "2022 Azimut Verve 47 – Jeddah Marina",
    category: "boats",
    make: "Azimut", model: "Verve 47", year: 2022,
    mileage: 210, color: "Pearl White", condition: "Excellent",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "Day Boat",
    vin: "AZI-VRVE47-JD22",
    description: "Open day-boat with teak beach club and Gulf-ready systems. Twin outboards, Seakeeper, full canvas. Berthed Jeddah Yacht Club — turnkey for Red Sea weekends.",
    images: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200",
      "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1200",
    ],
    location: "Jeddah",
    startingPrice: 1850000, reservePrice: 2100000, minIncrement: 25000,
    currentBid: 2185000, currentBidder: "Omar Al Blooshi", currentBidderId: "b6",
    bids: [
      mkBid("b2", "Mohammed Al Farsi", 1850000, 90),
      mkBid("b6", "Omar Al Blooshi", 1950000, 70),
      mkBid("b4", "Sara Al Hashimi", 2050000, 45),
      mkBid("b6", "Omar Al Blooshi", 2185000, 12),
    ],
    startTime: NOW - 4 * HOUR, endTime: NOW + 5 * HOUR + 22 * MIN,
    manualEnded: false, featured: true,
    sellerId: "s6", sellerName: "Marina Hub Jeddah",
    views: 1124, watchers: 67,
  },
  {
    id: "a12",
    title: "2021 Galeon 335 HTS – Manama Waterfront",
    category: "boats",
    make: "Galeon", model: "335 HTS", year: 2021,
    mileage: 340, color: "Graphite", condition: "Excellent",
    transmission: "Automatic", fuelType: "Diesel", bodyType: "Sport Cruiser",
    vin: "GAL-335HTS-BH21",
    description: "Hardtop sport cruiser with convertible cockpit and Gulf AC package. Ideal for Bahrain–Saudi coastal hops. Full service book, dry-stack option available.",
    images: [
      "https://images.unsplash.com/photo-1520256862855-398228c41684?w=1200",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200",
    ],
    location: "Manama",
    startingPrice: 920000, reservePrice: 1050000, minIncrement: 15000,
    currentBid: 1085000, currentBidder: "Fatima Al Kaabi", currentBidderId: "b5",
    bids: [
      mkBid("b5", "Fatima Al Kaabi", 920000, 140),
      mkBid("b1", "Ahmed Al Rashid", 980000, 100),
      mkBid("b3", "Khalid Al Mazrouei", 1020000, 55),
      mkBid("b5", "Fatima Al Kaabi", 1085000, 18),
    ],
    startTime: NOW - 2 * HOUR, endTime: NOW + 9 * HOUR,
    manualEnded: false, featured: false,
    sellerId: "s6", sellerName: "Marina Hub Bahrain",
    views: 786, watchers: 41,
  },
  {
    id: "a13",
    title: "2023 Axopar 37 XC Cross Cabin – Yanbu",
    category: "boats",
    make: "Axopar", model: "37 XC", year: 2023,
    mileage: 85, color: "Arctic White", condition: "Excellent",
    transmission: "Automatic", fuelType: "Petrol", bodyType: "Cabin Boat",
    vin: "AXO-37XC-YN23",
    description: "Near-new Cross Cabin for Red Sea exploration near Madinah’s Yanbu coast. Twin Mercury Verado, bow thruster, premium audio. Private-client handover available.",
    images: [
      "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1200",
    ],
    location: "Madinah",
    startingPrice: 1450000, reservePrice: 1600000, minIncrement: 20000,
    currentBid: 1450000, currentBidder: null, currentBidderId: null,
    bids: [],
    startTime: NOW + 6 * HOUR, endTime: NOW + 6 * HOUR + 36 * HOUR,
    manualEnded: false, featured: false,
    sellerId: "s7", sellerName: "Red Sea Marine Madinah",
    views: 412, watchers: 28,
  },

  // ── Yachts (يخوت) ───────────────────────────────────────────────────────────
  {
    id: "a14",
    title: "2019 Sunseeker 76 Yacht – Palm Marina",
    category: "yachts",
    make: "Sunseeker", model: "76 Yacht", year: 2019,
    mileage: 780, color: "Navy Hull", condition: "Excellent",
    transmission: "Automatic", fuelType: "Diesel", bodyType: "Motor Yacht",
    vin: "SNK-76Y-DXB19",
    description: "Italian-finished flybridge yacht with mahogany salon and turnkey Palm berth package. Zero-speed stabilisers, crew quarters, recent yard refit. Private viewing by appointment.",
    images: [
      "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200",
      "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200",
      "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1200",
    ],
    location: "Dubai",
    startingPrice: 12500000, reservePrice: 13800000, minIncrement: 100000,
    currentBid: 14150000, currentBidder: "Hamdan Al Suwaidi", currentBidderId: "b7",
    bids: [
      mkBid("b3", "Khalid Al Mazrouei", 12500000, 200),
      mkBid("b7", "Hamdan Al Suwaidi", 13000000, 160),
      mkBid("b1", "Ahmed Al Rashid", 13500000, 90),
      mkBid("b7", "Hamdan Al Suwaidi", 14150000, 25),
    ],
    startTime: NOW - 8 * HOUR, endTime: NOW + 14 * HOUR,
    manualEnded: false, featured: true,
    sellerId: "s8", sellerName: "PalmLuxe Yachts",
    views: 3421, watchers: 198,
  },
  {
    id: "a15",
    title: "2020 Prestige 680 Fly – Lusail Marina",
    category: "yachts",
    make: "Prestige", model: "680 Fly", year: 2020,
    mileage: 620, color: "Ivory", condition: "Excellent",
    transmission: "Automatic", fuelType: "Diesel", bodyType: "Flybridge Yacht",
    vin: "PRS-680-DOH20",
    description: "French flybridge yacht with full-beam master and Gulf climate package. Ideal for Qatar–Bahrain island runs. Warranty transferable; berth negotiable.",
    images: [
      "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200",
    ],
    location: "Doha",
    startingPrice: 8900000, reservePrice: 9600000, minIncrement: 75000,
    currentBid: 9750000, currentBidder: "Sara Al Hashimi", currentBidderId: "b4",
    bids: [
      mkBid("b4", "Sara Al Hashimi", 8900000, 160),
      mkBid("b6", "Omar Al Blooshi", 9200000, 110),
      mkBid("b2", "Mohammed Al Farsi", 9450000, 60),
      mkBid("b4", "Sara Al Hashimi", 9750000, 20),
    ],
    startTime: NOW - 3 * HOUR, endTime: NOW + 20 * HOUR,
    manualEnded: false, featured: false,
    sellerId: "s8", sellerName: "PalmLuxe Yachts Doha",
    views: 1876, watchers: 112,
  },
  {
    id: "a16",
    title: "2018 Azimut Grande 27M – Abu Dhabi",
    category: "yachts",
    make: "Azimut", model: "Grande 27M", year: 2018,
    mileage: 1100, color: "Silver", condition: "Good",
    transmission: "Automatic", fuelType: "Diesel", bodyType: "Superyacht",
    vin: "AZI-G27M-AUH18",
    description: "Explorer-grade 27m with beach club and formal dining. Recent engineservice, MCA-friendly layout. Upcoming auction for serious private clients only.",
    images: [
      "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1200",
    ],
    location: "Abu Dhabi",
    startingPrice: 15800000, reservePrice: 17500000, minIncrement: 150000,
    currentBid: 15800000, currentBidder: null, currentBidderId: null,
    bids: [],
    startTime: NOW + 1 * DAY, endTime: NOW + 3 * DAY,
    manualEnded: false, featured: true,
    sellerId: "s6", sellerName: "Marina Hub Abu Dhabi",
    views: 954, watchers: 73,
  },

  // ── Villas (فلل) ────────────────────────────────────────────────────────────
  {
    id: "a17",
    title: "Palm Jumeirah Signature Villa – Frond M",
    category: "villas",
    make: "Palm Estate", model: "Signature Villa", year: 2021,
    mileage: 920, color: "Sandstone", condition: "Excellent",
    transmission: "Automatic", fuelType: "Electric", bodyType: "Waterfront Villa",
    vin: "PLT-PJ-FRM-17",
    description: "Private beach villa with infinity pool, smart home and staff wing. Uninterrupted Gulf views. Freehold title ready for GCC/expat private-client transfer.",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
    ],
    location: "Dubai",
    startingPrice: 42000000, reservePrice: 45500000, minIncrement: 250000,
    currentBid: 46200000, currentBidder: "Khalid Al Mazrouei", currentBidderId: "b3",
    bids: [
      mkBid("b1", "Ahmed Al Rashid", 42000000, 180),
      mkBid("b3", "Khalid Al Mazrouei", 43500000, 120),
      mkBid("b7", "Hamdan Al Suwaidi", 44800000, 70),
      mkBid("b3", "Khalid Al Mazrouei", 46200000, 15),
    ],
    startTime: NOW - 5 * HOUR, endTime: NOW + 11 * HOUR,
    manualEnded: false, featured: true,
    sellerId: "s9", sellerName: "PalmLuxe Estates",
    views: 4210, watchers: 256,
  },
  {
    id: "a18",
    title: "Madinah Premium Villa – Private Compound",
    category: "villas",
    make: "Madinah Living", model: "Premium Villa", year: 2022,
    mileage: 780, color: "Warm Limestone", condition: "Excellent",
    transmission: "Automatic", fuelType: "Electric", bodyType: "Family Villa",
    vin: "PLT-MDN-PC-08",
    description: "Gated Madinah villa with majlis, courtyard garden and rooftop terrace. Quiet compound near key landmarks. Ideal private-client residence with full finishes.",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cd00?w=1200",
    ],
    location: "Madinah",
    startingPrice: 8500000, reservePrice: 9200000, minIncrement: 100000,
    currentBid: 9450000, currentBidder: "Ahmed Al Rashid", currentBidderId: "b1",
    bids: [
      mkBid("b5", "Fatima Al Kaabi", 8500000, 130),
      mkBid("b1", "Ahmed Al Rashid", 8800000, 95),
      mkBid("b2", "Mohammed Al Farsi", 9100000, 50),
      mkBid("b1", "Ahmed Al Rashid", 9450000, 10),
    ],
    startTime: NOW - 2 * HOUR, endTime: NOW + 28 * HOUR,
    manualEnded: false, featured: true,
    sellerId: "s10", sellerName: "Madinah Private Estates",
    views: 2688, watchers: 164,
  },
  {
    id: "a19",
    title: "Riyadh Diplomatic Quarter Villa",
    category: "villas",
    make: "DQ Residences", model: "Garden Villa", year: 2020,
    mileage: 1100, color: "Travertine", condition: "Excellent",
    transmission: "Automatic", fuelType: "Electric", bodyType: "Garden Villa",
    vin: "PLT-RYD-DQ-22",
    description: "Diplomatic Quarter villa with formal reception, landscaped gardens and secure parking. Upcoming lot for accredited private buyers.",
    images: [
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=1200",
    ],
    location: "Riyadh",
    startingPrice: 18000000, reservePrice: 19500000, minIncrement: 150000,
    currentBid: 18000000, currentBidder: null, currentBidderId: null,
    bids: [],
    startTime: NOW + 18 * HOUR, endTime: NOW + 3 * DAY,
    manualEnded: false, featured: false,
    sellerId: "s9", sellerName: "PalmLuxe Estates Riyadh",
    views: 1021, watchers: 88,
  },

  // ── Palaces (قصور) ──────────────────────────────────────────────────────────
  {
    id: "a20",
    title: "Royal Compound Palace – North Riyadh",
    category: "palaces",
    make: "Royal Compounds", model: "Ceremonial Palace", year: 2018,
    mileage: 4500, color: "Marble White", condition: "Excellent",
    transmission: "Automatic", fuelType: "Electric", bodyType: "Palace",
    vin: "PLT-RYD-PAL-01",
    description: "Ceremonial courtyard, guest palace wings and secure compound. Ballroom, helipad approach and staff village. Ultra-prime private-client sale.",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200",
    ],
    location: "Riyadh",
    startingPrice: 95000000, reservePrice: 110000000, minIncrement: 500000,
    currentBid: 112500000, currentBidder: "Hamdan Al Suwaidi", currentBidderId: "b7",
    bids: [
      mkBid("b7", "Hamdan Al Suwaidi", 95000000, 240),
      mkBid("b3", "Khalid Al Mazrouei", 102000000, 180),
      mkBid("b1", "Ahmed Al Rashid", 108000000, 100),
      mkBid("b7", "Hamdan Al Suwaidi", 112500000, 30),
    ],
    startTime: NOW - 10 * HOUR, endTime: NOW + 2 * DAY,
    manualEnded: false, featured: true,
    sellerId: "s11", sellerName: "Royal Garage Estates",
    views: 5120, watchers: 312,
  },
  {
    id: "a21",
    title: "Madinah Estate Palace – Private Grounds",
    category: "palaces",
    make: "Madinah Living", model: "Estate Palace", year: 2019,
    mileage: 3200, color: "Desert Stone", condition: "Excellent",
    transmission: "Automatic", fuelType: "Electric", bodyType: "Palace",
    vin: "PLT-MDN-PAL-04",
    description: "Palatial residence with grand majlis, private mosque wing and landscaped grounds. Designed for large family compounds near Madinah.",
    images: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
    ],
    location: "Madinah",
    startingPrice: 48000000, reservePrice: 52000000, minIncrement: 400000,
    currentBid: 53500000, currentBidder: "Mohammed Al Farsi", currentBidderId: "b2",
    bids: [
      mkBid("b2", "Mohammed Al Farsi", 48000000, 200),
      mkBid("b4", "Sara Al Hashimi", 50000000, 140),
      mkBid("b6", "Omar Al Blooshi", 51500000, 80),
      mkBid("b2", "Mohammed Al Farsi", 53500000, 22),
    ],
    startTime: NOW - 6 * HOUR, endTime: NOW + 16 * HOUR,
    manualEnded: false, featured: false,
    sellerId: "s10", sellerName: "Madinah Private Estates",
    views: 2890, watchers: 201,
  },

  // ── Chalets (شاليهات) ───────────────────────────────────────────────────────
  {
    id: "a22",
    title: "Red Sea Beach Chalet – Obhur",
    category: "chalets",
    make: "Obhur Retreats", model: "Beach Chalet", year: 2021,
    mileage: 280, color: "Coastal White", condition: "Excellent",
    transmission: "Automatic", fuelType: "Electric", bodyType: "Beach Chalet",
    vin: "PLT-JED-CH-12",
    description: "Direct beachfront chalet with private jetty access and outdoor cinema deck. Perfect Jeddah weekend escape — furnished turnkey.",
    images: [
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200",
    ],
    location: "Jeddah",
    startingPrice: 3200000, reservePrice: 3600000, minIncrement: 50000,
    currentBid: 3725000, currentBidder: "Fatima Al Kaabi", currentBidderId: "b5",
    bids: [
      mkBid("b5", "Fatima Al Kaabi", 3200000, 100),
      mkBid("b1", "Ahmed Al Rashid", 3400000, 70),
      mkBid("b4", "Sara Al Hashimi", 3550000, 40),
      mkBid("b5", "Fatima Al Kaabi", 3725000, 8),
    ],
    startTime: NOW - 1 * HOUR, endTime: NOW + 7 * HOUR,
    manualEnded: false, featured: true,
    sellerId: "s12", sellerName: "Gulf Chalet Collective",
    views: 1543, watchers: 96,
  },
  {
    id: "a23",
    title: "Hatta Mountain Chalet – Private Valley",
    category: "chalets",
    make: "Hatta Escapes", model: "Mountain Chalet", year: 2020,
    mileage: 220, color: "Timber", condition: "Excellent",
    transmission: "Automatic", fuelType: "Electric", bodyType: "Mountain Chalet",
    vin: "PLT-DXB-HT-09",
    description: "Secluded mountain chalet with glass lounge, fireplace and trail access. Cool-weather retreat from the Gulf coast — fully managed option.",
    images: [
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200",
    ],
    location: "Dubai",
    startingPrice: 2800000, reservePrice: 3100000, minIncrement: 40000,
    currentBid: 3180000, currentBidder: "Omar Al Blooshi", currentBidderId: "b6",
    bids: [
      mkBid("b6", "Omar Al Blooshi", 2800000, 110),
      mkBid("b3", "Khalid Al Mazrouei", 2950000, 75),
      mkBid("b2", "Mohammed Al Farsi", 3050000, 35),
      mkBid("b6", "Omar Al Blooshi", 3180000, 14),
    ],
    startTime: NOW - 4 * HOUR, endTime: NOW + 12 * HOUR,
    manualEnded: false, featured: false,
    sellerId: "s12", sellerName: "Gulf Chalet Collective",
    views: 1298, watchers: 71,
  },
  {
    id: "a24",
    title: "AlUla Desert Retreat Chalet",
    category: "chalets",
    make: "AlUla Living", model: "Desert Chalet", year: 2023,
    mileage: 190, color: "Sand", condition: "Excellent",
    transmission: "Automatic", fuelType: "Electric", bodyType: "Desert Chalet",
    vin: "PLT-ALU-CH-03",
    description: "Stargazing desert chalet with plunge pool and panoramic rock views. Near Madinah corridor — upcoming lot for experiential private buyers.",
    images: [
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200",
    ],
    location: "Madinah",
    startingPrice: 4100000, reservePrice: 4500000, minIncrement: 50000,
    currentBid: 4100000, currentBidder: null, currentBidderId: null,
    bids: [],
    startTime: NOW + 2 * DAY, endTime: NOW + 4 * DAY,
    manualEnded: false, featured: false,
    sellerId: "s10", sellerName: "Madinah Private Estates",
    views: 634, watchers: 45,
  },
];

// ─── Simulated bidders ────────────────────────────────────────────────────────

const SIM_BIDDERS = [
  { id: "b1", name: "Ahmed Al Rashid" },
  { id: "b2", name: "Mohammed Al Farsi" },
  { id: "b3", name: "Khalid Al Mazrouei" },
  { id: "b4", name: "Sara Al Hashimi" },
  { id: "b5", name: "Fatima Al Kaabi" },
  { id: "b6", name: "Omar Al Blooshi" },
  { id: "b7", name: "Hamdan Al Suwaidi" },
];

// ─── Context ──────────────────────────────────────────────────────────────────

type AuctionCtx = {
  auctions: Auction[];
  placeBid: (auctionId: string, amount: number, bidderId: string, bidderName: string, isAdmin?: boolean) => string | null;
  createAuction: (draft: NewAuctionDraft) => string;
  updateAuction: (id: string, patch: Partial<Auction>) => void;
  endAuction: (id: string) => void;
  deleteAuction: (id: string) => void;
};

const Ctx = createContext<AuctionCtx | null>(null);

export function AuctionProvider({ children }: { children: React.ReactNode }) {
  const [auctions, setAuctions] = useState<Auction[]>(SEED);

  // Auto-simulation: occasionally place bids on live auctions
  useEffect(() => {
    const id = setInterval(() => {
      setAuctions((prev) =>
        prev.map((a) => {
          if (getStatus(a) !== "live") return a;
          if (Math.random() > 0.22) return a; // 22% chance each tick
          const others = SIM_BIDDERS.filter((b) => b.id !== a.currentBidderId);
          const bidder = others[Math.floor(Math.random() * others.length)];
          const extraIncrements = Math.floor(Math.random() * 3);
          const newBid = a.currentBid + a.minIncrement * (1 + extraIncrements);
          const bid: Bid = {
            id: `bid-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            bidderName: bidder.name,
            bidderId: bidder.id,
            amount: newBid,
            timestamp: Date.now(),
            isAdmin: false,
          };
          return {
            ...a,
            currentBid: newBid,
            currentBidder: bidder.name,
            currentBidderId: bidder.id,
            bids: [...a.bids, bid],
          };
        })
      );
    }, 18_000); // every 18 seconds
    return () => clearInterval(id);
  }, []);

  const placeBid = useCallback(
    (auctionId: string, amount: number, bidderId: string, bidderName: string, isAdmin = false): string | null => {
      let error: string | null = null;
      setAuctions((prev) =>
        prev.map((a) => {
          if (a.id !== auctionId) return a;
          if (getStatus(a) !== "live") { error = "Auction is not currently live."; return a; }
          const minBid = a.currentBid + a.minIncrement;
          if (amount < minBid) { error = `Minimum bid is ${minBid.toLocaleString()}.`; return a; }
          if (a.currentBidderId === bidderId) { error = "You are already the highest bidder."; return a; }
          const bid: Bid = {
            id: `bid-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            bidderName, bidderId, amount, timestamp: Date.now(), isAdmin,
          };
          return {
            ...a,
            currentBid: amount,
            currentBidder: bidderName,
            currentBidderId: bidderId,
            bids: [...a.bids, bid],
          };
        })
      );
      return error;
    },
    []
  );

  const createAuction = useCallback((draft: NewAuctionDraft) => {
    const id = `a-${Date.now()}`;
    const a: Auction = {
      ...draft,
      category: draft.category ?? "cars",
      id,
      bids: [],
      currentBid: draft.startingPrice,
      currentBidder: null,
      currentBidderId: null,
      manualEnded: false,
      views: 0,
      watchers: 0,
    };
    setAuctions((prev) => [a, ...prev]);
    return id;
  }, []);

  const updateAuction = useCallback((id: string, patch: Partial<Auction>) => {
    setAuctions((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const endAuction = useCallback((id: string) => {
    setAuctions((prev) => prev.map((a) => (a.id === id ? { ...a, manualEnded: true } : a)));
  }, []);

  const deleteAuction = useCallback((id: string) => {
    setAuctions((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <Ctx.Provider value={{ auctions, placeBid, createAuction, updateAuction, endAuction, deleteAuction }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuction() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuction must be used within AuctionProvider");
  return ctx;
}
