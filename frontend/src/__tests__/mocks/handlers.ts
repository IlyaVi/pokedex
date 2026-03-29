import { http, HttpResponse } from "msw";
import { makePage, MOCK_POKEMON } from "./data";

export const handlers = [
  http.get("/api/pokemon", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("page_size") ?? "10");
    return HttpResponse.json(makePage(page, pageSize));
  }),

  http.get("/api/pokemon/types", () => {
    return HttpResponse.json(["fire", "grass", "water"]);
  }),

  http.get("/api/captured", () => {
    return HttpResponse.json({ captured_ids: [] });
  }),

  http.post("/api/pokemon/:number/capture", () => {
    return HttpResponse.json({ captured: true });
  }),

  http.delete("/api/pokemon/:number/capture", () => {
    return HttpResponse.json({ captured: false });
  }),
];

export { MOCK_POKEMON };
