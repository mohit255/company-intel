export default function Spinner({ size = 18 }: { size?: number }) {
  return (
    <svg
      className="animate-spin text-amber-400"
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M22 12c0-5.523-4.477-10-10-10V0C18.627 0 24 5.373 24 12h-2z"
      />
    </svg>
  );
}
