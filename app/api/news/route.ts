import { NextRequest, NextResponse } from "next/server";
import { getLatestNews } from "@/lib/news";

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get("ticker");
  if (!ticker) {
    return NextResponse.json({ error: "A ticker symbol is required." }, { status: 400 });
  }

  const articles = await getLatestNews(ticker);
  return NextResponse.json({ articles });
}
