"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ImageIcon,
  LinkIcon,
  Code,
  Unlink,
  Palette,
  Highlighter,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  AtSign,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface InkspireEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  uploadEndpoint?: string;
  staticMode?: boolean;
  height?: string;
  className?: string;
  mentionUsers?: Array<{ id: string; name: string; avatar?: string }>;
  onMention?: (userId: string) => void;
  toolbarOptions?: {
    basic?: boolean;
    formatting?: boolean;
    alignment?: boolean;
    lists?: boolean;
    media?: boolean;
    link?: boolean;
    code?: boolean;
    colors?: boolean;
    history?: boolean;
    mention?: boolean;
  };
}

interface HistoryItem {
  html: string;
  selection?: {
    startContainer: Node;
    startOffset: number;
    endContainer: Node;
    endOffset: number;
  };
}

export function InkspireEditor({
  initialValue = "",
  onChange,
  onImageUpload,
  placeholder = "Start typing...",
  uploadEndpoint = "/api/upload",
  staticMode = false,
  height = "300px",
  className = "",
  mentionUsers = [],
  onMention,
  toolbarOptions = {
    basic: true,
    formatting: true,
    alignment: true,
    lists: true,
    media: true,
    link: true,
    code: true,
    colors: true,
    history: true,
    mention: true,
  },
}: InkspireEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [activeStyles, setActiveStyles] = useState<Record<string, boolean>>({});
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCodeActive, setIsCodeActive] = useState(false);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef(false);
  const lastKeyPressRef = useRef("");

  // Initialize editor with content
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = initialValue;
      // Initialize history with initial content
      setHistory([{ html: initialValue }]);
      setHistoryIndex(0);
      setIsInitialized(true);
    }
  }, [initialValue, isInitialized]);

  // Set up event listener for selection changes to update active styles
  useEffect(() => {
    const checkActiveStyles = () => {
      if (
        !document.activeElement ||
        !editorRef.current?.contains(document.activeElement)
      ) {
        return;
      }

      const newActiveStyles: Record<string, boolean> = {
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        justifyFull: document.queryCommandState("justifyFull"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
        createLink: document.queryCommandState("createLink"),
      };

      // Check if selection is inside a code block
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preElement = findParentWithTag(range.startContainer, "PRE");
        setIsCodeActive(!!preElement);
      }

      setActiveStyles(newActiveStyles);
    };

    document.addEventListener("selectionchange", checkActiveStyles);
    return () => {
      document.removeEventListener("selectionchange", checkActiveStyles);
    };
  }, []);

  // Handle click outside mention dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mentionDropdownRef.current &&
        !mentionDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMentionDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper function to find parent element with specific tag
  const findParentWithTag = (
    node: Node,
    tagName: string
  ): HTMLElement | null => {
    let currentNode: Node | null = node;
    while (currentNode) {
      if (
        currentNode.nodeType === Node.ELEMENT_NODE &&
        (currentNode as HTMLElement).tagName === tagName
      ) {
        return currentNode as HTMLElement;
      }
      currentNode = currentNode.parentNode;
    }
    return null;
  };

  // Save current selection state
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      return {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset,
      };
    }
    return undefined;
  };

  // Restore selection state
  const restoreSelection = (savedSelection: any) => {
    if (savedSelection) {
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.setStart(
          savedSelection.startContainer,
          savedSelection.startOffset
        );
        range.setEnd(savedSelection.endContainer, savedSelection.endOffset);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  // Add to history
  const addToHistory = () => {
    if (!editorRef.current) return;

    const currentContent = editorRef.current.innerHTML;
    const currentSelection = saveSelection();

    // Only add to history if content has changed
    if (history.length === 0 || history[historyIndex].html !== currentContent) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ html: currentContent, selection: currentSelection });

      // Limit history size to prevent memory issues
      if (newHistory.length > 100) {
        newHistory.shift();
      }

      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  // Debounced version of addToHistory
  const debouncedAddToHistory = debounce(addToHistory, 300);

  // Debounce function
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const handleContentChange = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);

      if (!isTypingRef.current) {
        debouncedAddToHistory();
      }
    }
  };

  const execCommand = (command: string, value = "") => {
    // Save current state to history before executing command
    addToHistory();

    document.execCommand(command, false, value);
    handleContentChange();

    // Update active styles after command execution
    const newActiveStyles = {
      ...activeStyles,
      [command]: document.queryCommandState(command),
    };
    setActiveStyles(newActiveStyles);

    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);

      if (editorRef.current) {
        editorRef.current.innerHTML = history[newIndex].html;

        // Restore selection if available
        if (history[newIndex].selection) {
          setTimeout(() => {
            restoreSelection(history[newIndex].selection);
          }, 0);
        }

        if (onChange) {
          onChange(history[newIndex].html);
        }
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);

      if (editorRef.current) {
        editorRef.current.innerHTML = history[newIndex].html;

        // Restore selection if available
        if (history[newIndex].selection) {
          setTimeout(() => {
            restoreSelection(history[newIndex].selection);
          }, 0);
        }

        if (onChange) {
          onChange(history[newIndex].html);
        }
      }
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // If custom upload handler is provided, use it
      if (onImageUpload) {
        const url = await onImageUpload(file);
        insertImage(url);
        setIsUploading(false);
        return;
      }

      if (staticMode) {
        // Static mode: Use FileReader to create a data URL
        await handleStaticUpload(file);
      } else {
        // Dynamic mode: Try server upload first, fall back to static if it fails
        try {
          await handleServerUpload(file);
        } catch (error) {
          console.error(
            "Server upload failed, falling back to static mode:",
            error
          );
          // Fall back to static mode if server upload fails
          await handleStaticUpload(file);
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsUploading(false);
      alert("Failed to upload image. Please try again.");
    }
  };

  // Insert image at current selection
  const insertImage = (url: string) => {
    // Save to history before inserting
    addToHistory();

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const img = document.createElement("img");
      img.src = url;
      img.style.maxWidth = "100%";
      img.alt = "Uploaded image";

      range.deleteContents();
      range.insertNode(img);

      // Move cursor after the image
      range.setStartAfter(img);
      range.setEndAfter(img);
      selection.removeAllRanges();
      selection.addRange(range);

      handleContentChange();
    }
  };

  // Helper function for static file handling
  const handleStaticUpload = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      reader.onload = () => {
        try {
          const dataUrl = reader.result as string;
          insertImage(dataUrl);
          setIsUploading(false);
          setUploadProgress(100);
          resolve();
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };

      reader.readAsDataURL(file);
    });
  };

  // Helper function for server upload
  const handleServerUpload = async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Use fetch instead of XMLHttpRequest
      const response = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
      });

      // Set upload to 100% when complete
      setUploadProgress(100);

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      // Try to parse the response as JSON
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          if (data.url) {
            insertImage(data.url);
          } else {
            throw new Error("Response missing URL property");
          }
        } else {
          // If not JSON, throw error
          const text = await response.text();
          throw new Error(
            `Server returned non-JSON response: ${text.substring(0, 50)}...`
          );
        }
      } catch (error) {
        console.error("Error parsing response:", error);
        throw error;
      }
    } finally {
      setIsUploading(false);
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      // Save to history before inserting link
      addToHistory();

      execCommand("createLink", linkUrl);

      // Get the newly created link and add target="_blank" attribute
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const linkNode = findParentWithTag(range.commonAncestorContainer, "A");

        if (linkNode) {
          linkNode.setAttribute("target", "_blank");
          linkNode.setAttribute("rel", "noopener noreferrer");
        }
      }

      setLinkUrl("");
      setShowLinkPopover(false);
    }
  };

  const removeLink = () => {
    // Save to history before removing link
    addToHistory();
    execCommand("unlink");
  };

  const applyTextColor = (color: string) => {
    setTextColor(color);
    execCommand("foreColor", color);
  };

  const applyBgColor = (color: string) => {
    setBgColor(color);

    // Custom implementation for background color
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      // Save to history before applying background color
      addToHistory();

      const range = selection.getRangeAt(0);

      if (range.collapsed) {
        // If no text is selected, do nothing
        return;
      }

      // Create a span with the background color
      const span = document.createElement("span");
      span.style.backgroundColor = color;

      // Extract the contents of the range and put them in the span
      const contents = range.extractContents();
      span.appendChild(contents);

      // Insert the span at the position of the range
      range.insertNode(span);

      // Update selection to include the new span
      range.selectNode(span);
      selection.removeAllRanges();
      selection.addRange(range);

      handleContentChange();
    }
  };

  const formatBlock = (tag: string) => {
    // Save to history before formatting
    addToHistory();

    if (isCodeActive && tag !== "pre") {
      // If we're in a code block and trying to format to something else,
      // first remove the code block
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preElement = findParentWithTag(range.startContainer, "PRE");

        if (preElement && preElement.parentNode) {
          // Extract content from pre element
          const content = preElement.textContent || "";
          const textNode = document.createTextNode(content);

          // Replace pre with text content
          preElement.parentNode.replaceChild(textNode, preElement);

          // Select the new text node
          range.selectNodeContents(textNode);
          selection.removeAllRanges();
          selection.addRange(range);

          setIsCodeActive(false);
        }
      }
    }

    execCommand("formatBlock", `<${tag}>`);

    // If formatting as code, set code active state
    if (tag === "pre") {
      setIsCodeActive(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Track typing state
    isTypingRef.current = true;
    lastKeyPressRef.current = e.key;

    // Handle @ key for mentions
    if (e.key === "@" && toolbarOptions.mention) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);

          // Create a temporary span to mark the position
          const tempSpan = document.createElement("span");
          tempSpan.id = "mention-position-marker";
          tempSpan.style.display = "inline";
          tempSpan.innerHTML = "&#8203;"; // Zero-width space

          // Insert the marker at cursor position
          range.insertNode(tempSpan);

          // Get the position of the marker
          const marker = document.getElementById("mention-position-marker");
          if (marker && editorRef.current) {
            const markerRect = marker.getBoundingClientRect();
            const editorRect = editorRef.current.getBoundingClientRect();

            // Calculate position relative to the viewport
            const top = markerRect.bottom + window.scrollY;
            const left = markerRect.left + window.scrollX;

            // Set the dropdown position
            setMentionPosition({
              top: top,
              left: left,
            });

            // Remove the marker
            marker.remove();
          }

          setMentionFilter("");
          setShowMentionDropdown(true);
        }
      });
    }

    // Handle Escape key to close mention dropdown
    if (e.key === "Escape" && showMentionDropdown) {
      setShowMentionDropdown(false);
      e.preventDefault();
    }

    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "z":
          if (!e.shiftKey) {
            e.preventDefault();
            handleUndo();
          }
          break;
        case "y":
          e.preventDefault();
          handleRedo();
          break;
        case "b":
          e.preventDefault();
          execCommand("bold");
          break;
        case "i":
          e.preventDefault();
          execCommand("italic");
          break;
        case "u":
          e.preventDefault();
          execCommand("underline");
          break;
      }
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    // Update active styles
    const newActiveStyles = {
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyCenter: document.queryCommandState("justifyRight"),
      justifyRight: document.queryCommandState("justifyRight"),
      justifyFull: document.queryCommandState("justifyFull"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
      createLink: document.queryCommandState("createLink"),
    };
    setActiveStyles(newActiveStyles);

    // Handle mention filtering
    if (showMentionDropdown) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editorRef.current!);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const text = preCaretRange.toString();

        // Find the text after the last @ symbol
        const lastAtIndex = text.lastIndexOf("@");
        if (lastAtIndex !== -1) {
          const filterText = text.substring(lastAtIndex + 1);
          setMentionFilter(filterText);
        }
      }
    }

    // Reset typing state after a short delay
    setTimeout(() => {
      isTypingRef.current = false;
    }, 100);
  };

  const insertMention = (user: { id: string; name: string }) => {
    // Save to history before inserting mention
    addToHistory();

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      // Delete the @ and any text after it that was part of the mention
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editorRef.current!);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      const text = preCaretRange.toString();
      const lastAtIndex = text.lastIndexOf("@");

      if (lastAtIndex !== -1) {
        // Calculate how many characters to delete
        const charsToDelete = text.length - lastAtIndex;

        // Create a new range for deletion
        const deleteRange = range.cloneRange();
        deleteRange.setStart(
          range.endContainer,
          range.endOffset - charsToDelete
        );
        deleteRange.setEnd(range.endContainer, range.endOffset);
        deleteRange.deleteContents();

        // Create mention span
        const mentionSpan = document.createElement("span");
        mentionSpan.className = "mention";
        mentionSpan.contentEditable = "false";
        mentionSpan.dataset.userId = user.id;
        mentionSpan.style.backgroundColor = "#e8f5fe";
        mentionSpan.style.color = "#1d9bf0";
        mentionSpan.style.padding = "0 2px";
        mentionSpan.style.borderRadius = "3px";
        mentionSpan.style.margin = "0 1px";
        mentionSpan.textContent = `@${user.name}`;

        // Insert the mention span
        range.insertNode(mentionSpan);

        // Move cursor after the mention
        range.setStartAfter(mentionSpan);
        range.setEndAfter(mentionSpan);
        selection.removeAllRanges();
        selection.addRange(range);

        // Insert a space after the mention
        const spaceNode = document.createTextNode("\u00A0");
        range.insertNode(spaceNode);
        range.setStartAfter(spaceNode);
        range.setEndAfter(spaceNode);
        selection.removeAllRanges();
        selection.addRange(range);

        // Trigger onChange
        handleContentChange();

        // Call onMention callback if provided
        if (onMention) {
          onMention(user.id);
        }
      }
    }

    setShowMentionDropdown(false);

    // Focus back on the editor to continue typing
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Filter users for mention dropdown
  const filteredUsers = mentionUsers.filter((user) =>
    user.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  return (
    <div className={cn("border rounded-md", className)}>
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
        {toolbarOptions.history && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="mx-1 h-6" />
          </>
        )}

        {toolbarOptions.basic && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeStyles.bold ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => execCommand("bold")}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bold (Ctrl+B)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeStyles.italic ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => execCommand("italic")}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Italic (Ctrl+I)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeStyles.underline ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => execCommand("underline")}
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Underline (Ctrl+U)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="mx-1 h-6" />
          </>
        )}

        {toolbarOptions.formatting && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => formatBlock("h1")}
                  >
                    <Heading1 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Heading 1</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => formatBlock("h2")}
                  >
                    <Heading2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Heading 2</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => formatBlock("h3")}
                  >
                    <Heading3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Heading 3</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => formatBlock("blockquote")}
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Quote</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="mx-1 h-6" />
          </>
        )}

        {toolbarOptions.alignment && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeStyles.justifyLeft ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => execCommand("justifyLeft")}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Left</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeStyles.justifyCenter ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => execCommand("justifyCenter")}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Center</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeStyles.justifyRight ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => execCommand("justifyRight")}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Right</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeStyles.justifyFull ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => execCommand("justifyFull")}
                  >
                    <AlignJustify className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Justify</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="mx-1 h-6" />
          </>
        )}

        {toolbarOptions.lists && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={
                      activeStyles.insertUnorderedList ? "secondary" : "ghost"
                    }
                    size="icon"
                    onClick={() => execCommand("insertUnorderedList")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bullet List</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={
                      activeStyles.insertOrderedList ? "secondary" : "ghost"
                    }
                    size="icon"
                    onClick={() => execCommand("insertOrderedList")}
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Numbered List</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="mx-1 h-6" />
          </>
        )}

        {toolbarOptions.colors && (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Palette className="h-4 w-4" />
                  <div
                    className="absolute bottom-0 right-0 w-2 h-2 rounded-full"
                    style={{ backgroundColor: textColor }}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="grid gap-2">
                  <h4 className="font-medium text-sm">Text Color</h4>
                  <div className="grid grid-cols-8 gap-1">
                    {[
                      "#000000",
                      "#FF0000",
                      "#00FF00",
                      "#0000FF",
                      "#FFFF00",
                      "#FF00FF",
                      "#00FFFF",
                      "#808080",
                      "#800000",
                      "#008000",
                      "#000080",
                      "#808000",
                      "#800080",
                      "#008080",
                      "#C0C0C0",
                      "#FFFFFF",
                    ].map((color) => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded-md border border-gray-300 cursor-pointer"
                        style={{ backgroundColor: color }}
                        onClick={() => applyTextColor(color)}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Label htmlFor="custom-color">Custom:</Label>
                    <Input
                      id="custom-color"
                      type="color"
                      value={textColor}
                      onChange={(e) => applyTextColor(e.target.value)}
                      className="w-8 h-8 p-0"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Highlighter className="h-4 w-4" />
                  <div
                    className="absolute bottom-0 right-0 w-2 h-2 rounded-full"
                    style={{ backgroundColor: bgColor }}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="grid gap-2">
                  <h4 className="font-medium text-sm">Background Color</h4>
                  <div className="grid grid-cols-8 gap-1">
                    {[
                      "#FFFFFF",
                      "#FFCDD2",
                      "#F8BBD0",
                      "#E1BEE7",
                      "#D1C4E9",
                      "#C5CAE9",
                      "#BBDEFB",
                      "#B3E5FC",
                      "#B2EBF2",
                      "#B2DFDB",
                      "#C8E6C9",
                      "#DCEDC8",
                      "#F0F4C3",
                      "#FFF9C4",
                      "#FFECB3",
                      "#FFE0B2",
                    ].map((color) => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded-md border border-gray-300 cursor-pointer"
                        style={{ backgroundColor: color }}
                        onClick={() => applyBgColor(color)}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Label htmlFor="custom-bg-color">Custom:</Label>
                    <Input
                      id="custom-bg-color"
                      type="color"
                      value={bgColor}
                      onChange={(e) => applyBgColor(e.target.value)}
                      className="w-8 h-8 p-0"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Separator orientation="vertical" className="mx-1 h-6" />
          </>
        )}

        {toolbarOptions.link && (
          <>
            <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
              <PopoverTrigger asChild>
                <Button
                  variant={activeStyles.createLink ? "secondary" : "ghost"}
                  size="icon"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Insert Link</h4>
                    <p className="text-sm text-muted-foreground">
                      Enter the URL for the link
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="url" className="text-right">
                        URL
                      </Label>
                      <Input
                        id="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="col-span-2 h-8"
                      />
                    </div>
                  </div>
                  <Button size="sm" onClick={insertLink}>
                    Insert Link
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {activeStyles.createLink && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={removeLink}>
                      <Unlink className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove Link</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Separator orientation="vertical" className="mx-1 h-6" />
          </>
        )}

        {toolbarOptions.media && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Button variant="ghost" size="icon" className="relative">
                    <ImageIcon className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                    />
                  </Button>
                  {isUploading && (
                    <div className="absolute -bottom-1 left-0 w-full h-1 bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>Upload Image</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {toolbarOptions.code && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isCodeActive ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => formatBlock(isCodeActive ? "p" : "pre")}
                >
                  <Code className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Code Block</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {toolbarOptions.mention && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    // Insert @ character at current cursor position
                    execCommand("insertText", "@");

                    // Show mention dropdown
                    requestAnimationFrame(() => {
                      const selection = window.getSelection();
                      if (selection && selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);

                        // Create a temporary span to mark the position
                        const tempSpan = document.createElement("span");
                        tempSpan.id = "mention-position-marker";
                        tempSpan.style.display = "inline";
                        tempSpan.innerHTML = "&#8203;"; // Zero-width space

                        // Insert the marker at cursor position
                        range.insertNode(tempSpan);

                        // Get the position of the marker
                        const marker = document.getElementById(
                          "mention-position-marker"
                        );
                        if (marker && editorRef.current) {
                          const markerRect = marker.getBoundingClientRect();
                          const editorRect =
                            editorRef.current.getBoundingClientRect();

                          // Calculate position relative to the viewport
                          const top = markerRect.bottom + window.scrollY;
                          const left = markerRect.left + window.scrollX;

                          // Set the dropdown position
                          setMentionPosition({
                            top: top,
                            left: left,
                          });

                          // Remove the marker
                          marker.remove();
                        }

                        setMentionFilter("");
                        setShowMentionDropdown(true);
                      }
                    });
                  }}
                >
                  <AtSign className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mention (@)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div
        ref={editorRef}
        contentEditable
        className="p-4 outline-none min-h-[200px] prose prose-sm max-w-none relative"
        style={{ height, minHeight: "200px", overflowY: "auto" }}
        onInput={handleContentChange}
        onBlur={handleContentChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        data-placeholder={placeholder}
      />

      {/* Mention dropdown */}
      {showMentionDropdown && (
        <div
          ref={mentionDropdownRef}
          className="fixed bg-white border rounded-md shadow-md z-50 max-h-[200px] overflow-y-auto w-[200px]"
          style={{
            top: `${mentionPosition.top}px`,
            left: `${mentionPosition.left}px`,
            maxWidth: "200px",
          }}
        >
          <Command>
            <CommandInput
              placeholder="Search users..."
              value={mentionFilter}
              onValueChange={setMentionFilter}
            />
            <CommandList>
              {filteredUsers.length === 0 ? (
                <CommandEmpty>No users found</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredUsers.map((user) => (
                    <CommandItem
                      key={user.id}
                      onSelect={() => insertMention(user)}
                      className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted"
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{user.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
