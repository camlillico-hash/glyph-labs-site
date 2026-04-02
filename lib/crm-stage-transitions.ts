export function getAttemptingStatusForPipeline(pipelineType?: string) {
  return pipelineType === "connector" ? "Attempting" : "Attempting";
}

export function getInitialStatusForPipeline(pipelineType?: string) {
  return pipelineType === "connector" ? "Identified" : "New";
}

export function advanceContactToAttemptingOnActivity(contact: any) {
  const currentStatus = String(contact?.status || getInitialStatusForPipeline(contact?.pipelineType)).trim();
  const initialStatus = getInitialStatusForPipeline(contact?.pipelineType);
  if (currentStatus !== initialStatus) return currentStatus;
  return getAttemptingStatusForPipeline(contact?.pipelineType);
}
