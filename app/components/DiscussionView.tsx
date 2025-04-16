'use client';

import React, { useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { GiscusComments } from '@/app/components/GiscusComments';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { SBIRSolicitation } from '@/types/sbir';
import { trackEvent } from '@/lib/trackEvent';

interface DiscussionViewProps {
  id: string;
  solicitation: SBIRSolicitation | null;
}

export function DiscussionView({ id, solicitation }: DiscussionViewProps) {
  // Find the matching topic if this is a topic ID
  const topic = solicitation?.solicitation_topics?.find(t => t.topic_number === id);

  useEffect(() => {
    // Determine the correct title for tracking
    const trackTitle = topic?.topic_title || solicitation?.solicitation_title || 'Unknown Title';
    trackEvent('discussion_view', { id: id, title: trackTitle });
  }, [id, solicitation, topic]); // Add topic to dependency array

  // Determine display title and subtitle
  const displayTitle = topic?.topic_title || solicitation?.solicitation_title || 'Discussion';
  const displaySubtitle = topic ? 
    `Topic ${topic.topic_number} (Solicitation: ${solicitation?.solicitation_number})` : 
    `Solicitation ${solicitation?.solicitation_number}`;

  return (
    <Box sx={{ 
      bgcolor: 'grey.900',
      minHeight: '100vh',
      py: { xs: 2, sm: 3 },
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      <Button
        component={Link}
        href="/"
        startIcon={<ArrowBackIcon />}
        sx={{
          color: 'grey.300',
          mb: 2,
          '&:hover': {
            color: 'common.white',
          }
        }}
      >
        Return to Dashboard
      </Button>

      <Paper
        elevation={0}
        sx={{
          bgcolor: 'grey.800',
          p: { xs: 2, sm: 3 },
          mb: 3,
          border: '1px solid',
          borderColor: 'grey.700',
          borderRadius: 1.5
        }}
      >
        <Typography variant="h5" component="h1" sx={{ color: 'common.white', mb: 1 }}>
          {displayTitle || 'Loading...'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'grey.400' }}>
          {displaySubtitle}
        </Typography>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          bgcolor: 'grey.800',
          p: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'grey.700',
          borderRadius: 1.5
        }}
      >
        <GiscusComments />
      </Paper>
    </Box>
  );
} 