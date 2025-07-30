import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with 2.5 Pro model
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
console.log('Gemini API Key available:', !!apiKey);
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface AIGreetingResponse {
  greeting: string;
  progressInsight: string;
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

// Cache for AI responses to reduce API calls
const responseCache = new Map<string, { data: any; timestamp: number }>();
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

  private getCacheKey(method: string, data: any, userId?: string): string {
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

  private setCachedResponse(cacheKey: string, data: any): void {
    responseCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  private async retryAIRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 2
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Apply rate limiting
        await this.rateLimit();
        
        return await requestFn();
      } catch (error: any) {
        lastError = error;
        
        // Check if it's a rate limit or overload error
        if (error.message?.includes('overloaded') || error.message?.includes('rate limit')) {
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
            console.log(`AI request failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        throw error;
      }
    }
    
    throw lastError;
  }

  async generateDashboardGreeting(
    userName: string,
    recentTasks: any[],
    recentMoodLogs: any[],
    userId: string
  ): Promise<AIGreetingResponse> {
    const model = this.getModel();
    if (!model) {
      return {
        greeting: `Good morning, ${userName}! Ready to make today productive?`,
        progressInsight: 'Keep up the great work on your tasks!'
      };
    }

    // Create cache key based on user and recent data
    const cacheKey = this.getCacheKey('greeting', {
      userName,
      taskCount: recentTasks.length,
      moodCount: recentMoodLogs.length,
      lastTask: recentTasks[0]?.title || '',
      lastMood: recentMoodLogs[0]?.mood || ''
    }, userId);

    // Check cache first
    const cached = this.getCachedResponse<AIGreetingResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const prompt = `You are InsideMentor, creating a personalized greeting for a student's dashboard.

Student name: ${userName}
Recent tasks: ${JSON.stringify(recentTasks)}
Recent mood logs: ${JSON.stringify(recentMoodLogs)}

Create a personalized greeting and progress insight. Return as JSON:
{"greeting": "personalized greeting message", "progressInsight": "brief insight about their progress"}`;

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
          progressInsight: 'Keep up the great work on your tasks!'
        };
        this.setCachedResponse(cacheKey, fallback);
        return fallback;
      }
    } catch (error) {
      console.error('Error generating greeting:', error);
      const fallback = {
        greeting: `Good morning, ${userName}! Ready to make today productive?`,
        progressInsight: 'Keep up the great work on your tasks!'
      };
      this.setCachedResponse(cacheKey, fallback);
      return fallback;
    }
  }

  async generateMoodInsight(
    moodLogs: any[],
    currentMood: string,
    userId: string
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
    }, userId);

    // Check cache first
    const cached = this.getCachedResponse<AIMoodInsightResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const prompt = `You are InsideMentor, analyzing a student's mood patterns. 

User's last 7 mood entries: ${JSON.stringify(moodLogs)}
Current mood logged: ${currentMood}

Provide a short, empathetic observation (2-3 sentences) about:
- Any patterns you notice
- Changes in mood over time
- Suggestions for improvement if needed

Return as JSON: {"observation": "string"}`;

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
    taskList: any[],
    moodLogs: any[],
    userId: string
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

  async breakDownTask(taskTitle: string, userId: string): Promise<AITaskBreakdownResponse> {
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
    pastEntries: string[],
    userId: string
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

  async generateMentorResponse(
    userMessage: string,
    contextData: {
      latestMood: string;
      tasks: any[];
      lastJournalEntry: string;
      streak: number;
    },
    userId: string
  ): Promise<AIMentorResponse> {
    const model = this.getModel();
    if (!model) {
      return {
        response: 'I understand how you\'re feeling. Let\'s work through this together. What would be most helpful for you right now?'
      };
    }

    const prompt = `You are InsideMentor, an empathetic AI mentor for academic wellness. 

Context about the student:
- Latest mood: ${contextData.latestMood}
- Recent tasks: ${JSON.stringify(contextData.tasks)}
- Last journal entry: "${contextData.lastJournalEntry}"
- Current streak: ${contextData.streak} days

Student's message: "${userMessage}"

Respond as InsideMentor (2-3 sentences):
- Be empathetic and supportive
- Reference their context when relevant
- Offer practical advice or encouragement
- Maintain an academic wellness focus

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