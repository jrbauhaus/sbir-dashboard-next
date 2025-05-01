"use client";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function WaitlistForm() {
  const supabase = createClientComponentClient(); // Use the client helper
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"sent"|"error">("idle"); // Add loading state

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading"); // Set loading state
    try {
        const { error } = await supabase
          .from("waitlist") // Target the waitlist table
          .insert({ email }) // Insert the email
          .select(); // Select to check for RLS errors explicitly
        
        if (error) {
          console.error("Waitlist insert error:", error);
          // Check for unique constraint violation (code 23505)
          if (error.code === '23505') {
              setStatus("error"); // Specific error for duplicate
          } else {
              setStatus("idle"); // Generic error, allow retry
              alert(`Error submitting waitlist: ${error.message}`); // Provide feedback
          }
        } else {
          setStatus("sent"); // Success
        }
    } catch (err) {
        console.error("Unexpected error submitting waitlist:", err);
        setStatus("idle");
        alert('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="mb-6 p-4 bg-blue-800 text-white rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Team Builder Early Access</h3>
      {status === "sent" ? (
        <p>✅ You're on the list! We'll email you when it's live.</p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={status === 'loading'}
            className="flex-1 p-2 rounded text-black disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2 bg-white text-blue-800 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="mt-2 text-red-300">⚠️ Looks like that email is already on the waitlist!</p>
      )}
    </div>
  );
} 