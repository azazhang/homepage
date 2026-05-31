// ===== JJJ_B LOCAL MUSIC DATABASE FALLBACK =====
// Serves as the source of truth for the local site load
// and fallback in case of Bandcamp client-side scraper failure.

const musicData = [
  {
    id: "1375316590",
    title: "Gloomy Vapor",
    year: "2025",
    genre: "Ambient / Vaporwave",
    description: "\"Gloomy Vapor\" represents an atmospheric exploration of ambient textures and vaporwave influences, creating a dreamlike sonic landscape that captures the essence of melancholic beauty.",
    bandcampUrl: "https://jjjb.bandcamp.com/album/gloomy-vapor",
    coverUrl: "images/album-covers/gloomy-vapor.jpg",
    spotifyUrl: "https://open.spotify.com/artist/3KeabuK2JtljSMRhYlcVBc",
    appleMusicUrl: "https://music.apple.com/us/artist/jjj-b/1586552449",
    tracks: [
      "Ethereal Dawn",
      "Obsidian Reflection",
      "Neon Fog",
      "Static Memory",
      "Dreamscape"
    ]
  },
  {
    id: "2799319376",
    title: "Fidelity on the Floor",
    year: "2024",
    genre: "Lo-Fi / Experimental Electronic",
    description: "\"Fidelity on the Floor\" is an introspective exploration of sound quality and emotional depth, weaving together lo-fi textures with high-fidelity production techniques to challenge conventional audio aesthetics.",
    bandcampUrl: "https://jjjb.bandcamp.com/album/fidelity-on-the-floor",
    coverUrl: "images/album-covers/fidelity-on-the-floor.jpg",
    spotifyUrl: "https://open.spotify.com/artist/3KeabuK2JtljSMRhYlcVBc",
    appleMusicUrl: "https://music.apple.com/us/artist/jjj-b/1586552449",
    tracks: [
      "Floorboard Resonance",
      "Low Resolution Comfort",
      "Vinyl Drift",
      "Tape Hiss Lullaby",
      "Decay Pattern"
    ]
  },
  {
    id: "1675303987",
    title: "Knocking like a mess",
    year: "2025",
    genre: "Experimental Electronic Chaos",
    description: "An experimental electronic album that masterfully balances chaotic rhythms with structured disorder. \"Knocking like a mess\" showcases JJJ_B's ability to find beauty in complexity, featuring intricate sound design.",
    bandcampUrl: "https://jjjb.bandcamp.com/album/knocking-like-a-mess",
    coverUrl: "images/album-covers/knocking-like-a-mess.jpg",
    spotifyUrl: "https://open.spotify.com/artist/3KeabuK2JtljSMRhYlcVBc",
    appleMusicUrl: "https://music.apple.com/us/artist/jjj-b/1586552449",
    tracks: [
      "Structured Disorder",
      "Jitter Resonance",
      "Oscillator Outflow",
      "Fractured Loop",
      "Clock Sync Failure"
    ]
  },
  {
    id: "3131193643",
    title: "Caught in the Trap",
    year: "2024",
    genre: "Dark Ambient / Trap Beats",
    description: "\"Caught in the Trap\" is a compelling exploration of cyclical patterns and escapism, blending dark ambient elements with rhythmic trap-influenced beats to capture the complexity of modern emotional landscapes.",
    bandcampUrl: "https://jjjb.bandcamp.com/album/caught-in-the-trap",
    coverUrl: "images/album-covers/caught-in-the-trap.jpg",
    spotifyUrl: "https://open.spotify.com/artist/3KeabuK2JtljSMRhYlcVBc",
    appleMusicUrl: "https://music.apple.com/us/artist/jjj-b/1586552449",
    tracks: [
      "Escapism Loop",
      "Subterranean Echoes",
      "Shadow Patterns",
      "808 Meditation",
      "Trapped Cycle"
    ]
  },
  {
    id: "408807296",
    title: "Melted Soul",
    year: "2023",
    genre: "Liquid Electronic / Ambient",
    description: "An emotional journey through liquid soundscapes and warm, melting melodies that capture the essence of transformation and vulnerability. \"Melted Soul\" highlights a warmer side of JJJ_B's production.",
    bandcampUrl: "https://jjjb.bandcamp.com/album/melted-soul",
    coverUrl: "images/album-covers/melted-soul.jpg",
    spotifyUrl: "https://open.spotify.com/artist/3KeabuK2JtljSMRhYlcVBc",
    appleMusicUrl: "https://music.apple.com/us/artist/jjj-b/1586552449",
    tracks: [
      "Liquefaction",
      "Warm Boundary",
      "Dissolving Gradients",
      "Inner Core",
      "Vapor Trail"
    ]
  },
  {
    id: "1888652718",
    title: "Yes it's album",
    year: "2023",
    genre: "Electronic Compilation",
    description: "A bold statement piece that embraces the album format with diverse compositions ranging from ambient interludes to energetic electronic anthems, breaking all genre boundaries.",
    bandcampUrl: "https://jjjb.bandcamp.com/album/yes-its-album",
    coverUrl: "images/album-covers/yes-its-album.jpg",
    spotifyUrl: "https://open.spotify.com/artist/3KeabuK2JtljSMRhYlcVBc",
    appleMusicUrl: "https://music.apple.com/us/artist/jjj-b/1586552449",
    tracks: [
      "Bold Statement",
      "Synthesized Assertion",
      "Interlude Three",
      "Anthem Pattern",
      "Concluding Remarks"
    ]
  }
];

// Export if running in a module context, otherwise attach to window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = musicData;
} else {
  window.musicData = musicData;
}
