import { describe, it, expect } from "vitest";
import { STUDY_SCENES, STUDY_TRACKS_BY_MOOD, AMBIENT_SOUNDS } from "../../../components/study/study-types";

describe("StudySpace Asset Integrity Tests", () => {
  it("should have valid non-empty URLs for all 50 scenes", () => {
    expect(STUDY_SCENES.length).toBeGreaterThanOrEqual(50);
    STUDY_SCENES.forEach((scene) => {
      expect(scene.id).toBeTruthy();
      expect(scene.name).toBeTruthy();
      expect(scene.bgUrl).toMatch(/^https?:\/\//);
      expect(scene.thumbnailUrl).toMatch(/^https?:\/\//);
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
        expect(t.src).toMatch(/^https?:\/\/.*\.mp3$/);
        expect(t.cover).toMatch(/^https?:\/\//);
      });
    });
  });

  it("should have valid 20 ambient sounds", () => {
    expect(AMBIENT_SOUNDS.length).toBe(20);
    AMBIENT_SOUNDS.forEach((s) => {
      expect(s.id).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(s.src).toMatch(/^https?:\/\/.*\.mp3$/);
    });
  });
});
