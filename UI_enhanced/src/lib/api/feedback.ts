export interface Feedback {
  name: string;
  type: 'feature_request' | 'bug_report' | 'improvement' | 'other';
  content: string;
  timestamp: string;
}

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_KJF_96v5p0sML6y3wcKJqmGbTUJ2h4LSVZldnRDNn608mhvAumBy_3UGF6xZgURK/exec';

export async function fetchFeedbacks(): Promise<Feedback[]> {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    if (!response.ok) throw new Error('Failed to fetch feedbacks');
    return await response.json();
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return [];
  }
}

export async function submitFeedback(feedback: Omit<Feedback, 'timestamp'>): Promise<boolean> {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        ...feedback,
        name: feedback.name || 'Ẩn danh',
        timestamp: new Date().toLocaleString('vi-VN'),
      }),
    });
    return true; 
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return false;
  }
}
