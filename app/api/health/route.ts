import { NextResponse } from "next/server";
export function GET() { return NextResponse.json({ status: "ok", service: "fiber-partner-hub-demo", version: "1.0.0" }); }
