export function notifyFailedRequests(results, toast, message) {
  const failure = results.find((result) => result.status === 'rejected');

  if (failure) {
    const detail = failure.reason instanceof Error ? ` ${failure.reason.message}` : '';
    toast.error(`${message}${detail}`);
  }
}
