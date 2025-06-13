# SOS Store Manager - Ultra-Lean MVP (2 Weeks)

## Core Value Proposition
**"Ask your store anything, get instant answers"**

## MVP = One Feature Done Well
### The ONLY Feature: Natural Language Q&A
- User types: "What were my sales yesterday?"
- App returns: "You had 23 orders totaling $1,847 yesterday"
- That's it. Ship it.

## Technical Stack (Minimal)
```
Gadget.dev (handles everything)
├── Shopify OAuth (built-in)
├── Database (automatic)
├── Hosting (included)
└── Webhooks (pre-configured)

+ OpenAI API (for NLP)
+ Shopify Polaris (UI components)
```

## 2-Week Sprint Plan

### Week 1: Build Core
**Day 1-2: Setup**
- Create Gadget.dev app
- Connect Shopify OAuth
- Import store data (orders, products, customers)

**Day 3-4: AI Integration**
- Connect OpenAI API
- Create simple prompt template:
  ```
  "You are a Shopify store assistant. 
  Store data: {context}
  Question: {user_question}
  Answer concisely with specific numbers."
  ```

**Day 5: Basic UI**
- One screen: Question box + Answer area
- Use Polaris components (TextBox, Card)
- Mobile responsive by default

### Week 2: Ship It
**Day 6-7: Core Queries**
- Implement 10 most common questions:
  1. Sales today/yesterday/this week/month
  2. Top products
  3. Order count
  4. Customer count
  5. Average order value
  6. Revenue trends
  7. Best customer
  8. Inventory levels
  9. Pending orders
  10. Recent orders

**Day 8-9: Polish**
- Error handling
- Loading states
- Example questions
- Basic help text

**Day 10: Launch**
- Deploy to production
- Submit to Shopify App Store
- Start collecting feedback

## Scope Cuts (Do Later)
- ❌ Dashboard (just Q&A)
- ❌ Voice input (just text)
- ❌ Daily emails (manual check only)
- ❌ Fancy analytics (just answers)
- ❌ Multiple pages (single screen)
- ❌ User accounts (Shopify handles it)
- ❌ Custom settings (works out of box)
- ❌ Webhooks beyond basic sync

## UI Mockup (ASCII)
```
┌─────────────────────────────────────┐
│  SOS Store Manager                  │
├─────────────────────────────────────┤
│                                     │
│  💬 Ask anything about your store   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ What were my sales today?    │   │
│  └─────────────────────────────┘   │
│         [Ask Question]              │
│                                     │
│  📊 Answer:                         │
│  ┌─────────────────────────────┐   │
│  │ You had 12 orders today      │   │
│  │ totaling $487.50             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Try asking:                        │
│  • What's my best selling product?  │
│  • How many customers do I have?    │
│  • Show me yesterday's revenue      │
│                                     │
└─────────────────────────────────────┘
```

## Code Structure (Minimal)
```
/routes
  /index.jsx (the only page)
/api  
  /ask.js (handles questions)
/utils
  /shopify.js (data fetching)
  /ai.js (OpenAI integration)
```

## Launch Checklist (10 Items)
1. [ ] OAuth works
2. [ ] Data syncs from Shopify
3. [ ] Questions get answered
4. [ ] Errors show friendly messages
5. [ ] Mobile layout works
6. [ ] Example questions help users
7. [ ] Loading spinner shows
8. [ ] Shopify Polaris styling applied
9. [ ] Basic rate limiting (10 questions/minute)
10. [ ] Privacy policy link added

## Pricing (Dead Simple)
```
FREE forever up to 50 questions/month
$19/month unlimited questions
(Add fancier tiers later)
```

## Success Metrics (Keep it Simple)
- Install count
- Questions asked per user
- % questions answered successfully
- User comes back next day

## Post-MVP Iterations (After Feedback)
**Week 3-4**: Add based on user requests
- Maybe a dashboard
- Maybe voice input  
- Maybe email summaries
- Maybe more data types

**Don't build it until users ask for it**

## Development Principles
1. **One feature, done well**
2. **Ship in 2 weeks, not 2 months**
3. **Real user feedback > Perfect planning**
4. **Working app > Complete documentation**
5. **Simple > Clever**

## Quick Start Commands
```bash
# Day 1
npm create gadget-app@latest sos-store-manager
cd sos-store-manager
npm install @shopify/polaris openai

# Create these 3 files and you're 80% done:
# 1. /routes/index.jsx (UI)
# 2. /api/ask.js (question handler)
# 3. /utils/ai.js (OpenAI caller)
```

## The Entire Business Logic
```javascript
// This is basically your whole app:
async function answerQuestion(question, storeData) {
  const prompt = `
    Store: ${storeData.name}
    Orders: ${JSON.stringify(storeData.recentOrders)}
    Products: ${JSON.stringify(storeData.topProducts)}
    Stats: ${JSON.stringify(storeData.stats)}
    
    Question: ${question}
    Answer (be specific with numbers):
  `;
  
  const response = await openai.complete(prompt);
  return response.text;
}
```

---

**That's it. Stop planning. Start building. Ship in 2 weeks.**