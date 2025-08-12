# 🎯 AI-POWERED SUGGESTIONS & NUDGES SYSTEM

## **🎯 OVERVIEW**
The **AI-Powered Suggestions & Nudges System** is a comprehensive intelligent system that helps all user types achieve their goals by providing personalized suggestions, smart nudges, and actionable recommendations based on their behavior, goals, and platform usage.

## **🎯 USER TYPES & GOALS**

### **1. VETERANS**
**Primary Goals:**
- ✅ **Find job opportunities** - Get hired by recruiters
- ✅ **Build professional network** - Connect with industry professionals
- ✅ **Improve pitch visibility** - Get more views and engagement
- ✅ **Enhance skills** - Develop marketable competencies
- ✅ **Get endorsements** - Build credibility through recommendations

### **2. RECRUITERS**
**Primary Goals:**
- ✅ **Find quality candidates** - Hire the best veterans
- ✅ **Fill positions quickly** - Reduce time-to-hire
- ✅ **Build talent pipeline** - Maintain candidate database
- ✅ **Improve hiring success** - Better candidate-job matches
- ✅ **Network with veterans** - Build relationships

### **3. SUPPORTERS**
**Primary Goals:**
- ✅ **Support veterans** - Help veterans succeed
- ✅ **Make meaningful impact** - Contribute to veteran success
- ✅ **Build community** - Connect with other supporters
- ✅ **Track impact** - See results of their support
- ✅ **Stay engaged** - Regular participation

## **🎯 AI SUGGESTIONS SYSTEM**

### **1. VETERAN SUGGESTIONS**
```typescript
// 🔄 NEW - Veteran AI Suggestions System
const VeteranSuggestions = ({ veteranId }) => {
  const [suggestions, setSuggestions] = useState([])
  const [goals, setGoals] = useState([])
  
  useEffect(() => {
    generateVeteranSuggestions()
  }, [veteranId])
  
  const generateVeteranSuggestions = async () => {
    const { data: veteranProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', veteranId)
      .single()
    
    const { data: pitchData } = await supabase
      .from('pitches')
      .select('*')
      .eq('user_id', veteranId)
    
    const { data: activityData } = await supabase
      .from('user_activity_log')
      .select('*')
      .eq('user_id', veteranId)
      .order('created_at', { ascending: false })
      .limit(50)
    
    const suggestions = await aiGenerateVeteranSuggestions({
      profile: veteranProfile,
      pitches: pitchData,
      activity: activityData
    })
    
    setSuggestions(suggestions)
  }
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Career Suggestions</h3>
      
      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                suggestion.priority === 'high' ? 'bg-red-100 text-red-600' :
                suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                'bg-green-100 text-green-600'
              }`}>
                {suggestion.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  {suggestion.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {suggestion.description}
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleSuggestionAction(suggestion)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                  >
                    {suggestion.actionText}
                  </button>
                  <button 
                    onClick={() => dismissSuggestion(suggestion.id)}
                    className="px-3 py-1 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// AI Suggestion Generation for Veterans
const aiGenerateVeteranSuggestions = async (data) => {
  const suggestions = []
  
  // Profile Completion Suggestions
  if (!data.profile.photo_url) {
    suggestions.push({
      id: 'profile-photo',
      title: 'Add a Professional Photo',
      description: 'Veterans with profile photos get 3x more recruiter views',
      priority: 'high',
      icon: '📸',
      actionText: 'Upload Photo',
      action: 'upload_photo'
    })
  }
  
  if (!data.profile.linkedin_url) {
    suggestions.push({
      id: 'linkedin-profile',
      title: 'Connect Your LinkedIn',
      description: 'LinkedIn profiles increase credibility and networking opportunities',
      priority: 'medium',
      icon: '💼',
      actionText: 'Add LinkedIn',
      action: 'add_linkedin'
    })
  }
  
  // Pitch Optimization Suggestions
  if (data.pitches && data.pitches.length > 0) {
    const pitch = data.pitches[0]
    
    if (pitch.likes_count < 5) {
      suggestions.push({
        id: 'pitch-engagement',
        title: 'Boost Your Pitch Visibility',
        description: 'Your pitch has low engagement. Consider updating it with more specific skills',
        priority: 'medium',
        icon: '📈',
        actionText: 'Update Pitch',
        action: 'update_pitch'
      })
    }
    
    if (!pitch.resume_url) {
      suggestions.push({
        id: 'upload-resume',
        title: 'Upload Your Resume',
        description: 'Resumes increase your chances of getting hired by 5x',
        priority: 'high',
        icon: '📄',
        actionText: 'Upload Resume',
        action: 'upload_resume'
      })
    }
  }
  
  // Networking Suggestions
  const recentConnections = data.activity?.filter(a => a.action === 'connect_with_recruiter').length || 0
  if (recentConnections < 3) {
    suggestions.push({
      id: 'network-expansion',
      title: 'Expand Your Network',
      description: 'Connect with more recruiters to increase job opportunities',
      priority: 'medium',
      icon: '🤝',
      actionText: 'Find Recruiters',
      action: 'find_recruiters'
    })
  }
  
  // Skill Development Suggestions
  const skillGaps = await analyzeSkillGaps(data.profile.skills, data.activity)
  if (skillGaps.length > 0) {
    suggestions.push({
      id: 'skill-development',
      title: 'Develop In-Demand Skills',
      description: `Consider learning: ${skillGaps.slice(0, 3).join(', ')}`,
      priority: 'medium',
      icon: '🎯',
      actionText: 'View Skills',
      action: 'view_skills'
    })
  }
  
  return suggestions
}
```

### **2. RECRUITER SUGGESTIONS**
```typescript
// 🔄 NEW - Recruiter AI Suggestions System
const RecruiterSuggestions = ({ recruiterId }) => {
  const [suggestions, setSuggestions] = useState([])
  
  useEffect(() => {
    generateRecruiterSuggestions()
  }, [recruiterId])
  
  const generateRecruiterSuggestions = async () => {
    const { data: recruiterProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', recruiterId)
      .single()
    
    const { data: hiringData } = await supabase
      .from('hiring_activities')
      .select('*')
      .eq('recruiter_id', recruiterId)
    
    const { data: candidateData } = await supabase
      .from('candidate_interactions')
      .select('*')
      .eq('recruiter_id', recruiterId)
    
    const suggestions = await aiGenerateRecruiterSuggestions({
      profile: recruiterProfile,
      hiring: hiringData,
      candidates: candidateData
    })
    
    setSuggestions(suggestions)
  }
  
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Hiring Suggestions</h3>
      
      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                suggestion.priority === 'high' ? 'bg-red-100 text-red-600' :
                suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                'bg-green-100 text-green-600'
              }`}>
                {suggestion.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  {suggestion.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {suggestion.description}
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleSuggestionAction(suggestion)}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
                  >
                    {suggestion.actionText}
                  </button>
                  <button 
                    onClick={() => dismissSuggestion(suggestion.id)}
                    className="px-3 py-1 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// AI Suggestion Generation for Recruiters
const aiGenerateRecruiterSuggestions = async (data) => {
  const suggestions = []
  
  // Profile Optimization
  if (!data.profile.company_description) {
    suggestions.push({
      id: 'company-profile',
      title: 'Complete Company Profile',
      description: 'Detailed company profiles attract 2x more veteran applications',
      priority: 'high',
      icon: '🏢',
      actionText: 'Add Details',
      action: 'add_company_details'
    })
  }
  
  // Active Hiring Suggestions
  const activePositions = data.hiring?.filter(h => h.status === 'active').length || 0
  if (activePositions === 0) {
    suggestions.push({
      id: 'post-position',
      title: 'Post a Job Position',
      description: 'Start hiring veterans by posting your first position',
      priority: 'high',
      icon: '📋',
      actionText: 'Post Job',
      action: 'post_job'
    })
  }
  
  // Candidate Engagement
  const recentInteractions = data.candidates?.filter(c => 
    new Date(c.last_interaction) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length || 0
  
  if (recentInteractions < 5) {
    suggestions.push({
      id: 'engage-candidates',
      title: 'Engage with More Candidates',
      description: 'Active engagement increases your hiring success rate',
      priority: 'medium',
      icon: '💬',
      actionText: 'Browse Candidates',
      action: 'browse_candidates'
    })
  }
  
  // Skill-Based Hiring
  const skillMatches = await findSkillMatches(data.hiring)
  if (skillMatches.length > 0) {
    suggestions.push({
      id: 'skill-matches',
      title: 'Perfect Matches Available',
      description: `${skillMatches.length} veterans match your current job requirements`,
      priority: 'medium',
      icon: '🎯',
      actionText: 'View Matches',
      action: 'view_matches'
    })
  }
  
  return suggestions
}
```

### **3. SUPPORTER SUGGESTIONS**
```typescript
// 🔄 NEW - Supporter AI Suggestions System
const SupporterSuggestions = ({ supporterId }) => {
  const [suggestions, setSuggestions] = useState([])
  
  useEffect(() => {
    generateSupporterSuggestions()
  }, [supporterId])
  
  const generateSupporterSuggestions = async () => {
    const { data: supporterProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', supporterId)
      .single()
    
    const { data: supportHistory } = await supabase
      .from('support_activities')
      .select('*')
      .eq('supporter_id', supporterId)
    
    const { data: impactData } = await supabase
      .from('supporter_impact')
      .select('*')
      .eq('supporter_id', supporterId)
    
    const suggestions = await aiGenerateSupporterSuggestions({
      profile: supporterProfile,
      history: supportHistory,
      impact: impactData
    })
    
    setSuggestions(suggestions)
  }
  
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Support Suggestions</h3>
      
      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                suggestion.priority === 'high' ? 'bg-red-100 text-red-600' :
                suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                'bg-green-100 text-green-600'
              }`}>
                {suggestion.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  {suggestion.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {suggestion.description}
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleSuggestionAction(suggestion)}
                    className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700"
                  >
                    {suggestion.actionText}
                  </button>
                  <button 
                    onClick={() => dismissSuggestion(suggestion.id)}
                    className="px-3 py-1 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// AI Suggestion Generation for Supporters
const aiGenerateSupporterSuggestions = async (data) => {
  const suggestions = []
  
  // Profile Completion
  if (!data.profile.motivation) {
    suggestions.push({
      id: 'add-motivation',
      title: 'Share Your Motivation',
      description: 'Tell us why you support veterans - it inspires others',
      priority: 'medium',
      icon: '💝',
      actionText: 'Add Story',
      action: 'add_motivation'
    })
  }
  
  // Support Variety
  const supportTypes = new Set(data.history?.map(h => h.support_type))
  if (supportTypes.size < 2) {
    suggestions.push({
      id: 'diversify-support',
      title: 'Try Different Ways to Support',
      description: 'Explore endorsements, referrals, or donations to maximize your impact',
      priority: 'medium',
      icon: '🌟',
      actionText: 'Explore Options',
      action: 'explore_support'
    })
  }
  
  // Regular Engagement
  const lastActivity = data.history?.[0]?.created_at
  if (lastActivity && new Date(lastActivity) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
    suggestions.push({
      id: 'stay-engaged',
      title: 'Stay Connected',
      description: 'Regular engagement helps veterans succeed and builds community',
      priority: 'high',
      icon: '🤝',
      actionText: 'Get Active',
      action: 'get_active'
    })
  }
  
  // Impact Tracking
  if (!data.impact?.last_impact_report) {
    suggestions.push({
      id: 'track-impact',
      title: 'See Your Impact',
      description: 'View how your support has helped veterans succeed',
      priority: 'medium',
      icon: '📊',
      actionText: 'View Impact',
      action: 'view_impact'
    })
  }
  
  return suggestions
}
```

## **🎯 SMART NUDGES SYSTEM**

### **1. BEHAVIORAL NUDGES**
```typescript
// 🔄 NEW - Behavioral Nudges System
const BehavioralNudges = ({ userId, userType }) => {
  const [nudges, setNudges] = useState([])
  
  useEffect(() => {
    generateBehavioralNudges()
  }, [userId, userType])
  
  const generateBehavioralNudges = async () => {
    const { data: userBehavior } = await supabase
      .from('user_behavior_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)
    
    const nudges = await aiGenerateBehavioralNudges({
      userId,
      userType,
      behavior: userBehavior
    })
    
    setNudges(nudges)
  }
  
  return (
    <div className="space-y-3">
      {nudges.map((nudge) => (
        <div key={nudge.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-l-4 border-yellow-400">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{nudge.icon}</div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                {nudge.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {nudge.message}
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleNudgeAction(nudge)}
                  className="px-3 py-1 bg-yellow-600 text-white text-xs rounded-lg hover:bg-yellow-700"
                >
                  {nudge.actionText}
                </button>
                <button 
                  onClick={() => snoozeNudge(nudge.id)}
                  className="px-3 py-1 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50"
                >
                  Remind Later
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// AI Behavioral Nudge Generation
const aiGenerateBehavioralNudges = async (data) => {
  const nudges = []
  
  // Inactivity Nudges
  const lastActivity = data.behavior?.[0]?.created_at
  if (lastActivity && new Date(lastActivity) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) {
    nudges.push({
      id: 'inactivity-reminder',
      title: 'We Miss You!',
      message: 'Great opportunities await. Come back and check out new veteran pitches.',
      icon: '👋',
      actionText: 'Browse Now',
      action: 'browse_pitches',
      priority: 'high'
    })
  }
  
  // Goal Achievement Nudges
  const userGoals = await getUserGoals(data.userId)
  const achievedGoals = userGoals.filter(g => g.achieved)
  const pendingGoals = userGoals.filter(g => !g.achieved)
  
  if (pendingGoals.length > 0) {
    const nextGoal = pendingGoals[0]
    nudges.push({
      id: 'goal-reminder',
      title: 'Goal Progress',
      message: `You're ${nextGoal.progress}% towards "${nextGoal.title}". Keep going!`,
      icon: '🎯',
      actionText: 'View Goals',
      action: 'view_goals',
      priority: 'medium'
    })
  }
  
  // Social Proof Nudges
  const similarUsers = await findSimilarUsers(data.userId, data.userType)
  if (similarUsers.length > 0) {
    const topPerformer = similarUsers[0]
    nudges.push({
      id: 'social-proof',
      title: 'Success Story',
      message: `${topPerformer.name} achieved great results. You can too!`,
      icon: '🏆',
      actionText: 'Learn More',
      action: 'view_success_story',
      priority: 'low'
    })
  }
  
  return nudges
}
```

### **2. CONTEXTUAL NUDGES**
```typescript
// 🔄 NEW - Contextual Nudges System
const ContextualNudges = ({ context, userId }) => {
  const [contextualNudges, setContextualNudges] = useState([])
  
  useEffect(() => {
    generateContextualNudges()
  }, [context, userId])
  
  const generateContextualNudges = async () => {
    const nudges = await aiGenerateContextualNudges({
      context,
      userId,
      currentPage: window.location.pathname,
      userSession: await getCurrentSession()
    })
    
    setContextualNudges(nudges)
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {contextualNudges.map((nudge) => (
        <div key={nudge.id} className="bg-white rounded-lg shadow-lg p-4 max-w-sm border-l-4 border-blue-400">
          <div className="flex items-start gap-3">
            <div className="text-xl">{nudge.icon}</div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                {nudge.title}
              </h4>
              <p className="text-xs text-gray-600 mb-2">
                {nudge.message}
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleContextualAction(nudge)}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  {nudge.actionText}
                </button>
                <button 
                  onClick={() => dismissContextualNudge(nudge.id)}
                  className="px-2 py-1 text-gray-400 text-xs hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// AI Contextual Nudge Generation
const aiGenerateContextualNudges = async (data) => {
  const nudges = []
  
  // Page-Specific Nudges
  if (data.currentPage.includes('/pitch/')) {
    const pitchId = data.currentPage.split('/').pop()
    const pitch = await getPitchDetails(pitchId)
    
    if (data.context.userType === 'recruiter') {
      nudges.push({
        id: 'pitch-contact',
        title: 'Interested in this veteran?',
        message: 'This veteran has skills that match your requirements.',
        icon: '💼',
        actionText: 'Contact Now',
        action: 'contact_veteran',
        priority: 'high'
      })
    }
    
    if (data.context.userType === 'supporter') {
      nudges.push({
        id: 'pitch-endorse',
        title: 'Support this veteran',
        message: 'Your endorsement can help this veteran get hired.',
        icon: '⭐',
        actionText: 'Endorse',
        action: 'endorse_veteran',
        priority: 'medium'
      })
    }
  }
  
  // Time-Based Nudges
  const hour = new Date().getHours()
  if (hour >= 9 && hour <= 17) {
    nudges.push({
      id: 'peak-activity',
      title: 'Peak Activity Time',
      message: 'More recruiters are active now. Great time to engage!',
      icon: '⏰',
      actionText: 'Browse Now',
      action: 'browse_active',
      priority: 'medium'
    })
  }
  
  // Session-Based Nudges
  const sessionDuration = data.userSession?.duration || 0
  if (sessionDuration > 10 * 60 * 1000) { // 10 minutes
    nudges.push({
      id: 'session-break',
      title: 'Take a Break',
      message: 'You\'ve been active for a while. Consider saving your progress.',
      icon: '☕',
      actionText: 'Save Progress',
      action: 'save_progress',
      priority: 'low'
    })
  }
  
  return nudges
}
```

## **🎯 GOAL ACHIEVEMENT SYSTEM**

### **1. SMART GOALS**
```typescript
// 🔄 NEW - Smart Goals System
const SmartGoals = ({ userId, userType }) => {
  const [goals, setGoals] = useState([])
  const [progress, setProgress] = useState({})
  
  useEffect(() => {
    loadUserGoals()
  }, [userId])
  
  const loadUserGoals = async () => {
    const { data: userGoals } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
    
    const { data: goalProgress } = await supabase
      .from('goal_progress')
      .select('*')
      .eq('user_id', userId)
    
    setGoals(userGoals || [])
    setProgress(goalProgress || {})
  }
  
  const createSmartGoal = async (goalData) => {
    const smartGoal = await aiGenerateSmartGoal({
      userId,
      userType,
      goalData,
      currentProgress: progress
    })
    
    const { data, error } = await supabase
      .from('user_goals')
      .insert(smartGoal)
      .select()
    
    if (!error) {
      setGoals([...goals, data[0]])
    }
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Your Goals</h3>
      
      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{goal.title}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${
                goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                goal.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {goal.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
            
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => updateGoalProgress(goal.id)}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
              >
                Update Progress
              </button>
              <button 
                onClick={() => viewGoalDetails(goal.id)}
                className="px-3 py-1 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
        
        <button 
          onClick={() => showGoalCreationModal()}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600"
        >
          + Create New Goal
        </button>
      </div>
    </div>
  )
}

// AI Smart Goal Generation
const aiGenerateSmartGoal = async (data) => {
  const { userType, goalData, currentProgress } = data
  
  let smartGoal = {
    user_id: data.userId,
    title: goalData.title,
    description: goalData.description,
    target_value: goalData.target,
    current_value: 0,
    progress: 0,
    status: 'active',
    deadline: goalData.deadline,
    milestones: [],
    suggestions: []
  }
  
  // Generate milestones based on goal type
  if (userType === 'veteran') {
    smartGoal.milestones = generateVeteranMilestones(goalData)
  } else if (userType === 'recruiter') {
    smartGoal.milestones = generateRecruiterMilestones(goalData)
  } else if (userType === 'supporter') {
    smartGoal.milestones = generateSupporterMilestones(goalData)
  }
  
  // Generate AI suggestions for goal achievement
  smartGoal.suggestions = await generateGoalSuggestions(smartGoal)
  
  return smartGoal
}
```

## **🎯 DATABASE SCHEMA**

### **1. SUGGESTIONS & NUDGES TABLES**
```sql
-- 🔄 NEW - AI Suggestions table
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  user_type VARCHAR(50) NOT NULL, -- 'veteran', 'recruiter', 'supporter'
  suggestion_type VARCHAR(50) NOT NULL, -- 'profile', 'engagement', 'skill', 'network'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL, -- 'high', 'medium', 'low'
  icon VARCHAR(10),
  action_text VARCHAR(100),
  action_type VARCHAR(50),
  action_data JSONB,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_at timestamptz,
  is_completed BOOLEAN DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- 🔄 NEW - Behavioral Nudges table
CREATE TABLE IF NOT EXISTS behavioral_nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  nudge_type VARCHAR(50) NOT NULL, -- 'inactivity', 'goal', 'social_proof', 'achievement'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  icon VARCHAR(10),
  action_text VARCHAR(100),
  action_type VARCHAR(50),
  action_data JSONB,
  priority VARCHAR(20) NOT NULL,
  is_snoozed BOOLEAN DEFAULT false,
  snoozed_until timestamptz,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- 🔄 NEW - User Goals table
CREATE TABLE IF NOT EXISTS user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  goal_type VARCHAR(50) NOT NULL, -- 'career', 'network', 'skill', 'impact'
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
  deadline timestamptz,
  milestones JSONB,
  suggestions JSONB,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 🔄 NEW - Goal Progress tracking
CREATE TABLE IF NOT EXISTS goal_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  goal_id uuid NOT NULL REFERENCES user_goals(id),
  progress_value INTEGER NOT NULL,
  progress_percentage INTEGER NOT NULL,
  milestone_achieved VARCHAR(100),
  notes TEXT,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 🔄 NEW - User Behavior Analytics
CREATE TABLE IF NOT EXISTS user_behavior_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL, -- 'login', 'browse', 'contact', 'endorse', 'donate'
  action_data JSONB,
  session_duration INTEGER, -- in seconds
  page_visited VARCHAR(255),
  time_spent INTEGER, -- in seconds
  created_at timestamptz NOT NULL DEFAULT now()
);
```

## **🎯 SUCCESS METRICS**

### **User Engagement Success:**
- ✅ **Increased activity** - More logins and interactions
- ✅ **Goal achievement** - Higher goal completion rates
- ✅ **Feature adoption** - More users try new features
- ✅ **Retention improvement** - Users stay engaged longer
- ✅ **Satisfaction increase** - Better user experience

### **Business Success:**
- ✅ **Veteran success** - More veterans get hired
- ✅ **Recruiter satisfaction** - Better hiring outcomes
- ✅ **Supporter engagement** - More active support
- ✅ **Platform growth** - Increased user activity
- ✅ **Revenue impact** - More premium features used

---

## **🎯 CONCLUSION**

### **KEY MESSAGE:**
**"AI-powered suggestions and nudges that help all users achieve their goals and maximize their success"**

### **WHAT THIS MEANS:**
1. **Personalized guidance** - AI-driven suggestions for each user type
2. **Goal achievement** - Smart goals with progress tracking
3. **Behavioral optimization** - Nudges based on user behavior
4. **Contextual relevance** - Suggestions at the right time and place
5. **Success acceleration** - Faster goal achievement and better outcomes

### **BENEFITS:**
- ✅ **User success** - All users achieve their goals faster
- ✅ **Platform engagement** - Higher user activity and retention
- ✅ **Business growth** - More successful outcomes for all parties
- ✅ **Data-driven insights** - Better understanding of user needs
- ✅ **Continuous improvement** - AI learns and gets better over time

**🎯 The AI-Powered Suggestions & Nudges System will help all users achieve their goals and maximize their success on the platform!**

**Ready to implement the comprehensive AI suggestions and nudges system?**
