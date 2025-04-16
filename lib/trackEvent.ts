export async function trackEvent(eventName: string, metadata?: any): Promise<void> {
  try {
    const response = await fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventName, metadata }),
    });

    if (!response.ok) {
      // Log error details if available
      const errorData = await response.json().catch(() => ({})); // Avoid crashing if body isn't JSON
      console.error('Failed to track event:', response.status, response.statusText, errorData);
    } else {
      // Optional: Log successful tracking on the client-side for debugging
      // console.log(`Event '${eventName}' tracked successfully.`);
    }
  } catch (error) {
    console.error('Error sending tracking event:', error);
  }
} 