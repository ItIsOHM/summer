"use client";

import { DM_Sans } from "next/font/google";
import { useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/component/Footer";
import { Loader } from "lucide-react";
import ReactMarkdown from "react-markdown";

const dm_sans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
});

require("dotenv");

export default function Page() {
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputMode, setInputMode] = useState("text");
  const [loading, setLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState("Copy to Clipboard");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setInputText("");
      setUrl("");
      setInputMode("file");
    }
  };

  const handleTextInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
    setFile(null);
    setUrl("");
    setInputMode("text");
  };

  const handleURLInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    setInputText("");
    setFile(null);
    setInputMode("url");
  };

  const generateSummary = async () => {
    try {
      setLoading(true);
      let textToSummarize = "";
      if (file) {
        const fileText = await readFileText(file);
        textToSummarize = fileText;
      } else if (url) {
        const urlText = await readUrlText(url);
        textToSummarize = urlText;
      } else {
        textToSummarize = inputText;
      }

      setSummary("");
      setIsModalOpen(true);

      await summarizeText(textToSummarize);
    } catch (error) {
      console.error("Error generating summary:", error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary).then(() => {
      setCopyStatus("Copied!");
      setTimeout(() => {
        setCopyStatus("Copy to Clipboard");
      }, 2000);
    });
  };

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "summary.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const readFileText = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/extract", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to read document.");
    }

    const data = await response.json();
    return data.content;
  };

  const readUrlText = async (url: string) => {
    const response = await fetch("/api/extract", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch the article.");
    }

    const data = await response.json();
    return data.extractedText;
  };

  const summarizeText = async (text: string) => {
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.body) throw new Error("ReadableStream not supported");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullSummary = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullSummary += chunk;
        setSummary((prev) => prev + chunk);
      }

      return fullSummary;
    } catch (error) {
      console.error("Error summarizing text:", error);
      return "An error occurred while summarizing the text.";
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#6366F1] to-[#9333EA] text-foreground",
        dm_sans.className
      )}
    >
      <div className="container mx-auto max-w-3xl px-12 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-6xl font-bold text-white">Summer</h1>
          <Link
            href="https://github.com/ItIsOHM/summer"
            className="text-white hover:underline"
            prefetch={false}
          >
            GitHub Repo
          </Link>
        </div>
        <p className="mb-8 text-white">
          A simple tool to summarize text or documents using AI technology.
        </p>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label
              htmlFor="input-mode"
              className="mb-2 block text-sm font-medium text-white"
            >
              Choose input mode
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between rounded-md bg-white/10 text-white hover:bg-white/20"
                >
                  {inputMode === "file"
                    ? "Upload a file"
                    : inputMode === "url"
                    ? "Enter a URL"
                    : "Paste Text"}
                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[200px] p-0">
                <DropdownMenuItem onClick={() => setInputMode("file")}>
                  Upload a file
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setInputMode("text")}>
                  Paste text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setInputMode("url")}>
                  Enter a URL
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {inputMode === "file" && (
            <div>
              <label
                htmlFor="file-upload"
                className="mb-2 block text-sm font-medium text-white"
              >
                Upload a file
              </label>
              <div className="relative">
                <input
                  id="file-upload"
                  type="file"
                  className="block w-full cursor-pointer rounded-md border-2 border-white/20 bg-white/10 py-2 px-3 text-sm file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:py-2 file:px-4 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-white placeholder:text-white/50"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          )}
          {inputMode === "text" && (
            <div>
              <label
                htmlFor="text-input"
                className="mb-2 block text-sm font-medium text-white"
              >
                Paste text
              </label>
              <textarea
                id="text-input"
                rows={5}
                className="block w-full rounded-md border-2 border-white/20 bg-white/10 py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 placeholder:text-white/50"
                placeholder="Enter your text here..."
                value={inputText}
                onChange={handleTextInput}
              />
            </div>
          )}
          {inputMode === "url" && (
            <div>
              <label
                htmlFor="url-input"
                className="mb-2 block text-sm font-medium text-white"
              >
                Enter a URL
              </label>
              <input
                id="url-input"
                type="url"
                className="block w-full rounded-md border-2 border-white/20 bg-white/10 py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 placeholder:text-white/50"
                placeholder="Enter the article URL..."
                value={url}
                onChange={handleURLInput}
              />
            </div>
          )}
        </div>
        <Button
          onClick={generateSummary}
          loading={loading}
          className="w-full rounded-md py-2 px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-md mt-8"
          variant="default"
        >
          Summarize
        </Button>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] overflow-y-scroll max-h-[75vh]">
          <DialogHeader>
            <DialogTitle className="text-lg">Summary</DialogTitle>
            <DialogDescription >
              {summary.length > 0 ? (
                <div className="prose dark:prose-invert">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex items-center">
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  <span>Loading summary...</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex gap-4">
              <Button variant="outline" onClick={copyToClipboard}>
                Copy to Clipboard
              </Button>
              <Button onClick={downloadSummary}>Download Summary</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}

function ChevronsUpDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
