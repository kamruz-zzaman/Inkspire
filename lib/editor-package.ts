// This file would be the main export for the npm package

import { InkspireEditor } from "@/components/rich-text-editor";
import type { InkspireEditorProps } from "@/components/rich-text-editor";

// Export the main component
export { InkspireEditor };

// Export types
export type { InkspireEditorProps };

// Package metadata
export const version = "0.1.2";
export const name =
  "InkspireEditor – Minimalist Text Editor to Ignite Your Creativity";
export const description =
  "Discover InkspireEditor, the sleek and intuitive text editor designed to spark creativity and streamline your writing process. Enjoy a distraction-free interface, powerful editing tools, and a seamless writing experience that lets your ideas flow effortlessly.";

// Export utility functions
export const parseHtml = (html: string): Document => {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
};

export const stripHtml = (html: string): string => {
  const doc = parseHtml(html);
  return doc.body.textContent || "";
};

export const countWords = (html: string): number => {
  const text = stripHtml(html);
  return text.split(/\s+/).filter(Boolean).length;
};

export const countCharacters = (html: string): number => {
  const text = stripHtml(html);
  return text.length;
};

// Extract mentions from content
export const extractMentions = (
  html: string
): Array<{ id: string; name: string }> => {
  const doc = parseHtml(html);
  const mentionElements = doc.querySelectorAll(".mention");

  return Array.from(mentionElements).map((element) => {
    const userId = element.getAttribute("data-user-id") || "";
    const name = element.textContent?.replace("@", "") || "";
    return { id: userId, name };
  });
};

// Check if content has images
export const hasImages = (html: string): boolean => {
  const doc = parseHtml(html);
  return doc.querySelectorAll("img").length > 0;
};

// Get plain text with mentions preserved
export const getPlainTextWithMentions = (html: string): string => {
  const doc = parseHtml(html);

  // Replace mention elements with their text representation
  const mentionElements = doc.querySelectorAll(".mention");
  mentionElements.forEach((element) => {
    const textNode = doc.createTextNode(element.textContent || "");
    element.parentNode?.replaceChild(textNode, element);
  });

  return doc.body.textContent || "";
};
