import type { TimelineTrack } from "../types/TimelineTrack";
import { timelineTrackRepository } from "../db/entityRepositories";
import { LOG_TEMPLATES } from "../constants/logTemplates";

const endpoint = "/api/timeline-track";
void endpoint;

export async function listTimelineTrack(): Promise<TimelineTrack[]> {
  return timelineTrackRepository.list();
}

export async function saveTimelineTrack(payload: TimelineTrack): Promise<TimelineTrack> {
  console.info(LOG_TEMPLATES.TimelineTrack[1], payload.id);
  return timelineTrackRepository.save(payload);
}
