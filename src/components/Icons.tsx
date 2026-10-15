// Small line icons (24×24, stroke = currentColor).
type P = { className?: string };
const base = (className = "h-4 w-4") => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
  "aria-hidden": true,
});

export const CalendarIcon = ({ className }: P) => (
  <svg {...base(className)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>
);
export const GaugeIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 14l4-4" /><path d="M3.3 17a9 9 0 1 1 17.4 0" /><circle cx="12" cy="14" r="1.2" /></svg>
);
export const FuelIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h12M4 11h10" /><path d="M14 8h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V9l-3-3" /></svg>
);
export const GearIcon = ({ className }: P) => (
  <svg {...base(className)}><circle cx="6" cy="6" r="2" /><circle cx="12" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="12" cy="18" r="2" /><path d="M6 8v8M12 8v8M18 8v4H6" /></svg>
);
export const CarIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M5 17H3v-5l2-5h10l4 5h2v5h-2" /><circle cx="7.5" cy="17" r="2" /><circle cx="16.5" cy="17" r="2" /><path d="M9.5 17h5M5 12h14" /></svg>
);
export const ShipIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M3 18c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" /><path d="M5 15l-1-5h16l-1 5M8 10V6h8v4M12 3v3" /></svg>
);
export const ShieldIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></svg>
);
export const WalletIcon = ({ className }: P) => (
  <svg {...base(className)}><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18M16 15h2M6 6l9-3 1 3" /></svg>
);
export const KeyIcon = ({ className }: P) => (
  <svg {...base(className)}><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M17 6l2 2M15 8l2 2" /></svg>
);
export const PhoneIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>
);
export const PinIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
);
export const ClockIcon = ({ className }: P) => (
  <svg {...base(className)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const SearchIcon = ({ className }: P) => (
  <svg {...base(className)}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
);
export const CheckIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const DocIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></svg>
);
export const CameraIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1" /><circle cx="12" cy="13.5" r="3.5" /></svg>
);
export const MenuIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const HeartIcon = ({ className, filled = false }: P & { filled?: boolean }) => (
  <svg {...base(className)} fill={filled ? "currentColor" : "none"}><path d="M12 20s-7-4.4-9-9.1C1.7 7.6 3.9 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.3 0 5.5 3.1 4.2 6.4C19 15.6 12 20 12 20z" /></svg>
);
export const LockIcon = ({ className }: P) => (
  <svg {...base(className)}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);
export const TagIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" /><circle cx="8" cy="8" r="1.5" /></svg>
);
export const ArrowDownIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 5v14M6 13l6 6 6-6" /></svg>
);
export const StarIcon = ({ className }: P) => (
  <svg {...base(className)} fill="currentColor" stroke="none"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" /></svg>
);
export const SparkIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" /></svg>
);
export const HomeIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>
);
export const ExpandIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
);
export const ShareIcon = ({ className }: P) => (
  <svg {...base(className)}><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" /></svg>
);
export const MailIcon = ({ className }: P) => (
  <svg {...base(className)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
);
export const RefreshIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4" /></svg>
);
export const CompareIcon = ({ className }: P) => (
  <svg {...base(className)}><rect x="3" y="4" width="7" height="16" rx="1.5" /><rect x="14" y="4" width="7" height="16" rx="1.5" /></svg>
);
export const ChevronLeftIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M15 18l-6-6 6-6" /></svg>
);
export const ChevronRightIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M9 18l6-6-6-6" /></svg>
);
export const ArrowRightIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const CloseIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
