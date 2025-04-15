'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Accordion, AccordionSummary, AccordionDetails,
  Popover, IconButton, Tooltip, TextField, InputAdornment, Link
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { SBIRSolicitation, SBIRTopic } from '@/types/sbir'; // Updated import path
import NextLink from 'next/link';

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
  
  // Filter items based on search
  const filteredItems = displayItems.filter(item => 
    item.topic_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.solicitation_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.topic_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
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
                bgcolor: 'grey.800',
                '& fieldset': {
                  borderColor: 'grey.700',
                },
                '& input': {
                  color: 'grey.100',
                },
                '&:hover fieldset': {
                  borderColor: 'grey.600',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              }
            }}
          />
        </Box>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            maxHeight: '70vh',
            overflow: 'auto',
            backgroundColor: 'grey.900',
            border: `1px solid grey.800`,
            borderRadius: 1.5,
            '& .MuiTable-root': {
              borderCollapse: 'separate',
              borderSpacing: '0 2px',
            }
          }}
        >
          <Table aria-label="opportunity table" stickyHeader size="small">
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: 'grey.900',
                  '& .MuiTableCell-root': {
                    color: 'grey.400',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    letterSpacing: '0.01em',
                    whiteSpace: 'nowrap',
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'grey.800'
                  }
                }}
              >
                <TableCell>Opportunity</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Status</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Apply</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Discussion</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item: DisplayItem) => (
                <TableRow
                  key={item.displayId}
                  sx={{
                    backgroundColor: 'grey.800',
                    transition: 'background-color 0.2s ease',
                    '&:hover': { 
                      backgroundColor: 'grey.700',
                    },
                    '& .MuiTableCell-root': {
                      padding: '12px 16px',
                      border: 'none',
                      color: 'grey.100'
                    },
                    '& + tr': {
                      marginTop: '2px'
                    }
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" component="div" sx={{ color: 'common.white', fontWeight: 500, mb: 0.5 }}>
                      {(item.isTopic ? item.branch : item.agency) || 'N/A'}:
                      <span style={{ fontWeight: 400 }}> {item.isTopic ? item.topic_title : item.solicitation_title}</span>
                    </Typography>
                    <Typography variant="caption" color="grey.400" component="div">
                      {item.isTopic ? `Topic #: ${item.topic_number?.trim() || 'N/A'}` : `Solicitation #: ${item.solicitation_number || 'N/A'}`}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <FiberManualRecordIcon sx={{ fontSize: 10, color: 'success.light' }} />
                      <Typography variant="body2" sx={{ color: 'grey.300' }}>Active</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'grey.300' }}>{formatDate(item.isTopic ? item.topic_closed_date! : item.close_date!)}</Typography>
                  </TableCell>
                  <TableCell>
                    {item.isTopic ? (
                      <Button
                        variant="contained"
                        size="small"
                        aria-describedby={popoverId}
                        onClick={(e) => handleClickApplyPopover(e, item as SBIRTopic)}
                        sx={{ 
                          textTransform: 'none', 
                          fontSize: '0.75rem', 
                          px: 1.5, 
                          py: 0.5,
                          bgcolor: '#cc0100',
                          color: 'common.white',
                          '&:hover': {
                            bgcolor: '#a30000'
                          }
                        }}
                      >
                        Apply
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        color="secondary"
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
                          py: 0.5,
                          borderColor: 'grey.600',
                          color: 'grey.100',
                          '&:hover': {
                            borderColor: 'grey.400',
                            bgcolor: 'rgba(255, 255, 255, 0.05)'
                          }
                        }}
                      >
                        View
                      </Button>
                    )}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Link
                      component={NextLink}
                      href={`/discuss/${item.isTopic ? item.topic_number : item.solicitation_number}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: 'grey.100',
                        textDecoration: 'none',
                        bgcolor: 'grey.700',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'grey.600',
                          color: 'common.white'
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
                            bgcolor: discussionCounts[item.isTopic ? item.topic_number || '' : item.solicitation_number || ''] > 0 ? '#002e6d' : 'grey.600',
                            color: 'common.white',
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Popover remains the same */}
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
              backgroundColor: 'grey.700',
              border: `1px solid grey.600`,
              borderRadius: 1.5,
              mt: 0.5,
            }
          }}
        >
          <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Copy Topic # and Go to DoD Search">
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
                onClick={handleCopyTopic}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                Copy Topic #
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

        {/* Accordion section remains the same */}
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
                pl: 4, // padding-left
                mt: 1, // margin-top
                mb: 2, // margin-bottom
                '& li': { 
                  color: 'grey.400',
                  mb: 1 // margin between list items
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