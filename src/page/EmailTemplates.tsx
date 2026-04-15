import React, { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Button as MuiButton,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  Tabs,
  Tab,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Mail,
  Wand2,
  Eye,
  X,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Quote,
  Code,
  Baseline,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useGetEmailTemplatesQuery, useGetEmailPreviewQuery, useBulkSendEmailMutation } from '../store/api/emailApi';
import { useGetUsersQuery } from '../store/api/userApi';
import { toast } from 'react-toastify';

const EmailTemplates: React.FC = () => {
  const { 
    data: emailResponse, 
    isLoading 
  } = useGetEmailTemplatesQuery(undefined, {
    refetchOnMountOrArgChange: true
  });
  
  const { data: usersResponse } = useGetUsersQuery({ page: 0, size: 200 });
  
  const emailTemplates = emailResponse?.data || [];
  const fetchedUsers = usersResponse?.data?.content || [];

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<any>(null);

  // Send Modal States
  const [recipientMode, setRecipientMode] = useState<'all' | 'selective'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'visual' | 'html' | 'preview'>('visual');
  const [emailBody, setEmailBody] = useState('Welcome to our platform! We are excited to have you on board.');
  const [subjectLine, setSubjectLine] = useState('Welcome to Prepnx Platform');

  const [bulkSendEmail, { isLoading: isSending }] = useBulkSendEmailMutation();
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  const { data: previewResponse, isFetching: isPreviewLoading } = useGetEmailPreviewQuery(
    previewTemplateId || '',
    { skip: !showPreviewModal || !previewTemplateId }
  );



  const callAI = async (prompt: string) => {
    try {
      const response = await fetch('https://api.a0.dev/ai/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      return data.completion;
    } catch (e) {
      console.error('AI call failed:', e);
      return null;
    }
  };

  const extractSubjectAndBody = (text: string) => {
    const subjectMatch = text.match(/Subject:\s*(.*)/i);
    const bodyMatch = text.replace(/Subject:\s*.*\n*/i, '').trim();
    return {
      subject: subjectMatch ? subjectMatch[1] : '',
      body: bodyMatch
    };
  };

  const handleGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    const result = await callAI(`Generate a professional email for this request: ${aiPrompt}. Please include a subject line starting with "Subject:".`);
    setIsGenerating(false);
    if (result) {
      const { subject, body } = extractSubjectAndBody(result);
      if (subject) setSubjectLine(subject);
      setEmailBody(body);
      setAiPrompt('');
      setShowSendModal(true);
      toast.success('AI Email generated');
    } else {
      toast.error('AI Generation failed');
    }
  };



  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 80px)' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ color: '#2463EB' }}>
              <Mail size={24} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2937', fontFamily: 'Outfit' }}>
              Communication Settings
            </Typography>
          </Box>
          <Typography variant="overline" sx={{ color: '#64748B', fontWeight: 600, letterSpacing: '0.1em', ml: { xs: 0, md: 5 }, fontFamily: 'Outfit' }}>
            EMAIL TEMPLATES & BRANDING
          </Typography>
        </Box>
      </Box>

      {/* Page Title Box */}
      <Box sx={{ mb: 4, bgcolor: "white", p: 2, borderRadius: '10px', width: 'fit-content', border: '1px solid #E2E8F0' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mb: 0.5, fontFamily: 'Outfit', fontSize: '20px' }}>
          Email Templates
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '14px', fontFamily: 'Outfit' }}>
          Customize the system emails sent to users.
        </Typography>
      </Box>

      {/* SECTION 1: AI EMAIL ASSISTANT */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
          borderRadius: '16px',
          p: { xs: 3, sm: 4 },
          mb: 4,
          border: '1px solid #E0E7FF',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'absolute', right: -20, top: -20, color: '#E0E7FF', opacity: 0.5 }}>
          <Wand2 size={120} />
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ color: '#4F46E5' }}>
              <Wand2 size={20} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1F2937', fontFamily: 'Outfit' }}>
              AI Email Assistant
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#4B5563', mb: 3, maxWidth: '600px', fontFamily: 'Outfit' }}>
            Describe the email you want to send, and our AI will generate professional content for you.
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
            <Box sx={{ flexGrow: 1 }}>
              <Input
                placeholder="e.g., Happy Diwali invitation with a special discount code"
                fullWidth
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#fff' } }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={isGenerating || !aiPrompt}
              sx={{
                px: 3,
                backgroundColor: '#111827',
                borderRadius: '10px',
                fontWeight: 700,
                minWidth: '120px',
                mb: "20px",
                '&:hover': { backgroundColor: '#1F2937' }
              }}
            >
              <Wand2 size={20} />   Generate

            </Button>
          </Box>

          {isGenerating && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#4F46E5', fontWeight: 700 }}>AI is thinking...</Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>65% Complete</Typography>
              </Box>
              <LinearProgress
                variant="indeterminate"
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#E0E7FF',
                  '& .MuiLinearProgress-bar': { backgroundColor: '#4F46E5' }
                }}
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* SECTION 2: SYSTEM TEMPLATES TABLE */}
      <Box sx={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', p: { xs: 3, sm: 4 }, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, fontFamily: 'Outfit' }}>
            System Templates
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '14px', fontFamily: 'Outfit' }}>
            Manage standard email notifications.
          </Typography>
        </Box>

        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <TableContainer sx={{ border: '1px solid #F1F5F9', borderRadius: '12px', overflow: 'hidden', minWidth: '800px' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                <TableRow>
                  {['TEMPLATE NAME', 'SUBJECT LINE', 'STATUS', 'LAST MODIFIED', 'ACTIONS'].map((head) => (
                    <TableCell key={head} sx={{ py: 2, fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 10, textAlign: 'center' }}>
                      <LinearProgress sx={{ maxWidth: 300, mx: 'auto', borderRadius: 4 }} />
                    </TableCell>
                  </TableRow>
                ) : emailTemplates.map((template) => (
                  <TableRow key={template.id} sx={{ '&:hover': { backgroundColor: '#F9FAFB' } }}>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: '8px', backgroundColor: '#F1F5F9', color: '#64748B' }}>
                          <Mail size={16} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937' }}>{template.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>{template.subject}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={template.status}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          borderRadius: '6px', 
                          fontWeight: 700, 
                          fontSize: '10px', 
                          height: '22px', 
                          borderColor: template.status === 'ACTIVE' ? '#10B981' : '#E2E8F0', 
                          color: template.status === 'ACTIVE' ? '#10B981' : '#64748B' 
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>
                        {new Date(template.lastModified).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton title="Preview" size="small" onClick={() => { 
                          setActiveTemplate(template); 
                          setPreviewTemplateId(template.id);
                          setShowPreviewModal(true); 
                        }}>
                          <Eye size={18} color="#64748B" />
                        </IconButton>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => { 
                            setActiveTemplate(template); 
                            setEmailBody(template.body); 
                            setSubjectLine(template.subject);
                            setShowSendModal(true); 
                          }}
                          sx={{
                            backgroundColor: '#111827',
                            color: '#fff',
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: '8px',
                            fontSize: { xs: '10px', sm: '12px' },
                            px: 2,
                            py: 0.5,
                            '&:hover': { backgroundColor: '#1F2937' }
                          }}
                        >
                          Send Email
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* SEND EMAIL MODAL */}
      <Dialog
        open={showSendModal}
        onClose={() => setShowSendModal(false)}
        maxWidth={false}
        PaperProps={{ sx: { width: '600px', borderRadius: '16px', overflow: 'hidden' } }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Outfit' }}>
              Send Template: {activeTemplate?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Finalize and send this email notification.
            </Typography>
          </Box>
          <IconButton onClick={() => setShowSendModal(false)} size="small">
            <X size={20} />
          </IconButton>
        </Box>

        <Box sx={{ p: 3, maxHeight: '80vh', overflowY: 'auto' }}>
          {/* RECIPIENTS SECTION */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '14px', mb: 1.5, color: '#1F2937' }}>Recipients</Typography>
            <ToggleButtonGroup
              value={recipientMode}
              exclusive
              onChange={(_, val) => val && setRecipientMode(val)}
              sx={{ 
                mb: 2, 
                display: 'flex', 
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                p: 0.5,
                backgroundColor: '#fff',
                '& .MuiToggleButton-root': { 
                  flex: 1, 
                  textTransform: 'none', 
                  fontWeight: 700, 
                  py: 1,
                  borderRadius: '8px !important',
                  border: 'none',
                  color: '#64748B',
                  '&.Mui-selected': { 
                    backgroundColor: '#2463EB', 
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#1D4ED8'
                    }
                  }
                } 
              }}
            >
              <ToggleButton value="all">All Users</ToggleButton>
              <ToggleButton value="selective">Selective Users</ToggleButton>
            </ToggleButtonGroup>

            {recipientMode === 'selective' && (
              <Select
                multiple
                fullWidth
                value={selectedUsers}
                onChange={(e) => setSelectedUsers(typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]))}
                displayEmpty
                renderValue={(selected) => {
                  if (selected.length === 0) return <Typography sx={{ color: '#9CA3AF', fontSize: '14px' }}>Select Users</Typography>;
                  return selected.join(', ');
                }}
                sx={{ borderRadius: '10px' }}
              >
                {fetchedUsers.length === 0 ? (
                  <MenuItem disabled>No users found</MenuItem>
                ) : (
                  fetchedUsers.map((user: any) => (
                    <MenuItem key={user.id} value={user.name}>{user.name}</MenuItem>
                  ))
                )}
              </Select>
            )}
          </Box>

          {/* SUBJECT LINE */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '14px', mb: 1, color: '#1F2937' }}>Subject Line</Typography>
            <Input
              fullWidth
              value={subjectLine}
              onChange={(e) => setSubjectLine(e.target.value)}
              sx={{ mb: 0 }}
            />
          </Box>

          {/* EMAIL BODY TABS */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, borderBottom: '1px solid #F1F5F9' }}>
              <Tabs
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
                sx={{
                  '& .MuiTabs-indicator': { height: 3, backgroundColor: '#2463EB' },
                  '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '14px', minWidth: 'auto', px: 2, py: 1, color: '#64748B', '&.Mui-selected': { color: '#2463EB' } }
                }}
              >
                <Tab label="Visual Editor" value="visual" />
                <Tab label="HTML Source" value="html" />
                <Tab label="Preview" value="preview" />
              </Tabs>

            </Box>



            {activeTab === 'visual' && (
              <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                <Box sx={{ p: 1.5, borderBottom: '1px solid #F1F5F9', backgroundColor: '#F9FAFB', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', px: 1, borderRight: '1px solid #E2E8F0', mr: 1 }}>
                    <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 700, fontSize: '13px' }}>Normal</Typography>
                    <IconButton size="small" sx={{ ml: 0.5, p: 0.5 }}><Baseline size={14} /></IconButton>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 0.5, borderRight: '1px solid #E2E8F0', pr: 1, mr: 1 }}>
                    <IconButton size="small" sx={{ p: 0.8 }}><Bold size={18} /></IconButton>
                    <IconButton size="small" sx={{ p: 0.8 }}><Italic size={18} /></IconButton>
                    <IconButton size="small" sx={{ p: 0.8 }}><Underline size={18} /></IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5, borderRight: '1px solid #E2E8F0', pr: 1, mr: 1 }}>
                    <IconButton size="small" sx={{ p: 0.8 }}><List size={18} /></IconButton>
                    <IconButton size="small" sx={{ p: 0.8 }}><ListOrdered size={18} /></IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5, borderRight: '1px solid #E2E8F0', pr: 1, mr: 1 }}>
                    <IconButton size="small" sx={{ p: 0.8 }}><AlignLeft size={18} /></IconButton>
                    <IconButton size="small" sx={{ p: 0.8 }}><AlignCenter size={18} /></IconButton>
                    <IconButton size="small" sx={{ p: 0.8 }}><AlignRight size={18} /></IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" sx={{ p: 0.8 }}><LinkIcon size={18} /></IconButton>
                    <IconButton size="small" sx={{ p: 0.8 }}><Quote size={18} /></IconButton>
                    <IconButton size="small" sx={{ p: 0.8 }}><Code size={18} /></IconButton>
                  </Box>
                </Box>
                <TextField
                  id="email-content-textarea"
                  aria-label="Email Content"
                  multiline
                  rows={10}
                  fullWidth
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      p: 2,
                      fontFamily: 'Outfit',
                      fontSize: '14px',
                      lineHeight: 1.6,
                    }
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      alignItems: 'flex-start'
                    }
                  }}
                />
              </Box>
            )}

            {activeTab === 'html' && (
              <Box
                sx={{
                  backgroundColor: '#1E1E2E',
                  borderRadius: '12px',
                  p: 2,
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  color: '#CDD6F4',
                  height: '250px',
                  overflowY: 'auto'
                }}
              >
                {`<html>\n  <body>\n    <p>${emailBody}</p>\n  </body>\n</html>`}
              </Box>
            )}

            {activeTab === 'preview' && (
              <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                <Box sx={{ backgroundColor: '#4F46E5', p: 3, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800 }}>Prepnx Platform</Typography>
                </Box>
                <Box sx={{ p: 4, backgroundColor: '#fff', minHeight: '200px' }}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ width: 32, height: 32, backgroundColor: '#F1F5F9', borderRadius: '4px' }} />
                  </Box>
                  <Box
                    dangerouslySetInnerHTML={{ __html: emailBody.replace(/\n/g, '<br/>') }}
                    sx={{ fontFamily: 'Outfit', fontSize: '15px', color: '#374151' }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        <Divider />
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <MuiButton 
            onClick={() => setShowSendModal(false)} 
            sx={{ textTransform: 'none', color: '#64748B', fontWeight: 700, fontSize: '15px' }}
          >
            Cancel
          </MuiButton>
          


          <Button
            variant="contained"
            disabled={isSending || (recipientMode === 'selective' && selectedUsers.length === 0)}
            onClick={async () => {
              try {
                await bulkSendEmail({ templateId: activeTemplate?.id }).unwrap();
                setShowSendModal(false);
                toast.success('Bulk email sending initiated');
              } catch (e) {
                console.error('Bulk send failed:', e);
                toast.error('Failed to initiate bulk email sending');
              }
            }}
            sx={{
              px: 4, 
              py: 1.5,
              backgroundColor: '#2463EB', 
              borderRadius: '10px', 
              fontWeight: 800, 
              fontSize: '15px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#1D4ED8'
              }
            }}
          >
            {isSending ? 'Sending...' : (recipientMode === 'all' ? 'Send to All Users' : `Send to ${selectedUsers.length} Users`)}
          </Button>
        </Box>
      </Dialog>

      {/* VIEW PREVIEW MODAL */}
      <Dialog
        open={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        maxWidth={false}
        PaperProps={{ sx: { width: '560px', borderRadius: '16px', overflow: 'hidden' } }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Outfit' }}>
              Preview: {activeTemplate?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              This is how the email will look to recipients.
            </Typography>
          </Box>
          <IconButton onClick={() => setShowPreviewModal(false)} size="small">
            <X size={20} />
          </IconButton>
        </Box>

        <Box sx={{ p: 4, backgroundColor: '#F9FAFB' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937' }}>
            Subject: <Box component="span" sx={{ fontWeight: 500, color: '#64748B' }}>{activeTemplate?.subject}</Box>
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937' }}>
            From: <Box component="span" sx={{ fontWeight: 500, color: '#64748B' }}>TeamsHub &lt;notifications@teamshub.com&gt;</Box>
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fff', minHeight: '300px', position: 'relative' }}>
            {isPreviewLoading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <LinearProgress sx={{ maxWidth: 200, mx: 'auto' }} />
              </Box>
            ) : (
              <Box sx={{ p: 0, maxHeight: '450px', overflowY: 'auto' }}>
                <div dangerouslySetInnerHTML={{ __html: previewResponse?.data || '<p>No preview available</p>' }} />
              </Box>
            )}
          </Box>
        </Box>

        <Divider />
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <MuiButton onClick={() => setShowPreviewModal(false)} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}>Close</MuiButton>
          <MuiButton
            variant="contained"
            onClick={() => {
              if (activeTemplate) {
                setEmailBody(activeTemplate.body);
                setSubjectLine(activeTemplate.subject);
              }
              setShowPreviewModal(false);
              setShowSendModal(true);
            }}
            sx={{
              px: 3, backgroundColor: '#2463EB', borderRadius: '10px', fontWeight: 700, textTransform: 'none', fontSize: { xs: '10px', sm: '12px' },
            }}
          >
            Edit Template
          </MuiButton>
        </Box>
      </Dialog>
    </Box >
  );
};

export default EmailTemplates;
