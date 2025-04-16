import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Assuming your tsconfig paths are set up

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventName, metadata } = body;

    if (!eventName) {
      return NextResponse.json({ message: 'eventName is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('events') // Your table name
      .insert([
        {
          event_name: eventName,
          metadata: metadata || null, // Ensure metadata is null if not provided
          // Supabase typically handles created_at automatically if column default is now()
        },
      ])
      .select(); // .select() can be useful for confirming the insert

    if (error) {
      console.error('Supabase insert error:', error);
      throw error; // Rethrow to be caught by the outer catch block
    }

    console.log('Event tracked:', data); // Optional: log successful tracking
    return NextResponse.json({ message: 'Event tracked successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Error tracking event:', error);
    return NextResponse.json(
      { 
        message: 'Error tracking event', 
        error: error.message || 'An unknown error occurred' 
      }, 
      { status: 500 }
    );
  }
} 