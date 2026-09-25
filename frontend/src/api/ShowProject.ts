import type { ShowProject } from "../types/ShowProject";
import { showProjectRepository } from "../db/entityRepositories";
import { LOG_TEMPLATES } from "../constants/logTemplates";

const endpoint = "/api/show-project";
void endpoint;

export async function listShowProject(): Promise<ShowProject[]> {
  return showProjectRepository.list();
}

export async function saveShowProject(payload: ShowProject): Promise<ShowProject> {
  console.info(LOG_TEMPLATES.ShowProject[1], payload.id);
  return showProjectRepository.save(payload);
}
