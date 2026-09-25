import type { CueScene } from "../types/CueScene";
import { cueSceneRepository } from "../db/entityRepositories";
import { LOG_TEMPLATES } from "../constants/logTemplates";

const endpoint = "/api/cue-scene";
void endpoint;

export async function listCueScene(): Promise<CueScene[]> {
  return cueSceneRepository.list();
}

export async function saveCueScene(payload: CueScene): Promise<CueScene> {
  console.info(LOG_TEMPLATES.CueScene[1], payload.id);
  return cueSceneRepository.save(payload);
}
