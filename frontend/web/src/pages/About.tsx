import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, Chip, Divider, Button, Link,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <Card sx={{ mb: 3 }}>
        <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
                {icon} {title}
            </Typography>
            {children}
        </CardContent>
    </Card>
);

export const About: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ animation: 'fadeInUp 0.4s ease' }}>
            <Button onClick={() => navigate('/')} sx={{ mb: 2 }}>← Back to Dashboard</Button>

            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                    💡 ClarityPro
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Make decisions with confidence
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Version 1.0 &bull; Open Source &bull; Free to Use
                </Typography>
            </Box>

            {/* What Is ClarityPro */}
            <Section title="What Is ClarityPro?" icon="🧠">
                <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>ClarityPro</strong> is a modern web application
                    that helps users make better life decisions through structured self-auditing. Every day, people
                    make decisions they later regret — acting impulsively, skipping research, rushing timing, or
                    deciding while emotional.
                </Typography>
                <Typography variant="body1">
                    ClarityPro provides a <strong>structured, non-judgmental framework</strong> that guides users through
                    four critical decision pillars, scores decisions objectively, tracks history to reveal patterns,
                    and generates actionable insights for continuous improvement.
                </Typography>
            </Section>

            {/* The 4-Pillar Scoring System */}
            <Section title="The 4-Pillar Scoring System" icon="📊">
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Each decision is evaluated across four research-backed pillars using a 3-tier scale:
                    <strong> Good (+1)</strong>, <strong>Partial (0)</strong>, <strong>None (−1)</strong>.
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: (t: any) => t.palette.mode === 'light' ? '#f5f5f5' : '#1A2332' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Pillar</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>✅ Good (+1)</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>⚠️ Partial (0)</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>🔴 None (−1)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>📋 Planning</TableCell>
                                <TableCell>Full plan with resources allocated</TableCell>
                                <TableCell>Some planning but gaps remained</TableCell>
                                <TableCell>No plan, acted without preparation</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>🔍 Research</TableCell>
                                <TableCell>Compared options, sought advice</TableCell>
                                <TableCell>Some research but incomplete</TableCell>
                                <TableCell>No research, acted on impulse</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>⏰ Timing</TableCell>
                                <TableCell>Right timing, prevented escalation</TableCell>
                                <TableCell>Slightly rushed or delayed</TableCell>
                                <TableCell>Poor timing caused unnecessary cost</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>🧘 Emotional Control</TableCell>
                                <TableCell>Calm, rational, deliberate</TableCell>
                                <TableCell>Some pressure but reasonable</TableCell>
                                <TableCell>Panicked, coerced, or emotional</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
                <Typography variant="body2" color="text.secondary">
                    <strong>Score range:</strong> −4 to +4. Verdicts use growth-oriented language: Excellent, Acceptable,
                    Even Ground, Learning Moment, and Growth Opportunity.
                </Typography>
            </Section>

            {/* Decision Categories */}
            <Section title="Decision Categories" icon="📁">
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    ClarityPro supports 9 life domains so you can audit any major decision:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[
                        { icon: '💼', label: 'Career' },
                        { icon: '❤️', label: 'Relationships' },
                        { icon: '👨‍👩‍👧‍👦', label: 'Family' },
                        { icon: '📈', label: 'Investments' },
                        { icon: '💰', label: 'Savings' },
                        { icon: '🛍️', label: 'Purchases' },
                        { icon: '🏥', label: 'Health' },
                        { icon: '🎓', label: 'Education' },
                        { icon: '🏢', label: 'Business' }
                    ].map(c => (
                        <Chip key={c.label} label={`${c.icon} ${c.label}`} variant="outlined" />
                    ))}
                </Box>
            </Section>

            {/* Features */}
            <Section title="Implemented Features" icon="✅">
                {[
                    { area: 'Scoring & Insights', items: [
                        '4-pillar scoring with pre-decision and post-decision modes',
                        'Emotional check-in (8 emotions with intensity scale)',
                        'Rich verdict system with growth-oriented labels',
                        'Per-pillar feedback with specific action items',
                        'Rule-based insights engine (always available)',
                        'AI-powered insights via OpenAI (optional enhancement)',
                    ]},
                    { area: 'Analytics & Patterns', items: [
                        'Category comparison charts on Dashboard',
                        'Decision profile summary',
                        'Pattern detection engine with 5 algorithms (recurring weakness, emotion correlation, category blindspot, trend analysis, streaks)',
                    ]},
                    { area: 'Management', items: [
                        'Full scorecard CRUD (create, view, edit, delete)',
                        'Outcome tracking with smart alerts (positive/neutral/negative)',
                        'Search and filter by category, verdict, and keyword',
                        'Pagination for large histories',
                    ]},
                    { area: 'User Experience', items: [
                        'Success screen with next-step actions after saving',
                        'Emotional insight bubble during check-in',
                        'Share summary to clipboard',
                        'Smooth fade-in and scale animations',
                        'Guest mode (no account required) and email login',
                    ]},
                ].map(group => (
                    <Box key={group.area} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                            {group.area}
                        </Typography>
                        {group.items.map((item, i) => (
                            <Typography key={i} variant="body2" sx={{ pl: 2, mb: 0.3 }}>
                                • {item}
                            </Typography>
                        ))}
                    </Box>
                ))}
            </Section>

            {/* Tech Stack */}
            <Section title="Technology Stack" icon="🛠️">
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: (t: any) => t.palette.mode === 'light' ? '#f5f5f5' : '#1A2332' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Layer</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Technology</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Purpose</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>Frontend</TableCell>
                                <TableCell>React 18 + TypeScript</TableCell>
                                <TableCell>Component-based UI with type safety</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>UI Library</TableCell>
                                <TableCell>Material UI (MUI) 5</TableCell>
                                <TableCell>Styled with sx prop — no CSS modules</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Build Tool</TableCell>
                                <TableCell>Vite 5</TableCell>
                                <TableCell>Fast dev server and optimized production builds</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Routing</TableCell>
                                <TableCell>React Router 6</TableCell>
                                <TableCell>Client-side page navigation</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Backend</TableCell>
                                <TableCell>Vercel Serverless Functions</TableCell>
                                <TableCell>Node.js API routes — no Express server</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Database</TableCell>
                                <TableCell>MongoDB Atlas (Free M0)</TableCell>
                                <TableCell>NoSQL document store for scorecards and users</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Authentication</TableCell>
                                <TableCell>Email-based UUID token</TableCell>
                                <TableCell>Simple login stored in localStorage + MongoDB</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>AI</TableCell>
                                <TableCell>OpenAI API (gpt-3.5-turbo)</TableCell>
                                <TableCell>Optional deeper insights with rule-based fallback</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Hosting</TableCell>
                                <TableCell>Vercel (Hobby Plan)</TableCell>
                                <TableCell>Free tier with global CDN and auto-deploy from GitHub</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Source Control</TableCell>
                                <TableCell>GitHub (Public Repo)</TableCell>
                                <TableCell>Version control with automatic Vercel deployments</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Section>

            {/* Psychological Foundation */}
            <Section title="Psychological Foundation" icon="🧬">
                <Typography variant="body2" sx={{ mb: 2 }}>
                    ClarityPro is grounded in established decision science and psychology research:
                </Typography>
                {[
                    { framework: 'Dual Process Theory', source: 'Kahneman, 2011', use: 'Activates System 2 (rational) over System 1 (emotional) by forcing structured evaluation' },
                    { framework: 'Decision Regret Theory', source: 'Connolly & Zeelenberg, 2002', use: 'Structured auditing reduces post-decision regret' },
                    { framework: 'Cognitive Load Management', source: 'Sweller, 1988', use: 'Breaking complex decisions into 4 manageable pillars' },
                    { framework: 'Growth Mindset', source: 'Dweck, 2006', use: 'Language focuses on learning and growth, never failure or shame' },
                ].map((f, i) => (
                    <Box key={i} sx={{ mb: 1.5, p: 1.5, bgcolor: (theme) => theme.palette.mode === 'light' ? '#E8F4FD' : '#0D2137', borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{f.framework}</Typography>
                        <Typography variant="caption" color="text.secondary">{f.source}</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>{f.use}</Typography>
                    </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    Language Design for Psychological Safety
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                    Instead of judgmental terms like "Poor decision" or "Critical failure", ClarityPro uses growth-oriented language:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label='⚖️ "Even Ground"' size="small" variant="outlined" />
                    <Chip label='🌱 "Learning Moment"' size="small" variant="outlined" />
                    <Chip label='💪 "Growth Opportunity"' size="small" variant="outlined" />
                </Box>
            </Section>

            {/* Who Is This For */}
            <Section title="Who Is This For?" icon="👥">
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: (t: any) => t.palette.mode === 'light' ? '#f5f5f5' : '#1A2332' }}>
                                <TableCell sx={{ fontWeight: 700 }}>User Type</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>How They Use ClarityPro</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[
                                { who: 'General Public', how: 'Audit major life decisions — career, relationships, purchases, health' },
                                { who: 'Therapy Patients', how: 'Pre-therapy homework, tracking decision patterns with data' },
                                { who: 'Therapists & Coaches', how: 'Monitor client decision patterns and identify cognitive biases' },
                                { who: 'Students', how: 'Learn structured decision-making frameworks for lifelong use' },
                            ].map((r, i) => (
                                <TableRow key={i}>
                                    <TableCell sx={{ fontWeight: 600 }}>{r.who}</TableCell>
                                    <TableCell>{r.how}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Section>

            {/* Future Roadmap */}
            <Section title="Future Roadmap" icon="🔮">
                {[
                    { phase: 'PDF Export', desc: 'Downloadable reports for therapy sessions' },
                    { phase: 'Weekly Summaries', desc: 'Email digests with decision trends' },
                    { phase: 'Native Mobile Apps', desc: 'iOS (SwiftUI) and Android (Kotlin) with offline-first architecture' },
                    { phase: 'Therapist Dashboard', desc: 'Dedicated view for clinicians to monitor client patterns' },
                    { phase: 'Collaborative Decisions', desc: 'Share audits with a partner or advisor' },
                ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'flex-start' }}>
                        <Chip label={`${i + 1}`} size="small" sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, minWidth: 28 }} />
                        <Box>
                            <Typography variant="body2" fontWeight={600}>{item.phase}</Typography>
                            <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                        </Box>
                    </Box>
                ))}
            </Section>

            {/* About the Creator */}
            <Section title="About the Creator" icon="👤">
                <Typography variant="body1" sx={{ mb: 1 }}>
                    Built with GitHub Copilot by <strong>Mudi</strong> — Software QA Tester, Tech Support Specialist, and LLM Tester.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    With a background spanning quality assurance, technical support, and large language model evaluation,
                    ClarityPro was born from a passion for combining decision science with accessible technology.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label="🔗 GitHub" component="a" href="https://github.com/ograabiodun/Universal_Decision_App" target="_blank" clickable variant="outlined" />
                    <Chip label="🌐 Live App" component="a" href="https://claritypro.vercel.app" target="_blank" clickable variant="outlined" />
                </Box>
            </Section>

            {/* Cost */}
            <Card sx={{ mb: 3, bgcolor: (t: any) => t.palette.mode === 'light' ? '#f0fdf4' : '#0F2A1A', border: (t: any) => `1px solid ${t.palette.mode === 'dark' ? '#10B98140' : '#10B98130'}` }}>
                <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        💰 Hosting Cost: $0/month
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Fully deployed on free tiers — Vercel (hosting + serverless), MongoDB Atlas (database).
                        No paid infrastructure required.
                    </Typography>
                </CardContent>
            </Card>

            <Box sx={{ textAlign: 'center', py: 3, opacity: 0.6 }}>
                <Typography variant="caption">
                    ClarityPro &bull; Built with React, MUI, Vercel & MongoDB Atlas
                </Typography>
            </Box>
        </Box>
    );
};
