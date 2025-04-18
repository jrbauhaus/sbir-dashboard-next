'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Accordion, AccordionSummary, AccordionDetails,
  Popover, IconButton, Tooltip, TextField, InputAdornment, Link, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { SBIRSolicitation, SBIRTopic } from '@/types/sbir'; // Updated import path
import NextLink from 'next/link';
import { trackEvent } from '@/lib/trackEvent'; // Import the tracking function
import { spaceGrotesk, ibmPlexMono } from '@/components/ThemeRegistry/theme'; // Corrected import path

// Helper function for consistent date formatting (moved inside or to a util file)
const formatDate = (dateString: string): string => {
  try {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return 'Invalid Date';
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
  } catch (error) {
    console.warn("Error formatting date:", dateString, error);
    return 'Invalid Date';
  }
};

// Interface to represent a displayable item (either Solicitation or Topic)
interface DisplayItem extends Partial<SBIRSolicitation>, Partial<SBIRTopic> {
  isTopic: boolean;
  displayId: string; // Unique key for rendering
}

// Interface for component props
interface SolicitationTableProps {
  solicitations: SBIRSolicitation[];
}

export const SolicitationTable: React.FC<SolicitationTableProps> = ({ solicitations }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [currentTopic, setCurrentTopic] = useState<SBIRTopic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [discussionCounts, setDiscussionCounts] = useState<Record<string, number>>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  // Process the solicitations prop to create displayItems
  const displayItems: DisplayItem[] = Array.isArray(solicitations)
    ? solicitations.flatMap((sol: SBIRSolicitation): DisplayItem[] => {
      if (sol.solicitation_topics && sol.solicitation_topics.length > 0) {
        return sol.solicitation_topics.map((topic: SBIRTopic): DisplayItem => ({
          ...topic,
          agency: sol.agency,
          current_status: sol.current_status,
          solicitation_agency_url: sol.solicitation_agency_url,
          close_date: sol.close_date,
          solicitation_number: sol.solicitation_number,
          solicitation_title: sol.solicitation_title,
          isTopic: true,
          displayId: `${sol.solicitation_id}-${topic.topic_number}`
        }));
      } else {
        return [{
          ...sol,
          isTopic: false,
          displayId: `${sol.solicitation_id}`
        }];
      }
    })
    : [];
  
  // Get unique branch names for the filter dropdown
  const uniqueBranches = Array.from(new Set(displayItems.map(item => item.branch).filter(Boolean)));

  // Filter items based on search AND selected branch
  const filteredItems = displayItems.filter(item => {
    const searchMatch = 
      item.topic_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.solicitation_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topic_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const branchMatch = !selectedBranch || item.branch === selectedBranch;

    return searchMatch && branchMatch;
  });

  // Fetch all discussion counts at once
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchCounts = async () => {
      try {
        setIsLoadingCounts(true);
        const response = await fetch('/api/discussions', {
          signal: controller.signal
        });
        
        if (!response.ok || !isMounted) return;
        
        const data = await response.json();
        setDiscussionCounts(data.counts);
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.warn('Error fetching discussion counts:', error);
        }
      } finally {
        if (isMounted) {
          setIsLoadingCounts(false);
        }
      }
    };

    fetchCounts();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []); // Only fetch once when component mounts

  const handleClickApplyPopover = (event: React.MouseEvent<HTMLButtonElement>, topic: SBIRTopic) => {
    trackEvent('apply_popover_opened', { topic_number: topic.topic_number }); // Track popover open
    setAnchorEl(event.currentTarget);
    setCurrentTopic(topic);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setCurrentTopic(null);
  };

  const handleCopyTopic = async () => {
    if (typeof window === 'undefined' || !currentTopic?.topic_number) {
      return;
    }
    trackEvent('apply_copy_topic_click', { topic_number: currentTopic.topic_number }); // Track copy click

    try {
      const topicNumber = currentTopic.topic_number.trim();
      await navigator.clipboard.writeText(topicNumber);
      console.log(`Copied topic #: ${topicNumber}`);
      window.open('https://www.dodsbirsttr.mil/topics-app/', '_blank');
    } catch (err) {
      console.error('Failed to copy topic number: ', err);
    } finally {
      handleClosePopover();
    }
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? 'copy-topic-popover' : undefined;

  console.log('[SolicitationTable Client Component] Processed displayItems:', displayItems);

  return (
    <Box sx={{ 
      bgcolor: 'grey.900', 
      minHeight: 'calc(100vh - 120px)',
      pt: { xs: 2, sm: 3 }
    }}>
      <Box sx={{ px: { xs: 2, sm: 2, md: 3 } }}>
        {/* Search and Filter Row */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {/* Search Bar */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'grey.600' }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: 'background.paper',
                borderRadius: 0.5,
                '& fieldset': {
                  borderColor: 'divider',
                },
                '& input': {
                  color: 'text.primary',
                },
                '&:hover fieldset': {
                  borderColor: 'text.secondary',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              }
            }}
          />
          {/* Branch Filter */}
          <FormControl variant="outlined" sx={{ minWidth: 200, bgcolor: 'background.paper', borderRadius: 0.5 }}>
            <InputLabel 
              id="branch-filter-label" 
              sx={{ color: 'grey.400', '&.Mui-focused': { color: 'secondary.main' } }}
            >
              Branch
            </InputLabel>
            <Select
              labelId="branch-filter-label"
              id="branch-filter"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              label="Branch"
              sx={{
                color: 'text.primary',
                borderRadius: 0.5,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'text.secondary' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' },
                '& .MuiSelect-icon': { color: 'text.secondary' },
              }}
            >
              <MenuItem value=""><em>All Branches</em></MenuItem>
              {uniqueBranches.sort().map(branch => (
                <MenuItem key={branch} value={branch}>{branch}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ 
            maxHeight: '70vh',
            overflow: 'auto',
            backgroundColor: 'transparent', // Transparent container background
            border: 'none', // Remove outer border
          }}
        >
          <Table aria-label="opportunity table" stickyHeader size="small" sx={{ borderCollapse: 'collapse' }}>
            <TableHead>
              <TableRow
                sx={{
                  '& .MuiTableCell-root': {
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    fontFamily: ibmPlexMono,
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                    py: 1, // Slightly reduce padding
                    border: '1px solid', // Apply border to all sides
                    borderColor: 'divider', 
                    textAlign: 'left', // Ensure left alignment
                  }
                }}
              >
                <TableCell>Opportunity</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, textAlign: 'center' }}>Status</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Apply</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, textAlign: 'center' }}>Discussion</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item: DisplayItem) => (
                <TableRow
                  key={item.displayId}
                  sx={{
                    backgroundColor: 'transparent', // Make row background transparent
                    transition: 'background-color 0.1s ease', // Faster transition
                    '&:hover': { 
                      backgroundColor: 'action.hover', // Use theme hover
                    },
                    '& .MuiTableCell-root': {
                      padding: '8px 12px', // Adjust padding
                      border: '1px solid', // Apply border to all sides
                      borderColor: 'divider',
                      color: 'text.primary',
                      verticalAlign: 'top', // Align content top
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" component="div" sx={{ color: 'text.primary', fontWeight: 500, mb: 0.5 }}>
                      {(item.isTopic ? item.branch : item.agency) || 'N/A'}:
                      <span style={{ fontWeight: 400 }}> {item.isTopic ? item.topic_title : item.solicitation_title}</span>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="div" sx={{ fontFamily: ibmPlexMono }}>
                      {item.isTopic ? `Topic #: ${item.topic_number?.trim() || 'N/A'}` : `Solicitation #: ${item.solicitation_number || 'N/A'}`}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, textAlign: 'center', verticalAlign: 'middle', padding: 0 }}>
                    {/* Wrapper Box for centering */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      width: '100%', 
                      minHeight: theme => theme.spacing(7)
                    }}>
                      {/* Inner Box for icon + text (keep inline-flex) */}
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                        <FiberManualRecordIcon sx={{ fontSize: 10, color: 'secondary.main' }} /> 
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: ibmPlexMono }}>Active</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle', padding: 0 }}>
                    {/* Wrapper Box for centering */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      width: '100%', 
                      minHeight: theme => theme.spacing(7)
                    }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: ibmPlexMono }}>{formatDate(item.isTopic ? item.topic_closed_date! : item.close_date!)}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle', padding: 0 }}>
                    {/* Wrapper Box for centering */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      width: '100%', 
                      minHeight: theme => theme.spacing(7) // Set minHeight 
                    }}>
                      {item.isTopic ? (
                        <Button
                          variant="outlined"
                          size="small"
                          aria-describedby={popoverId}
                          onClick={(e) => handleClickApplyPopover(e, item as SBIRTopic)}
                          sx={{ 
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            px: 1.5, 
                            borderColor: '#EF5350', // Lighter Red border
                            color: '#EF5350', // Lighter Red text
                            borderRadius: 0.5,
                            '&:hover': {
                              borderColor: '#E53935', // Slightly darker Lighter Red border
                              color: '#E53935', // Slightly darker Lighter Red text
                              bgcolor: 'action.hover' 
                            }
                          }}
                        >
                          Apply
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          component="a"
                          href={item.solicitation_agency_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<OpenInNewIcon sx={{ fontSize: 14 }}/>}
                          disabled={!item.solicitation_agency_url}
                          sx={{ 
                            textTransform: 'none', 
                            fontSize: '0.75rem', 
                            px: 1.5,
                            borderColor: 'text.secondary',
                            color: 'text.secondary',
                            borderRadius: 0.5,
                            '&:hover': {
                              borderColor: 'text.primary',
                              color: 'text.primary',
                              bgcolor: 'action.hover'
                            }
                          }}
                        >
                          Access File
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, textAlign: 'center', verticalAlign: 'middle', padding: 0 }}>
                    {/* Wrapper Box for centering */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      width: '100%', 
                      minHeight: theme => theme.spacing(7) // Set minHeight
                    }}>
                      <Link
                        component={NextLink}
                        href={`/discuss/${item.isTopic ? item.topic_number : item.solicitation_number}`}
                        onClick={() => trackEvent('discussion_link_click', { 
                          id: item.isTopic ? item.topic_number : item.solicitation_number, 
                          type: item.isTopic ? 'topic' : 'solicitation' 
                        })}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          maxWidth: 'fit-content',
                          gap: 0.5,
                          border: '1px solid',
                          borderColor: '#60A5FA', // Lighter Blue border (Theme Accent)
                          color: '#60A5FA', // Lighter Blue text/icon
                          textDecoration: 'none',
                          bgcolor: 'transparent', // Keep background transparent
                          px: 1.5,
                          borderRadius: 0.5,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: '#42A5F5', // Slightly darker Lighter Blue border
                            color: '#42A5F5', // Slightly darker Lighter Blue text
                            bgcolor: 'action.hover'
                          },
                          '& .MuiBox-root > .MuiBox-root': { 
                             bgcolor: 'primary.main', 
                             color: 'primary.contrastText' 
                          }
                        }}
                      >
                        <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2" component="span" sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}>
                          Discussion
                          <Box
                            component="span"
                            sx={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '20px',
                              height: '20px',
                              borderRadius: '10px',
                              fontSize: '0.75rem',
                              fontWeight: 'medium',
                              px: 0.75,
                              opacity: isLoadingCounts ? 0.7 : 1,
                              transition: 'opacity 0.2s ease'
                            }}
                          >
                            {discussionCounts[item.isTopic ? item.topic_number || '' : item.solicitation_number || ''] || '0'}
                          </Box>
                        </Typography>
                      </Link>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Popover
          id={popoverId}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClosePopover}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{
            elevation: 4,
            sx: {
              backgroundColor: 'background.paper',
              border: `1px solid divider`,
              borderRadius: 0.5,
              mt: 0.5,
            }
          }}
        >
          <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Copy Topic ID and Go to DoD Search">
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
                onClick={handleCopyTopic}
                sx={{ 
                  borderColor: 'text.secondary',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: 'text.primary',
                    color: 'text.primary',
                    bgcolor: 'action.hover'
                  },
                  textTransform: 'none', 
                  fontSize: '0.75rem' 
                }}
              >
                Copy Topic ID
              </Button>
            </Tooltip>
            {currentTopic?.sbir_topic_link && (
              <Tooltip title="View Original Topic">
                <IconButton component="a" size="small" href={currentTopic.sbir_topic_link} target="_blank" rel="noopener noreferrer" sx={{ color: 'grey.400', '&:hover': { color: 'common.white' } }}>
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Popover>

        <Box sx={{ mt: 6, pb: { xs: 2, sm: 4, md: 5 } }}>
          <Accordion
            disableGutters
            elevation={0}
            sx={{
              backgroundColor: 'transparent',
              borderTop: `1px solid grey.800`,
              '&:before': { display: 'none' }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'grey.500'}} />}
              sx={{ '& .MuiAccordionSummary-content': { margin: 0 }, padding: '0', minHeight: 'auto' }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'grey.400', py: 1.5 }}>
                Agency Account/Submission Requirements (Coming Soon...)
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{
              color: 'grey.400',
              backgroundColor:'transparent',
              padding: '8px 0 16px 0',
              textAlign: 'left',
              fontSize: '0.85rem',
              '& ul': { paddingLeft: '1.5em', margin: 0, listStylePosition: 'outside' },
              '& li': { textAlign: 'left', marginBottom: '0.25em' },
              '& a': { color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: 'primary.light' } }
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'common.white', textAlign: 'left', fontSize: '1rem', mb: 1.5 }}>
                DOD SBIR/STTR Requirements:
              </Typography>
              <Typography paragraph sx={{ textAlign: 'left' }}>
                1. DSIP Account: Create an account on the Defense SBIR/STTR Innovation Portal (DSIP)
              </Typography>
              <Typography paragraph sx={{ textAlign: 'left' }}>
                2. SAM Registration: Active registration in the System for Award Management (SAM)
              </Typography>
              <Typography paragraph sx={{ textAlign: 'left' }}>
                3. DUNS/UEI Number: Valid Unique Entity ID from SAM.gov
              </Typography>
              <Typography paragraph sx={{ textAlign: 'left' }}>
                4. Company Requirements:
              </Typography>
              <Box component="ul" sx={{ 
                pl: 4,
                mt: 1,
                mb: 2,
                '& li': { 
                  color: 'grey.400',
                  mb: 1
                }
              }}>
                <li>Must be a small business (500 or fewer employees)</li>
                <li>Must be U.S.-owned and operated</li>
                <li>Principal Investigator must be primarily employed by the company</li>
              </Box>
              <Typography sx={{ textAlign: 'left' }}>
                For more details, visit: <a href="https://www.dodsbirsttr.mil/submissions/" target="_blank" rel="noopener noreferrer">DOD SBIR/STTR Website</a>
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Box>
  );
}; 