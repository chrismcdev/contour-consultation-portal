import { MIN_SCHOOL_QUERY_LENGTH, type SchoolsResponse } from "@/lib/catalog/contracts";
import { searchSchools } from "@/lib/catalog/schools";

export const GET = async (request: Request): Promise<Response> => {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < MIN_SCHOOL_QUERY_LENGTH) return Response.json({ schools: [] } satisfies SchoolsResponse);
  if (query.length > 200) return Response.json({ error: "School search is too long." }, { status: 400 });

  try {
    const schools = await searchSchools(query);
    return Response.json({ schools } satisfies SchoolsResponse, {
      headers: { "Cache-Control": "private, no-store" }
    });
  } catch {
    return Response.json({ error: "School search is temporarily unavailable." }, { status: 503 });
  }
};
