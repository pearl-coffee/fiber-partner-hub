import { NextResponse } from "next/server";
import { store } from "@/lib/demo-store";
export function GET() { return NextResponse.json({ total: store.partners.length, items: store.partners }); }
