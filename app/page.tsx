"use client";

import { useState } from "react";
import { InkspireEditor } from "@/components/rich-text-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Lightbulb } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  const [content1, setContent1] = useState(
    "<p>This is a fully featured rich text editor with active highlighting.</p>"
  );
  const [content2, setContent2] = useState(
    "<p>This editor uses static mode for file uploads (no server required).</p>"
  );
  const [content3, setContent3] = useState(
    "<p>This is a minimal editor with limited options.</p>"
  );

  // Sample users for mention feature
  const sampleUsers = [
    {
      id: "1",
      name: "John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "3",
      name: "Robert Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "4",
      name: "Emily Davis",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "5",
      name: "Michael Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ];

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Advanced Rich Text Editor
      </h1>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Enhanced Editor Features</AlertTitle>
        <AlertDescription>
          This editor now includes working undo/redo, proper background colors,
          fixed code blocks, working links, and @mentions. Try typing @ to
          mention users from the dropdown!
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="full" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="full">Full Editor</TabsTrigger>
          <TabsTrigger value="static">Static Mode</TabsTrigger>
          <TabsTrigger value="minimal">Minimal</TabsTrigger>
        </TabsList>

        <TabsContent value="full">
          <Card>
            <CardHeader>
              <CardTitle>Full-Featured Editor</CardTitle>
              <CardDescription>
                Complete rich text editor with all formatting options and active
                state highlighting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InkspireEditor
                initialValue={content1}
                onChange={setContent1}
                height="250px"
                mentionUsers={sampleUsers}
                onMention={(userId) => console.log("Mentioned user:", userId)}
              />

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">HTML Output:</h3>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  {content1}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="static">
          <Card>
            <CardHeader>
              <CardTitle>Static Mode Editor</CardTitle>
              <CardDescription>
                Uses local file handling without server uploads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InkspireEditor
                staticMode={true}
                initialValue={content2}
                onChange={setContent2}
                height="250px"
                mentionUsers={sampleUsers}
                toolbarOptions={{
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
                }}
              />

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">HTML Output:</h3>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  {content2}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="minimal">
          <Card>
            <CardHeader>
              <CardTitle>Minimal Editor</CardTitle>
              <CardDescription>Basic formatting options only</CardDescription>
            </CardHeader>
            <CardContent>
              <InkspireEditor
                initialValue={content3}
                onChange={setContent3}
                height="150px"
                toolbarOptions={{
                  basic: true,
                  formatting: false,
                  alignment: false,
                  lists: false,
                  media: false,
                  link: false,
                  code: false,
                  colors: false,
                  history: true,
                  mention: false,
                }}
              />

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">HTML Output:</h3>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  {content3}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Features Overview</CardTitle>
          <CardDescription>
            Comprehensive list of features available in the editor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc pl-5">
            <li>Active state highlighting for formatting options</li>
            <li>Text formatting (bold, italic, underline)</li>
            <li>Headings (H1, H2, H3)</li>
            <li>Text alignment (left, center, right, justify)</li>
            <li>Lists (ordered and unordered)</li>
            <li>Links (insert and remove)</li>
            <li>Text and background color selection</li>
            <li>Smart image uploads with fallback</li>
            <li>Code blocks with proper toggling</li>
            <li>Blockquotes</li>
            <li>Working undo/redo functionality</li>
            <li>Custom upload handler support</li>
            <li>@mentions with dropdown selection</li>
            <li>Keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)</li>
            <li>Responsive design</li>
            <li>HTML output</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            User Documentation
          </CardTitle>
          <CardDescription>
            Learn how to use all the features of the Rich Text Editor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Getting Started</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">
                  The Rich Text Editor provides a user-friendly interface for
                  creating formatted content. Simply click inside the editor
                  area and start typing.
                </p>
                <p>
                  Use the toolbar buttons to format your text, add links, insert
                  images, and more.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Text Formatting</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">
                  Use the <strong>B</strong>, <em>I</em>, and <u>U</u> buttons
                  to make text bold, italic, or underlined.
                </p>
                <p className="mb-2">You can also use keyboard shortcuts:</p>
                <ul className="list-disc pl-5 mb-2">
                  <li>Ctrl+B for bold</li>
                  <li>Ctrl+I for italic</li>
                  <li>Ctrl+U for underline</li>
                </ul>
                <p>
                  The H1, H2, and H3 buttons create different heading sizes.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Working with Links</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">To add a link:</p>
                <ol className="list-decimal pl-5 mb-2">
                  <li>Select the text you want to turn into a link</li>
                  <li>Click the link button in the toolbar</li>
                  <li>Enter the URL in the popup</li>
                  <li>Click "Insert Link"</li>
                </ol>
                <p>
                  To remove a link, select the linked text and click the unlink
                  button.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Image Uploads</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">
                  The editor supports two modes for image uploads:
                </p>
                <ul className="list-disc pl-5 mb-2">
                  <li>
                    <strong>Static Mode:</strong> Images are converted to data
                    URLs and embedded directly in the content. No server
                    required.
                  </li>
                  <li>
                    <strong>Dynamic Mode:</strong> Images are uploaded to your
                    server endpoint and referenced by URL. If server upload
                    fails, it automatically falls back to static mode.
                  </li>
                </ul>
                <p>
                  Click the image button and select a file from your device to
                  upload.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>Using @Mentions</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">To mention a user:</p>
                <ol className="list-decimal pl-5 mb-2">
                  <li>Type @ in the editor</li>
                  <li>A dropdown will appear with a list of users</li>
                  <li>Continue typing to filter the list</li>
                  <li>Click on a user to insert the mention</li>
                </ol>
                <p>
                  You can also click the @ button in the toolbar to trigger the
                  mention dropdown.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>Code Blocks</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">To create a code block:</p>
                <ol className="list-decimal pl-5 mb-2">
                  <li>Select the text you want to format as code</li>
                  <li>Click the code button in the toolbar</li>
                </ol>
                <p>
                  To convert a code block back to normal text, select the code
                  block and click the code button again.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger>Undo and Redo</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">
                  The editor maintains a history of your changes, allowing you
                  to undo and redo actions.
                </p>
                <p className="mb-2">
                  Use the undo and redo buttons in the toolbar, or the keyboard
                  shortcuts:
                </p>
                <ul className="list-disc pl-5">
                  <li>Ctrl+Z to undo</li>
                  <li>Ctrl+Y to redo</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger>
                Integration Guide for Developers
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">
                  To integrate this editor into your React application:
                </p>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm mb-2">
                  {`import { InkspireEditor } from 'rich-text-editor';

function MyComponent() {
  const [content, setContent] = useState('<p>Initial content</p>');
  
  return (
    <InkspireEditor
      initialValue={content}
      onChange={setContent}
      uploadEndpoint="/api/upload"
      staticMode={false}
      mentionUsers={[
        { id: "1", name: "John Doe" },
        { id: "2", name: "Jane Smith" }
      ]}
      onMention={(userId) => console.log("Mentioned:", userId)}
    />
  );
}`}
                </pre>
                <p className="mb-2">Available props:</p>
                <ul className="list-disc pl-5">
                  <li>
                    <code>initialValue</code>: Initial HTML content
                  </li>
                  <li>
                    <code>onChange</code>: Callback function when content
                    changes
                  </li>
                  <li>
                    <code>onImageUpload</code>: Custom image upload handler
                  </li>
                  <li>
                    <code>uploadEndpoint</code>: Server endpoint for image
                    uploads
                  </li>
                  <li>
                    <code>staticMode</code>: Whether to use static mode for
                    images
                  </li>
                  <li>
                    <code>height</code>: Height of the editor
                  </li>
                  <li>
                    <code>mentionUsers</code>: Array of users for @mentions
                  </li>
                  <li>
                    <code>onMention</code>: Callback when a user is mentioned
                  </li>
                  <li>
                    <code>toolbarOptions</code>: Configure which toolbar options
                    to show
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </main>
  );
}
