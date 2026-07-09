import { NextRequest, NextResponse } from "next/server";
import { fetchStockData, type Period } from "@/lib/stockData";

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get("ticker");
  const period = (req.nextUrl.searchParams.get("period") as Period | null) ?? "1mo";

  if (!ticker) {
    return NextResponse.json({ error: "A ticker symbol is required." }, { status: 400 });
  }

  const stockData = await fetchStockData(ticker.toUpperCase(), period);
  if ("error" in stockData) {
    return NextResponse.json({ error: stockData.error }, { status: 422 });
  }

  return NextResponse.json({ stockData });
}
