import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with 2.5 Pro model
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
console.log('Gemini API Key available:', !!apiKey);


export interface AIGreetingResponse {
  greeting: string;
  progressInsight: string;
  quickTip: string;
}

export interface AIMoodInsightResponse {
  observation: string;
}

export interface AITaskSortResponse {
  sortedTasks: string[];
}

export interface AITaskBreakdownResponse {
  subtasks: string[];
}

export interface AIJournalFeedbackResponse {
  feedback: string;
}

export interface AIMentorResponse {
  response: string;
}

export interface AITaskParseResponse {
  title: string;
  dueDate?: string;
  time?: string;
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

export interface AIMoodInsightResponse {
  observation: string;
  followUpAction?: string;
}

export interface AIProgressReportResponse {
  moodTrend: string;
  productivityInsight: string;
  journalThemes: string;
  recommendations: string[];
}

export interface AIWeeklyReportResponse {
  summary: string;
  moodAnalysis: string;
  taskAnalysis: string;
  journalInsights: string;
  nextWeekGoals: string[];
}

// Cache for AI responses to reduce API calls
const responseCache = new Map<string, { data: Record<string, unknown>; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests
let lastRequestTime = 0;

class AIService {
  private getModel() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Gemini API key not found');
      return null;
    }
    return new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: 'gemini-2.5-pro' });
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }

  private cleanAIResponse(text: string): string {
    // Remove markdown code blocks and extract JSON
    let cleaned = text.trim();
    
    // Remove ```json and ``` markers
    cleaned = cleaned.replace(/```json\s*/g, '');
    cleaned = cleaned.replace(/```\s*/g, '');
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // If the response doesn't start with {, try to find JSON object
    if (!cleaned.startsWith('{')) {
      const jsonMatch = cleaned.match(/\{.*\}/s);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }
    }
    
    return cleaned;
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      const delay = RATE_LIMIT_DELAY - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${delay}ms before next AI request`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    lastRequestTime = Date.now();
  }

  private getCacheKey(method: string, data: Record<string, unknown>, userId?: string): string {
    const userPrefix = userId ? `user_${userId}_` : '';
    return `${userPrefix}${method}_${JSON.stringify(data)}`;
  }

  private getCachedResponse<T>(cacheKey: string): T | null {
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached AI response');
      return cached.data as T;
    }
    return null;
  }

  private setCachedResponse(cacheKey: string, data: Record<string, unknown>): void {
    responseCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  private async retryAIRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: unknown;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.rateLimit();
        
        return await requestFn();
      } catch (error: unknown) {
        lastError = error;
        
        // Check if it's a rate limit, overload, or service unavailable error
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isRetryableError = errorMessage.includes('overloaded') || 
                               errorMessage.includes('rate limit') ||
                               errorMessage.includes('503') ||
                               errorMessage.includes('service unavailable') ||
                               errorMessage.includes('quota exceeded');
        
        if (isRetryableError && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`AI request failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If it's not a retryable error or we've exhausted retries, throw
        if (!isRetryableError) {
          console.error('Non-retryable AI error:', error);
          throw error;
        }
      }
    }
    
    console.error(`AI request failed after ${maxRetries} attempts:`, lastError);
    throw lastError;
  }

  async parseTaskInput(
    rawText: string
  ): Promise<AITaskParseResponse> {
    const model = this.getModel();
    if (!model) {
      return {
        title: rawText,
        priority: 'medium'
      };
    }

    const currentDate = new Date().toISOString().split('T')[0];
    const prompt = `You are a task parser. Extract the Title, Due Date, Time, and Priority from the following text. The current date is ${currentDate}. Respond only with a JSON object.

Text: "${rawText}"

Return JSON with these fields:
- title: The task title
- dueDate: Date in YYYY-MM-DD format (optional)
- time: Time in HH:MM format (optional)
- priority: "low", "medium", or "high"
- description: Any additional details (optional)

Example: {"title": "Study Physics", "dueDate": "2025-07-31", "time": "16:00", "priority": "high"}`;

    try {
      const result = await this.retryAIRequest(async () => {
        return await model.generateContent(prompt);
      });
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = this.cleanAIResponse(text);
      try {
        return JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON parse error, using fallback:', parseError);
        return {
          title: rawText,
          priority: 'medium'
        };
      }
    } catch (error) {
      console.error('Error parsing task input:', error);
      return {
        title: rawText,
        priority: 'medium'
      };
    }
  }

  async generateDashboardGreeting(
    userName: string,
    recentTasks: Array<{ title: string; status: string; priority: string }>,
    recentMoodLogs: Array<{ mood: string; energy: number; date: Date }>
  ): Promise<AIGreetingResponse> {
    const model = this.getModel();
    if (!model) {
      return {
        greeting: `Good morning, ${userName}! Ready to make today productive?`,
        progressInsight: 'Keep up the great work on your tasks!',
        quickTip: 'Start with your most important task to build momentum.'
      };
    }

    // Create cache key based on user and recent data
    const cacheKey = this.getCacheKey('greeting', {
      userName,
      taskCount: recentTasks.length,
      moodCount: recentMoodLogs.length,
      lastTask: recentTasks[0]?.title || '',
      lastMood: recentMoodLogs[0]?.mood || ''
    });

    // Check cache first
    const cached = this.getCachedResponse<AIGreetingResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const prompt = `You are the voice of the InsideMentor app. Based on the following user data, generate three distinct JSON fields: greeting, progressInsight, and quickTip. Be warm, encouraging, and concise.

User Data:
{
  "userName": "${userName}",
  "timeOfDay": "${this.getTimeOfDay()}",
  "recentTasks": ${JSON.stringify(recentTasks)},
  "recentMoodLogs": ${JSON.stringify(recentMoodLogs)}
}

Expected AI Response (Output):
{
  "greeting": "personalized greeting message",
  "progressInsight": "brief insight about their progress",
  "quickTip": "bite-sized, actionable advice based on context"
}`;

    try {
      const result = await this.retryAIRequest(async () => {
        return await model.generateContent(prompt);
      });
      const response = await result.response;
      const text = response.text();
      
      // Clean the response and parse JSON
      const cleanedText = this.cleanAIResponse(text);
      try {
        const result = JSON.parse(cleanedText);
        // Cache the successful response
        this.setCachedResponse(cacheKey, result);
        return result;
      } catch (parseError) {
        console.error('JSON parse error, using fallback:', parseError);
        const fallback = {
          greeting: `Good morning, ${userName}! Ready to make today productive?`,
          progressInsight: 'Keep up the great work on your tasks!',
          quickTip: 'Start with your most important task to build momentum.'
        };
        this.setCachedResponse(cacheKey, fallback);
        return fallback;
      }
    } catch (error) {
      console.error('Error generating greeting:', error);
      const fallback = {
        greeting: `Good morning, ${userName}! Ready to make today productive?`,
        progressInsight: 'Keep up the great work on your tasks!',
        quickTip: 'Start with your most important task to build momentum.'
      };
      this.setCachedResponse(cacheKey, fallback);
      return fallback;
    }
  }

  async generateMoodInsight(
    moodLogs: Array<{ mood: string; energy: number; date: Date }>,
    currentMood: string
  ): Promise<AIMoodInsightResponse> {
    const model = this.getModel();
    if (!model) {
      return {
        observation: 'Thanks for sharing your mood. Every check-in helps track your wellbeing journey.'
      };
    }

    // Create cache key based on mood data
    const cacheKey = this.getCacheKey('moodInsight', {
      currentMood,
      moodCount: moodLogs.length,
      recentMoods: moodLogs.slice(0, 3).map(m => m.mood).join(',')
    });

    // Check cache first
    const cached = this.getCachedResponse<AIMoodInsightResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const prompt = `You are a gentle and supportive AI mentor. A user just logged their mood. Based on their recent history, provide one short, non-judgmental observation (max 20 words). Notice a simple pattern (e.g., time of day, repetition) and offer a gentle reflection.

User Data:
{
  "currentMood": ${JSON.stringify({ mood: currentMood, timestamp: new Date().toISOString() })},
  "recentHistory": ${JSON.stringify(moodLogs.slice(0, 3))}
}

Return as JSON: {"observation": "string", "followUpAction": "optional suggested action"}`;

    try {
      const result = await this.retryAIRequest(async () => {
        return await model.generateContent(prompt);
      });
      const response = await result.response;
      const text = response.text();
      
      // Clean the response and parse JSON
      const cleanedText = this.cleanAIResponse(text);
      try {
        const result = JSON.parse(cleanedText);
        // Cache the successful response
        this.setCachedResponse(cacheKey, result);
        return result;
      } catch (parseError) {
        console.error('JSON parse error, using fallback:', parseError);
        const fallback = {
          observation: 'Thanks for sharing your mood. Every check-in helps track your wellbeing journey.'
        };
        this.setCachedResponse(cacheKey, fallback);
        return fallback;
      }
    } catch (error) {
      console.error('Error generating mood insight:', error);
      const fallback = {
        observation: 'Thanks for sharing your mood. Every check-in helps track your wellbeing journey.'
      };
      this.setCachedResponse(cacheKey, fallback);
      return fallback;
    }
  }

  async sortTasksByMood(
    taskList: Array<{ id: string; title: string; priority: string; status: string }>,
    moodLogs: Array<{ mood: string; energy: number; date: Date }>
  ): Promise<AITaskSortResponse> {
    const model = this.getModel();
    if (!model) {
      return {
        sortedTasks: taskList.map(task => task.id)
      };
    }

    const prompt = `You are InsideMentor, helping a student prioritize tasks based on their current energy and mood.

Available tasks: ${JSON.stringify(taskList)}
Recent mood data: ${JSON.stringify(moodLogs)}

Analyze the user's recent mood and energy levels, then reorder the tasks to optimize productivity:
- If user has low energy: prioritize easy, quick wins first
- If user has high energy: prioritize challenging, important tasks
- Consider task complexity, importance, and estimated time

Return ONLY a JSON array of task IDs in the recommended order: {"sortedTasks": ["task_id_1", "task_id_2", ...]}`;

    try {
      const result = await this.retryAIRequest(async () => {
        return await model.generateContent(prompt);
      });
      const response = await result.response;
      const text = response.text();
      
      // Clean the response and parse JSON
      const cleanedText = this.cleanAIResponse(text);
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error sorting tasks:', error);
      return {
        sortedTasks: taskList.map(task => task.id)
      };
    }
  }

  async breakDownTask(taskTitle: string): Promise<AITaskBreakdownResponse> {
    const model = this.getModel();
    if (!model) {
      return {
        subtasks: [
          'Research the topic',
          'Create an outline',
          'Write the first draft',
          'Review and revise',
          'Finalize the task'
        ]
      };
    }

    const prompt = `You are InsideMentor, helping a student break down a large task into manageable steps.

Task: "${taskTitle}"

Break this task into 3-5 specific, actionable subtasks that:
- Are concrete and measurable
- Can be completed in 30-60 minutes each
- Follow a logical sequence
- Are specific to this particular task

Return as JSON: {"subtasks": ["subtask1", "subtask2", ...]}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return JSON.parse(text);
    } catch (error) {
      console.error('Error breaking down task:', error);
      return {
        subtasks: [
          'Research the topic',
          'Create an outline',
          'Write the first draft',
          'Review and revise',
          'Finalize the task'
        ]
      };
    }
  }

  async generateJournalFeedback(
    currentEntry: string,
    pastEntries: string[]
  ): Promise<AIJournalFeedbackResponse> {
    const model = this.getModel();
    if (!model) {
      return {
        feedback: 'Thank you for sharing your thoughts. Your journal entries show growth and self-reflection.'
      };
    }

    const prompt = `You are InsideMentor, providing thoughtful feedback on a student's journal entry.

Current journal entry: "${currentEntry}"
Past entries (last 3): ${JSON.stringify(pastEntries)}

Provide a thoughtful, empathetic reflection (3-4 sentences) that:
- Acknowledges their feelings and experiences
- Identifies patterns or growth across entries
- Offers gentle encouragement or insights
- Maintains a supportive, academic wellness focus

Return as JSON: {"feedback": "string"}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response and parse JSON
      const cleanedText = this.cleanAIResponse(text);
      try {
        return JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON parse error, using fallback:', parseError);
        return {
          feedback: 'Thank you for sharing your thoughts. Your journal entries show growth and self-reflection.'
        };
      }
    } catch (error) {
      console.error('Error generating journal feedback:', error);
      return {
        feedback: 'Thank you for sharing your thoughts. Your journal entries show growth and self-reflection.'
      };
    }
  }

  async generateProgressReport(
    moodEntries: Array<{ mood: string; energy: number; date: Date }>,
    tasks: Array<{ title: string; status: string; priority: string }>,
    journalEntries: Array<{ content: string; date: Date }>
  ): Promise<AIProgressReportResponse> {
    const model = this.getModel();
    if (!model) {
      return {
        moodTrend: 'Your mood has been stable recently.',
        productivityInsight: 'You\'ve been making good progress on your tasks.',
        journalThemes: 'Your journal entries show thoughtful reflection.',
        recommendations: ['Keep up the great work!', 'Consider setting daily goals.']
      };
    }

    const prompt = `You are InsideMentor, analyzing a student's progress data. Generate insights and recommendations.

Data:
- Mood entries: ${JSON.stringify(moodEntries.slice(0, 7))}
- Tasks: ${JSON.stringify(tasks.slice(0, 10))}
- Journal entries: ${JSON.stringify(journalEntries.slice(0, 5))}

Provide analysis in JSON format:
{
  "moodTrend": "brief mood pattern analysis",
  "productivityInsight": "task completion and productivity insights",
  "journalThemes": "recurring themes from journal entries",
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2"]
}`;

    try {
      const result = await this.retryAIRequest(async () => {
        return await model.generateContent(prompt);
      });
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = this.cleanAIResponse(text);
      try {
        return JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON parse error, using fallback:', parseError);
        return {
          moodTrend: 'Your mood has been stable recently.',
          productivityInsight: 'You\'ve been making good progress on your tasks.',
          journalThemes: 'Your journal entries show thoughtful reflection.',
          recommendations: ['Keep up the great work!', 'Consider setting daily goals.']
        };
      }
    } catch (error) {
      console.error('Error generating progress report:', error);
      return {
        moodTrend: 'Your mood has been stable recently.',
        productivityInsight: 'You\'ve been making good progress on your tasks.',
        journalThemes: 'Your journal entries show thoughtful reflection.',
        recommendations: ['Keep up the great work!', 'Consider setting daily goals.']
      };
    }
  }

  async generateWeeklyReport(
    weeklyData: {
      moodEntries: Array<{ mood: string; energy: number; date: Date }>;
      tasks: Array<{ title: string; status: string; priority: string }>;
      journalEntries: Array<{ content: string; date: Date }>;
    }
  ): Promise<AIWeeklyReportResponse> {
    const model = this.getModel();
    if (!model) {
      return {
        summary: 'You had a productive week with good emotional balance.',
        moodAnalysis: 'Your mood remained positive throughout the week.',
        taskAnalysis: 'You completed most of your planned tasks.',
        journalInsights: 'Your journal entries show growth and self-reflection.',
        nextWeekGoals: ['Set specific daily goals', 'Maintain your positive momentum']
      };
    }

    const prompt = `You are InsideMentor, generating a weekly progress report. Analyze the following data and provide insights.

Weekly Data:
- Mood entries: ${JSON.stringify(weeklyData.moodEntries)}
- Tasks: ${JSON.stringify(weeklyData.tasks)}
- Journal entries: ${JSON.stringify(weeklyData.journalEntries)}

Generate a comprehensive weekly report in JSON format:
{
  "summary": "one-paragraph weekly summary",
  "moodAnalysis": "detailed mood pattern analysis",
  "taskAnalysis": "productivity and task completion analysis",
  "journalInsights": "themes and growth patterns from journal entries",
  "nextWeekGoals": ["specific goal 1", "specific goal 2", "specific goal 3"]
}`;

    try {
      const result = await this.retryAIRequest(async () => {
        return await model.generateContent(prompt);
      });
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = this.cleanAIResponse(text);
      try {
        return JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON parse error, using fallback:', parseError);
        return {
          summary: 'You had a productive week with good emotional balance.',
          moodAnalysis: 'Your mood remained positive throughout the week.',
          taskAnalysis: 'You completed most of your planned tasks.',
          journalInsights: 'Your journal entries show growth and self-reflection.',
          nextWeekGoals: ['Set specific daily goals', 'Maintain your positive momentum']
        };
      }
    } catch (error) {
      console.error('Error generating weekly report:', error);
      return {
        summary: 'You had a productive week with good emotional balance.',
        moodAnalysis: 'Your mood remained positive throughout the week.',
        taskAnalysis: 'You completed most of your planned tasks.',
        journalInsights: 'Your journal entries show growth and self-reflection.',
        nextWeekGoals: ['Set specific daily goals', 'Maintain your positive momentum']
      };
    }
  }

  async generateMentorResponse(
    userMessage: string,
    contextData: {
      latestMood: string;
      tasks: Array<{ title: string; status: string; priority: string }>;
      lastJournalEntry: string;
      streak: number;
    }
  ): Promise<AIMentorResponse> {
    const model = this.getModel();
    if (!model) {
      return {
        response: 'I understand how you\'re feeling. Let\'s work through this together. What would be most helpful for you right now?'
      };
    }

    const prompt = `You are InsideMentor – an emotionally intelligent AI guide for coaching students under pressure. Your role is to provide empathetic, judgment-free, and personalized guidance that blends emotional and academic support.

Current Context:
User Message: "${userMessage}"
Mood Trends: ${contextData.latestMood}
Pending Tasks: ${JSON.stringify(contextData.tasks)}
Journal Themes: "${contextData.lastJournalEntry}"

Your Responsibilities:
- Understand the underlying emotion and immediate concern
- Respond only to what the student seems to need right now
- Suggest small, achievable next steps (emotionally or academically)
- Never pressure. Always empower gently

Return as JSON: {"response": "string"}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response and parse JSON
      const cleanedText = this.cleanAIResponse(text);
      try {
        return JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON parse error, using fallback:', parseError);
        return {
          response: 'I understand how you\'re feeling. Let\'s work through this together. What would be most helpful for you right now?'
        };
      }
    } catch (error) {
      console.error('Error generating mentor response:', error);
      return {
        response: 'I understand how you\'re feeling. Let\'s work through this together. What would be most helpful for you right now?'
      };
    }
  }

  // Method to clear the cache (useful for testing or when cache becomes stale)
  clearCache(): void {
    responseCache.clear();
    console.log('AI response cache cleared');
  }

  // Method to get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: responseCache.size,
      keys: Array.from(responseCache.keys())
    };
  }
}

export const aiService = new AIService(); 