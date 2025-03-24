import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Read the file as an ArrayBuffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate a unique filename
    const uniqueId = uuidv4()
    const originalName = file.name
    const extension = originalName.split(".").pop()
    const fileName = `${uniqueId}.${extension}`

    // Define the path where the file will be saved
    const uploadDir = join(process.cwd(), "public", "uploads")

    // Ensure the uploads directory exists
    try {
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
    } catch (err) {
      console.error("Error creating directory:", err)
      return NextResponse.json(
        { error: "Failed to create upload directory", details: String(err) },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    const path = join(uploadDir, fileName)

    // Write the file to the filesystem
    try {
      await writeFile(path, buffer)
    } catch (err) {
      console.error("Error writing file:", err)
      return NextResponse.json(
        { error: "Failed to write file", details: String(err) },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Return the URL to the uploaded file
    const url = `/uploads/${fileName}`

    // Ensure we're returning proper JSON with the correct content type
    return new NextResponse(JSON.stringify({ url, success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error uploading file:", error)

    // Ensure error responses are also proper JSON
    return new NextResponse(JSON.stringify({ error: "Error uploading file", details: String(error) }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}

