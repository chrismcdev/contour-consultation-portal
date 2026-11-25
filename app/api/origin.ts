export const isCrossOriginRequest = (request: Request): boolean => {
  switch (request.headers.get("sec-fetch-site")) {
    case "same-origin":
      return false;
    case "same-site":
    case "cross-site":
      return true;
    default: {
      const origin = request.headers.get("origin");
      return origin !== null && origin !== new URL(request.url).origin;
    }
  }
};
