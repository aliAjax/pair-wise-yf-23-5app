import type { Fixture } from "../types/Fixture";
import type { CueScene } from "../types/CueScene";
import type { TimelineTrack } from "../types/TimelineTrack";
import type { ShowProject } from "../types/ShowProject";
import { STORE_NAMES, idbGetAll, idbPut, idbPutMany, isStoreSeeded } from "./stageLightDb";
import { mockData } from "../mocks/seedData";

async function ensureSeeded<T>(storeName: string, seedRows: T[]): Promise<T[]> {
  const seeded = await isStoreSeeded(storeName);
  if (!seeded) await idbPutMany(storeName, seedRows);
  return idbGetAll<T>(storeName);
}

export const fixtureRepository = {
  async list(): Promise<Fixture[]> {
    return ensureSeeded<Fixture>(STORE_NAMES.fixture, mockData.fixture as Fixture[]);
  },
  async save(fixture: Fixture): Promise<Fixture> {
    await idbPut(STORE_NAMES.fixture, fixture);
    return fixture;
  },
  async saveAll(rows: Fixture[]): Promise<void> {
    await idbPutMany(STORE_NAMES.fixture, rows);
  }
};

export const cueSceneRepository = {
  async list(): Promise<CueScene[]> {
    return ensureSeeded<CueScene>(STORE_NAMES.cueScene, mockData.cueScene as CueScene[]);
  },
  async save(scene: CueScene): Promise<CueScene> {
    await idbPut(STORE_NAMES.cueScene, scene);
    return scene;
  }
};

export const timelineTrackRepository = {
  async list(): Promise<TimelineTrack[]> {
    return ensureSeeded<TimelineTrack>(STORE_NAMES.timelineTrack, mockData.timelineTrack as TimelineTrack[]);
  },
  async save(track: TimelineTrack): Promise<TimelineTrack> {
    await idbPut(STORE_NAMES.timelineTrack, track);
    return track;
  }
};

export const showProjectRepository = {
  async list(): Promise<ShowProject[]> {
    return ensureSeeded<ShowProject>(STORE_NAMES.showProject, mockData.showProject as ShowProject[]);
  },
  async save(project: ShowProject): Promise<ShowProject> {
    await idbPut(STORE_NAMES.showProject, project);
    return project;
  }
};
