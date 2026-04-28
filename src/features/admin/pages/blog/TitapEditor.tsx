import {
    useEditor,
    EditorContent,
    NodeViewWrapper,
    ReactNodeViewRenderer,
} from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Heading from "@tiptap/extension-heading";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import TextAlign from "@tiptap/extension-text-align";
// NOTE: The following table extensions need to be installed for table functionality.
// If you see a "Cannot find module" error, run this command in your terminal:
// npm install @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-header @tiptap/extension-table-cell
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import Image from "@tiptap/extension-image";
import { useEffect, useRef, } from "react";
import {
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Image as ImageIcon,
    X,
    Table as TableIcon,
    Trash2,
    Columns,
    Rows,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Combine,
    Split,
} from "lucide-react";

// ─── Custom Image Component with Resize and Delete ─────────────────────────
const ImageComponent = ({
    node,
    updateAttributes,
    deleteNode,
    selected,
}: {
    node: any;
  
    updateAttributes: (attrs: Record<string, any>) => void;
    deleteNode: () => void;
    selected: boolean;
}) => {
    const { src, width, height, align } = node.attrs as {
        src: string;
        width: string | number;
        height: string | number;
        align: string;
    };

    return (
        <NodeViewWrapper
            style={{
                display: "flex",
                justifyContent:
                    align === "left"
                        ? "flex-start"
                        : align === "right"
                            ? "flex-end"
                            : "center",
                width: "100%",
            }}
            className="relative group my-4"
        >
            <div
                className={`relative inline-block overflow-hidden rounded-lg shadow-lg border-2 transition-all text-primary ${selected
                    ? "border-primary-500 ring-2 ring-primary-500/20"
                    : "border-secondary-200 dark:border-secondary-700"
                    } bg-secondary-50 dark:bg-secondary-800`}
            >
                <img
                    src={src}
                    style={{
                        width: width === "auto" ? "100%" : `${width}px`,
                        height: height === "auto" ? "auto" : `${height}px`,
                        maxWidth: width === "auto" ? "500px" : "100%",
                        maxHeight: height === "auto" ? "500px" : "none",
                        objectFit: "contain",
                        display: "block",
                    }}
                    alt=""
                  
                />

                {/* Delete Button */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteNode();
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-primary rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Remove Image"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Dimension & Alignment Controls Overlay */}
                <div
                    contentEditable={false}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-secondary-900/90 text-primary dark:text-primary px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-3 backdrop-blur-sm border border-secondary-200 dark:border-secondary-600/50 z-10 whitespace-nowrap shadow-md"
                >
                    <div className="flex items-center gap-1.5">
                        <span className="text-secondary-400">W:</span>
                        <input
                            type="number"
                            value={width === "auto" ? "" : width}
                            onChange={(e) =>
                                updateAttributes({ width: e.target.value || "auto" })
                            }
                            onMouseDown={(e) => e.stopPropagation()}
                            className="w-14 bg-secondary-50 dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded px-1 py-0.5 outline-none text-center focus:border-primary-500"
                            placeholder="500"
                        />
                    </div>
                    <div className="w-px h-3 bg-secondary-200 dark:bg-secondary-700" />
                    <div className="flex items-center gap-1.5">
                        <span className="text-secondary-400">H:</span>
                        <input
                            type="number"
                            value={height === "auto" ? "" : height}
                            onChange={(e) =>
                                updateAttributes({ height: e.target.value || "auto" })
                            }
                            onMouseDown={(e) => e.stopPropagation()}
                            className="w-14 bg-secondary-50 dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded px-1 py-0.5 outline-none text-center focus:border-primary-500"
                            placeholder="300"
                        />
                    </div>

                    <div className="w-px h-3 bg-secondary-200 dark:bg-secondary-700" />

                    {/* Alignment Buttons */}
                    <div className="flex items-center gap-1">
                        {(["left", "center", "right"] as const).map((a) => {
                            const Icon =
                                a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
                            return (
                                <button
                                    key={a}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateAttributes({ align: a });
                                    }}
                                    className={`p-1 rounded transition ${align === a
                                        ? "bg-primary-500 text-primary"
                                        : "hover:bg-secondary-100 dark:hover:bg-secondary-700"
                                        }`}
                                    title={`Align ${a}`}
                                >
                                    <Icon className="w-3 h-3" />
                                </button>
                            );
                        })}
                    </div>

                    <div className="w-px h-3 bg-secondary-200 dark:bg-secondary-700" />

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateAttributes({ width: "auto", height: "auto", align: "center" });
                        }}
                        className="text-primary-500 hover:text-primary-600 font-medium"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </NodeViewWrapper>
    );
};

// ─── Custom Image Extension ─────────────────────────────────────────────────
const CustomImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: "auto",
                parseHTML: (element) => element.getAttribute("width") || "auto",
                renderHTML: (attributes) => ({ width: attributes.width }),
            },
            height: {
                default: "auto",
                parseHTML: (element) => element.getAttribute("height") || "auto",
                renderHTML: (attributes) => ({ height: attributes.height }),
            },
            align: {
                default: "left",
                parseHTML: (element) => element.getAttribute("align") || "left",
                renderHTML: (attributes) => ({ align: attributes.align }),
            },
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(ImageComponent);
    },
});

// ─── Roman Numeral List ─────────────────────────────────────────────────────
const RomanList = OrderedList.extend({
    name: "romanList",
    addAttributes() {
        return {
            ...this.parent?.(),
            type: {
                default: "i",
                parseHTML: (element) => element.getAttribute("type"),
                renderHTML: (attributes) => ({ type: attributes.type }),
            },
        };
    },
});

// ─── Alphabetical List ──────────────────────────────────────────────────────
const AlphaList = OrderedList.extend({
    name: "alphaList",
    addAttributes() {
        return {
            ...this.parent?.(),
            type: {
                default: "a",
                parseHTML: (element) => element.getAttribute("type"),
                renderHTML: (attributes) => ({ type: attributes.type }),
            },
        };
    },
});

// This custom extension ensures that the document always ends with a paragraph.
// It's a workaround for when the official `@tiptap/extension-trailing-node`
// cannot be installed due to environment issues. This prevents the cursor
// from getting "stuck" in nodes like tables or images, and also helps with
// pasting table data correctly.
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';

const TrailingParagraph = Extension.create({
    name: 'trailingParagraph',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('trailingParagraph'),
                appendTransaction: (transactions, _, newState) => {
                    const docChanged = transactions.some(transaction => transaction.docChanged);
                    if (!docChanged) {
                        return null;
                    }

                    // Don't interfere with paste transactions, which allows table pasting to work correctly
                    const isPaste = transactions.some(tr => tr.getMeta('paste'));
                    if (isPaste) {
                        return null;
                    }

                    const { doc, tr } = newState;
                    const lastNode = doc.lastChild;
                    const paragraph = newState.schema.nodes.paragraph;

                    if (lastNode && lastNode.type !== paragraph) {
                        tr.insert(doc.content.size, paragraph.create());
                        return tr;
                    }

                    return null;
                },
            }),
        ];
    },
});
// ─── Editor Props ───────────────────────────────────────────────────────────
interface TiptapEditorProps {
    content: string;
    onChange: (html: string) => void;
    onEditorReady?: (editor: ReturnType<typeof useEditor>) => void;
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function TiptapEditor({
    content,
    onChange,
    onEditorReady,
}: TiptapEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            Document,
            Paragraph,
            Text,
            Heading.configure({ levels: [1, 2, 3] }),
            Bold,
            Italic,
            Underline,
            BulletList,
            OrderedList,
            RomanList,
            AlphaList,
            ListItem,
            TextAlign.configure({
                types: ["heading", "paragraph", "image"],
                alignments: ["left", "center", "right", "justify"],
            }),
            CustomImage.configure({ allowBase64: true }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            // Custom extension to ensure a trailing paragraph
            TrailingParagraph,
        ],
        content,
        editorProps: {
            handleDrop: (_, event) => {
                const files = event.dataTransfer?.files;
                if (files && files[0]?.type.startsWith("image/")) {
                    insertImageFromFile(files[0]);
                    return true;
                }
                return false;
            },
            handlePaste: (_, event) => {
                const files = event.clipboardData?.files;
                if (files && files[0]?.type.startsWith("image/")) {
                    insertImageFromFile(files[0]);
                    return true;
                }
                return false;
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && typeof onEditorReady === "function") {
            onEditorReady(editor);
        }
    }, [editor, onEditorReady]);


    useEffect(() => {
        if (!editor || editor.isDestroyed) {
            return;
        }

        // A check to prevent a feedback loop. If the editor's content
        // already matches the `content` prop, we do nothing. This prevents
        // the cursor from jumping and breaking complex inputs like pasting.
        if (editor.getHTML() === content) {
            return;
        }
        editor.commands.setContent(content);
    }, [content, editor]);

  
    const insertImageFromFile = (file: File) => {
        if (!editor) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const src = e.target?.result as string;
            if (src) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (editor.chain().focus() as any).setImage({ src }).run();
            }
        };
        reader.readAsDataURL(file);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            insertImageFromFile(file);
            if (e.target) e.target.value = "";
        }
    };

    // ── Text transformations ──────────────────────────────────────────────────
    const transformText = (type: "uppercase" | "lowercase" | "sentencecase") => {
        if (!editor) return;
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, "");
        let result = text;
        if (type === "uppercase") result = text.toUpperCase();
        else if (type === "lowercase") result = text.toLowerCase();
        else if (type === "sentencecase")
            result = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        editor.chain().focus().deleteSelection().insertContent(result).run();
    };

    if (!editor) return null;

    // ── Toolbar button class helper ───────────────────────────────────────────
    const btn = (active: boolean) =>
        `px-2 py-1 text-xs rounded transition font-medium ${active
            ? "bg-[#b0cb1f] text-gray-900"
            : "bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-200 dark:hover:bg-secondary-600"
        }`;

    return (
        <div className="rounded-xl border border-secondary-200 dark:border-secondary-700 overflow-hidden">
            {/* ── Toolbar ── */}
            <div className="flex flex-wrap gap-1.5 p-2.5 border-b border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900">

                {/* Headings */}
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btn(editor.isActive("heading", { level: 1 }))}>H1</button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>H2</button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))}>H3</button>

                <div className="w-px bg-secondary-200 dark:bg-secondary-700 mx-0.5" />

                {/* Text Formatting */}
                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}>Bold</button>
                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}>Italic</button>
                <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive("underline"))}>Underline</button>

                <div className="w-px bg-secondary-200 dark:bg-secondary-700 mx-0.5" />

                {/* Lists */}
                <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>• List</button>
                <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}>1,2,3</button>
                <button type="button" onClick={() => editor.chain().focus().toggleList("romanList", "listItem").run()} className={btn(editor.isActive("romanList"))}>i,ii,iii</button>
                <button type="button" onClick={() => editor.chain().focus().toggleList("alphaList", "listItem").run()} className={btn(editor.isActive("alphaList"))}>a,b,c</button>

                <div className="w-px bg-secondary-200 dark:bg-secondary-700 mx-0.5" />

                {/* Alignment */}
                <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()} className={btn(editor.isActive({ textAlign: "left" }))} title="Align Left"><AlignLeft className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()} className={btn(editor.isActive({ textAlign: "center" }))} title="Align Center"><AlignCenter className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()} className={btn(editor.isActive({ textAlign: "right" }))} title="Align Right"><AlignRight className="w-4 h-4" /></button>
                <button type="button" onClick={() => editor.chain().focus().setTextAlign("justify").run()} className={btn(editor.isActive({ textAlign: "justify" }))} title="Justify"><AlignJustify className="w-4 h-4" /></button>

                <div className="w-px bg-secondary-200 dark:bg-secondary-700 mx-0.5" />

                {/* Table Controls */}
                <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={btn(false)} title="Insert Table"><TableIcon className="w-4 h-4" /></button>
                {editor.isActive('table') && (
                    <>
                        <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} className={btn(false)} title="Add Column Before"><div className="flex items-center gap-1"><ArrowLeft size={12}/><Columns className="w-3 h-3"/></div></button>
                        <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className={btn(false)} title="Add Column After"><div className="flex items-center gap-1"><Columns className="w-3 h-3"/><ArrowRight size={12}/></div></button>
                        <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className={btn(false)} title="Delete Column"><div className="flex items-center gap-1 text-red-500"><Columns className="w-3 h-3"/><X size={12}/></div></button>
                        
                        <div className="w-px bg-secondary-200 dark:bg-secondary-700 mx-0.5" />

                        <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()} className={btn(false)} title="Add Row Before"><div className="flex items-center gap-1"><ArrowUp size={12}/><Rows className="w-3 h-3"/></div></button>
                        <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className={btn(false)} title="Add Row After"><div className="flex items-center gap-1"><Rows className="w-3 h-3"/><ArrowDown size={12}/></div></button>
                        <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className={btn(false)} title="Delete Row"><div className="flex items-center gap-1 text-red-500"><Rows className="w-3 h-3"/><X size={12}/></div></button>
                        
                        <div className="w-px bg-secondary-200 dark:bg-secondary-700 mx-0.5" />

                        {/* Merge/Split Cells */}
                        <button type="button" onClick={() => editor.chain().focus().mergeCells().run()} disabled={!editor.can().mergeCells()} className={btn(false)} title="Merge Cells"><Combine className="w-4 h-4"/></button>
                        <button type="button" onClick={() => editor.chain().focus().splitCell().run()} disabled={!editor.can().splitCell()} className={btn(false)} title="Split Cell"><Split className="w-4 h-4"/></button>

                        <div className="w-px bg-secondary-200 dark:bg-secondary-700 mx-0.5" />

                        <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className={btn(false)} title="Delete Table"><Trash2 className="w-4 h-4 text-red-500"/></button>
                    </>
                )}

                <div className="w-px bg-secondary-200 dark:bg-secondary-700 mx-0.5" />

                {/* Image Upload */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={btn(false)}
                    title="Insert Image"
                >
                    <ImageIcon className="w-4 h-4" />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    accept="image/*"
                    className="hidden"
                />

                <div className="w-px bg-secondary-200 dark:bg-secondary-700 mx-0.5" />

                {/* Text Case */}
                <button type="button" onClick={() => transformText("uppercase")} className={btn(false)} title="UPPERCASE">ABC</button>
                <button type="button" onClick={() => transformText("lowercase")} className={btn(false)} title="lowercase">abc</button>
                <button type="button" onClick={() => transformText("sentencecase")} className={btn(false)} title="Sentence case">Abc</button>
            </div>

            {/* ── Editor Area ── */}
            <EditorContent
                editor={editor}
                className="
          p-4 min-h-[300px]
          bg-white dark:bg-secondary-800
          text-primary
          prose prose-sm dark:prose-invert max-w-none
          [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6
          [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5
          /* Table Styles & Column Resizing */
          [&_table]:w-full [&_table]:my-4 [&_table]:border-collapse [&_table]:table-fixed
          [&_th]:relative [&_th]:border [&_th]:border-gray-300 dark:[&_th]:border-gray-600 [&_th]:p-2 [&_th]:font-bold [&_th]:text-left [&_th]:bg-gray-100 dark:[&_th]:bg-gray-700
          [&_td]:relative [&_td]:border [&_td]:border-gray-300 dark:[&_td]:border-gray-600 [&_td]:p-2 [&_td]:align-top
          /* This makes the table resizable */
          /* This adds a visual indicator for selected cells, like in Excel */
          [&_.selectedCell]:after:content-[''] [&_.selectedCell]:after:absolute [&_.selectedCell]:after:inset-0 [&_.selectedCell]:after:bg-[#b0cb1f]/30 [&_.selectedCell]:after:pointer-events-none
          [&_.column-resize-handle]:absolute [&_.column-resize-handle]:right-[-2px] [&_.column-resize-handle]:top-0 [&_.column-resize-handle]:bottom-[-2px] [&_.column-resize-handle]:w-1 [&_.column-resize-handle]:z-20 [&_.column-resize-handle]:bg-[#b0cb1f] [&_.column-resize-handle]:pointer-events-none
          [&.resize-cursor]:cursor-col-resize
          [&_h3]:text-xl  [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4
          [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-4
          [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-4
          [&_ol[type='i']]:list-[lower-roman]
          [&_ol[type='a']]:list-[lower-alpha]
          [&_li]:mb-1
          [&_p]:mb-3
          focus:outline-none
        "
            />
        </div>
    );
}
