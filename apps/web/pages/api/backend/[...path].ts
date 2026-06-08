import type { NextApiRequest, NextApiResponse } from "next";
import { createApp } from "@ecotrack/api/src/app";

const app = createApp();

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true
  }
};

function toExpressApiUrl(url = "/") {
  const [pathname, search] = url.split("?");
  const apiPath = (pathname ?? "/").replace(/^\/api\/backend(?=\/|$)/, "/api");

  return search ? `${apiPath}?${search}` : apiPath;
}

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  request.url = toExpressApiUrl(request.url);
  app(request, response);
}
