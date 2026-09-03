export const STUDY_CDN_URL = "https://github.com/TienxDun/HUFLIT_GPA_Strategist/releases/download/v1.0.0-assets";

export type MoodType = "lofi" | "jazz" | "relax";

export interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  category: MoodType;
  src: string;
  cover: string;
}

export interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  src: string;
  category: "rain" | "nature" | "indoor";
}

export interface Scene {
  id: string;
  name: string;
  category: string;
  type: "VIDEO" | "IMAGE";
  bgUrl: string;
  thumbnailUrl: string;
}

export interface StudyTask {
  id: string;
  text: string;
  completed: boolean;
  pomodoros: number;
  priority: "low" | "medium" | "high";
  createdAt: number;
}

export interface KanbanChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  priority?: "low" | "medium" | "high";
  checklist: KanbanChecklistItem[];
  dueDate?: string;
  completed?: boolean;
  createdAt: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  order: number;
}

export interface KanbanBoard {
  id: string;
  title: string;
  columns: KanbanColumn[];
  cards: KanbanCard[];
  createdAt: number;
}

export const STUDY_TRACKS_BY_MOOD: Record<MoodType, Track[]> = {
  "lofi": [
    {
      "id": "69120cb7fcf70a70a9c9c71d",
      "title": "Good Night - Lofi Cozy Chill Music",
      "artist": "FASSounds",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/good-night-lofi-cozy-chill-music-160166.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2023/07/30/13-02-32-179_200x200.jpg"
    },
    {
      "id": "6912147dd25e72c5f292c4f4",
      "title": "Take A Break - Cozy Ambient Lofi",
      "artist": "FASSounds",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/take-a-break-cozy-ambient-lofi-199738.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2023/07/30/13-02-32-179_200x200.jpg"
    },
    {
      "id": "691214c3d25e72c5f292c4f6",
      "title": "Winter - Holiday Chill Hop",
      "artist": "FASSounds",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/winter-holiday-chill-hop-179283.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2023/07/30/13-02-32-179_200x200.jpg"
    },
    {
      "id": "691214edd25e72c5f292c4f8",
      "title": "Sunset",
      "artist": "FASSounds",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/sunset-154292.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2023/07/30/13-02-32-179_200x200.jpg"
    },
    {
      "id": "6912151ad25e72c5f292c4fa",
      "title": "Passionate - Mediation Ambient Yoga Lofi",
      "artist": "FASSounds",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/passionate-mediation-ambient-yoga-lofi-199739.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2023/07/30/13-02-32-179_200x200.jpg"
    },
    {
      "id": "6912153cd25e72c5f292c4fc",
      "title": "Tasty - Chill Lofi Vibe",
      "artist": "FASSounds",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/tasty-chill-lofi-vibe-242105.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2023/07/30/13-02-32-179_200x200.jpg"
    },
    {
      "id": "6912158fd25e72c5f292c502",
      "title": "Romantic Dinner - Lofi Relax Beat",
      "artist": "FASSounds",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/romantic-dinner-lofi-relax-beat-112192.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2023/07/30/13-02-32-179_200x200.jpg"
    },
    {
      "id": "691215dbd25e72c5f292c506",
      "title": "Hot Coffee - Lofi Vlog Chill Hop",
      "artist": "FASSounds",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/hot-coffee-lofi-vlog-chill-hop-179282.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2023/07/30/13-02-32-179_200x200.jpg"
    },
    {
      "id": "691215f9d25e72c5f292c508",
      "title": "Lofi Mood",
      "artist": "FASSounds",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/lofi-mood-193721.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2023/07/30/13-02-32-179_200x200.jpg"
    },
    {
      "id": "6912161ad25e72c5f292c50a",
      "title": "Focus",
      "artist": "FASSounds",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/focus-154291.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2023/07/30/13-02-32-179_200x200.jpg"
    },
    {
      "id": "6912163fd25e72c5f292c50c",
      "title": "Cooking Beats",
      "artist": "FASSounds",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/cooking-beats-154289.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2023/07/30/13-02-32-179_200x200.jpg"
    },
    {
      "id": "6912165bd25e72c5f292c50e",
      "title": "Lazy Time - Summer Relax Lofi",
      "artist": "FASSounds",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/lazy-time-summer-relax-lofi-199737.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2023/07/30/13-02-32-179_200x200.jpg"
    },
    {
      "id": "6912168fd25e72c5f292c510",
      "title": "Fireplace",
      "artist": "FASSounds",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/fireplace-179281.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2023/07/30/13-02-32-179_200x200.jpg"
    },
    {
      "id": "691216bbd25e72c5f292c514",
      "title": "Chill Night",
      "artist": "FASSounds",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/chill-night-154287.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2023/07/30/13-02-32-179_200x200.jpg"
    },
    {
      "id": "691216d7d25e72c5f292c516",
      "title": "Blizzard",
      "artist": "FASSounds",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/blizzard-179280.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2023/07/30/13-02-32-179_200x200.jpg"
    },
    {
      "id": "69121733d25e72c5f292c518",
      "title": "November - Chill Fall Autumn Lofi Hip-Hop",
      "artist": "FASSounds",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/november-chill-fall-autumn-lofi-hip-hop-253484.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2023/07/30/13-02-32-179_200x200.jpg"
    },
    {
      "id": "6912a1d6b3db845e87111e3e",
      "title": "Lofi Chill Jazz",
      "artist": "SigmaMusicArt",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/lofi-chill-jazz-272869.mp3`,
      "cover": "https://res.cloudinary.com/dwycykmig/image/upload/v1762828425/chillax/authors/SigmaMusicArt.jpg"
    },
    {
      "id": "6975a7aa2b15ba426d339a7a",
      "title": "Lofi Background Music 2",
      "artist": "DELOSound",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/lofi-background-music-2-337568.mp3`,
      "cover": `${STUDY_CDN_URL}/delosound.webp`
    },
    {
      "id": "6975a8242b15ba426d339a7b",
      "title": "Lofi Background Music 4",
      "artist": "DELOSound",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/lofi-background-music-4-309039.mp3`,
      "cover": `${STUDY_CDN_URL}/delosound.webp`
    },
    {
      "id": "6975a8872b15ba426d339a7c",
      "title": "Lofi Background Music Lo-Fi",
      "artist": "DELOSound",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/lofi-background-music-lo-fi-309034.mp3`,
      "cover": `${STUDY_CDN_URL}/delosound.webp`
    },
    {
      "id": "6975a9922b15ba426d339a7d",
      "title": "Lofi Chill - Commercial Fashion Vlog",
      "artist": "FASSounds",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/lofi-chill-commercial-fashion-vlog-140858.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2023/07/30/13-02-32-179_200x200.jpg"
    },
    {
      "id": "6975aa262b15ba426d339a7e",
      "title": "Lofi Cafe",
      "artist": "lofidreams",
      "genre": "Lo-fi",
      "category": "lofi",
      "src": `${STUDY_CDN_URL}/lofi-cafe-427593.mp3`,
      "cover": `${STUDY_CDN_URL}/lofidreams.webp`
    }
  ],
  "jazz": [
    {
      "id": "6975b3062b15ba426d339a7f",
      "title": "Coffee Jazz Podcast Music",
      "artist": "Denis-Pavlov-Music",
      "genre": "Jazz",
      "category": "jazz",
      "src": `${STUDY_CDN_URL}/coffee-jazz-podcast-music-256133.mp3`,
      "cover": `${STUDY_CDN_URL}/Denis-Pavlov-Music.jpg`
    },
    {
      "id": "6975b7062b15ba426d339a82",
      "title": "Coffee with jazz",
      "artist": "Playlistsons",
      "genre": "Jazz",
      "category": "jazz",
      "src": `${STUDY_CDN_URL}/coffee-with-jazz-327479.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2025/04/14/22-15-39-553_200x200.png"
    },
    {
      "id": "6975b7692b15ba426d339a83",
      "title": "Good Morning Café Jazz",
      "artist": "sleepvolume",
      "genre": "Jazz",
      "category": "jazz",
      "src": `${STUDY_CDN_URL}/good-morning-cafe-jazz-227888.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2025/06/12/18-43-29-670_200x200.jpg"
    },
    {
      "id": "6975b7c12b15ba426d339a84",
      "title": "Jazz Cafe Background",
      "artist": "Tunetank",
      "genre": "Jazz",
      "category": "jazz",
      "src": `${STUDY_CDN_URL}/jazz-cafe-background-348913.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2025/05/29/22-47-49-487_200x200.jpg"
    },
    {
      "id": "6975b8402b15ba426d339a85",
      "title": "Jazz Night at the Coffee House",
      "artist": "TokyoRifft",
      "genre": "Jazz",
      "category": "jazz",
      "src": `${STUDY_CDN_URL}/jazz-night-at-the-coffee-house-410241.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2025/09/25/03-30-45-14_200x200.jpg"
    },
    {
      "id": "6975b8962b15ba426d339a86",
      "title": "Royalty Free JAZZ - Velvet Steps",
      "artist": "Free_Audio_Library",
      "genre": "Jazz",
      "category": "jazz",
      "src": `${STUDY_CDN_URL}/royalty-free-jazz-velvet-steps-355581.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2025/06/05/17-34-32-884_200x200.png"
    },
    {
      "id": "6975b8e82b15ba426d339a87",
      "title": "Smooth Coffee",
      "artist": "DJARTMUSIC",
      "genre": "Jazz",
      "category": "jazz",
      "src": `${STUDY_CDN_URL}/smooth-coffee-254076.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2024/10/23/08-31-46-872_200x200.jpg"
    },
    {
      "id": "6975b9322b15ba426d339a88",
      "title": "Smooth Jazz Cafe Session 1",
      "artist": "sleepvolume",
      "genre": "Jazz",
      "category": "jazz",
      "src": `${STUDY_CDN_URL}/smooth-jazz-cafe-session-1-306314.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2025/06/12/18-39-24-241_200x200.jpg"
    },
    {
      "id": "6975c0a02b15ba426d339a89",
      "title": "Fruity Jazz Session 2",
      "artist": "sleepvolume",
      "genre": "Jazz",
      "category": "jazz",
      "src": `${STUDY_CDN_URL}/fruity-jazz-session-2-283529.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2025/06/12/18-39-24-241_200x200.jpg"
    },
    {
      "id": "6975c1312b15ba426d339a8a",
      "title": "Street Corner Jazz Cafe",
      "artist": "HarumachiMusic",
      "genre": "Jazz",
      "category": "jazz",
      "src": `${STUDY_CDN_URL}/street-corner-jazz-cafe-338559.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2025/05/08/12-15-50-920_200x200.png"
    },
    {
      "id": "6975c1722b15ba426d339a8b",
      "title": "Jazz in a gentle coffee shop",
      "artist": "ONION_ALL_STARS",
      "genre": "Jazz",
      "category": "jazz",
      "src": `${STUDY_CDN_URL}/jazz-in-a-gentle-coffee-shop-137710.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2023/02/07/03-22-03-984_200x200.png"
    },
    {
      "id": "6975c1d22b15ba426d339a8c",
      "title": "lazy afternoon Jazz",
      "artist": "InhalingInfinity",
      "genre": "Jazz",
      "category": "jazz",
      "src": `${STUDY_CDN_URL}/lazy-afternoon-jazz-chilled-relaxing-saxophone-lounge-morning-303202.mp3`,
      "cover": `${STUDY_CDN_URL}/coffee-shop.PNG`
    },
    {
      "id": "6975c2232b15ba426d339a8d",
      "title": "Smooth Jazz Cafe Session 5",
      "artist": "sleepvolume",
      "genre": "Jazz",
      "category": "jazz",
      "src": `${STUDY_CDN_URL}/smooth-jazz-cafe-session-5-306319.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2025/06/12/14-47-52-63_200x200.jpg"
    },
    {
      "id": "6975c2592b15ba426d339a8e",
      "title": "Cotton Candy Jazz Session 1",
      "artist": "sleepvolume",
      "genre": "Jazz",
      "category": "jazz",
      "src": `${STUDY_CDN_URL}/cotton-candy-jazz-session-1-283530.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2025/06/12/14-47-52-63_200x200.jpg"
    },
    {
      "id": "6975c2972b15ba426d339a8f",
      "title": "Smooth Jazz Cafe Session 2",
      "artist": "sleepvolume",
      "genre": "Jazz",
      "category": "jazz",
      "src": `${STUDY_CDN_URL}/smooth-jazz-cafe-session-2-306315.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2025/06/12/14-47-52-63_200x200.jpg"
    }
  ],
  "relax": [
    {
      "id": "6975c5112b15ba426d339a90",
      "title": "relaxing piano music",
      "artist": "Clavier-Music",
      "genre": "Relax",
      "category": "relax",
      "src": `${STUDY_CDN_URL}/soft-piano-music-312509.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2024/12/12/10-25-26-543_200x200.jpg"
    },
    {
      "id": "6975c57c2b15ba426d339a91",
      "title": "relaxing piano music",
      "artist": "Clavier-Music",
      "genre": "Relax",
      "category": "relax",
      "src": `${STUDY_CDN_URL}/relaxing-piano-music-376369.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2024/12/05/13-47-53-576_200x200.jpg"
    },
    {
      "id": "6975c5ff2b15ba426d339a92",
      "title": "relaxing piano music",
      "artist": "Clavier-Music",
      "genre": "Relax",
      "category": "relax",
      "src": `${STUDY_CDN_URL}/relaxing-piano-music-293690.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2024/12/05/13-47-53-576_200x200.jpg"
    },
    {
      "id": "6975c6652b15ba426d339a93",
      "title": "Emotional Piano Music",
      "artist": "SigmaMusicArt",
      "genre": "Relax",
      "category": "relax",
      "src": `${STUDY_CDN_URL}/emotional-piano-music-256262.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2024/10/29/08-32-50-109_200x200.jpg"
    },
    {
      "id": "6975c6c12b15ba426d339a94",
      "title": "serene locations - relaxing piano music",
      "artist": "RibhavAgrawal",
      "genre": "Relax",
      "category": "relax",
      "src": `${STUDY_CDN_URL}/serene-locations-relaxing-piano-music-311526.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2025/03/10/05-15-47-945_200x200.jpg"
    },
    {
      "id": "6975c7132b15ba426d339a95",
      "title": "soft memories - relaxing piano music",
      "artist": "Clavier-Music",
      "genre": "Relax",
      "category": "relax",
      "src": `${STUDY_CDN_URL}/soft-memories-relaxing-piano-music-351872.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2025/05/30/10-09-07-282_200x200.jpg"
    },
    {
      "id": "6975c7912b15ba426d339a96",
      "title": "Emotional Piano Music",
      "artist": "DELOSound",
      "genre": "Relax",
      "category": "relax",
      "src": `${STUDY_CDN_URL}/emotional-piano-music-471129.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2026/01/22/11-37-10-469_200x200.png"
    },
    {
      "id": "6975c8af2b15ba426d339a97",
      "title": "relaxing piano music",
      "artist": "Clavier-Music",
      "genre": "Relax",
      "category": "relax",
      "src": `${STUDY_CDN_URL}/relaxing-piano-music-286434.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2025/01/10/11-57-39-29_200x200.jpg"
    },
    {
      "id": "6975c9042b15ba426d339a98",
      "title": "Soft Piano Music",
      "artist": "Sakartvelo",
      "genre": "Relax",
      "category": "relax",
      "src": `${STUDY_CDN_URL}/soft-piano-music-368174.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2025/06/30/21-45-03-322_200x200.jpg"
    },
    {
      "id": "6975c98f2b15ba426d339a99",
      "title": "Calm Piano Music",
      "artist": "Clavier-Music",
      "genre": "Relax",
      "category": "relax",
      "src": `${STUDY_CDN_URL}/calm-piano-music-351839.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2025/05/30/09-32-12-451_200x200.jpg"
    },
    {
      "id": "6975c9ed2b15ba426d339a9a",
      "title": "Piano Background Music",
      "artist": "SigmaMusicArt",
      "genre": "Relax",
      "category": "relax",
      "src": `${STUDY_CDN_URL}/piano-background-music-462076.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2026/01/09/16-27-48-222_200x200.jpg"
    },
    {
      "id": "6975ca472b15ba426d339a9b",
      "title": "Piano Relaxing Ambient Music",
      "artist": "Surprising_Media",
      "genre": "Relax",
      "category": "relax",
      "src": `${STUDY_CDN_URL}/piano-relaxing-ambient-music-405363.mp3`,
      "cover": "https://cdn.pixabay.com/audio/2025/09/16/11-26-54-970_200x200.jpg"
    }
  ]
};

export const ALL_STUDY_TRACKS: Track[] = [
  ...STUDY_TRACKS_BY_MOOD.lofi,
  ...STUDY_TRACKS_BY_MOOD.jazz,
  ...STUDY_TRACKS_BY_MOOD.relax,
];

export const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    "id": "690a1ec2be9fba0e783fc5c8",
    "name": "Forest Rain",
    "icon": "CloudRain",
    "src": `${STUDY_CDN_URL}/rain_forest.mp3`,
    "category": "rain"
  },
  {
    "id": "690a1ec2be9fba0e783fc5d1",
    "name": "Summer Storm",
    "icon": "CloudRain",
    "src": `${STUDY_CDN_URL}/summer_storm.mp3`,
    "category": "rain"
  },
  {
    "id": "690a1ec2be9fba0e783fc5d7",
    "name": "Deep Space",
    "icon": "Orbit",
    "src": `${STUDY_CDN_URL}/deepspace.mp3`,
    "category": "indoor"
  },
  {
    "id": "690a1ec2be9fba0e783fc5cc",
    "name": "City Traffic",
    "icon": "Car",
    "src": `${STUDY_CDN_URL}/city_traffic.mp3`,
    "category": "indoor"
  },
  {
    "id": "690a1ec2be9fba0e783fc5ce",
    "name": "Forest",
    "icon": "Trees",
    "src": `${STUDY_CDN_URL}/forest_night.mp3`,
    "category": "nature"
  },
  {
    "id": "690a1ec2be9fba0e783fc5d3",
    "name": "People Talking",
    "icon": "Coffee",
    "src": `${STUDY_CDN_URL}/people_talk_inside.mp3`,
    "category": "indoor"
  },
  {
    "id": "690a1ec2be9fba0e783fc5d8",
    "name": "Window Rain",
    "icon": "CloudRain",
    "src": `${STUDY_CDN_URL}/window_rain.mp3`,
    "category": "rain"
  },
  {
    "id": "690a1ec2be9fba0e783fc5d5",
    "name": "Wind",
    "icon": "Wind",
    "src": `${STUDY_CDN_URL}/wind.mp3`,
    "category": "nature"
  },
  {
    "id": "690a1ec2be9fba0e783fc5cb",
    "name": "City Rain",
    "icon": "CloudRain",
    "src": `${STUDY_CDN_URL}/rain_city.mp3`,
    "category": "rain"
  },
  {
    "id": "690a1ec2be9fba0e783fc5cf",
    "name": "Waves",
    "icon": "Waves",
    "src": `${STUDY_CDN_URL}/waves.mp3`,
    "category": "nature"
  },
  {
    "id": "690a1ec2be9fba0e783fc5d9",
    "name": "Train",
    "icon": "CloudRain",
    "src": `${STUDY_CDN_URL}/train.mp3`,
    "category": "rain"
  },
  {
    "id": "690a1ec2be9fba0e783fc5cd",
    "name": "Campfire",
    "icon": "Flame",
    "src": `${STUDY_CDN_URL}/campfire.mp3`,
    "category": "indoor"
  },
  {
    "id": "690a1ec2be9fba0e783fc5d0",
    "name": "Fan",
    "icon": "Fan",
    "src": `${STUDY_CDN_URL}/fan.mp3`,
    "category": "indoor"
  },
  {
    "id": "690a1ec2be9fba0e783fc5d6",
    "name": "Fireplace",
    "icon": "Flame",
    "src": `${STUDY_CDN_URL}/fireplace.mp3`,
    "category": "indoor"
  },
  {
    "id": "690a1ec2be9fba0e783fc5db",
    "name": "Thunders",
    "icon": "Zap",
    "src": `${STUDY_CDN_URL}/thunders.mp3`,
    "category": "rain"
  },
  {
    "id": "690a1ec2be9fba0e783fc5ca",
    "name": "Keyboard",
    "icon": "Keyboard",
    "src": `${STUDY_CDN_URL}/keyboard.mp3`,
    "category": "indoor"
  },
  {
    "id": "690a1ec2be9fba0e783fc5c9",
    "name": "Bird Chirping",
    "icon": "Bird",
    "src": `${STUDY_CDN_URL}/birds.mp3`,
    "category": "nature"
  },
  {
    "id": "690a1ec2be9fba0e783fc5d2",
    "name": "River",
    "icon": "Droplets",
    "src": `${STUDY_CDN_URL}/river.mp3`,
    "category": "nature"
  },
  {
    "id": "690a1ec2be9fba0e783fc5d4",
    "name": "Underwater",
    "icon": "Droplets",
    "src": `${STUDY_CDN_URL}/underwater.mp3`,
    "category": "indoor"
  },
  {
    "id": "690a1ec2be9fba0e783fc5da",
    "name": "Plane",
    "icon": "Plane",
    "src": `${STUDY_CDN_URL}/airplane.mp3`,
    "category": "indoor"
  }
];

export const STUDY_SCENES: Scene[] = [
  {
    "id": "scene-4k-fantasy-world",
    "name": "Journey Through Fantasy World",
    "category": "chill",
    "type": "VIDEO",
    "bgUrl": `${STUDY_CDN_URL}/journey-through-fantasy-world.3840x2160.mp4`,
    "thumbnailUrl": `${STUDY_CDN_URL}/journey-through-fantasy-world.webp`
  },
  {
    "id": "scene-4k-rainy-sunset",
    "name": "Rainy Sunset",
    "category": "chill",
    "type": "VIDEO",
    "bgUrl": `${STUDY_CDN_URL}/rainy-sunset.3840x2160.mp4`,
    "thumbnailUrl": `${STUDY_CDN_URL}/rainy-sunset.webp`
  },
  {
    "id": "scene-4k-rainy-valley",
    "name": "Rainy Valley",
    "category": "chill",
    "type": "VIDEO",
    "bgUrl": `${STUDY_CDN_URL}/rainy-valley.3840x2160.mp4`,
    "thumbnailUrl": `${STUDY_CDN_URL}/rainy-valley.webp`
  },
  {
    "id": "scene-4k-train-journey",
    "name": "Sotheby Train Journey",
    "category": "chill",
    "type": "VIDEO",
    "bgUrl": `${STUDY_CDN_URL}/sotheby-train-journey-live-wallpaper.mp4`,
    "thumbnailUrl": `${STUDY_CDN_URL}/sotheby-train-journey.webp`
  },
  {
    "id": "6908d218cf9c9d8232aeb13a",
    "name": "Living Room",
    "category": "chill",
    "type": "VIDEO",
    "bgUrl": `${STUDY_CDN_URL}/mylivewallpapers-com-Cozy-Cabin-Living-Room-4K.mp4`,
    "thumbnailUrl": `${STUDY_CDN_URL}/mylivewallpapers-com-Cozy-Cabin-Living-Room-4K.png`
  },
  {
    "id": "6908d218cf9c9d8232aeb159",
    "name": "Japanese Fujiwara Tofu",
    "category": "chill",
    "type": "VIDEO",
    "bgUrl": `${STUDY_CDN_URL}/japanese-fujiwara-tofu-store-rainy-day-initial-d-moewalls.com.mp4`,
    "thumbnailUrl": `${STUDY_CDN_URL}/japanese-fujiwara-tofu-store-rainy-day-initial-d-moewalls.com.png`
  },
  {
    "id": "6908d218cf9c9d8232aeb148",
    "name": "We Bare Bears",
    "category": "cute",
    "type": "VIDEO",
    "bgUrl": `${STUDY_CDN_URL}/mylivewallpapers-com-We-Bare-Bears-4K.mp4`,
    "thumbnailUrl": `${STUDY_CDN_URL}/mylivewallpapers-com-We-Bare-Bears-4K.png`
  },
  {
    "id": "69496d99ba05117ff34d65b7",
    "name": "Cat By The Window",
    "category": "chill",
    "type": "VIDEO",
    "bgUrl": `${STUDY_CDN_URL}/cat-by-the-window.mp4`,
    "thumbnailUrl": `${STUDY_CDN_URL}/cat-by-the-window.png`
  },
  {
    "id": "6961314b19d32e345c5bce73",
    "name": "Night Sky",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/3d-cartoon-night-sky.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/3d-cartoon-night-sky.avif`
  },
  {
    "id": "6961319719d32e345c5bce74",
    "name": "Botanic Garden",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/3d-rendering-illustration-botanic-garden.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/3d-rendering-illustration-botanic-garden.avif`
  },
  {
    "id": "696131bb19d32e345c5bce75",
    "name": "Anime Moon",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/anime-moon-landscape.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/anime-moon-landscape.avif`
  },
  {
    "id": "696131d819d32e345c5bce76",
    "name": "Anime Moon",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/anime-moon-landscape-2.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/anime-moon-landscape-2.avif`
  },
  {
    "id": "6961320d19d32e345c5bce77",
    "name": "Office Space",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/beautiful-office-space-cartoon-style-2.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/beautiful-office-space-cartoon-style-2.avif`
  },
  {
    "id": "6961322119d32e345c5bce78",
    "name": "Office Space",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/beautiful-office-space-cartoon-style.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/beautiful-office-space-cartoon-style.avif`
  },
  {
    "id": "6961332419d32e345c5bce79",
    "name": "City Architecture",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/city-architecture-landscape-digital-art.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/city-architecture-landscape-digital-art.avif`
  },
  {
    "id": "6961334419d32e345c5bce7a",
    "name": "Cityspace",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/cityscape-anime-inspired-urban-area.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/cityscape-anime-inspired-urban-area.avif`
  },
  {
    "id": "6961336a19d32e345c5bce7b",
    "name": "Cozy Home",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/cozy-home-interior-anime-style.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/cozy-home-interior-anime-style.avif`
  },
  {
    "id": "696133bf19d32e345c5bce7c",
    "name": "Urban Landscape",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/digital-art-with-urban-landscape-architecture.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/digital-art-with-urban-landscape-architecture.avif`
  },
  {
    "id": "696133e319d32e345c5bce7d",
    "name": "Evening",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/evening.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/evening.avif`
  },
  {
    "id": "6961341419d32e345c5bce7e",
    "name": "Nature Hawaii",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/nature-landscape-hawaii-with-digital-art-style.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/nature-landscape-hawaii-with-digital-art-style.avif`
  },
  {
    "id": "69637c0ac638c10eee8c62fc",
    "name": "Tokyo City Scape Night Japan",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/tokyo-cityscape-night-japan.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/tokyo-cityscape-night-japan.avif`
  },
  {
    "id": "69637c5ac638c10eee8c62fd",
    "name": "Pathway Middle Buildings Dark Sky Japan",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/pathway-middle-buildings-dark-sky-japan.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/pathway-middle-buildings-dark-sky-japan.avif`
  },
  {
    "id": "69637c7ac638c10eee8c62fe",
    "name": "Anime City",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/illustration-anime-city.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/illustration-anime-city.avif`
  },
  {
    "id": "69637c98c638c10eee8c62ff",
    "name": "River Nature",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/digital-art-style-river-nature-landscape.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/digital-art-style-river-nature-landscape.avif`
  },
  {
    "id": "69637cb4c638c10eee8c6300",
    "name": "Isolated House",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/digital-art-isolated-house.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/digital-art-isolated-house.avif`
  },
  {
    "id": "69637ccfc638c10eee8c6301",
    "name": "City Architecture",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/city-architecture-landscape-digital-art-2.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/city-architecture-landscape-digital-art-2.avif`
  },
  {
    "id": "69637ceec638c10eee8c6302",
    "name": "Office Space",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/beautiful-office-space-cartoon-style-4.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/beautiful-office-space-cartoon-style-4.avif`
  },
  {
    "id": "69637d08c638c10eee8c6303",
    "name": "Office Space",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/beautiful-office-space-cartoon-style-3.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/beautiful-office-space-cartoon-style-3.avif`
  },
  {
    "id": "69637d37c638c10eee8c6304",
    "name": "Cozy Home",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/anime-style-cozy-home-interior-with-furnishings.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/anime-style-cozy-home-interior-with-furnishings.avif`
  },
  {
    "id": "69637d56c638c10eee8c6305",
    "name": "Night Sky",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/anime-night-sky-illustration.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/anime-night-sky-illustration.avif`
  },
  {
    "id": "69637d71c638c10eee8c6306",
    "name": "Moon Landscape",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/anime-moon-landscape-3.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/anime-moon-landscape-3.avif`
  },
  {
    "id": "69637d99c638c10eee8c6307",
    "name": "Tokyo Cityscape With Fuji Mountain",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/aerial-view-tokyo-cityscape-with-fuji-mountain-japan.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/aerial-view-tokyo-cityscape-with-fuji-mountain-japan.avif`
  },
  {
    "id": "69637dd0c638c10eee8c6308",
    "name": "American Village",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/3d-cartoon-latin-american-village-scenery.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/3d-cartoon-latin-american-village-scenery.avif`
  },
  {
    "id": "6969d8e4f5373372f117a107",
    "name": "Yoga & Chill",
    "category": "chill",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/still-life-yoga-equipment.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/still-life-yoga-equipment.avif`
  },
  {
    "id": "6969d8e4f5373372f117a10a",
    "name": "Foggy Dark City II",
    "category": "dark",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/view-urban-dark-city-with-fog.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/view-urban-dark-city-with-fog.avif`
  },
  {
    "id": "6969d8e4f5373372f117a104",
    "name": "Cozy Anime Room",
    "category": "anime",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/cozy-home-interior-anime-style.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/cozy-home-interior-anime-style.avif`
  },
  {
    "id": "6969d8e4f5373372f117a101",
    "name": "Cozy Anime Home Interior",
    "category": "anime",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/anime-style-cozy-home-interior-with-furnishings.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/anime-style-cozy-home-interior-with-furnishings.avif`
  },
  {
    "id": "6969d8e4f5373372f117a105",
    "name": "Cyberpunk City",
    "category": "cyberpunk",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/cyberpunk-urban-scenery.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/cyberpunk-urban-scenery.avif`
  },
  {
    "id": "6969d8e4f5373372f117a109",
    "name": "Foggy Dark City I",
    "category": "dark",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/view-urban-dark-city-with-fog-1.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/view-urban-dark-city-with-fog-1.avif`
  },
  {
    "id": "6969d8e4f5373372f117a103",
    "name": "Modern Glass Building",
    "category": "urban",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/beautiful-view-tall-glass-business-building-with-tall-swings-side.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/beautiful-view-tall-glass-business-building-with-tall-swings-side.avif`
  },
  {
    "id": "6969d8e4f5373372f117a102",
    "name": "Anime House Architecture",
    "category": "anime",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/anime-style-house-architecture.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/anime-style-house-architecture.avif`
  },
  {
    "id": "6969d8e4f5373372f117a108",
    "name": "Urban Red Light",
    "category": "urban",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/urban-view-with-red-traffic-light.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/urban-view-with-red-traffic-light.avif`
  },
  {
    "id": "696e6122b00567589a636a2e",
    "name": "Cartoon Welcome Door",
    "category": "cartoon",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/3d-rendering-cartoon-welcome-door.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/3d-rendering-cartoon-welcome-door.avif`
  },
  {
    "id": "696e6122b00567589a636a30",
    "name": "Anime Moon Landscape V",
    "category": "anime",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/anime-moon-landscape-5.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/anime-moon-landscape-5.avif`
  },
  {
    "id": "696e6122b00567589a636a31",
    "name": "Beautiful Anime Landscape",
    "category": "anime",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/beautiful-anime-landscape-cartoon-scene.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/beautiful-anime-landscape-cartoon-scene.avif`
  },
  {
    "id": "696e6122b00567589a636a32",
    "name": "Beautiful Sunset Sea",
    "category": "nature",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/beautiful-sunset-sea.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/beautiful-sunset-sea.avif`
  },
  {
    "id": "696e6122b00567589a636a33",
    "name": "Coastal Sunset Grass",
    "category": "nature",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/coastal-sunset-scene-with-tall-grass.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/coastal-sunset-scene-with-tall-grass.avif`
  },
  {
    "id": "696e6122b00567589a636a34",
    "name": "Japan Night Street",
    "category": "urban",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/japan-city-night-with-car-street.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/japan-city-night-with-car-street.avif`
  },
  {
    "id": "696e6122b00567589a636a35",
    "name": "House Near Woods & Water",
    "category": "nature",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/landscape-house-near-woods-calm-body-water.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/landscape-house-near-woods-calm-body-water.avif`
  },
  {
    "id": "696e6122b00567589a636a36",
    "name": "Urban Street View",
    "category": "urban",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/urban-view-with-people-street.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/urban-view-with-people-street.avif`
  },
  {
    "id": "696e6122b00567589a636a37",
    "name": "Green Palm Foliage",
    "category": "nature",
    "type": "IMAGE",
    "bgUrl": `${STUDY_CDN_URL}/view-green-palm-tree-species-with-beautiful-foliage.avif`,
    "thumbnailUrl": `${STUDY_CDN_URL}/view-green-palm-tree-species-with-beautiful-foliage.avif`
  }
];

export type EmbedPlatform = "youtube" | "spotify" | "custom";

export interface StudyEmbedItem {
  id: string;
  title: string;
  url: string;
  embedUrl: string;
  platform: EmbedPlatform;
  category?: string;
  thumbnail?: string;
  isLive?: boolean;
  addedAt?: number;
}

export const CURATED_EMBED_PRESETS: StudyEmbedItem[] = [
  {
    id: "preset-chillhop-live",
    title: "Chillhop Radio — Jazzy & Lofi Hip Hop",
    url: "https://www.youtube.com/watch?v=7NOSDKb0HlU",
    embedUrl: "https://www.youtube-nocookie.com/embed/7NOSDKb0HlU?autoplay=1&rel=0",
    platform: "youtube",
    category: "Jazz Lofi",
    thumbnail: "https://img.youtube.com/vi/7NOSDKb0HlU/hqdefault.jpg",
    isLive: true
  },
  {
    id: "preset-spotify-peaceful-piano",
    title: "Peaceful Piano Study",
    url: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0",
    platform: "spotify",
    category: "Piano Cổ Điển",
    thumbnail: "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?w=600&auto=format&fit=crop&q=80",
    isLive: false
  }
];

export function parseEmbedUrl(rawUrl: string): { embedUrl: string; platform: EmbedPlatform; title?: string; thumbnail?: string; isLive?: boolean } | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();

  // 1. YouTube URL formats
  // Check playlist first: youtube.com/playlist?list=ID
  const ytPlaylistMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (trimmed.includes("youtube.com") && ytPlaylistMatch && !trimmed.includes("watch?v=")) {
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${ytPlaylistMatch[1]}&autoplay=1`,
      platform: "youtube",
      title: "YouTube Playlist",
      isLive: false
    };
  }

  // YouTube Live channel format: youtube.com/channel/ID/live or youtube.com/c/NAME/live
  const ytChannelLive = trimmed.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)(?:\/live)?/);
  if (ytChannelLive && trimmed.includes("live")) {
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/live_stream?channel=${ytChannelLive[1]}&autoplay=1`,
      platform: "youtube",
      title: "YouTube Live Stream",
      isLive: true
    };
  }

  // YouTube Live video format: youtube.com/live/ID
  const ytLiveMatch = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
  if (ytLiveMatch) {
    const videoId = ytLiveMatch[1];
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`,
      platform: "youtube",
      title: "YouTube Live Stream",
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      isLive: true
    };
  }

  // YouTube Standard: youtube.com/watch?v=ID or youtu.be/ID or youtube.com/embed/ID
  const ytVideoMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytVideoMatch) {
    const videoId = ytVideoMatch[1];
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`,
      platform: "youtube",
      title: "YouTube Video",
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      isLive: false
    };
  }

  // 2. Spotify URL formats
  // Examples: open.spotify.com/playlist/ID, open.spotify.com/track/ID, open.spotify.com/album/ID, open.spotify.com/artist/ID
  const spotifyMatch = trimmed.match(/open\.spotify\.com\/(playlist|track|album|artist|episode|show)\/([a-zA-Z0-9]+)/);
  if (spotifyMatch) {
    const [, type, id] = spotifyMatch;
    return {
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
      platform: "spotify",
      title: `Spotify ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      isLive: false
    };
  }

  // Spotify URI format: spotify:track:ID or spotify:playlist:ID
  const spotifyUriMatch = trimmed.match(/spotify:(playlist|track|album|artist):([a-zA-Z0-9]+)/);
  if (spotifyUriMatch) {
    const [, type, id] = spotifyUriMatch;
    return {
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
      platform: "spotify",
      title: `Spotify ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      isLive: false
    };
  }

  // 3. Fallback: If it's already an embeddable HTTPS iframe URL
  if (trimmed.startsWith("https://") && (trimmed.includes("embed") || trimmed.includes("player"))) {
    return {
      embedUrl: trimmed,
      platform: "custom",
      title: "Custom Stream",
      isLive: false
    };
  }

  return null;
}
