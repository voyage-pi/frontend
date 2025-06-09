import placeCategories from "../../public/place_categories.json";

// Direct mapping for Google Places API types to user-friendly categories
const googlePlacesTypeMapping = {
  // Nature & Parks
  park: "Park",
  national_park: "Park",
  amusement_park: "Amusement Park",
  rv_park: "Park",
  campground: "Campground",
  zoo: "Zoo",
  aquarium: "Aquarium",
  garden: "Garden",

  // Culture & Education
  museum: "Museum",
  art_gallery: "Art Gallery",
  library: "Library",
  university: "University",
  school: "School",
  church: "Church",
  synagogue: "Synagogue",
  mosque: "Mosque",
  hindu_temple: "Temple",
  place_of_worship: "Place of Worship",

  // Entertainment
  movie_theater: "Cinema",
  night_club: "Nightclub",
  casino: "Casino",
  bowling_alley: "Bowling",
  stadium: "Stadium",
  gym: "Gym",
  spa: "Spa",

  // Food & Drink
  restaurant: "Restaurant",
  meal_takeaway: "Takeaway",
  meal_delivery: "Delivery",
  cafe: "Cafe",
  bar: "Bar",
  bakery: "Bakery",
  food: "Food",

  // Shopping
  shopping_mall: "Shopping Mall",
  department_store: "Department Store",
  clothing_store: "Clothing Store",
  jewelry_store: "Jewelry Store",
  book_store: "Bookstore",
  electronics_store: "Electronics",
  furniture_store: "Furniture",
  home_goods_store: "Home Goods",
  supermarket: "Supermarket",
  convenience_store: "Convenience Store",
  pharmacy: "Pharmacy",
  florist: "Florist",
  pet_store: "Pet Store",
  store: "Store",

  // Services
  bank: "Bank",
  atm: "ATM",
  hospital: "Hospital",
  pharmacy: "Pharmacy",
  doctor: "Doctor",
  dentist: "Dentist",
  veterinary_care: "Veterinary",
  gas_station: "Gas Station",
  car_wash: "Car Wash",
  car_repair: "Car Repair",
  car_rental: "Car Rental",
  taxi_stand: "Taxi",
  subway_station: "Subway",
  train_station: "Train Station",
  bus_station: "Bus Station",
  airport: "Airport",
  lodging: "Hotel",
  travel_agency: "Travel Agency",

  // Government & Institutions
  city_hall: "City Hall",
  courthouse: "Courthouse",
  embassy: "Embassy",
  fire_station: "Fire Station",
  police: "Police",
  post_office: "Post Office",
  local_government_office: "Government Office",
  historical_place: "Historical Place",
  plaza: "Plaza",
  observation_deck: "Observation Deck",

  // Generic fallbacks
};

export const getCategoryFromTypes = (types) => {
  if (!types || !Array.isArray(types)) return null;

  // First, try to find a specific mapping for Google Places API types
  for (const type of types) {
    if (googlePlacesTypeMapping[type]) {
      return googlePlacesTypeMapping[type];
    }
  }

  // Fallback to the original category system if no specific mapping found
  for (const [category, categoryTypes] of Object.entries(placeCategories)) {
    for (const type of types) {
      if (categoryTypes.includes(type)) {
        return category;
      }
    }
  }

  return null;
};

export const getCategoryColor = (category) => {
  // Color mapping for specific Google Places API categories with modern gradients
  const specificColors = {
    // Nature & Parks - Green gradients
    Park: "bg-gradient-to-r from-green-50 to-emerald-100 text-green-700 border border-green-200/60",
    Garden:
      "bg-gradient-to-r from-green-50 to-lime-100 text-green-700 border border-green-200/60",
    Zoo: "bg-gradient-to-r from-green-50 to-teal-100 text-green-700 border border-green-200/60",
    Aquarium:
      "bg-gradient-to-r from-blue-50 to-cyan-100 text-blue-700 border border-blue-200/60",
    Campground:
      "bg-gradient-to-r from-green-50 to-emerald-100 text-green-700 border border-green-200/60",
    "Amusement Park":
      "bg-gradient-to-r from-pink-50 to-rose-100 text-pink-700 border border-pink-200/60",

    // Culture & Education - Blue gradients
    Museum:
      "bg-gradient-to-r from-blue-50 to-indigo-100 text-blue-700 border border-blue-200/60",
    "Art Gallery":
      "bg-gradient-to-r from-purple-50 to-violet-100 text-purple-700 border border-purple-200/60",
    Library:
      "bg-gradient-to-r from-blue-50 to-sky-100 text-blue-700 border border-blue-200/60",
    University:
      "bg-gradient-to-r from-indigo-50 to-blue-100 text-indigo-700 border border-indigo-200/60",
    School:
      "bg-gradient-to-r from-blue-50 to-cyan-100 text-blue-700 border border-blue-200/60",
    Church:
      "bg-gradient-to-r from-indigo-50 to-purple-100 text-indigo-700 border border-indigo-200/60",
    Synagogue:
      "bg-gradient-to-r from-indigo-50 to-purple-100 text-indigo-700 border border-indigo-200/60",
    Mosque:
      "bg-gradient-to-r from-indigo-50 to-purple-100 text-indigo-700 border border-indigo-200/60",
    Temple:
      "bg-gradient-to-r from-indigo-50 to-purple-100 text-indigo-700 border border-indigo-200/60",
    "Place of Worship":
      "bg-gradient-to-r from-indigo-50 to-purple-100 text-indigo-700 border border-indigo-200/60",

    // Entertainment - Purple/Pink gradients
    Cinema:
      "bg-gradient-to-r from-purple-50 to-fuchsia-100 text-purple-700 border border-purple-200/60",
    Nightclub:
      "bg-gradient-to-r from-purple-50 to-pink-100 text-purple-700 border border-purple-200/60",
    Casino:
      "bg-gradient-to-r from-red-50 to-rose-100 text-red-700 border border-red-200/60",
    Bowling:
      "bg-gradient-to-r from-purple-50 to-violet-100 text-purple-700 border border-purple-200/60",
    Stadium:
      "bg-gradient-to-r from-orange-50 to-amber-100 text-orange-700 border border-orange-200/60",
    Gym: "bg-gradient-to-r from-orange-50 to-red-100 text-orange-700 border border-orange-200/60",
    Spa: "bg-gradient-to-r from-pink-50 to-rose-100 text-pink-700 border border-pink-200/60",

    // Food & Drink - Warm gradients
    Restaurant:
      "bg-gradient-to-r from-orange-50 to-amber-100 text-orange-700 border border-orange-200/60",
    Cafe: "bg-gradient-to-r from-yellow-50 to-amber-100 text-yellow-700 border border-yellow-200/60",
    Bar: "bg-gradient-to-r from-amber-50 to-orange-100 text-amber-700 border border-amber-200/60",
    Bakery:
      "bg-gradient-to-r from-yellow-50 to-orange-100 text-yellow-700 border border-yellow-200/60",
    Takeaway:
      "bg-gradient-to-r from-orange-50 to-red-100 text-orange-700 border border-orange-200/60",
    Delivery:
      "bg-gradient-to-r from-orange-50 to-red-100 text-orange-700 border border-orange-200/60",
    Food: "bg-gradient-to-r from-orange-50 to-amber-100 text-orange-700 border border-orange-200/60",

    // Shopping - Emerald gradients
    "Shopping Mall":
      "bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-700 border border-emerald-200/60",
    "Department Store":
      "bg-gradient-to-r from-emerald-50 to-teal-100 text-emerald-700 border border-emerald-200/60",
    "Clothing Store":
      "bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-700 border border-emerald-200/60",
    "Jewelry Store":
      "bg-gradient-to-r from-emerald-50 to-cyan-100 text-emerald-700 border border-emerald-200/60",
    Bookstore:
      "bg-gradient-to-r from-emerald-50 to-teal-100 text-emerald-700 border border-emerald-200/60",
    Electronics:
      "bg-gradient-to-r from-emerald-50 to-blue-100 text-emerald-700 border border-emerald-200/60",
    Furniture:
      "bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-700 border border-emerald-200/60",
    "Home Goods":
      "bg-gradient-to-r from-emerald-50 to-teal-100 text-emerald-700 border border-emerald-200/60",
    Supermarket:
      "bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-700 border border-emerald-200/60",
    "Convenience Store":
      "bg-gradient-to-r from-emerald-50 to-lime-100 text-emerald-700 border border-emerald-200/60",
    Pharmacy:
      "bg-gradient-to-r from-emerald-50 to-teal-100 text-emerald-700 border border-emerald-200/60",
    Florist:
      "bg-gradient-to-r from-emerald-50 to-pink-100 text-emerald-700 border border-emerald-200/60",
    "Pet Store":
      "bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-700 border border-emerald-200/60",
    Store:
      "bg-gradient-to-r from-emerald-50 to-teal-100 text-emerald-700 border border-emerald-200/60",

    // Services - Cool gradients
    Bank: "bg-gradient-to-r from-cyan-50 to-blue-100 text-cyan-700 border border-cyan-200/60",
    ATM: "bg-gradient-to-r from-cyan-50 to-sky-100 text-cyan-700 border border-cyan-200/60",
    Hospital:
      "bg-gradient-to-r from-red-50 to-pink-100 text-red-700 border border-red-200/60",
    Doctor:
      "bg-gradient-to-r from-red-50 to-rose-100 text-red-700 border border-red-200/60",
    Dentist:
      "bg-gradient-to-r from-red-50 to-pink-100 text-red-700 border border-red-200/60",
    Veterinary:
      "bg-gradient-to-r from-red-50 to-orange-100 text-red-700 border border-red-200/60",
    "Gas Station":
      "bg-gradient-to-r from-cyan-50 to-teal-100 text-cyan-700 border border-cyan-200/60",
    "Car Wash":
      "bg-gradient-to-r from-cyan-50 to-blue-100 text-cyan-700 border border-cyan-200/60",
    "Car Repair":
      "bg-gradient-to-r from-cyan-50 to-slate-100 text-cyan-700 border border-cyan-200/60",
    "Car Rental":
      "bg-gradient-to-r from-cyan-50 to-sky-100 text-cyan-700 border border-cyan-200/60",
    Hotel:
      "bg-gradient-to-r from-teal-50 to-cyan-100 text-teal-700 border border-teal-200/60",
    "Travel Agency":
      "bg-gradient-to-r from-teal-50 to-blue-100 text-teal-700 border border-teal-200/60",

    // Transportation - Neutral gradients
    Taxi: "bg-gradient-to-r from-gray-50 to-slate-100 text-gray-700 border border-gray-200/60",
    Subway:
      "bg-gradient-to-r from-gray-50 to-zinc-100 text-gray-700 border border-gray-200/60",
    "Train Station":
      "bg-gradient-to-r from-gray-50 to-slate-100 text-gray-700 border border-gray-200/60",
    "Bus Station":
      "bg-gradient-to-r from-gray-50 to-stone-100 text-gray-700 border border-gray-200/60",
    Airport:
      "bg-gradient-to-r from-slate-50 to-gray-100 text-slate-700 border border-slate-200/60",

    // Government & Institutions - Stone gradients
    "City Hall":
      "bg-gradient-to-r from-stone-50 to-gray-100 text-stone-700 border border-stone-200/60",
    Courthouse:
      "bg-gradient-to-r from-stone-50 to-slate-100 text-stone-700 border border-stone-200/60",
    Embassy:
      "bg-gradient-to-r from-stone-50 to-zinc-100 text-stone-700 border border-stone-200/60",
    "Fire Station":
      "bg-gradient-to-r from-red-50 to-orange-100 text-red-700 border border-red-200/60",
    Police:
      "bg-gradient-to-r from-blue-50 to-indigo-100 text-blue-700 border border-blue-200/60",
    "Post Office":
      "bg-gradient-to-r from-stone-50 to-blue-100 text-stone-700 border border-stone-200/60",
    "Government Office":
      "bg-gradient-to-r from-stone-50 to-gray-100 text-stone-700 border border-stone-200/60",
    "Historical Place":
      "bg-gradient-to-r from-amber-50 to-orange-100 text-amber-700 border border-amber-200/60",
    Plaza:
      "bg-gradient-to-r from-slate-50 to-gray-100 text-slate-700 border border-slate-200/60",
    "Observation Deck":
      "bg-gradient-to-r from-sky-50 to-blue-100 text-sky-700 border border-sky-200/60",
  };

  // Check for specific category first
  if (specificColors[category]) {
    return specificColors[category];
  }

  // Fallback to original broad categories
  const broadColors = {
    Attractions: "bg-blue-100 text-blue-800 border-blue-200",
    Stores: "bg-green-100 text-green-800 border-green-200",
    Services: "bg-purple-100 text-purple-800 border-purple-200",
    Institutions: "bg-orange-100 text-orange-800 border-orange-200",
  };

  return broadColors[category] || "bg-gray-100 text-gray-800 border-gray-200";
};

export const getPrimaryType = (types) => {
  if (!types || !Array.isArray(types)) return null;

  const priorityTypes = [
    "tourist_attraction",
    "museum",
    "park",
    "restaurant",
    "store",
    "bank",
    "school",
  ];

  for (const priorityType of priorityTypes) {
    if (types.includes(priorityType)) {
      return priorityType;
    }
  }

  return types[0];
};
