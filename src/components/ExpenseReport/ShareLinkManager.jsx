import React, { useState } from 'react'; // Import useState
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
// Import Collapse and icons
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function ShareLinkManager({
    shareLink,
    generateLink,
    generatingLink,
    linkError,
    copyToClipboard,
    copied,
    disabled
}) {
    // State for expansion, default to collapsed
    const [isExpanded, setIsExpanded] = useState(false);

    // Handler to toggle expansion
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            {/* Header section, clickable to toggle */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={toggleExpand}>
                <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>Share Report</Typography>
                <IconButton onClick={(e) => { e.stopPropagation(); toggleExpand(); }} size="small">
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>

            {/* Collapsible content */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                {/* Existing content goes inside Collapse */}
                <Box sx={{ pt: 2 }}> {/* Add padding top to separate from header */}
                    {!shareLink && (
                        <Button
                            variant="contained"
                            onClick={generateLink}
                            disabled={generatingLink || disabled}
                            startIcon={generatingLink ? <CircularProgress size={20} /> : null}
                        >
                            {generatingLink ? 'Generating...' : 'Generate Share Link'}
                        </Button>
                    )}
                    {linkError && <Alert severity="error" sx={{ mt: 1 }}>{linkError}</Alert>}
                    {shareLink && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, flexWrap: 'wrap' }}>
                            <Link href={shareLink} target="_blank" rel="noopener noreferrer" sx={{ mr: 1, wordBreak: 'break-all' }}>
                                {shareLink}
                            </Link>
                            <Tooltip title={copied ? "Copied!" : "Copy link"} placement="top">
                                <IconButton onClick={copyToClipboard} size="small" color={copied ? "success" : "primary"}>
                                    <ContentCopyIcon fontSize="inherit" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                        Generate a unique link to share your expense report for review and reimbursement processing. Anyone with the link can view expenses and mark them as reimbursed or denied.
                    </Typography>
                </Box>
            </Collapse>
        </Box>
    );
}
