import type { ChatConversation } from "./types";

const NOW = Date.now();
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export const sampleConversations: ChatConversation[] = [
  {
    id: "c1",
    title: "Order #1042 status",
    preview: "Your order is out for delivery. ETA: 12 minutes.",
    updatedAt: NOW - 4 * MIN,
    unread: 1,
    messages: [
      {
        id: "m1",
        role: "user",
        text: "Where is my order #1042?",
        createdAt: NOW - 9 * MIN,
      },
      {
        id: "m2",
        role: "bot",
        text: "Hi! Your order #1042 has left the restaurant and is out for delivery. ETA: 12 minutes.",
        createdAt: NOW - 8 * MIN,
      },
    ],
  },
];

export const formatRelativeTime = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  if (diff < MIN) return "Just now";
  if (diff < HOUR) return `${Math.floor(diff / MIN)}m`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;
  return `${Math.floor(diff / DAY)}d`;
};

export const formatClockTime = (timestamp: number): string => {
  const d = new Date(timestamp);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = ((h + 11) % 12) + 1;
  return `${hr}:${m} ${ampm}`;
};

const dayKey = (timestamp: number): string => {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

export const isSameDay = (a: number, b: number): boolean =>
  dayKey(a) === dayKey(b);

export const formatDayLabel = (timestamp: number): string => {
  const d = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(timestamp, today.getTime())) return "Today";
  if (isSameDay(timestamp, yesterday.getTime())) return "Yesterday";

  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(d.getFullYear() !== today.getFullYear() ? { year: "numeric" } : {}),
  });
};
