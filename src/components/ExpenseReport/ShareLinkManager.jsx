import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function ShareLinkManager({
    shareLink,
    generateLink,
    generatingLink,
    linkError,
    copyToClipboard,
    copied,
    disabled // Add a general disabled prop
}) {
    return (
        <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>Share Report</Typography>
            {!shareLink && (
                <Button
                    variant="contained"
                    onClick={generateLink}
                    disabled={generatingLink || disabled} // Use combined disabled state
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
    );
}
