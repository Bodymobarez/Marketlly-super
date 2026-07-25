import { useEffect, useMemo, useRef, useState } from "react";
import { formatCurrency } from "../utils";
import { ArrowLeft, MapPin, Heart, Shield, MessageCircle, ChevronDown, ChevronUp, Search, Check, X, SlidersHorizontal } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  listingsApi,
  type Listing,
  type GccCountry,
  GCC_COUNTRIES,
  DEFAULT_GCC_CITY_LABEL,
  citiesForCountry,
  isGccCountry,
  toBase,
  LUXURY_CATEGORIES,
  type ShoppingVertical,
} from "@marketly/core";
import { useApp } from "../AppContext";
import { useAuth } from "../AuthContext";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { HeaderControls } from "./HeaderControls";
import { VerticalSwitcher } from "./VerticalSwitcher";
import { Editable } from "./Editable";
import { Banners } from "./Banners";
import { ResponsiveSelect } from "./ResponsiveSelect";
import { tOpt } from "../i18nLabel";

type Props = {
  initial: {
    q?: string;
    location?: string;
    country?: string;
    category?: string;
    make?: string;
    model?: string;
  };
  onBack: () => void;
  onOpen: (id: number) => void;
};

const motorsFilters = {
  regionalSpecs: ["GCC", "American", "Canadian", "European", "Japanese", "Korean", "Chinese", "Other"],
  sellerType: ["Owner", "Dealer", "Dealership/Certified Pre-Owned"],
  bodyType: ["SUV", "Coupe", "Sedan", "Crossover", "Hard Top Convertible", "Pick Up Truck", "Hatchback", "Van", "Wagon", "Convertible"],
  seats: ["2", "4", "5", "6", "7", "8", "9+"],
  transmission: ["Manual", "Automatic"],
  fuel: ["Petrol", "Diesel", "Hybrid", "Electric"],
  badges: ["First Owner", "In Warranty", "Dealer Warranty", "Service History", "No Accidents", "Original Paint", "Service Contract", "Car Finance"],
  exportStatus: ["UAE (can be exported)", "Export Only"],
  exteriorColor: [
    { name: "Bronze", hex: "#cd7f32" }, { name: "Maroon", hex: "#800000" }, { name: "Pink", hex: "#ffc0cb" },
    { name: "Black", hex: "#000000" }, { name: "Blue", hex: "#2563eb" }, { name: "Brown", hex: "#8b4513" },
    { name: "Burgundy", hex: "#800020" }, { name: "Gold", hex: "#d4af37" }, { name: "Grey", hex: "#808080" },
    { name: "Orange", hex: "#f97316" }, { name: "Green", hex: "#22c55e" }, { name: "Purple", hex: "#a855f7" },
    { name: "Red", hex: "#ef4444" }, { name: "Silver", hex: "#c0c0c0" }, { name: "Beige", hex: "#f5f5dc" },
    { name: "Tan", hex: "#d2b48c" }, { name: "Teal", hex: "#0d9488" }, { name: "White", hex: "#ffffff" },
    { name: "Yellow", hex: "#facc15" }, { name: "Other Color", hex: "" },
  ],
  interiorColor: [
    { name: "Beige", hex: "#f5f5dc" }, { name: "Maroon", hex: "#800000" }, { name: "Pink", hex: "#ffc0cb" },
    { name: "Black", hex: "#000000" }, { name: "Blue", hex: "#2563eb" }, { name: "Brown", hex: "#8b4513" },
    { name: "Green", hex: "#22c55e" }, { name: "Grey", hex: "#808080" }, { name: "Orange", hex: "#f97316" },
    { name: "Red", hex: "#ef4444" }, { name: "Tan", hex: "#d2b48c" }, { name: "White", hex: "#ffffff" },
    { name: "Yellow", hex: "#facc15" }, { name: "Other Color", hex: "" },
  ],
  horsepower: ["0 - 99 HP", "100 - 199 HP", "200 - 299 HP", "300 - 399 HP", "400 - 499 HP", "500 - 599 HP", "600 - 699 HP", "700 - 799 HP", "800 - 899 HP", "900+ HP", "Unknown"],
  engineCapacity: ["0 - 499 cc", "500 - 999 cc", "1000 - 1499 cc", "1500 - 1999 cc", "2000 - 2499 cc", "2500 - 2999 cc", "3000 - 3499 cc", "3500 - 3999 cc", "4000+ cc", "3000 - 5999 cc", "Unknown"],
  doors: ["2", "3", "4", "5+"],
  warranty: ["Yes", "No", "Does not apply"],
  adsPosted: ["Today", "Within 3 days", "Within 1 week", "Within 2 weeks", "Within 1 month", "Within 3 months", "Within 6 months"],
  cylinders: ["3", "4", "5", "6", "8", "10", "12", "Unknown"],
  driverAssistance: ["360 Camera", "4 Wheel Drive", "Adaptive Brake Lights", "Alarm / Anti-Theft System", "All Wheel Drive", "Anti-Lock Brakes (ABS)", "Attention Assist", "Autonomous Emergency Braking (AEB)", "Brake Assist (BA)", "Blind Spot Monitor", "Cornering Assist", "Crosswind Assist", "Cruise Control", "Drive Mode Selector", "Electronic Stability Control", "Front Wheel Drive", "Hill Assist", "Hill Descent Control", "Lane Departure Warning", "Limited-Slip Differential", "Paddle Shifters", "Parallel Parking Assist", "Parking Sensors - Front", "Parking Sensors - Rear", "Performance Brakes", "Rear View Camera", "Rear Wheel Drive", "Seatbelt Pretensioners", "Speed Limiter", "Traction Control", "Tyre Pressure Monitoring System (TPMS)", "Front Camera", "Front Airbags", "Side Airbags", "Airbags", "Lane Keeping Assist", "Driver Attention Monitor", "Auto Hold", "Rear Cross-Traffic Alert", "Traffic Sign Recognition", "Hill Start Assist", "Automatic High-Beam Assist", "Child Seat Anchors (ISOFIX)", "Automated Parking Assist"],
  comfort: ["Active Steering", "Active Understeer Control (AUC)", "Adaptive Suspension Package", "Air Conditioning", "Airbags", "Ambient Interior Lighting", "Automatic Climate Control", "Automatic Crash Door Unlock", "Central Locking", "Climate Controlled Seats", "Cool box", "Dual Exhaust", "Foldable Rear Seats", "Foldable Rear Seats with 60:40 Split", "Heated Seats", "Keyless Entry", "Keyless Start", "Leather Seats", "Lumbar Support", "Memory Seats", "Off-Road Kit", "Off-Road Tyres", "Overhead Console Sunglass Holder", "Performance Tyres", "Power Locks", "Power Mirrors", "Power Seats", "Power Steering", "Power Windows", "Racing Seats", "Rear AC Vents", "Rear Blinds", "Remote Start", "Tilt & Telescopic Steering", "Ventilated Seats", "Auto-Dimming Mirror", "All Wheel Steering", "Valet Lock", "Illuminated Door Sills", "Rear Door Sunblinds", "Rear Electric Sunblind", "Fingerprint scanner", "Sports Suspension"],
  entertainment: ["AM/FM Radio", "Bluetooth", "Touchscreen Display", "Head-Up Display (HUD)", "Navigation System", "Premium Sound System", "Steering Wheel Audio Controls", "USB Port(s)", "Apple CarPlay", "Android Auto", "Wireless Charging", "Digital Instrument Cluster", "12V Power Outlet(s)", "Rear Entertainment Screens", "Interior Camera"],
  exteriorFeatures: ["Alloy Pedals", "Alloy Wheels", "Auto Retractable Hardtop Roof", "Body Kit", "Daytime Running Lights (DRL)", "Headlight Washers", "Panoramic Roof", "Power Tailgate", "Rear Spoiler", "Rear Window Defogger", "Rear Wiper", "Roof Rack/Rails", "Sunroof", "Tow Hitch", "Adaptive Headlights", "Hands-free Tailgate", "Side Steps", "Rain-Sensing Wipers", "Rear Fog Lights", "Cornering Lights", "LED Headlights", "Front Fog Lights"],
  otherFilters: ["Ads with 360 view", "Ads in English", "Ads with Video", "Yard Sale"],
};

const classifiedsFilters = {
  condition: ["New", "Used - Like New", "Used - Good", "Used - Fair"],
  warranty: ["Yes - Manufacturer", "Yes - Seller", "No"],
};

const classifiedsCategories: { group: string; items: string[] }[] = [
  { group: "Computers & Networking", items: ["Laptops", "Desktops", "Tablets", "Monitors", "Printers & Scanners", "Networking", "Computer Accessories"] },
  { group: "Mobile Phones & Tablets", items: ["Mobile Phones", "Smart Watches", "Mobile Accessories"] },
  { group: "Electronics & Appliances", items: ["TV & Audio", "Cameras", "Gaming Consoles", "Home Appliances", "Air Conditioners"] },
  { group: "Home & Garden", items: ["Furniture", "Kitchen Appliances", "Garden & Outdoor"] },
  { group: "Fashion & Beauty", items: ["Clothing", "Shoes", "Watches", "Bags & Luggage"] },
  { group: "Sports & Hobbies", items: ["Bicycles", "Fitness Equipment", "Musical Instruments"] },
];

const classifiedsMakes: Record<string, string[]> = {
  "Laptops": ["Apple", "HP", "Dell", "Lenovo", "Asus", "Acer", "Microsoft", "MSI", "Razer", "Samsung", "Huawei", "LG", "Toshiba", "Sony", "Other"],
  "Desktops": ["Apple", "HP", "Dell", "Lenovo", "Asus", "Acer", "Custom Build", "Alienware", "MSI", "Other"],
  "Tablets": ["Apple", "Samsung", "Huawei", "Microsoft", "Lenovo", "Xiaomi", "Amazon", "Other"],
  "Monitors": ["Samsung", "LG", "Dell", "HP", "Asus", "Acer", "BenQ", "ViewSonic", "MSI", "Apple", "Other"],
  "Printers & Scanners": ["HP", "Canon", "Epson", "Brother", "Xerox", "Ricoh", "Samsung", "Other"],
  "Networking": ["Cisco", "TP-Link", "Netgear", "Asus", "D-Link", "Huawei", "Ubiquiti", "Mikrotik", "Other"],
  "Computer Accessories": ["Logitech", "Razer", "Apple", "Microsoft", "HyperX", "Corsair", "SteelSeries", "Other"],
  "Mobile Phones": ["Apple", "Samsung", "Huawei", "Xiaomi", "Oppo", "Vivo", "OnePlus", "Google", "Nokia", "Sony", "Honor", "Realme", "Nothing", "Other"],
  "Smart Watches": ["Apple", "Samsung", "Huawei", "Garmin", "Fitbit", "Xiaomi", "Amazfit", "Other"],
  "Mobile Accessories": ["Apple", "Samsung", "Anker", "Belkin", "Spigen", "Otterbox", "JBL", "Other"],
  "TV & Audio": ["Samsung", "LG", "Sony", "TCL", "Hisense", "Bose", "JBL", "Sonos", "Yamaha", "Other"],
  "Cameras": ["Canon", "Nikon", "Sony", "Fujifilm", "Panasonic", "Olympus", "Leica", "GoPro", "DJI", "Other"],
  "Gaming Consoles": ["Sony", "Microsoft", "Nintendo", "Valve", "Other"],
  "Home Appliances": ["Bosch", "Siemens", "LG", "Samsung", "Whirlpool", "Daewoo", "Beko", "Hitachi", "Other"],
  "Air Conditioners": ["LG", "Samsung", "Daikin", "Mitsubishi", "Gree", "Hitachi", "Carrier", "Midea", "Other"],
  "Furniture": ["IKEA", "Home Centre", "Pan Emirates", "West Elm", "Pottery Barn", "Other"],
  "Kitchen Appliances": ["Bosch", "Kenwood", "Philips", "Tefal", "Black+Decker", "KitchenAid", "Braun", "Other"],
  "Garden & Outdoor": ["Bosch", "Stihl", "Husqvarna", "Black+Decker", "Karcher", "Other"],
  "Clothing": ["Nike", "Adidas", "Zara", "H&M", "Uniqlo", "Levi's", "Gucci", "Louis Vuitton", "Other"],
  "Shoes": ["Nike", "Adidas", "Puma", "New Balance", "Skechers", "Vans", "Converse", "Other"],
  "Watches": ["Rolex", "Omega", "Casio", "Seiko", "Citizen", "Tissot", "TAG Heuer", "Apple", "Other"],
  "Bags & Luggage": ["Samsonite", "American Tourister", "Tumi", "Louis Vuitton", "Gucci", "Coach", "Other"],
  "Bicycles": ["Trek", "Giant", "Specialized", "Cannondale", "Scott", "Merida", "Cube", "Other"],
  "Fitness Equipment": ["Technogym", "Life Fitness", "NordicTrack", "Bowflex", "Reebok", "Other"],
  "Musical Instruments": ["Yamaha", "Fender", "Gibson", "Roland", "Casio", "Korg", "Pearl", "Other"],
};

function MakeFilter({ subcat, selected, onToggle, onClear }: {
  subcat: string;
  selected: string[];
  onToggle: (m: string) => void;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  const tr = (s: string) => tOpt(t, s);
  const makes = classifiedsMakes[subcat] || [];
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = q ? makes.filter((m) => m.toLowerCase().includes(q.toLowerCase())) : makes;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm hover:border-blue-600"
      >
        <span className="inline-flex items-center gap-2 text-slate-500">
          <Search className="size-4" />
          {selected.length === 0 ? `Search ${subcat} make…` : `${selected.length} make${selected.length === 1 ? "" : "s"} selected`}
        </span>
        <ChevronDown className={`size-4 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((m) => (
            <span key={m} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs border border-blue-200 dark:border-blue-900">
              {m}
              <button onClick={() => onToggle(m)} className="hover:text-blue-900"><X className="size-3" /></button>
            </span>
          ))}
          <button onClick={onClear} className="text-xs text-slate-500 hover:text-rose-600 underline">{tr("Clear")}</button>
        </div>
      )}

      {open && (
        <div className="absolute z-20 mt-1 start-0 end-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                autoFocus value={q} onChange={(e) => setQ(e.target.value)}
                placeholder={tr("Search makes…")}
                className="w-full ps-8 pe-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none text-sm focus:border-blue-600"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">{tr("No matches")}</p>
            ) : filtered.map((mk) => {
              const on = selected.includes(mk);
              return (
                <button key={mk} onClick={() => onToggle(mk)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-start hover:bg-slate-50 dark:hover:bg-slate-800 ${on ? "text-blue-700 dark:text-blue-300" : ""}`}>
                  <span>{mk}</span>
                  {on && <Check className="size-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function useMulti() {
  const [val, setVal] = useState<Record<string, string[]>>({});
  const has = (k: string, v: string) => (val[k] || []).includes(v);
  const toggle = (k: string, v: string) =>
    setVal((s) => {
      const cur = s[k] || [];
      return { ...s, [k]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] };
    });
  const clearKey = (k: string) => setVal((s) => ({ ...s, [k]: [] }));
  const clear = () => setVal({});
  return { val, has, toggle, clear, clearKey };
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 py-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between mb-3">
        <span className="tracking-tight font-bold font-[Akaya_Kanadaka] text-[20px]">{title}</span>
        {open ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
      </button>
      {open && children}
    </div>
  );
}

function PillGroup({ items, k, has, toggle, viewMore = false }: { items: string[]; k: string; has: (k: string, v: string) => boolean; toggle: (k: string, v: string) => void; viewMore?: boolean }) {
  const { t } = useTranslation();
  const tr = (s: string) => tOpt(t, s);
  const [expanded, setExpanded] = useState(!viewMore);
  const shown = expanded ? items : items.slice(0, 6);
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {shown.map((it) => (
          <button
            key={it}
            onClick={() => toggle(k, it)}
            className={`px-3 py-1.5 rounded-full border text-sm transition ${has(k, it) ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300" : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-400"}`}
          >
            {tOpt(t, it)}
          </button>
        ))}
      </div>
      {viewMore && items.length > 6 && (
        <button onClick={() => setExpanded(!expanded)} className="mt-2 text-blue-600 hover:underline text-sm">
          {expanded ? tOpt(t, "View Less") : tOpt(t, "View More")}
        </button>
      )}
    </>
  );
}

function ColorGroup({ items, k, has, toggle }: { items: { name: string; hex: string }[]; k: string; has: (k: string, v: string) => boolean; toggle: (k: string, v: string) => void }) {
  const { t } = useTranslation();
  const tr = (s: string) => tOpt(t, s);
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, 9);
  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {shown.map((c) => (
          <button
            key={c.name}
            onClick={() => toggle(k, c.name)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-full border text-sm transition ${has(k, c.name) ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30" : "border-slate-200 dark:border-slate-700"}`}
          >
            {c.hex ? (
              <span className="size-3 rounded-full border border-slate-300" style={{ background: c.hex }} />
            ) : (
              <span className="size-3 rounded-full border border-slate-300 bg-gradient-to-br from-pink-400 via-yellow-400 to-blue-400" />
            )}
            <span className="truncate">{tOpt(t, c.name)}</span>
          </button>
        ))}
      </div>
      {items.length > 9 && (
        <button onClick={() => setExpanded(!expanded)} className="mt-2 text-blue-600 hover:underline text-sm">
          {expanded ? tOpt(t, "View Less") : tOpt(t, "View More")}
        </button>
      )}
    </>
  );
}

export function Browse({ initial, onBack, onOpen }: Props) {
  const { t } = useTranslation();
  const tr = (s: string) => tOpt(t, s);
  const {
    favorites,
    toggleFavorite,
    vertical,
    currency,
    country: preferredCountry,
    setCountry: setPreferredCountry,
    setCity: setPreferredCity,
  } = useApp();
  const { user } = useAuth();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [q, setQ] = useState(initial.q || "");
  const cat = initial.category || "";
  const [country, setCountry] = useState<GccCountry | "">(
    isGccCountry(initial.country) ? initial.country : preferredCountry,
  );
  const [city, setCity] = useState(initial.location || DEFAULT_GCC_CITY_LABEL);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [sort, setSort] = useState("newest");
  const [inspectedOnly, setInspectedOnly] = useState(false);
  const [subcat, setSubcat] = useState<string>("");
  const m = useMulti();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const cityOptions = country ? citiesForCountry(country) : [];
  const prevVertical = useRef(vertical);

  // Vertical switcher is source of truth — clear city so Madinah default never hides coastal inventory
  useEffect(() => {
    if (prevVertical.current === vertical) return;
    prevVertical.current = vertical;
    setCity("");
  }, [vertical]);

  /** Prefer active vertical over URL category (avoids motors/cars vs yachts mismatch → 0 results) */
  const categoryForQuery = useMemo(() => {
    if (vertical !== "super") return undefined;
    if (cat && (LUXURY_CATEGORIES as readonly string[]).includes(cat)) return cat;
    if (cat === "motors") return "cars";
    return cat || undefined;
  }, [vertical, cat]);

  const verticalForQuery: ShoppingVertical | undefined =
    vertical === "super" && categoryForQuery && (LUXURY_CATEGORIES as readonly string[]).includes(categoryForQuery)
      ? (categoryForQuery as ShoppingVertical)
      : vertical;

  const fetchBrowse = async () => {
    const base = {
      status: "approved" as const,
      includeOwnPending: true,
      userId: user?.id,
      category: vertical !== "super" ? undefined : categoryForQuery,
      q: q || undefined,
      make: initial.make,
      vertical: verticalForQuery,
    };
    let res = await listingsApi.listListings({
      ...base,
      location: city || undefined,
      country: country || undefined,
    });
    if (!res.ok) return res;
    // Location/country too tight for this vertical → show full vertical inventory
    if (res.data.length === 0 && (city || country)) {
      if (city) {
        res = await listingsApi.listListings({ ...base, country: country || undefined });
        if (res.ok && res.data.length > 0) {
          setCity("");
          return res;
        }
      }
      if (country) {
        res = await listingsApi.listListings({ ...base });
        if (res.ok && res.data.length > 0) {
          setCity("");
          setCountry("");
          return res;
        }
      }
    }
    return res;
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchBrowse().then((res) => {
      if (!alive) return;
      if (res.ok) setListings(res.data);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchBrowse closes over latest filters
  }, [q, cat, city, country, user?.id, initial.make, vertical, categoryForQuery, verticalForQuery]);

  useEffect(
    () =>
      listingsApi.subscribeListings(() => {
        fetchBrowse().then((res) => {
          if (res.ok) setListings(res.data);
        });
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, cat, city, country, user?.id, initial.make, vertical, categoryForQuery, verticalForQuery],
  );

  const results: Listing[] = useMemo(() => {
    let list = [...listings];
    // Min/max are entered in the active display currency; listings are stored in SAR.
    if (min) list = list.filter((l) => l.price >= toBase(+min, currency));
    if (max) list = list.filter((l) => l.price <= toBase(+max, currency));
    const selectedMakes = m.val["make"] || [];
    if (selectedMakes.length > 0) list = list.filter((l) => l.make && selectedMakes.includes(l.make));
    if (inspectedOnly) list = list.filter((l) => l.verified);
    if (sort === "priceLow") list.sort((a, b) => a.price - b.price);
    else if (sort === "priceHigh") list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => a.date - b.date);
    return list;
  }, [listings, min, max, sort, inspectedOnly, m.val, currency]);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const [path, query = ""] = hash.split("?");
    if (path !== "browse") return;
    const ps = new URLSearchParams(query);
    const next: Record<string, string> = { category: cat || "" };
    if (q) next.q = q;
    if (city) next.location = city;
    if (country) next.country = country;
    if (min) next.min = min;
    if (max) next.max = max;
    if (sort !== "newest") next.sort = sort;
    if (inspectedOnly) next.inspected = "1";
    if (subcat) next.subcat = subcat;
    const makes = (m.val["make"] || []).join(",");
    if (makes) next.make = makes;
    const newQs = new URLSearchParams(next).toString();
    if (newQs !== ps.toString()) {
      const target = `#browse${newQs ? `?${newQs}` : ""}`;
      if (window.location.hash !== target) window.history.replaceState(null, "", target);
    }
  }, [q, cat, city, country, min, max, sort, inspectedOnly, subcat, m.val]);

  const clearAll = () => {
    setQ("");
    setCountry(preferredCountry);
    setCity(DEFAULT_GCC_CITY_LABEL);
    setMin("");
    setMax("");
    setSort("newest");
    setInspectedOnly(false);
    m.clear();
  };

  const pickCountry = (code: GccCountry | "") => {
    setCountry(code);
    if (!code) {
      setCity("");
      return;
    }
    // Sync preferred country → active currency for all product surfaces
    setPreferredCountry(code);
    const cities = citiesForCountry(code);
    const keep = cities.some((c) => c.labelEn === city);
    if (!keep) {
      const next = cities[0]?.labelEn || "";
      setCity(next);
      if (next) setPreferredCity(next);
    }
  };

  const titleVertical =
    vertical !== "super"
      ? vertical
      : cat && (LUXURY_CATEGORIES as readonly string[]).includes(cat)
        ? cat
        : cat === "motors"
          ? "cars"
          : "";
  const catTitle = titleVertical
    ? t(`super.vertical.${titleVertical}`)
    : cat === "classifieds"
      ? t("nav.classifieds")
      : t("browse.title");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0" aria-label={t("common.back", { defaultValue: "Back" })}>
            <ArrowLeft className="size-5 rtl:rotate-180" />
          </button>
          <h1 className="tracking-tight min-w-0 truncate flex-1">{catTitle}</h1>
          <div className="ms-auto shrink-0"><HeaderControls /></div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-2 overflow-x-auto no-scrollbar">
            <VerticalSwitcher size="sm" className="w-full max-w-none" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-[300px_1fr] gap-6">
        {filtersOpen && (
          <button
            type="button"
            className="lg:hidden fixed inset-0 z-[70] bg-black/45"
            aria-label={t("common.close")}
            onClick={() => setFiltersOpen(false)}
          />
        )}
        <aside
          className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 h-fit z-[80]
            max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:max-h-[90dvh] max-lg:rounded-t-2xl max-lg:overflow-y-auto max-lg:shadow-2xl
            ${filtersOpen ? "max-lg:block" : "max-lg:hidden"}
            lg:block lg:rounded-2xl lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto`}
        >
          <div className="flex items-center justify-between mb-2 gap-2">
            <h3 className="tracking-tight">{t("browse.filters")}</h3>
            <div className="flex items-center gap-2">
              <button type="button" onClick={clearAll} className="text-blue-600 hover:text-blue-700 text-sm">
                {t("browse.clear")}
              </button>
              <button
                type="button"
                className="lg:hidden min-h-10 min-w-10 inline-flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label={t("common.close")}
                onClick={() => setFiltersOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          <Section title={t("browse.priceWithCurrency", { currency })}>
            <div className="grid grid-cols-2 gap-2">
              <input value={min} onChange={(e) => setMin(e.target.value)} type="number" placeholder={tr("Min")} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 outline-none text-sm" />
              <input value={max} onChange={(e) => setMax(e.target.value)} type="number" placeholder={tr("Max")} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 outline-none text-sm" />
            </div>
          </Section>

          <Section title={t("gcc.country")}>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => pickCountry("")}
                className={`px-2.5 py-1 rounded-lg text-xs border ${
                  !country
                    ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                {t("gcc.allCountries")}
              </button>
              {GCC_COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => pickCountry(c.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs border ${
                    country === c.code
                      ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {t(`gcc.countries.${c.code}`)}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">{t("gcc.startingFromMadinah")}</p>
          </Section>

          <Section title={t("browse.location")}>
            <div className="relative">
              <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none z-[1]" />
              <ResponsiveSelect
                value={city}
                onChange={setCity}
                className="ps-9"
                aria-label={t("browse.location")}
                options={[
                  { value: "", label: t("super.allLocations") },
                  ...(cityOptions.length
                    ? cityOptions
                    : GCC_COUNTRIES.flatMap((c) => citiesForCountry(c.code))
                  ).map((c) => ({
                    value: c.labelEn,
                    label: t(`gcc.cities.${c.id}`, { defaultValue: c.labelEn }),
                  })),
                ]}
              />
            </div>
          </Section>

          {cat === "motors" && (
            <>
              <div className="py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="tracking-tight font-[Abhaya_Libre_ExtraBold]">
                    <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-1.5 py-0.5 rounded">Marketly</span> {tr("inspected cars")}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white">{t("common.newBadge")}</span>
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={inspectedOnly} onChange={(e) => setInspectedOnly(e.target.checked)} className="size-4 accent-blue-600" />
                  <span className="text-sm">{tr("Show inspected cars only")}</span>
                </label>
              </div>

              <Section title={tOpt(t, "Regional Specs")}>
                <PillGroup items={motorsFilters.regionalSpecs} k="regionalSpecs" has={m.has} toggle={m.toggle} viewMore />
              </Section>

              <Section title={tOpt(t, "Keywords")}>
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Enter Keyword...")} className="w-full ps-9 pe-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 outline-none text-sm" />
                </div>
              </Section>

              <Section title={tOpt(t, "Seller Type")}>
                <PillGroup items={motorsFilters.sellerType} k="sellerType" has={m.has} toggle={m.toggle} />
              </Section>

              <Section title={tOpt(t, "Body Type")}>
                <PillGroup items={motorsFilters.bodyType} k="bodyType" has={m.has} toggle={m.toggle} viewMore />
              </Section>

              <Section title={tOpt(t, "Seats")}>
                <PillGroup items={motorsFilters.seats} k="seats" has={m.has} toggle={m.toggle} viewMore />
              </Section>

              <Section title={tOpt(t, "Transmission Type")}>
                <PillGroup items={motorsFilters.transmission} k="transmission" has={m.has} toggle={m.toggle} />
              </Section>

              <Section title={tOpt(t, "Fuel Type")}>
                <PillGroup items={motorsFilters.fuel} k="fuel" has={m.has} toggle={m.toggle} />
              </Section>

              <Section title={tOpt(t, "Badges")}>
                <PillGroup items={motorsFilters.badges} k="badges" has={m.has} toggle={m.toggle} viewMore />
              </Section>

              <Section title={tOpt(t, "Dealer Name")} defaultOpen={false}>
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input placeholder={tr("Search")} className="w-full ps-9 pe-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 outline-none text-sm" />
                </div>
              </Section>

              <Section title={tOpt(t, "Export Status")}>
                <PillGroup items={motorsFilters.exportStatus} k="exportStatus" has={m.has} toggle={m.toggle} />
              </Section>

              <Section title={tOpt(t, "Exterior Color")}>
                <ColorGroup items={motorsFilters.exteriorColor} k="exteriorColor" has={m.has} toggle={m.toggle} />
              </Section>

              <Section title={tOpt(t, "Interior Color")} defaultOpen={false}>
                <ColorGroup items={motorsFilters.interiorColor} k="interiorColor" has={m.has} toggle={m.toggle} />
              </Section>

              <Section title={tOpt(t, "Horsepower")} defaultOpen={false}>
                <PillGroup items={motorsFilters.horsepower} k="horsepower" has={m.has} toggle={m.toggle} viewMore />
              </Section>

              <Section title={tOpt(t, "Engine Capacity (Cc)")} defaultOpen={false}>
                <PillGroup items={motorsFilters.engineCapacity} k="engineCapacity" has={m.has} toggle={m.toggle} viewMore />
              </Section>

              <Section title={tOpt(t, "Doors")} defaultOpen={false}>
                <PillGroup items={motorsFilters.doors} k="doors" has={m.has} toggle={m.toggle} />
              </Section>

              <Section title={tOpt(t, "Warranty")} defaultOpen={false}>
                <PillGroup items={motorsFilters.warranty} k="warranty" has={m.has} toggle={m.toggle} />
              </Section>

              <Section title={tOpt(t, "Ads Posted")} defaultOpen={false}>
                <PillGroup items={motorsFilters.adsPosted} k="adsPosted" has={m.has} toggle={m.toggle} viewMore />
              </Section>

              <Section title={tOpt(t, "Number Of Cylinders")} defaultOpen={false}>
                <PillGroup items={motorsFilters.cylinders} k="cylinders" has={m.has} toggle={m.toggle} viewMore />
              </Section>

              <Section title={tOpt(t, "Driver Assistance & Safety")} defaultOpen={false}>
                <PillGroup items={motorsFilters.driverAssistance} k="driverAssistance" has={m.has} toggle={m.toggle} viewMore />
              </Section>

              <Section title={tOpt(t, "Comfort & Convenience")} defaultOpen={false}>
                <PillGroup items={motorsFilters.comfort} k="comfort" has={m.has} toggle={m.toggle} viewMore />
              </Section>

              <Section title={tOpt(t, "Entertainment & Technology")} defaultOpen={false}>
                <PillGroup items={motorsFilters.entertainment} k="entertainment" has={m.has} toggle={m.toggle} viewMore />
              </Section>

              <Section title={tOpt(t, "Exterior")} defaultOpen={false}>
                <PillGroup items={motorsFilters.exteriorFeatures} k="exteriorFeatures" has={m.has} toggle={m.toggle} viewMore />
              </Section>

              <Section title={tOpt(t, "Other Filters")} defaultOpen={false}>
                <div className="space-y-2">
                  {motorsFilters.otherFilters.map((it) => (
                    <label key={it} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={m.has("otherFilters", it)} onChange={() => m.toggle("otherFilters", it)} className="size-4 accent-blue-600" />
                      <span className="text-sm">{it}</span>
                    </label>
                  ))}
                </div>
              </Section>
            </>
          )}

          {cat === "classifieds" && (
            <>
              <Section title={tOpt(t, "Category")}>
                <select value={subcat} onChange={(e) => setSubcat(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none text-sm">
                  <option value="">{tr("All categories")}</option>
                  {classifiedsCategories.map((g) => (
                    <optgroup key={g.group} label={g.group}>
                      {g.items.map((it) => <option key={it} value={it}>{tOpt(t, it)}</option>)}
                    </optgroup>
                  ))}
                </select>
              </Section>

              {subcat && classifiedsMakes[subcat] && (
                <Section title={tOpt(t, "Make")}>
                  <MakeFilter
                    subcat={subcat}
                    selected={m.val["make"] || []}
                    onToggle={(mk) => m.toggle("make", mk)}
                    onClear={() => m.clearKey("make")}
                  />
                </Section>
              )}

              <Section title={tOpt(t, "Keywords")}>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Enter Keyword...")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 outline-none text-sm" />
              </Section>
              <Section title={tOpt(t, "Condition")}>
                <PillGroup items={classifiedsFilters.condition} k="condition" has={m.has} toggle={m.toggle} />
              </Section>
              <Section title={tOpt(t, "Warranty")}>
                <PillGroup items={classifiedsFilters.warranty} k="warranty" has={m.has} toggle={m.toggle} />
              </Section>
            </>
          )}

          {!cat && (
            <Section title={tOpt(t, "Keywords")}>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Enter Keyword...")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 outline-none text-sm" />
            </Section>
          )}

          <Section title={tOpt(t, "Sort")}>
            <ResponsiveSelect
              value={sort}
              onChange={setSort}
              aria-label={tOpt(t, "Sort")}
              options={[
                { value: "newest", label: t("browse.newest") },
                { value: "priceLow", label: t("browse.priceLow") },
                { value: "priceHigh", label: t("browse.priceHigh") },
              ]}
            />
          </Section>

          <div className="flex gap-2 mt-4 sticky bottom-0 bg-white dark:bg-slate-900 pt-3 pb-[env(safe-area-inset-bottom,0px)]">
            <button type="button" onClick={clearAll} className="min-h-11 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
              {tr("Clear")}
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="flex-1 min-h-11 px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-white dark:text-slate-900 text-white"
            >
              {t("browse.showResults", {
                count: results.length,
                defaultValue: `Show ${results.length} results`,
              })}
            </button>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="lg:hidden mb-4">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="min-h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium"
            >
              <SlidersHorizontal className="size-4" />
              {t("browse.filters")}
            </button>
          </div>
          <Banners placement="browse-top" className="mb-4" />
          <p className="text-slate-500 mb-4">
            <Editable id="browse.resultsPrefix" page="Browse" label="Results Label Prefix"
              defaultValue={`${results.length} ${t("browse.results")}`} />
          </p>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse">
                  <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 w-3/4" />
                    <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 w-1/3" />
                    <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center text-slate-500">
              {t("browse.none")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {results.map((l) => {
                const fav = favorites.includes(l.id);
                return (
                  <article key={l.id} className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition">
                    <button onClick={() => onOpen(l.id)} className="block w-full text-start">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <ImageWithFallback src={l.img} alt={l.title} className="size-full object-cover" />
                        <span className="absolute top-3 start-3 px-2 py-1 rounded-md bg-white/95 dark:bg-slate-900/95 text-xs">
                          {t(`super.vertical.${l.category}`, { defaultValue: String(l.category) })}
                        </span>
                        {l.verified && (
                          <span className="absolute bottom-3 start-3 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500 text-white text-xs">
                            <Shield className="size-3" /> {t("featured.verified")}
                          </span>
                        )}
                      </div>
                    </button>
                    <div className="p-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate">{l.title}</p>
                        <p className="text-blue-600 mt-1">{formatCurrency(l.price)}</p>
                        <p className="text-slate-500 mt-2 inline-flex items-center gap-1"><MapPin className="size-3.5" /> {l.location}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => { toggleFavorite(l.id); toast(fav ? "Removed from favorites" : "Added to favorites"); }}
                          aria-label={fav ? tr("Remove from favorites") : tr("Add to favorites")}
                          aria-pressed={fav}
                          className={`size-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center ${fav ? "text-blue-700" : "text-slate-500"}`}
                        >
                          <Heart className={`size-4 ${fav ? "fill-current" : ""}`} />
                        </button>
                        <button
                          onClick={() => toast.success(t("browse.chat"))}
                          aria-label={tr("Chat with seller")}
                          className="size-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-emerald-600"
                        >
                          <MessageCircle className="size-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
