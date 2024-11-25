export function GET(request: Request) {
  return Response.json({ hello: "world" });
}

export async function POST(request: Request) {
  const { prompt } = await request.json();

  return Response.json({
    output: `prompt = ${prompt ?? "dummy prompt"}`,
  });
}
