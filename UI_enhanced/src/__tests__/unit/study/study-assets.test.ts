import { describe, it, expect } from "vitest";
import { 
  STUDY_SCENES, 
  STUDY_TRACKS_BY_MOOD, 
  AMBIENT_SOUNDS, 
  CURATED_EMBED_PRESETS, 
  parseEmbedUrl 
} from "../../../components/study/study-types";

describe("StudySpace Asset Integrity Tests", () => {
  it("should have valid non-empty URLs for all 50 scenes", () => {
    expect(STUDY_SCENES.length).toBeGreaterThanOrEqual(50);
    STUDY_SCENES.forEach((scene) => {
      expect(scene.id).toBeTruthy();
      expect(scene.name).toBeTruthy();
      expect(scene.bgUrl).toMatch(/^(https?:\/\/|\/)/);
      expect(scene.thumbnailUrl).toMatch(/^(https?:\/\/|\/)/);
      // Ensure no double slashes in paths
      expect(scene.bgUrl).not.toContain("scenes/scenes/");
    });
  });

  it("should have valid audio tracks for all 3 moods", () => {
    const moods = ["lofi", "jazz", "relax"] as const;
    moods.forEach((mood) => {
      const tracks = STUDY_TRACKS_BY_MOOD[mood];
      expect(tracks.length).toBeGreaterThan(0);
      tracks.forEach((t) => {
        expect(t.id).toBeTruthy();
        expect(t.title).toBeTruthy();
        expect(t.src).toMatch(/^(https?:\/\/|\/).*\.mp3$/);
        expect(t.cover).toMatch(/^(https?:\/\/|\/)/);
      });
    });
  });

  it("should have valid 20 ambient sounds", () => {
    expect(AMBIENT_SOUNDS.length).toBe(20);
    AMBIENT_SOUNDS.forEach((s) => {
      expect(s.id).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(s.src).toMatch(/^(https?:\/\/|\/).*\.mp3$/);
    });
  });

  it("should have valid curated embed presets", () => {
    expect(CURATED_EMBED_PRESETS.length).toBe(2);
    CURATED_EMBED_PRESETS.forEach((preset) => {
      expect(preset.id).toBeTruthy();
      expect(preset.title).toBeTruthy();
      expect(preset.url).toMatch(/^https?:\/\//);
      expect(preset.embedUrl).toMatch(/^https?:\/\//);
      expect(["youtube", "spotify", "custom"]).toContain(preset.platform);
    });
  });

  it("should correctly parse various YouTube and Spotify URLs", () => {
    // YouTube Watch
    const ytWatch = parseEmbedUrl("https://www.youtube.com/watch?v=jfKfPfyJRdk");
    expect(ytWatch).not.toBeNull();
    expect(ytWatch?.platform).toBe("youtube");
    expect(ytWatch?.embedUrl).toContain("youtube-nocookie.com/embed/jfKfPfyJRdk");

    // YouTube Short URL
    const ytShort = parseEmbedUrl("https://youtu.be/5yx6BWlEvcY");
    expect(ytShort?.platform).toBe("youtube");
    expect(ytShort?.embedUrl).toContain("5yx6BWlEvcY");

    // YouTube Live URL
    const ytLive = parseEmbedUrl("https://www.youtube.com/live/jfKfPfyJRdk");
    expect(ytLive?.platform).toBe("youtube");
    expect(ytLive?.embedUrl).toContain("jfKfPfyJRdk");

    // YouTube Playlist
    const ytPlaylist = parseEmbedUrl("https://www.youtube.com/playlist?list=PLw-VjHDlEOgvW36epg_n19t-R_LwZ-M7d");
    expect(ytPlaylist?.platform).toBe("youtube");
    expect(ytPlaylist?.embedUrl).toContain("list=PLw-VjHDlEOgvW36epg_n19t-R_LwZ-M7d");

    // Spotify Playlist
    const spotPlaylist = parseEmbedUrl("https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM");
    expect(spotPlaylist?.platform).toBe("spotify");
    expect(spotPlaylist?.embedUrl).toContain("open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM");

    // Spotify Track
    const spotTrack = parseEmbedUrl("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT");
    expect(spotTrack?.platform).toBe("spotify");
    expect(spotTrack?.embedUrl).toContain("open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT");

    // Invalid URL
    expect(parseEmbedUrl("not-a-valid-url")).toBeNull();
  });
});
