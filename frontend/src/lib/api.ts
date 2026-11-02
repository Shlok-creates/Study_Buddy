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
  xp?: number;
  level?: number;
  badges_json?: string;
  created_at?: string;
}

export interface PlannerTask {
  id: number;
  student_id: string;
  topic_name: string;
  subject?: string;
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
  is_completed?: boolean;
  quiz: QuizQuestion[];
}

export interface PodLeaderboardItem {
  rank: number;
  student_id: string;
  student_name: string;
  tasks_completed_count: number;
  last_active: string;
}

export interface SubjectProgressItem {
  subject: string;
  color: string;
  total_tasks: number;
  completed_tasks: number;
  remaining_tasks: number;
  completion_percentage: number;
  today_total: number;
  today_completed: number;
  today_percentage: number;
  week_total: number;
  week_completed: number;
  week_percentage: number;
}

export interface SubjectProgressData {
  student_id: string;
  today_date: string;
  week_range: string;
  subjects: SubjectProgressItem[];
  overall_today_percentage: number;
  overall_week_percentage: number;
  total_today_tasks: number;
  total_today_completed: number;
  total_week_tasks: number;
  total_week_completed: number;
}

export interface GamificationStatus {
  student_id: string;
  total_xp: number;
  level: number;
  xp_into_level: number;
  xp_to_next: number;
  progress_percentage: number;
  current_badge: string;
  unlocked_badges: string[];
}

export interface GamificationAwardResult {
  xp_awarded: number;
  total_xp: number;
  level: number;
  xp_into_level: number;
  xp_to_next: number;
  leveled_up: boolean;
  new_level: number;
  badge_unlocked: string | null;
}

export interface StudySquad {
  id: number;
  name: string;
  invite_code: string;
  description: string;
  member_count: number;
  created_by: string;
  members: {
    student_id: string;
    student_name: string;
    joined_at: string;
  }[];
}

export interface SquadFeedItem {
  id: number;
  squad_id: number;
  student_id: string;
  student_name: string;
  event_type: "task_completed" | "streak_milestone" | "level_up" | "cheer";
  message: string;
  reactions: {
    "🔥": number;
    "👏": number;
    "🎯": number;
  };
  created_at: string;
}

export interface LeaderboardItem {
  rank: number;
  student_id: string;
  student_name: string;
  grade_stream: string;
  level: number;
  xp: number;
  streak: number;
  tasks_done: number;
  score: number;
  avatar: string;
}

export interface UserStanding {
  student_id: string;
  student_name: string;
  rank: number;
  score: number;
  metric: string;
  percentile: number;
  level: number;
  xp: number;
  streak: number;
  xp_to_next_rank: number;
  next_rank_name: string | null;
}

export interface LeaderboardResponse {
  timeframe: string;
  metric: string;
  total_students: number;
  user_standing: UserStanding | null;
  top_50: LeaderboardItem[];
}

export interface CareerTrack {
  id: string;
  key: string;
  title: string;
  badge: string;
  description: string;
  icon: string;
  color: string;
  domains: string[];
  key_exams: { name: string; focus: string }[];
  accelerator_pathways: string[];
}

export interface CareerGuidance {
  socratic_advice: string;
  career_matches: {
    title: string;
    domain: string;
    fit_reason: string;
    salary_outlook: string;
    required_skills: string[];
  }[];
  target_exams: {
    name: string;
    eligibility: string;
    exam_period: string;
    difficulty_tier: string;
  }[];
  dual_strategy: {
    plan_a: {
      title: string;
      target_institutes: string;
      strategy_summary: string;
    };
    plan_b: {
      title: string;
      target_institutes: string;
      roi_advantage: string;
      strategy_summary: string;
    };
  };
  actionable_tasks: {
    topic_name: string;
    subject: string;
    duration_minutes: number;
    priority: string;
  }[];
}

// Local Storage helpers for dynamic user identity
export function getStoredUserId(): string | null {
  if (typeof window === "undefined") return null;
  const prof = getStoredProfile();
  return (
    prof?.id ||
    localStorage.getItem("student_id") ||
    localStorage.getItem("study_buddy_user_id") ||
    null
  );
}

export function setStoredUserId(id: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("student_id", id);
    localStorage.setItem("study_buddy_user_id", id);
  }
}

export function getStoredProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw =
    localStorage.getItem("student_profile") ||
    localStorage.getItem("study_buddy_profile");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredProfile(profile: UserProfile): void {
  if (typeof window !== "undefined") {
    const raw = JSON.stringify(profile);
    localStorage.setItem("student_profile", raw);
    localStorage.setItem("study_buddy_profile", raw);
    if (profile.id) {
      localStorage.setItem("student_id", profile.id);
      localStorage.setItem("study_buddy_user_id", profile.id);
    }
  }
}

export function clearUserSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("student_profile");
    localStorage.removeItem("study_buddy_profile");
    localStorage.removeItem("student_id");
    localStorage.removeItem("study_buddy_user_id");
  }
}

export async function loginProfile(identifier: string): Promise<{ message: string; user_id: string; profile: UserProfile }> {
  const res = await fetch(`${API_BASE}/api/onboarding/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }
  return res.json();
}

// Global Level-Up Event Dispatcher
export function triggerLevelUpCelebration(detail: { new_level: number; badge_unlocked: string | null; total_xp: number }) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("study-buddy-level-up", { detail }));
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

export async function toggleTask(
  taskId: number,
  isCompleted?: boolean
): Promise<{ message: string; task: PlannerTask; gamification?: GamificationAwardResult | null }> {
  const res = await fetch(`${API_BASE}/api/planner/tasks/${taskId}/toggle`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(isCompleted !== undefined ? { is_completed: isCompleted } : {}),
  });
  if (!res.ok) throw new Error("Failed to toggle task");
  const data = await res.json();
  if (data.gamification && data.gamification.leveled_up) {
    triggerLevelUpCelebration(data.gamification);
  }
  return data;
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

// MODULE 1: Subject Progress
export async function fetchSubjectProgress(studentId?: string): Promise<SubjectProgressData> {
  const id = studentId || getStoredUserId();
  if (!id) {
    return {
      student_id: "",
      today_date: "",
      week_range: "",
      subjects: [],
      overall_today_percentage: 0,
      overall_week_percentage: 0,
      total_today_tasks: 0,
      total_today_completed: 0,
      total_week_tasks: 0,
      total_week_completed: 0,
    };
  }
  const res = await fetch(`${API_BASE}/api/analytics/subject-progress/${id}`);
  if (!res.ok) throw new Error("Failed to fetch subject progress");
  return res.json();
}

// MODULE 2: Gamification Progression
export async function fetchGamificationStatus(studentId?: string): Promise<GamificationStatus> {
  const id = studentId || getStoredUserId();
  if (!id) {
    return {
      student_id: "",
      total_xp: 0,
      level: 1,
      xp_into_level: 0,
      xp_to_next: 500,
      progress_percentage: 0,
      current_badge: "Novice Scholar",
      unlocked_badges: ["Novice Scholar"],
    };
  }
  const res = await fetch(`${API_BASE}/api/gamification/status/${id}`);
  if (!res.ok) throw new Error("Failed to fetch gamification status");
  return res.json();
}

export async function awardGamificationXP(amount: number, reason: string, studentId?: string): Promise<GamificationAwardResult> {
  const id = studentId || getStoredUserId();
  if (!id) throw new Error("No student ID");
  const res = await fetch(`${API_BASE}/api/gamification/award-xp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id: id, amount, reason }),
  });
  if (!res.ok) throw new Error("Failed to award XP");
  const data = await res.json();
  if (data.leveled_up) {
    triggerLevelUpCelebration(data);
  }
  return data;
}

// MODULE 3: Social Squads
export async function fetchMySquads(studentId?: string): Promise<{ squads: StudySquad[] }> {
  const id = studentId || getStoredUserId();
  if (!id) return { squads: [] };
  const res = await fetch(`${API_BASE}/api/squads/my/${id}`);
  if (!res.ok) throw new Error("Failed to fetch squads");
  return res.json();
}

export async function createSquad(name: string, description?: string, studentId?: string): Promise<{ message: string; squad: StudySquad }> {
  const id = studentId || getStoredUserId();
  if (!id) throw new Error("No student ID");
  const res = await fetch(`${API_BASE}/api/squads/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, created_by: id, description }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create squad");
  }
  return res.json();
}

export async function joinSquad(inviteCode: string, studentId?: string, studentName?: string): Promise<{ message: string; squad: StudySquad; already_member: boolean }> {
  const id = studentId || getStoredUserId();
  if (!id) throw new Error("No student ID");
  const name = studentName || getStoredProfile()?.full_name || "Scholar";
  const res = await fetch(`${API_BASE}/api/squads/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invite_code: inviteCode, student_id: id, student_name: name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to join squad");
  }
  return res.json();
}

export async function fetchSquadFeed(squadId: number): Promise<{ squad_id: number; feed: SquadFeedItem[] }> {
  const res = await fetch(`${API_BASE}/api/squads/${squadId}/feed`);
  if (!res.ok) throw new Error("Failed to fetch squad feed");
  return res.json();
}

export async function reactSquadFeedItem(itemId: number, emoji: "🔥" | "👏" | "🎯", studentId?: string): Promise<{ id: number; reactions: Record<string, number> }> {
  const id = studentId || getStoredUserId();
  const res = await fetch(`${API_BASE}/api/squads/feed/${itemId}/react`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emoji, student_id: id }),
  });
  if (!res.ok) throw new Error("Failed to react to feed item");
  return res.json();
}

export async function postSquadMessage(squadId: number, message: string, studentId?: string, studentName?: string): Promise<SquadFeedItem> {
  const id = studentId || getStoredUserId();
  if (!id) throw new Error("No student ID");
  const name = studentName || getStoredProfile()?.full_name || "Scholar";
  const res = await fetch(`${API_BASE}/api/squads/feed/${squadId}/post`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id: id, student_name: name, message }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to post message to squad");
  }
  return res.json();
}

// MODULE 4: Global Leaderboards
export async function fetchGlobalLeaderboard(
  studentId?: string,
  timeframe: string = "all-time",
  metric: string = "xp"
): Promise<LeaderboardResponse> {
  const id = studentId || getStoredUserId() || "";
  const params = new URLSearchParams({ timeframe, metric });
  if (id) params.set("student_id", id);
  const res = await fetch(`${API_BASE}/api/leaderboard/global?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch global leaderboard");
  return res.json();
}

// MODULE 5: Career & Academic Counsellor Hub
export async function fetchCareerRoadmaps(): Promise<{ tracks: CareerTrack[] }> {
  const res = await fetch(`${API_BASE}/api/counsellor/roadmaps`);
  if (!res.ok) throw new Error("Failed to fetch career roadmaps");
  return res.json();
}

export async function requestCareerAdvice(
  streamTrack: string,
  query: string,
  studentId?: string
): Promise<{ session_id: number; student_id: string; stream_track: string; query: string; guidance: CareerGuidance; timestamp: string }> {
  const id = studentId || getStoredUserId();
  if (!id) throw new Error("No student ID");
  const res = await fetch(`${API_BASE}/api/counsellor/advise`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id: id, stream_track: streamTrack, query }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to get career guidance");
  }
  return res.json();
}

export async function applyCareerMilestones(
  tasks: { topic_name: string; subject: string; duration_minutes: number; priority?: string }[],
  studentId?: string
): Promise<{ message: string; added_count: number; tasks: PlannerTask[] }> {
  const id = studentId || getStoredUserId();
  if (!id) throw new Error("No student ID");
  const res = await fetch(`${API_BASE}/api/counsellor/apply-milestones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id: id, tasks }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to apply milestones to planner");
  }
  return res.json();
}

export async function fetchCareerHistory(studentId?: string): Promise<{ sessions: any[] }> {
  const id = studentId || getStoredUserId();
  if (!id) return { sessions: [] };
  const res = await fetch(`${API_BASE}/api/counsellor/history/${id}`);
  if (!res.ok) throw new Error("Failed to fetch career history");
  return res.json();
}

// Existing endpoints
export async function snapSolveDoubt(formData: FormData): Promise<any> {
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

export async function submitSkillQuiz(nodeId: string, scorePercentage: number, studentId?: string): Promise<any> {
  const id = studentId || getStoredUserId();
  const res = await fetch(`${API_BASE}/api/skills/submit-quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ node_id: nodeId, score_percentage: scorePercentage, student_id: id }),
  });
  if (!res.ok) throw new Error("Failed to submit quiz");
  const data = await res.json();
  if (data.gamification && data.gamification.leveled_up) {
    triggerLevelUpCelebration(data.gamification);
  }
  return data;
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
