# Inkspire Editor

![Inkspire Editor](https://github.com/kamruz-zzaman/Inkspire/raw/main/public/inkspire-logo.png)

A feature-rich, customizable rich text editor for React applications with active state highlighting, mentions, image uploads, and more.

[![npm version](https://img.shields.io/npm/v/inkspire-editor.svg)](https://www.npmjs.com/package/inkspire-editor)
[![License](https://img.shields.io/npm/l/inkspire-editor.svg)](https://github.com/kamruz-zzaman/Inkspire/blob/main/LICENSE)

## 🚀 [Live Demo](https://inkspire-editor.vercel.app/)

Check out the [live demo](https://inkspire-editor.vercel.app/) to see Inkspire Editor in action!

## 📂 Repository

[![GitHub](https://img.shields.io/badge/GitHub-Inkspire--Editor-blue?logo=github)](https://github.com/kamruz-zzaman/Inkspire)

Find the source code on GitHub: [Inkspire Repository](https://github.com/kamruz-zzaman/Inkspire)

## ✨ Features

- 📝 **Rich Text Editing** - Full text formatting including bold, italic, underline, strikethrough, and headings.
- 🎨 **Active State Highlighting** - Toolbar icons indicate active formatting styles.
- 📊 **Multiple Heading Levels** - H1, H2, H3 support for structured content.
- 📏 **Text Alignment** - Options for left, center, right, and justify alignment.
- 📋 **Lists** - Ordered (numbered) and unordered (bulleted) lists.
- 🔗 **Links** - Insert and remove links with target="\_blank" support.
- 🎭 **Text & Background Colors** - Choose text and background colors via UI picker.
- 🖼️ **Smart Image Uploads** - Supports both static (data URL) and server-based uploads.
- 💻 **Code Blocks** - Easily insert code blocks with syntax formatting.
- 📑 **Blockquotes** - Highlight citations and quotations.
- ↩️ **Undo/Redo** - Reliable history tracking with undo/redo functionality.
- 📤 **Custom Upload Handler** - Use your own image upload function.
- 👤 **@Mentions** - Mention users with a dropdown selection and filtering.
- ⌨️ **Keyboard Shortcuts** - Quick formatting with shortcuts (Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Z, Ctrl+Y).
- 📱 **Responsive Design** - Optimized for different screen sizes and mobile use.
- 🔧 **Highly Customizable** - Configure toolbar options to fit your needs.

## 📦 Installation

Install Inkspire Editor via npm, yarn, or pnpm:

```sh
npm install inkspire-editor
# or
yarn add inkspire-editor
# or
pnpm add inkspire-editor
```

## 🚀 Getting Started

Import and use `InkspireEditor` in your React project:

```tsx
import React, { useState } from "react";
import { InkspireEditor } from "inkspire-editor";

const App = () => {
  const [content, setContent] = useState("");

  return (
    <div>
      <h2>Inkspire Editor Example</h2>
      <InkspireEditor
        initialValue={content}
        onChange={setContent}
        placeholder="Start typing..."
        mentionUsers={[
          { id: "1", name: "John Doe" },
          { id: "2", name: "Jane Doe" },
        ]}
        onMention={(userId) => console.log("Mentioned user ID:", userId)}
        onImageUpload={async (file) => {
          // Simulate an upload and return a URL
          return URL.createObjectURL(file);
        }}
      />
      <h3>Editor Output:</h3>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default App;
```

## 🎛️ Props

| Prop Name        | Type                                                   | Description                                                       |
| ---------------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| `initialValue`   | `string`                                               | Initial content of the editor.                                    |
| `onChange`       | `(value: string) => void`                              | Callback fired when content changes.                              |
| `placeholder`    | `string`                                               | Placeholder text for the editor.                                  |
| `onImageUpload`  | `(file: File) => Promise<string>`                      | Function to handle image uploads. Returns the uploaded image URL. |
| `mentionUsers`   | `Array<{ id: string; name: string; avatar?: string }>` | List of users available for mentions.                             |
| `onMention`      | `(userId: string) => void`                             | Callback fired when a user is mentioned.                          |
| `toolbarOptions` | `{ [key: string]: boolean }`                           | Customize which toolbar options are enabled.                      |

## 🔍 Keywords

rich-text-editor, text-editor, react-editor, wysiwyg, markdown-editor, editor, react, typescript, inkspire-editor

## 📜 License

MIT License

Copyright (c) 2025 Kamruz Zaman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
