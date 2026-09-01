import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const STORE_DATA_FILE = path.join(DATA_DIR, "store-data.json");

function getStoreData(): Record<string, any> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_DATA_FILE)) {
      const content = fs.readFileSync(STORE_DATA_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading store data file:", e);
  }
  return {};
}

function saveStoreData(data: Record<string, any>) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving store data file:", e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const data = getStoreData();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to load store data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = getStoreData();
    const updated = {
      ...current,
      ...body,
      updated_at: new Date().toISOString(),
    };
    saveStoreData(updated);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to save store data" }, { status: 500 });
  }
}
