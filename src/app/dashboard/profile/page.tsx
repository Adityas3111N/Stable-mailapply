"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const majorRoles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Software Engineer",
    "Data Analyst",
    "Data Scientist",
    "Machine Learning Engineer",
    "AI Engineer",
    "DevOps Engineer",
    "Cloud Engineer",
    "Mobile Developer",
    "iOS Developer",
    "Android Developer",
    "UI/UX Designer",
    "Product Manager",
    "Product Designer",
    "QA Engineer",
    "Cybersecurity Analyst",
    "Database Administrator",
    "System Administrator",
    "Network Engineer",
    "Blockchain Developer",
    "Game Developer",
    "Embedded Systems Engineer",
    "Technical Writer",
    "Scrum Master",
    "Business Analyst",
    "Project Manager",
    "Marketing Manager",
    "Sales Executive",
    "HR Manager",
    "Content Writer",
    "Graphic Designer",
    "Video Editor",
    "Digital Marketing Specialist",
    "SEO Specialist",
    "Financial Analyst",
    "Accountant",
    "Consultant",
    "Operations Manager",
];

const skillsByRole: Record<string, string[]> = {
    "Frontend Developer": ["React", "Next.js", "TypeScript", "Angular", "Vue.js", "JavaScript", "Tailwind CSS", "Redux", "GraphQL", "Webpack / Vite", "Performance Optimization", "System Design", "Responsive Design", "Accessibility (a11y)", "Testing (Jest / Cypress)", "CSS Architecture", "Web APIs", "PWA", "Server Components", "Micro-Frontends"],
    "Backend Developer": ["Node.js", "Python", "Java", "Go", "C#", "System Design", "PostgreSQL", "MongoDB", "Redis", "Microservices", "Docker", "AWS", "REST API Design", "GraphQL", "Message Queues (Kafka / RabbitMQ)", "Authentication (OAuth / JWT)", "CI/CD", "Spring Boot", "Django / FastAPI", "Database Optimization"],
    "Full Stack Developer": ["React", "Node.js", "TypeScript", "Python", "Next.js", "System Design", "PostgreSQL", "MongoDB", "Docker", "AWS", "GraphQL", "REST API Design", "Redis", "CI/CD", "Authentication", "Tailwind CSS", "Testing", "Microservices", "WebSockets", "DevOps Basics"],
    "Software Engineer": ["DSA", "System Design", "Python", "Java", "C++", "Distributed Systems", "Docker", "AWS", "Design Patterns", "Linux", "SQL", "OOP", "Concurrency", "Networking", "Operating Systems", "Compiler Design", "Cloud Architecture", "Testing", "CI/CD", "Problem Solving"],
    "Data Analyst": ["SQL", "Python", "Power BI", "Tableau", "Statistics", "Advanced Excel", "Data Modeling", "ETL Pipelines", "BigQuery", "Storytelling with Data", "Google Analytics", "R", "Pandas / NumPy", "Data Cleaning", "A/B Testing", "Dashboard Design", "Reporting", "Data Warehousing", "Jupyter", "Business Intelligence"],
    "Data Scientist": ["Machine Learning", "Deep Learning", "Python", "TensorFlow / PyTorch", "Statistics", "NLP", "SQL", "Feature Engineering", "Model Deployment", "Spark", "Scikit-learn", "Computer Vision", "A/B Testing", "R", "Data Visualization", "Big Data", "Recommendation Systems", "Time Series", "Bayesian Methods", "Research"],
    "Machine Learning Engineer": ["Deep Learning", "TensorFlow / PyTorch", "MLOps", "NLP", "Computer Vision", "Python", "Model Optimization", "Distributed Training", "Kubernetes", "Data Pipelines", "AWS SageMaker", "Feature Stores", "Model Monitoring", "Spark", "Docker", "Transformers", "Reinforcement Learning", "Edge AI", "AutoML", "Mathematics"],
    "AI Engineer": ["LLMs & Prompt Engineering", "RAG Architecture", "LangChain / LlamaIndex", "Fine-tuning", "Python", "Vector Databases", "Deep Learning", "NLP", "Cloud AI Services", "System Design", "OpenAI / Anthropic APIs", "Hugging Face", "Embeddings", "Agent Frameworks", "MLOps", "FastAPI", "Evaluation & Benchmarking", "Multimodal AI", "Knowledge Graphs", "Research"],
    "DevOps Engineer": ["Kubernetes", "Docker", "Terraform", "CI/CD Pipelines", "AWS", "Linux", "Monitoring & Observability", "Infrastructure as Code", "Networking", "Security", "Azure / GCP", "Ansible", "Jenkins / GitHub Actions", "Prometheus / Grafana", "Bash Scripting", "Service Mesh", "GitOps", "Nginx / Load Balancing", "Incident Management", "SRE Practices"],
    "Cloud Engineer": ["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "Serverless Architecture", "Networking", "Security & IAM", "Cost Optimization", "Linux", "CloudFormation / CDK", "Docker", "CI/CD", "Lambda / Functions", "S3 / Storage", "VPC & Subnets", "Load Balancing", "Disaster Recovery", "Monitoring", "Multi-Cloud Strategy"],
    "Mobile Developer": ["React Native", "Flutter", "Swift", "Kotlin", "State Management", "REST APIs", "Firebase", "App Store Deployment", "Performance", "CI/CD", "Dart", "TypeScript", "SQLite / Realm", "Push Notifications", "Deep Linking", "Offline-first", "Animation", "Testing", "Security", "Analytics Integration"],
    "iOS Developer": ["Swift", "SwiftUI", "UIKit", "Core Data", "Xcode", "MVVM Architecture", "Concurrency (async/await)", "App Store Connect", "Testing (XCTest)", "ARKit", "Combine", "SPM / CocoaPods", "Push Notifications", "Core Animation", "Accessibility", "Instruments (Profiling)", "Networking (URLSession)", "Security (Keychain)", "WidgetKit", "CloudKit"],
    "Android Developer": ["Kotlin", "Jetpack Compose", "Android SDK", "MVVM Architecture", "Coroutines / Flow", "Room Database", "Dagger / Hilt", "Testing (JUnit / Espresso)", "Play Store", "Performance", "Retrofit / OkHttp", "Material Design 3", "Firebase", "Navigation Component", "WorkManager", "Gradle", "ProGuard / R8", "Accessibility", "CI/CD", "Security"],
    "UI/UX Designer": ["Figma", "User Research", "Design Systems", "Prototyping", "Interaction Design", "Usability Testing", "Information Architecture", "Design Thinking", "Accessibility", "Motion Design", "Wireframing", "Typography", "Color Theory", "User Flows", "Responsive Design", "A/B Testing", "Sketch", "Adobe XD", "Miro", "Storyboarding"],
    "Product Manager": ["Product Strategy", "Roadmapping", "User Research", "Data-Driven Decisions", "Stakeholder Management", "Agile / Scrum", "Prioritization Frameworks", "Market Research", "SQL", "Technical Understanding", "OKRs / KPIs", "A/B Testing", "PRDs", "Go-to-Market Strategy", "Competitive Analysis", "User Stories", "JIRA", "Presentation Skills", "Pricing Strategy", "Analytics"],
    "Product Designer": ["Figma", "Design Systems", "User Research", "Prototyping", "Visual Design", "Interaction Design", "Design Thinking", "Accessibility", "Framer", "Motion Design", "Wireframing", "Typography", "Responsive Design", "User Flows", "Usability Testing", "Component Libraries", "Sketch", "Adobe XD", "Storyboarding", "Design Critique"],
    "QA Engineer": ["Automation Testing", "Selenium / Cypress", "API Testing", "Performance Testing", "Test Architecture", "CI/CD", "Python / Java", "SQL", "Mobile Testing", "Security Testing", "Postman / REST Assured", "JUnit / TestNG", "Load Testing (JMeter)", "BDD / TDD", "Test Strategy", "Bug Tracking (JIRA)", "Regression Testing", "Appium", "Docker", "Accessibility Testing"],
    "Cybersecurity Analyst": ["Penetration Testing", "Network Security", "SIEM", "Incident Response", "Vulnerability Assessment", "Ethical Hacking", "Cloud Security", "Forensics", "Python", "Threat Intelligence", "Firewall / IDS / IPS", "OWASP Top 10", "Compliance (ISO / SOC2)", "Risk Assessment", "Malware Analysis", "Encryption / PKI", "SOC Operations", "Red Team / Blue Team", "Identity & Access Management", "Scripting"],
    "Database Administrator": ["PostgreSQL", "MySQL", "MongoDB", "Performance Tuning", "High Availability", "Backup & Recovery", "Database Design", "Replication", "Cloud Databases (RDS / Atlas)", "Security", "Oracle", "Redis", "Indexing Strategies", "Query Optimization", "Data Migration", "Partitioning / Sharding", "ETL", "Monitoring", "Disaster Recovery", "Stored Procedures"],
    "System Administrator": ["Linux", "Windows Server", "Networking", "Active Directory", "Virtualization (VMware)", "Docker", "Bash / PowerShell", "Monitoring (Nagios / Zabbix)", "Security", "Automation (Ansible)", "DNS / DHCP", "Backup Solutions", "Patch Management", "Cloud (AWS / Azure)", "Firewall Management", "Troubleshooting", "LDAP", "IT Compliance", "Storage Management", "Disaster Recovery"],
    "Network Engineer": ["Cisco (CCNA / CCNP)", "Routing & Switching", "TCP/IP", "Firewalls", "VPN", "BGP / OSPF", "Cloud Networking", "Wireshark", "Security", "Automation (Ansible / Python)", "Load Balancing", "SD-WAN", "VLAN / QoS", "DNS / DHCP", "Wireless Networks", "IPv6", "Network Monitoring", "Troubleshooting", "SDN", "Zero Trust Architecture"],
    "Blockchain Developer": ["Solidity", "Smart Contracts", "Ethereum", "Web3.js / Ethers.js", "DeFi Protocols", "Security Auditing", "Cryptography", "Rust", "Hardhat / Foundry", "Tokenomics", "NFT Standards (ERC-721)", "Layer 2 Solutions", "IPFS", "Cross-chain Bridges", "DAO Architecture", "Gas Optimization", "Testing (Slither / Echidna)", "Consensus Mechanisms", "Wallet Integration", "Chainlink / Oracles"],
    "Game Developer": ["Unity", "Unreal Engine", "C# / C++", "Game Design", "3D Modeling & Shaders", "Physics Engine", "Multiplayer Networking", "Optimization", "AI Systems (Pathfinding)", "VR / AR", "Animation Systems", "Level Design", "Audio Engineering", "Game Architecture", "Blender", "Procedural Generation", "UI / HUD Design", "Version Control (Perforce)", "Profiling", "Cross-platform Development"],
    "Embedded Systems Engineer": ["C / C++", "RTOS", "Microcontrollers (ARM / STM32)", "PCB Design", "FPGA / Verilog", "I2C / SPI / UART", "Debugging & Oscilloscope", "IoT", "Linux (Embedded)", "Low-level Programming", "Device Drivers", "DMA / Interrupts", "Power Management", "BLE / Zigbee", "Signal Processing", "Safety Standards (ISO 26262)", "Bootloaders", "JTAG / SWD", "Sensor Integration", "Real-time Systems"],
    "Technical Writer": ["Technical Writing", "API Documentation", "Developer Docs", "Content Strategy", "Markdown / DITA / AsciiDoc", "Diagramming (Mermaid / Draw.io)", "Git", "SEO for Docs", "Research", "Simplification", "Docs-as-Code", "SDK Guides", "Release Notes", "Tutorials / How-tos", "Information Architecture", "Style Guides", "User Guides", "Confluence / Notion", "Code Examples", "Localization"],
    "Scrum Master": ["Agile & Scrum", "Facilitation", "Coaching", "Sprint Planning", "Retrospectives", "Conflict Resolution", "Stakeholder Management", "SAFe", "Metrics & Velocity", "Continuous Improvement", "Kanban", "Team Dynamics", "Servant Leadership", "Backlog Refinement", "OKRs", "Change Management", "Risk Management", "Cross-team Coordination", "Workshop Facilitation", "Release Management"],
    "Business Analyst": ["Requirements Gathering", "Data Analysis", "SQL", "Power BI / Tableau", "Process Modeling (BPMN)", "Stakeholder Management", "Agile", "Gap Analysis", "UML", "Domain Knowledge", "User Stories / Use Cases", "UAT", "SWOT Analysis", "Wireframing", "Excel (Advanced)", "JIRA / Confluence", "KPI Design", "Root Cause Analysis", "Presentation Skills", "Documentation"],
    "Project Manager": ["Project Planning", "Agile & Waterfall", "Risk Management", "Stakeholder Management", "Budgeting", "Team Leadership", "Resource Allocation", "PMP / PRINCE2", "JIRA / MS Project", "Negotiation", "Scope Management", "Earned Value Management", "Change Management", "Communication", "Vendor Management", "Quality Assurance", "Program Management", "Gantt Charts", "Status Reporting", "Conflict Resolution"],
    "Marketing Manager": ["Marketing Strategy", "SEO & SEM", "Campaign Management", "Google Analytics", "Content Marketing", "Brand Management", "Paid Advertising", "CRM (HubSpot / Salesforce)", "Market Research", "Team Leadership", "Email Marketing", "Social Media Strategy", "Influencer Marketing", "Marketing Automation", "Conversion Optimization", "A/B Testing", "Budget Management", "PR & Communications", "Go-to-Market Strategy", "Customer Segmentation"],
    "Sales Executive": ["Sales Strategy", "Lead Generation", "Negotiation & Closing", "CRM (Salesforce / HubSpot)", "Pipeline Management", "B2B / B2C Sales", "Account Management", "Presentation Skills", "Market Research", "Forecasting", "Cold Outreach", "Relationship Building", "Product Knowledge", "Objection Handling", "Territory Management", "Revenue Targets", "Contract Negotiation", "Cross-selling / Upselling", "Sales Analytics", "Partner Management"],
    "HR Manager": ["Talent Acquisition", "Employee Relations", "Performance Management", "HR Policies & Compliance", "Training & Development", "HRIS (Workday / BambooHR)", "Culture Building", "Labor Law", "Diversity & Inclusion", "Succession Planning", "Compensation & Benefits", "Onboarding Programs", "Employee Engagement", "Conflict Resolution", "Campus Hiring", "Employer Branding", "Exit Management", "HR Analytics", "Organization Design", "Workforce Planning"],
    "Content Writer": ["Content Writing", "SEO Writing", "Copywriting", "Content Strategy", "Storytelling", "Research", "Editing & Proofreading", "CMS / WordPress", "Brand Voice", "Creative Writing", "Blog Writing", "Email Copywriting", "Social Media Content", "Long-form Content", "Headline Writing", "Keyword Research", "Content Calendar", "Fact-checking", "Tone Adaptation", "Analytics & Performance"],
    "Graphic Designer": ["Photoshop", "Illustrator", "Figma", "Branding & Logo Design", "Typography", "Layout & Print Design", "Motion Graphics", "UI Design", "Color Theory", "3D / Mockups", "InDesign", "After Effects", "Packaging Design", "Infographics", "Social Media Graphics", "Brand Guidelines", "Vector Illustration", "Photo Manipulation", "Presentation Design", "Design for Web"],
    "Video Editor": ["Premiere Pro", "After Effects", "DaVinci Resolve", "Motion Graphics", "Color Grading", "Audio Editing", "Storytelling", "VFX", "4K Workflow", "YouTube / Social Media", "Final Cut Pro", "Cinematography Basics", "Thumbnail Design", "Sound Design", "Multi-cam Editing", "Green Screen / Chroma Key", "Animation", "Compression & Export", "Scriptwriting", "Client Communication"],
    "Digital Marketing Specialist": ["Google Ads", "Facebook / Meta Ads", "SEO", "Google Analytics 4", "Conversion Optimization", "Email Marketing", "Marketing Automation", "Funnel Strategy", "A/B Testing", "ROI Tracking", "Content Marketing", "Social Media Marketing", "Landing Page Optimization", "Copywriting", "Retargeting", "Influencer Marketing", "CRM", "Customer Journey Mapping", "Affiliate Marketing", "Video Marketing"],
    "SEO Specialist": ["Technical SEO", "On-page & Off-page SEO", "Keyword Research", "Google Search Console", "Ahrefs / SEMrush", "Link Building", "Core Web Vitals", "Schema Markup", "Competitor Analysis", "Content Optimization", "Local SEO", "International SEO", "Site Architecture", "Log File Analysis", "Google Analytics 4", "PageSpeed Optimization", "E-E-A-T", "Crawl Budget", "Featured Snippets", "Algorithm Updates"],
    "Financial Analyst": ["Financial Modeling", "Valuation (DCF / Comps)", "Advanced Excel", "Financial Statements", "Forecasting", "Power BI / Tableau", "Risk Analysis", "SQL", "Bloomberg Terminal", "Investment Analysis", "Budgeting", "Variance Analysis", "M&A Analysis", "Capital Markets", "VBA / Python", "Presentation Skills", "Ratio Analysis", "Market Research", "Regulatory Compliance", "Data Visualization"],
    "Accountant": ["Accounting (GAAP / IFRS)", "Tax Filing & GST", "Tally / QuickBooks", "Financial Statements", "Auditing", "Advanced Excel", "SAP / ERP", "Bookkeeping", "Payroll", "Compliance", "Accounts Payable / Receivable", "Reconciliation", "Cost Accounting", "Budgeting", "Internal Controls", "Financial Reporting", "Fixed Assets Management", "VAT / TDS", "Statutory Audit", "Cash Flow Management"],
    "Consultant": ["Problem Solving", "Strategy", "Data Analysis", "Client Management", "Presentation Skills", "Market Analysis", "Financial Analysis", "Process Improvement", "Industry Knowledge", "Critical Thinking", "Stakeholder Communication", "Change Management", "Research", "Excel & PowerPoint", "Business Development", "Project Management", "Hypothesis-driven Thinking", "Benchmarking", "Due Diligence", "Workshop Facilitation"],
    "Operations Manager": ["Operations Management", "Process Improvement", "Supply Chain", "Lean / Six Sigma", "Team Leadership", "Budgeting & KPIs", "ERP Systems", "Vendor Management", "Quality Control", "Logistics", "Inventory Management", "Workforce Planning", "SOP Development", "Compliance & Safety", "Procurement", "Capacity Planning", "Continuous Improvement", "Data-driven Decisions", "Cross-functional Coordination", "Risk Management"],
};

const genericSkills = ["JavaScript", "Python", "SQL", "System Design", "Data Analysis", "Project Management", "Problem Solving", "Communication", "Leadership", "Cloud (AWS/Azure/GCP)", "Excel", "Git", "Agile", "Critical Thinking", "Research", "Presentation Skills", "Technical Writing", "Teamwork", "Adaptability", "Time Management"];

const MAX_SKILLS = 10;
const BIO_EXTRA_WORD_LIMIT = 50;

interface ProfileData {
    name: string;
    email: string;
    role: string;
    experience: string;
    bio: string;
    skills: string[];
    resumeUrl: string;
    jobPreferences?: {
        workMode: "remote" | "hybrid" | "onsite" | "any";
        preferredCountries: string[];
        jobType: "full-time" | "contract" | "any";
    };
}

export default function ProfilePage() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [gmailConnected, setGmailConnected] = useState(false);
    const [showCustomRole, setShowCustomRole] = useState(false);
    const [customSkill, setCustomSkill] = useState("");
    const [bioExtra, setBioExtra] = useState("");
    const [suggestionIndex, setSuggestionIndex] = useState(-1);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [profile, setProfile] = useState<ProfileData>({
        name: "",
        email: "",
        role: "",
        experience: "0",
        bio: "",
        skills: [],
        resumeUrl: "",
        jobPreferences: {
            workMode: "any",
            preferredCountries: [],
            jobType: "any",
        },
    });

    const STORAGE_KEY = "mailapply_profile_draft";

    // Load profile: localStorage draft first, then API as base
    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await fetch("/api/user");
                if (res.ok) {
                    const data = await res.json();
                    const serverUser = data.user;
                    // If the OAuth callback just redirected us here with ?gmail=connected,
                    // trust it — the token was just saved. Don't let the async API
                    // response race and overwrite the state back to false.
                    const justConnected = searchParams.get("gmail") === "connected";
                    setGmailConnected(justConnected || Boolean(serverUser.gmailRefreshToken));

                    // Check for a locally cached draft
                    const cached = localStorage.getItem(STORAGE_KEY);
                    if (cached) {
                        try {
                            const draft = JSON.parse(cached);
                            // Merge: use draft values over server values
                            setProfile({ ...serverUser, ...draft.profile, email: serverUser.email });
                            if (draft.bioExtra !== undefined) setBioExtra(draft.bioExtra);
                            const mergedRole = draft.profile?.role || serverUser.role;
                            if (mergedRole && !majorRoles.includes(mergedRole)) {
                                setShowCustomRole(true);
                            }
                        } catch {
                            setProfile(serverUser);
                        }
                    } else {
                        setProfile(serverUser);
                        if (serverUser.role && !majorRoles.includes(serverUser.role)) {
                            setShowCustomRole(true);
                        }
                        if (serverUser.bio) {
                            const autoPrefix = buildAutoBio(serverUser.name, serverUser.skills, parseInt(serverUser.experience) || 0);
                            if (serverUser.bio.startsWith(autoPrefix)) {
                                setBioExtra(serverUser.bio.slice(autoPrefix.length).trim());
                            } else {
                                setBioExtra(serverUser.bio);
                            }
                        }
                    }
                }
            } catch {
                // Defaults
            } finally {
                setLoading(false);
            }
        }
        if (session) loadProfile();
    }, [session]);

    // Handle ?gmail=connected / ?gmail=error from OAuth callback
    useEffect(() => {
        const gmailParam = searchParams.get("gmail");
        if (gmailParam === "connected") {
            setGmailConnected(true);
            setSuccess("Gmail connected! Emails will now be sent from your account.");
            setTimeout(() => setSuccess(""), 4000);
        } else if (gmailParam === "error") {
            const reason = searchParams.get("reason") || "unknown";
            setError(`Gmail connection failed (${reason}). Please try again.`);
        }
    }, [searchParams]);

    // Auto-save draft to localStorage on every change
    useEffect(() => {
        if (!loading) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, bioExtra }));
        }
    }, [profile, bioExtra, loading]);

    const experienceYears = parseInt(profile.experience) || 0;
    const availableSkills = skillsByRole[profile.role] || genericSkills;

    // Custom skills = skills in profile that are NOT in the preset list
    const customSkills = profile.skills.filter((s) => !availableSkills.includes(s));

    // All unique skills across every role for autocomplete suggestions
    const allSkills = Array.from(new Set(Object.values(skillsByRole).flat().concat(genericSkills)));
    const suggestions = customSkill.trim().length >= 1
        ? allSkills
            .filter((s) =>
                s.toLowerCase().includes(customSkill.toLowerCase()) &&
                !profile.skills.includes(s) &&
                !availableSkills.includes(s)
            )
            .slice(0, 6)
        : [];

    function buildAutoBio(name: string, skills: string[], years: number): string {
        if (!name && skills.length === 0) return "";
        const parts: string[] = [];
        if (name) parts.push(`I am ${name}.`);
        if (skills.length > 0) {
            const skillText = skills.length === 1
                ? skills[0]
                : skills.slice(0, -1).join(", ") + " and " + skills[skills.length - 1];
            parts.push(`I am best at ${skillText}.`);
        }
        if (years > 0) {
            parts.push(`I have ${years} ${years === 1 ? "year" : "years"} of full-time experience working with these.`);
        } else {
            parts.push("I am a fresher eager to apply these skills professionally.");
        }
        return parts.join(" ");
    }

    const autoBio = buildAutoBio(profile.name, profile.skills, experienceYears);

    // Combine auto bio + user extra text for saving
    const fullBio = bioExtra ? `${autoBio} ${bioExtra}` : autoBio;

    const bioExtraWordCount = bioExtra.trim() ? bioExtra.trim().split(/\s+/).length : 0;

    const toggleSkill = (skill: string) => {
        if (profile.skills.includes(skill)) {
            setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });
        } else if (profile.skills.length < MAX_SKILLS) {
            setProfile({ ...profile, skills: [...profile.skills, skill] });
        }
    };

    const addCustomSkill = () => {
        const trimmed = customSkill.trim();
        if (!trimmed) return;
        if (profile.skills.includes(trimmed)) {
            setCustomSkill("");
            return;
        }
        if (profile.skills.length >= MAX_SKILLS) return;
        setProfile({ ...profile, skills: [...profile.skills, trimmed] });
        setCustomSkill("");
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch("/api/user", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: profile.name,
                    role: profile.role,
                    experience: profile.experience,
                    bio: fullBio,
                    skills: profile.skills,
                    jobPreferences: profile.jobPreferences,
                }),
            });

            if (res.ok) {
                localStorage.removeItem(STORAGE_KEY);
                setSuccess("Profile updated successfully!");
                setTimeout(() => setSuccess(""), 3000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to update profile");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            setError("Please upload a PDF file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload-resume", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setProfile((prev) => ({ ...prev, resumeUrl: data.url }));
                setSuccess("Resume uploaded successfully!");
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError("Failed to upload resume. Check your Cloudinary config.");
            }
        } catch {
            setError("Resume upload failed. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-3 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
                    Profile Setup
                </h1>
                <p className="text-slate-500 mt-1">
                    Complete your profile once &mdash; it powers every email you generate.
                </p>
            </div>

            {success && (
                <div className="mb-6 p-3 rounded-xl bg-success-100 text-success-700 text-sm font-medium animate-fade-in">
                    {success}
                </div>
            )}

            {error && (
                <div className="mb-6 p-3 rounded-xl bg-danger-100 text-danger-700 text-sm font-medium animate-fade-in">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
                    <h2 className="text-lg font-semibold text-slate-900">Basic Info</h2>

                    <Input
                        label="Full Name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        required
                    />

                    <Input
                        label="Email"
                        type="email"
                        value={profile.email}
                        disabled
                        helperText="Email cannot be changed"
                    />

                    {/* Target Role Dropdown */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Target Role
                        </label>
                        <select
                            value={
                                majorRoles.includes(profile.role)
                                    ? profile.role
                                    : showCustomRole || profile.role
                                        ? "__other__"
                                        : ""
                            }
                            onChange={(e) => {
                                if (e.target.value === "__other__") {
                                    setShowCustomRole(true);
                                    setProfile({ ...profile, role: "", skills: [] });
                                } else {
                                    setShowCustomRole(false);
                                    setProfile({ ...profile, role: e.target.value, skills: [] });
                                }
                            }}
                            className="w-full px-4 py-2.5 text-sm bg-white text-slate-900 border border-slate-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-primary-500 focus:ring-primary-500/30 cursor-pointer"
                        >
                            <option value="" disabled>
                                Select your target role...
                            </option>
                            {majorRoles.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                            <option value="__other__">Other (type manually)</option>
                        </select>

                        {showCustomRole && (
                            <div className="mt-2">
                                <Input
                                    placeholder="Type your target role..."
                                    value={profile.role}
                                    onChange={(e) =>
                                        setProfile({ ...profile, role: e.target.value })
                                    }
                                />
                            </div>
                        )}
                    </div>

                    {/* Experience Stepper */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Experience
                        </label>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    if (experienceYears > 0)
                                        setProfile({
                                            ...profile,
                                            experience: String(experienceYears - 1),
                                        });
                                }}
                                className="w-11 h-11 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-primary-300 flex items-center justify-center text-xl font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                disabled={experienceYears <= 0}
                            >
                                -
                            </button>
                            <div className="text-center min-w-[90px]">
                                <span className="text-3xl font-bold font-heading text-slate-900">
                                    {experienceYears}
                                </span>
                                <span className="text-sm text-slate-500 ml-1.5">
                                    {experienceYears === 1 ? "year" : "years"}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    setProfile({
                                        ...profile,
                                        experience: String(experienceYears + 1),
                                    })
                                }
                                className="w-11 h-11 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-primary-300 flex items-center justify-center text-xl font-bold transition-all cursor-pointer"
                            >
                                +
                            </button>
                        </div>
                        <p className="mt-1.5 text-xs text-slate-400">
                            Full-time experience only (after graduation)
                        </p>
                    </div>
                </div>

                {/* Skills Section */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Skills</h2>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${profile.skills.length >= MAX_SKILLS
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-100 text-slate-600"
                            }`}>
                            {profile.skills.length}/{MAX_SKILLS} selected
                        </span>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-50 border border-orange-200">
                        <span className="text-orange-500 mt-0.5 text-base">&#9888;&#65039;</span>
                        <p className="text-xs text-orange-700 font-medium">
                            Pick your <strong>top {MAX_SKILLS} strongest skills</strong> &mdash; the ones you can confidently back up in any interview. You&apos;ll only get the job if you&apos;re truly good at it. Don&apos;t waste recruiters&apos; time.
                        </p>
                    </div>

                    {!profile.role ? (
                        <p className="text-sm text-slate-400 py-4 text-center">
                            Select a target role above to see relevant skills.
                        </p>
                    ) : (
                        <>
                            {/* Preset skill chips */}
                            <div className="flex flex-wrap gap-2">
                                {availableSkills.map((skill) => {
                                    const isSelected = profile.skills.includes(skill);
                                    const isDisabled = !isSelected && profile.skills.length >= MAX_SKILLS;
                                    return (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => !isDisabled && toggleSkill(skill)}
                                            disabled={isDisabled}
                                            className={`
                        px-3 py-1.5 text-sm rounded-lg font-medium
                        transition-all duration-200 cursor-pointer
                        ${isSelected
                                                    ? "bg-primary-600 text-white shadow-sm"
                                                    : isDisabled
                                                        ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                                                        : "bg-slate-100 text-slate-600 hover:bg-primary-50 hover:text-primary-700"
                                                }
                        border ${isSelected ? "border-primary-600" : "border-transparent"}
                      `}
                                        >
                                            {isSelected && "\u2713 "}{skill}
                                        </button>
                                    );
                                })}

                                {/* Show custom-added skills as visible chips too */}
                                {customSkills.map((skill) => (
                                    <button
                                        key={skill}
                                        type="button"
                                        onClick={() => toggleSkill(skill)}
                                        className="px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 cursor-pointer bg-primary-600 text-white shadow-sm border border-primary-600"
                                    >
                                        {"\u2713 "}{skill}
                                        <span className="ml-1 opacity-70">&times;</span>
                                    </button>
                                ))}
                            </div>

                            {/* Add custom skill with autocomplete */}
                            <div className="pt-2 border-t border-slate-100">
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                    Don&apos;t see your skill? Search or type to add:
                                </label>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            placeholder="e.g. Rust, Figma, etc."
                                            value={customSkill}
                                            onChange={(e) => {
                                                setCustomSkill(e.target.value);
                                                setSuggestionIndex(-1);
                                                setShowSuggestions(true);
                                            }}
                                            onFocus={() => setShowSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                            onKeyDown={(e) => {
                                                if (e.key === "ArrowDown") {
                                                    e.preventDefault();
                                                    setSuggestionIndex((i) => Math.min(i + 1, suggestions.length - 1));
                                                } else if (e.key === "ArrowUp") {
                                                    e.preventDefault();
                                                    setSuggestionIndex((i) => Math.max(i - 1, -1));
                                                } else if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    if (suggestionIndex >= 0 && suggestions[suggestionIndex]) {
                                                        toggleSkill(suggestions[suggestionIndex]);
                                                        setCustomSkill("");
                                                        setSuggestionIndex(-1);
                                                        setShowSuggestions(false);
                                                    } else {
                                                        addCustomSkill();
                                                    }
                                                } else if (e.key === "Escape") {
                                                    setShowSuggestions(false);
                                                }
                                            }}
                                            disabled={profile.skills.length >= MAX_SKILLS}
                                            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                        />
                                        {showSuggestions && suggestions.length > 0 && (
                                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                                                {suggestions.map((s, i) => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => {
                                                            if (profile.skills.length < MAX_SKILLS) {
                                                                setProfile({ ...profile, skills: [...profile.skills, s] });
                                                            }
                                                            setCustomSkill("");
                                                            setSuggestionIndex(-1);
                                                            setShowSuggestions(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${i === suggestionIndex
                                                            ? "bg-primary-50 text-primary-700"
                                                            : "text-slate-700 hover:bg-slate-50"
                                                            }`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addCustomSkill}
                                        disabled={profile.skills.length >= MAX_SKILLS || !customSkill.trim()}
                                        className="px-4 py-2 text-sm font-semibold bg-primary-50 text-primary-700 rounded-xl hover:bg-primary-100 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        + Add
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Job Preferences Section */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
                    <h2 className="text-lg font-semibold text-slate-900">Job Preferences</h2>

                    {/* Work Mode */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Work Mode</label>
                        <div className="flex flex-wrap gap-3">
                            {(["remote", "hybrid", "onsite", "any"] as const).map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setProfile({
                                        ...profile,
                                        jobPreferences: { ...profile.jobPreferences!, workMode: mode }
                                    })}
                                    className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${profile.jobPreferences?.workMode === mode
                                        ? "bg-primary-50 border-primary-600 text-primary-700 shadow-sm"
                                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                >
                                    {mode === "onsite" ? "On-site" : mode.charAt(0).toUpperCase() + mode.slice(1)}
                                    {mode === "remote" && " 🌐"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preferred Countries */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Locations (Countries)
                        </label>
                        <p className="text-xs text-slate-500 mb-3">
                            Select countries you are open to working in. <strong className="font-semibold text-slate-700">Remote roles are always shown worldwide.</strong> Leave empty to see all jobs.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {["US", "IN", "GB", "CA", "AU"].map((country) => {
                                const names: Record<string, string> = { US: "United States", IN: "India", GB: "United Kingdom", CA: "Canada", AU: "Australia" };
                                const isSelected = profile.jobPreferences?.preferredCountries.includes(country) || false;
                                return (
                                    <button
                                        key={country}
                                        type="button"
                                        onClick={() => {
                                            const current = profile.jobPreferences?.preferredCountries || [];
                                            const next = isSelected
                                                ? current.filter(c => c !== country)
                                                : [...current, country];
                                            setProfile({
                                                ...profile,
                                                jobPreferences: { ...profile.jobPreferences!, preferredCountries: next }
                                            });
                                        }}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${isSelected
                                            ? "bg-primary-600 border-primary-600 text-white shadow-sm"
                                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                            }`}
                                    >
                                        {isSelected && "✓ "}{names[country]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Job Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Job Type</label>
                        <div className="flex flex-wrap gap-3">
                            {(["full-time", "contract", "any"] as const).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setProfile({
                                        ...profile,
                                        jobPreferences: { ...profile.jobPreferences!, jobType: type }
                                    })}
                                    className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${profile.jobPreferences?.jobType === type
                                        ? "bg-primary-50 border-primary-600 text-primary-700 shadow-sm"
                                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                >
                                    {type === "full-time" ? "Full-time" : type === "contract" ? "Contract" : "Any"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Professional Bio Section */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">Professional Bio</h2>
                    <p className="text-xs text-slate-500">
                        Auto-generated from your profile. You can add more about yourself below.
                    </p>

                    {/* Auto-generated bio preview */}
                    {autoBio ? (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <p className="text-sm text-slate-700 leading-relaxed">
                                {autoBio}
                                {bioExtra && (
                                    <span className="text-primary-700"> {bioExtra}</span>
                                )}
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <p className="text-sm text-slate-400 italic">
                                Fill in your name, skills, and experience above to auto-generate your bio.
                            </p>
                        </div>
                    )}

                    {/* Extra bio input */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm font-medium text-slate-700">
                                Add more about yourself
                            </label>
                            <span className={`text-xs font-medium ${bioExtraWordCount > BIO_EXTRA_WORD_LIMIT ? "text-red-500" : "text-slate-400"
                                }`}>
                                {bioExtraWordCount}/{BIO_EXTRA_WORD_LIMIT} words
                            </span>
                        </div>
                        <textarea
                            placeholder="E.g. projects you've built, achievements, what you're passionate about..."
                            value={bioExtra}
                            onChange={(e) => {
                                const words = e.target.value.trim().split(/\s+/);
                                if (e.target.value.trim() === "" || words.length <= BIO_EXTRA_WORD_LIMIT) {
                                    setBioExtra(e.target.value);
                                }
                            }}
                            rows={3}
                            className="w-full px-4 py-2.5 text-sm bg-white text-slate-900 placeholder-slate-400 border border-slate-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-primary-500 focus:ring-primary-500/30 resize-none"
                        />
                    </div>
                </div>

                {/* Resume Section */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
                    <h2 className="text-lg font-semibold text-slate-900">Resume</h2>

                    {profile.resumeUrl && (
                        <div className="flex items-center gap-3 p-3 bg-success-100 rounded-xl">
                            <span className="text-success-700 text-sm font-medium">
                                &#10004; Resume uploaded
                            </span>
                            <a
                                href={profile.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                View PDF &rarr;
                            </a>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Upload Resume (PDF, max 5MB)
                        </label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleResumeUpload}
                            className="
                w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-xl file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100
                file:cursor-pointer cursor-pointer
              "
                        />
                    </div>
                </div>

                {/* Gmail Connection Section */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Gmail Account</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Connect your Gmail so outreach emails send directly from your account.
                            </p>
                        </div>
                        {gmailConnected ? (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-success-700 bg-success-100 px-3 py-1.5 rounded-full">
                                ✓ Connected
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                                Not connected
                            </span>
                        )}
                    </div>

                    {gmailConnected ? (
                        <div className="flex items-center gap-3 p-3 bg-success-50 border border-success-200 rounded-xl">
                            <span className="text-lg">✅</span>
                            <div>
                                <p className="text-sm font-medium text-success-800">
                                    Emails will be sent from {profile.email}
                                </p>
                                <p className="text-xs text-success-600 mt-0.5">
                                    Reconnect if sending stops working.
                                </p>
                            </div>
                            <a
                                href="/api/auth/gmail"
                                className="ml-auto text-xs font-semibold text-success-700 hover:text-success-900 underline"
                            >
                                Reconnect
                            </a>
                        </div>
                    ) : (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <span className="text-xl mt-0.5">📧</span>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-amber-800">
                                    Connect your Gmail to send emails
                                </p>
                                <p className="text-xs text-amber-600 mt-1">
                                    You&apos;ll be redirected to Google to grant send-only permission.
                                    We only request <code className="bg-amber-100 px-1 rounded">gmail.send</code> access.
                                </p>
                            </div>
                            <a
                                href="/api/auth/gmail"
                                className="shrink-0 px-4 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors"
                            >
                                Connect Gmail →
                            </a>
                        </div>
                    )}
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={saving}
                    className="w-full sm:w-auto"
                >
                    Save Profile
                </Button>
            </form>
        </div>
    );
}
