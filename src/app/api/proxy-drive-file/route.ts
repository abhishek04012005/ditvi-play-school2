import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";


/**
 * API route to proxy Google Drive files
 * Avoids CORS issues by fetching files server-side
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get("id");
    const type = searchParams.get("type") || "view"; // 'view' or 'download'

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Build Google Drive URL
    const driveUrl = `https://drive.google.com/uc?export=${type}&id=${fileId}`;

    // Fetch the file from Google Drive
    const response = await fetch(driveUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file from Google Drive" },
        { status: response.status }
      );
    }

    // Get the content type
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const buffer = await response.arrayBuffer();

    // Return with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error proxying file:", error);
    return NextResponse.json(
      { error: "Failed to proxy file" },
      { status: 500 }
    );
  }
}
