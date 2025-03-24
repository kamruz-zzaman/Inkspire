// This file would be the main export for the npm package

import { RichTextEditor } from "@/components/rich-text-editor"
import type { RichTextEditorProps } from "@/components/rich-text-editor"

// Export the main component
export { RichTextEditor }

// Export types
export type { RichTextEditorProps }

// Package metadata
export const version = "1.0.0"
export const name = "react-rich-text-editor"
export const description =
  "A feature-rich text editor for React applications with active state highlighting, mentions, and more"

// Export utility functions
export const parseHtml = (html: string): Document => {
  const parser = new DOMParser()
  return parser.parseFromString(html, "text/html")
}

export const stripHtml = (html: string): string => {
  const doc = parseHtml(html)
  return doc.body.textContent || ""
}

export const countWords = (html: string): number => {
  const text = stripHtml(html)
  return text.split(/\s+/).filter(Boolean).length
}

export const countCharacters = (html: string): number => {
  const text = stripHtml(html)
  return text.length
}

// Extract mentions from content
export const extractMentions = (html: string): Array<{ id: string; name: string }> => {
  const doc = parseHtml(html)
  const mentionElements = doc.querySelectorAll(".mention")

  return Array.from(mentionElements).map((element) => {
    const userId = element.getAttribute("data-user-id") || ""
    const name = element.textContent?.replace("@", "") || ""
    return { id: userId, name }
  })
}

// Check if content has images
export const hasImages = (html: string): boolean => {
  const doc = parseHtml(html)
  return doc.querySelectorAll("img").length > 0
}

// Get plain text with mentions preserved
export const getPlainTextWithMentions = (html: string): string => {
  const doc = parseHtml(html)

  // Replace mention elements with their text representation
  const mentionElements = doc.querySelectorAll(".mention")
  mentionElements.forEach((element) => {
    const textNode = doc.createTextNode(element.textContent || "")
    element.parentNode?.replaceChild(textNode, element)
  })

  return doc.body.textContent || ""
}

