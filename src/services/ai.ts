// NeuroTask - AI Service (OpenRouter Integration)
// Uses OpenRouter to access various LLM models (GPT-4, Claude, etc.)
// Structured prompts ensure reliable, parseable JSON responses.

import axios from "axios";
import { AIBreakdownResult, AIChatMessage, Subtask } from "../types/task";

// Set your OpenRouter API key in .env as EXPO_PUBLIC_OPENROUTER_KEY
const API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_KEY ?? "";
const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-4o-mini"; // cost-efficient for productivity tasks

const openRouterHeaders = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
  "HTTP-Referer": "https://neurotask.app",
  "X-Title": "NeuroTask",
};

// ---------- Task Breakdown ----------
// Given a task title, returns structured subtasks with time estimates.
export async function breakdownTask(
  taskTitle: string,
): Promise<AIBreakdownResult> {
  const prompt = `You are a productivity expert. Break down this task into actionable subtasks.

Task: "${taskTitle}"

Respond ONLY with valid JSON in this exact format:
{
  "subtasks": [
    { "title": "...", "estimatedMinutes": 15, "difficulty": "easy" }
  ],
  "totalEstimatedMinutes": 60,
  "difficultyRating": "medium"
}

Rules:
- 3-7 subtasks
- difficulty: "easy" | "medium" | "hard"
- Be very specific and actionable`;

  const response = await axios.post(
    BASE_URL,
    {
      model: DEFAULT_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    },
    { headers: openRouterHeaders },
  );

  const raw = response.data.choices[0].message.content;
  const parsed = JSON.parse(raw);

  // Attach unique IDs to subtasks
  const subtasks: Subtask[] = parsed.subtasks.map(
    (s: Omit<Subtask, "id" | "completed">, i: number) => ({
      ...s,
      id: `subtask-${Date.now()}-${i}`,
      completed: false,
    }),
  );

  return {
    subtasks,
    totalEstimatedMinutes: parsed.totalEstimatedMinutes,
    difficultyRating: parsed.difficultyRating,
    suggestedPriority: parsed.suggestedPriority ?? "p2",
  };
}

// ---------- AI Chat ----------
// General-purpose productivity assistant chat.
export async function sendChatMessage(
  messages: AIChatMessage[],
): Promise<string> {
  const systemPrompt = `You are NeuroTask AI, a friendly and concise productivity assistant.
Help the user:
- Plan their week efficiently
- Break down complex tasks
- Manage burnout and rest
- Improve focus and productivity

Keep responses short (max 150 words), practical, and encouraging. 
Use bullet points when listing items.`;

  const chatMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const response = await axios.post(
    BASE_URL,
    {
      model: DEFAULT_MODEL,
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 300,
    },
    { headers: openRouterHeaders },
  );

  return response.data.choices[0].message.content as string;
}

// ---------- Weekly Schedule Optimizer ----------
// Reorganizes overdue tasks across available days.
export function optimizeWeeklySchedule(
  tasks: { id: string; title: string; estimatedMinutes?: number }[],
  availabilityMinutesPerDay: number[], // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
): Record<string, string[]> {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const schedule: Record<string, string[]> = {};
  const remaining = [...availabilityMinutesPerDay];

  days.forEach((d) => (schedule[d] = []));

  for (const task of tasks) {
    const est = task.estimatedMinutes ?? 30;
    for (let i = 0; i < days.length; i++) {
      if (remaining[i] >= est) {
        schedule[days[i]].push(task.id);
        remaining[i] -= est;
        break;
      }
    }
  }

  return schedule;
}
