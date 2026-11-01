const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  grade_stream: string;
  focus_span_minutes: number;
  school_start_time: string;
  school_end_time: string;
  sleep_start_time: string;
  peak_energy: string;
  created_at?: string;
}

export interface PlannerTask {
  id: number;
  student_id: string;
  topic_name: string;
  scheduled_date: string;
  duration_minutes: number;
  is_completed: boolean;
  is_missed: boolean;
}

export interface AnalyticsData {
  student_id: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  streak_days: number;
  backlog_count: number;
  heatmap: Record<string, number>;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardSetItem {
  id: number;
  topic: string;
  image_path?: string;
  cards: Flashcard[];
  next_review_date: string;
  srs_interval: number;
  created_at: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface SkillNodeItem {
  id: string;
  track: string;
  title: string;
  level_order: number;
  is_unlocked: boolean;
  quiz: QuizQuestion[];
}

export interface PodLeaderboardItem {
  rank: number;
  student_id: string;
  student_name: string;
  tasks_completed_count: number;
  last_active: string;
}

// Local Storage helpers for dynamic user identity
export function getStoredUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("study_buddy_user_id");
}

export function setStoredUserId(id: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("study_buddy_user_id", id);
  }
}

export function getStoredProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("study_buddy_profile");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredProfile(profile: UserProfile): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("study_buddy_profile", JSON.stringify(profile));
  }
}

export function clearUserSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("study_buddy_user_id");
    localStorage.removeItem("study_buddy_profile");
  }
}

// API methods
export async function fetchProfile(studentId?: string): Promise<UserProfile> {
  const id = studentId || getStoredUserId();
  if (!id) throw new Error("No active student ID");
  const res = await fetch(`${API_BASE}/api/onboarding/profile/${id}`);
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function saveProfile(data: Partial<UserProfile>): Promise<{ message: string; user_id: string; profile: UserProfile }> {
  const res = await fetch(`${API_BASE}/api/onboarding/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save profile");
  return res.json();
}

export async function fetchTasks(studentId?: string): Promise<PlannerTask[]> {
  const id = studentId || getStoredUserId();
  if (!id) return [];
  const res = await fetch(`${API_BASE}/api/planner/tasks/${id}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function generateRoadmap(payload: {
  student_id?: string;
  target_goal: string;
  deadline_date: string;
  daily_hours: number;
}): Promise<any> {
  const id = payload.student_id || getStoredUserId();
  if (!id) throw new Error("User must complete onboarding first");

  const res = await fetch(`${API_BASE}/api/planner/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: id,
      target_goal: payload.target_goal,
      deadline_date: payload.deadline_date,
      daily_hours: payload.daily_hours,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to generate roadmap");
  }
  return res.json();
}

export async function rescheduleBacklogs(studentId?: string): Promise<any> {
  const id = studentId || getStoredUserId();
  if (!id) throw new Error("No active student ID");
  const res = await fetch(`${API_BASE}/api/planner/reschedule-missed/${id}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to reschedule backlogs");
  return res.json();
}

export async function toggleTask(taskId: number, isCompleted?: boolean): Promise<any> {
  const res = await fetch(`${API_BASE}/api/planner/tasks/${taskId}/toggle`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(isCompleted !== undefined ? { is_completed: isCompleted } : {}),
  });
  if (!res.ok) throw new Error("Failed to toggle task");
  return res.json();
}

export async function fetchAnalytics(studentId?: string): Promise<AnalyticsData> {
  const id = studentId || getStoredUserId();
  if (!id) {
    return {
      student_id: "",
      total_tasks: 0,
      completed_tasks: 0,
      completion_rate: 0,
      streak_days: 0,
      backlog_count: 0,
      heatmap: {},
    };
  }
  const res = await fetch(`${API_BASE}/api/planner/analytics/${id}`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

export async function snapSolveDoubt(formData: FormData): Promise<any> {
  // IMPORTANT: Do NOT manually set Content-Type header on FormData!
  // The browser sets multipart/form-data with the correct boundary automatically.
  const res = await fetch(`${API_BASE}/api/doubts/snap-solve`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to solve doubt snapshot");
  }
  return res.json();
}

export async function fetchFlashcards(studentId?: string): Promise<FlashcardSetItem[]> {
  const id = studentId || getStoredUserId();
  if (!id) return [];
  const res = await fetch(`${API_BASE}/api/doubts/flashcards/${id}`);
  if (!res.ok) throw new Error("Failed to fetch flashcards");
  return res.json();
}

export async function analyzeYoutubeVideo(url: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/youtube/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to analyze YouTube video");
  }
  return res.json();
}

export async function explainTeacherNotes(formData: FormData): Promise<any> {
  // IMPORTANT: Do NOT set Content-Type header so the browser sets multipart boundary automatically
  const res = await fetch(`${API_BASE}/api/teacher/explain`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to generate teacher explanation");
  }
  return res.json();
}

export async function fetchSkillTracks(): Promise<{ tracks: string[] }> {
  const res = await fetch(`${API_BASE}/api/skills/tracks`);
  if (!res.ok) throw new Error("Failed to fetch skill tracks");
  return res.json();
}

export async function fetchSkillTree(track: string): Promise<SkillNodeItem[]> {
  const res = await fetch(`${API_BASE}/api/skills/tree/${encodeURIComponent(track)}`);
  if (!res.ok) throw new Error("Failed to fetch skill tree");
  return res.json();
}

export async function submitSkillQuiz(nodeId: string, scorePercentage: number): Promise<any> {
  const res = await fetch(`${API_BASE}/api/skills/submit-quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ node_id: nodeId, score_percentage: scorePercentage }),
  });
  if (!res.ok) throw new Error("Failed to submit quiz");
  return res.json();
}

export async function fetchPodLeaderboard(roomCode: string = "FOCUS-2026"): Promise<{
  room_code: string;
  active_students_count: number;
  leaderboard: PodLeaderboardItem[];
}> {
  const res = await fetch(`${API_BASE}/api/pods/leaderboard/${roomCode}`);
  if (!res.ok) throw new Error("Failed to fetch pod leaderboard");
  return res.json();
}

export async function joinPodRoom(roomCode: string, studentName?: string, studentId?: string): Promise<any> {
  const id = studentId || getStoredUserId() || "student-temp";
  const name = studentName || getStoredProfile()?.full_name || "Scholar";
  const res = await fetch(`${API_BASE}/api/pods/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_code: roomCode, student_name: name, student_id: id }),
  });
  if (!res.ok) throw new Error("Failed to join pod");
  return res.json();
}

export { API_BASE };
