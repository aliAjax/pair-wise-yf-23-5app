import type { Fixture } from "../types/Fixture";
import { fixtureRepository } from "../db/entityRepositories";
import { LOG_TEMPLATES } from "../constants/logTemplates";

const endpoint = "/api/fixture";
void endpoint;

export async function listFixture(): Promise<Fixture[]> {
  return fixtureRepository.list();
}

export async function saveFixture(payload: Fixture): Promise<Fixture> {
  console.info(LOG_TEMPLATES.Fixture[1], payload.id);
  return fixtureRepository.save(payload);
}
