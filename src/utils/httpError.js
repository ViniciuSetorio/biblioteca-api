export function httpError(status, code, message) {
  return {
    status,
    body: {
      error: {
        code,
        message,
      },
    },
  };
}
