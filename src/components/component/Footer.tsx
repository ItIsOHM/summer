import React from "react";

export function Footer() {
  return (
    <footer className="flex w-full items-center justify-between bg-white/10 p-4 text-white fixed bottom-0">
      <div className="flex items-center gap-2">
        <MountainIcon className="h-6 w-6" />
        <span className="text-lg font-medium">Summer</span>
      </div>
      <span className="text-sm">Made with love by Rhythm Garg.</span>
    </footer>
  );
}

function MountainIcon(props) {
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
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}