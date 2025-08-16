# AI Contact Suggestions - Data Sources Guide

## 🔍 **Current Implementation: Mock Data**

### **Where Names Come From (Current)**
The AI Contact Suggestions system is currently using **hardcoded mock data** in the component:

```typescript
// From: src/components/AIContactSuggestions.tsx
const mockSuggestions: ContactSuggestion[] = [
  {
    id: '1',
    name: 'Sarah Johnson',           // ← HARDCODED
    role: 'Senior Recruiter',        // ← HARDCODED
    company: 'TechCorp Solutions',   // ← HARDCODED
    connectionStrength: 'high',
    suggestedAction: 'email',
    reason: 'Actively hiring for roles matching your skills',
    successProbability: 85
  },
  {
    id: '2',
    name: 'Michael Chen',            // ← HARDCODED
    role: 'Engineering Manager',     // ← HARDCODED
    company: 'InnovateTech',         // ← HARDCODED
    // ... more mock data
  }
]
```

### **Why Mock Data?**
- **Demonstration purposes** - Shows the UI and functionality
- **Development phase** - Real data integration planned
- **Testing interface** - Validates user experience
- **Feature preview** - Allows users to see the concept

## 🗄️ **Available Real Data Sources**

### **1. Recruiters Table** (`public.recruiters`)
```sql
-- Structure from database
CREATE TABLE public.recruiters (
    user_id UUID PRIMARY KEY REFERENCES public.users(id),
    company_name TEXT,        -- ← Real company names
    industry TEXT,            -- ← Real industry data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Sample Data Available:**
- **Ananya Kapoor** at **TechCorp India** (Technology industry)

### **2. Users Table** (`public.users`)
```sql
-- Contains all user profiles
-- Fields: id, email, name, phone, role
```

**Current Users in Database:**
- **6 users** total in the system
- **1 recruiter**: Ananya Kapoor
- **2 veterans**: Col. Raghav Mehta (Retd.), Lt. Priya Singh (Retd.)
- **1 supporter**: Amit Sharma
- **1 admin**: Admin User

### **3. Supporters Table** (`public.supporters`)
```sql
-- Network contacts who can make referrals
CREATE TABLE public.supporters (
    user_id UUID PRIMARY KEY REFERENCES public.users(id),
    intro TEXT,               -- ← Professional introduction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 **Real Data Integration Implementation**

### **New Server Action Created**
I've created `src/lib/actions/contact-suggestions.ts` that:

1. **Fetches real recruiters** from the database
2. **Analyzes skill matches** between veteran and recruiter industries
3. **Calculates location compatibility**
4. **Generates personalized reasons** for connections
5. **Ranks suggestions** by success probability

### **How Real Data Would Work**

```typescript
// Instead of mock data, the system would:
const { data: recruiters } = await supabase
  .from('recruiters')
  .select(`
    user_id,
    company_name,        // ← Real company names
    industry,            // ← Real industry data
    users!inner (
      name,              // ← Real recruiter names
      email,
      role
    )
  `)
  .eq('users.role', 'recruiter')
```

### **Intelligent Matching Algorithm**

The system analyzes:
- **Skill Match**: Compares veteran skills with recruiter industry
- **Location Match**: Geographic compatibility
- **Industry Relevance**: How well skills align with company needs
- **Success Probability**: Calculated based on multiple factors

## 📊 **Data Flow Architecture**

### **Current Flow (Mock)**
```
User visits dashboard → Component loads → Mock data displayed
```

### **Future Flow (Real Data)**
```
User visits dashboard → Server action called → Database queried → 
Real recruiters fetched → Skill matching algorithm → 
Personalized suggestions generated → Displayed to user
```

## 🔮 **Future Data Sources**

### **1. External APIs**
- **LinkedIn API**: Real professional connections
- **Company databases**: Active hiring information
- **Industry databases**: Market trends and opportunities

### **2. User-Generated Data**
- **Network connections**: User's professional network
- **Referral history**: Past successful connections
- **Feedback data**: Success/failure rates

### **3. AI-Enhanced Data**
- **Market intelligence**: Real-time hiring trends
- **Company insights**: Active recruitment status
- **Skill demand**: Current market needs

## 🎯 **Benefits of Real Data Integration**

### **For Veterans**
- **Real opportunities**: Actual hiring companies
- **Personalized matches**: Based on their specific skills
- **Higher success rates**: Data-driven recommendations

### **For Recruiters**
- **Quality candidates**: Pre-screened veterans
- **Better matches**: Skill-aligned suggestions
- **Efficient hiring**: Reduced time-to-hire

### **For Platform**
- **Better engagement**: Real value for users
- **Data insights**: Learn from successful matches
- **Network growth**: Organic user acquisition

## 🔧 **Implementation Steps**

### **Phase 1: Database Integration** ✅
- [x] Create server action for real data
- [x] Implement skill matching algorithm
- [x] Add location compatibility logic

### **Phase 2: UI Integration**
- [ ] Update component to use real data
- [ ] Add loading states for data fetching
- [ ] Implement error handling

### **Phase 3: AI Enhancement**
- [ ] Integrate with OpenAI for intelligent suggestions
- [ ] Add market intelligence data
- [ ] Implement learning from outcomes

### **Phase 4: Advanced Features**
- [ ] Real-time updates
- [ ] Predictive analytics
- [ ] Success tracking

## 📈 **Current Status**

- **Mock Data**: ✅ Working (for demonstration)
- **Real Data Integration**: ✅ Code ready
- **Database Queries**: ✅ Implemented
- **UI Integration**: 🔄 Ready to implement
- **AI Enhancement**: 🔄 Planned

## 🎉 **Summary**

The AI Contact Suggestions system currently uses **hardcoded mock data** for demonstration purposes, but the **infrastructure is ready** for real data integration. The system can pull from:

1. **Real recruiters** in the database
2. **Actual user profiles** and connections
3. **Industry and skill matching** algorithms
4. **Personalized recommendations** based on veteran profiles

The transition from mock to real data is **straightforward** and will provide veterans with **genuine networking opportunities** with actual hiring companies and recruiters! 🚀
