'use client';

import React, { useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { GiscusComments } from '@/app/components/GiscusComments';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NextLink from 'next/link';
import { SBIRTopic } from '@/types/sbir';
import { trackEvent } from '@/lib/trackEvent';

interface DiscussionViewProps {
  id: string;
  topic: SBIRTopic | null;
}

export function DiscussionView({ id, topic }: DiscussionViewProps) {
  useEffect(() => {
    const trackTitle = topic?.topic_title || 'Unknown Title';
    trackEvent('discussion_view', { id: id, title: trackTitle });
  }, [id, topic]);

  const displayTitle = topic?.topic_title || 'Discussion';
  const displaySubtitle = topic ? 
    `Topic ${topic.topic_number} (Solicitation: ${topic.solicitation_number || 'N/A'})` : 
    `Topic ID: ${id}`;

  return (
    <Box sx={{ 
      bgcolor: 'background.default',
      minHeight: '100vh',
      py: { xs: 2, sm: 3 },
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      <Button
        component={NextLink}
        href="/"
        startIcon={<ArrowBackIcon />}
        sx={{
          color: 'text.secondary',
          mb: 2,
          textTransform: 'none',
          '&:hover': {
            color: 'text.primary',
            bgcolor: 'action.hover'
          }
        }}
      >
        Return to Dashboard
      </Button>

      <Paper
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          p: { xs: 2, sm: 3 },
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 0.5
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
          bgcolor: 'background.paper',
          p: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 0.5
        }}
      >
        <GiscusComments />
      </Paper>
    </Box>
  );
} 