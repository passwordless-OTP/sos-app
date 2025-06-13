# SOS Store Manager - MVP Definition & Plan

## MVP Vision Statement
**"An AI-powered assistant that answers store owners' questions about their Shopify data in plain English, providing instant insights through a simple dashboard."**

## MVP Scope Definition

### ✅ IN SCOPE for MVP (4-6 weeks)

#### Core Features
1. **Natural Language Query Engine**
   - Text-based questions about store data
   - Pre-built question templates
   - Example: "What were my sales last month?" → Returns formatted answer with data

2. **Essential Analytics Dashboard**
   - Today's snapshot (revenue, orders, visitors)
   - 7-day and 30-day trends
   - Top 5 products and customers
   - Mobile-responsive design using Polaris

3. **AI-Powered Insights**
   - Daily automated summary (sent via webhook/email)
   - Anomaly detection (unusual sales spikes/drops)
   - Simple recommendations (e.g., "Stock running low on Product X")

4. **Basic Voice Input** (Secondary Interface)
   - Web Speech API integration
   - Voice-to-text for queries only
   - Visual confirmation of interpreted text

5. **Authentication & Onboarding**
   - OAuth 2.0 Shopify integration
   - 3-step onboarding wizard
   - Permission request (read-only for MVP)

### ❌ NOT IN SCOPE for MVP (Future Releases)

- IP blocking and traffic management
- Cloudflare integration
- Device fingerprinting
- Advanced fraud detection
- Custom reporting builder
- Team collaboration features
- White-label options
- API access for users
- Multi-language support
- Advanced voice features (voice responses)

## Technical Architecture (MVP)

### Stack
- **Platform**: Gadget.dev
- **Frontend**: React with Shopify Polaris
- **AI/LLM**: OpenAI GPT-4 or Claude API
- **Voice**: Web Speech API (browser-based)
- **Database**: Gadget.dev managed PostgreSQL
- **Analytics**: Mixpanel or Amplitude (free tier)

### Shopify API Usage (MVP)
```
Required Scopes:
- read_products
- read_orders  
- read_customers
- read_analytics
- read_reports
- read_inventory

Primary APIs:
- GraphQL Admin API (for complex queries)
- Webhooks (for real-time updates)
```

## MVP Feature Set (Prioritized)

### Week 1-2: Foundation
| Feature | Description | Priority | Effort |
|---------|-------------|----------|--------|
| Shopify OAuth | Secure app installation | P0 | 3 days |
| Basic Dashboard | Polaris-based UI with key metrics | P0 | 3 days |
| Data Sync | Initial store data import | P0 | 2 days |
| Webhook Setup | Real-time order/product updates | P0 | 2 days |

### Week 3-4: AI Integration
| Feature | Description | Priority | Effort |
|---------|-------------|----------|--------|
| LLM Integration | Connect OpenAI/Claude API | P0 | 2 days |
| Query Parser | Natural language → API calls | P0 | 3 days |
| Response Formatter | Data → Human-readable answers | P0 | 2 days |
| Question Templates | Pre-built common questions | P1 | 2 days |
| Error Handling | Graceful fallbacks | P0 | 1 day |

### Week 5-6: Polish & Launch
| Feature | Description | Priority | Effort |
|---------|-------------|----------|--------|
| Voice Input | Web Speech API integration | P1 | 2 days |
| Daily Insights | Automated summary generation | P1 | 2 days |
| Mobile Optimization | Responsive dashboard | P0 | 2 days |
| Onboarding Flow | First-time user experience | P0 | 2 days |
| Help Documentation | Basic user guide | P0 | 2 days |

## MVP User Journey

```
1. DISCOVERY
   ↓
   Shopify App Store → App listing page
   
2. INSTALLATION
   ↓
   One-click install → OAuth consent → Welcome screen
   
3. ONBOARDING (3 steps)
   ↓
   Step 1: "Hi! I'm your AI store assistant"
   Step 2: "Ask me anything about your store"
   Step 3: "Try asking: 'What were my sales yesterday?'"
   
4. FIRST VALUE
   ↓
   User asks question → Gets instant answer
   Dashboard shows key metrics
   
5. HABIT FORMATION
   ↓
   Daily insight email
   Quick voice queries
   Regular dashboard checks
```

## MVP Metrics & Success Criteria

### Primary Metrics
- **Activation Rate**: % users who ask first question < 24 hours
- **Weekly Active Users**: Users who query at least 1x/week
- **Query Success Rate**: % queries answered successfully
- **Time to First Value**: Minutes from install to first answer

### Success Targets (First 30 Days)
- 100 installs
- 60% activation rate  
- 40% weekly active rate
- 85% query success rate
- <5 minutes to first value

## MVP Pricing Strategy

### Launch Pricing (Simple)
```
FREE TIER (MVP Launch - First 3 months for all)
- Unlimited questions
- Daily insights
- Basic dashboard
- Voice input
- Up to 1,000 orders/month

PAID TIERS (Announce but implement post-MVP)
- Starter: $19/month (up to 5,000 orders)
- Growth: $49/month (up to 20,000 orders)  
- Scale: $99/month (unlimited orders)
```

## Development Timeline

### Pre-Development (Week 0)
- [ ] Finalize PRD
- [ ] Create Figma mockups  
- [ ] Set up Gadget.dev account
- [ ] Obtain Shopify Partner account
- [ ] Select LLM provider

### Sprint 1 (Week 1-2): Foundation
- [ ] Implement OAuth flow
- [ ] Build dashboard layout
- [ ] Create data models
- [ ] Set up webhooks
- [ ] Deploy to staging

### Sprint 2 (Week 3-4): Intelligence  
- [ ] Integrate LLM API
- [ ] Build query parser
- [ ] Create response system
- [ ] Add question templates
- [ ] Implement error handling

### Sprint 3 (Week 5-6): Polish
- [ ] Add voice input
- [ ] Build daily insights
- [ ] Optimize mobile UX
- [ ] Create onboarding
- [ ] Write documentation

### Launch Week (Week 7)
- [ ] Submit to Shopify App Store
- [ ] Prepare marketing materials
- [ ] Set up support system
- [ ] Launch monitoring
- [ ] Begin user feedback collection

## MVP Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM API costs exceed budget | High | Implement caching, rate limiting |
| Poor query understanding | High | Start with templates, improve over time |
| Shopify API rate limits | Medium | Efficient GraphQL queries, caching |
| Low user activation | Medium | Better onboarding, example questions |
| Voice browser compatibility | Low | Graceful fallback to text input |

## Post-MVP Roadmap Preview

**Phase 2 (Weeks 8-12)**
- Advanced analytics
- Custom alerts
- Competitor insights
- Inventory predictions

**Phase 3 (Months 3-4)**
- Team collaboration
- API access
- Advanced voice features
- Custom reporting

**Phase 4 (Months 5-6)**
- IP blocking
- Fraud detection
- Cloudflare integration
- Enterprise features

## MVP Definition of Done

### Technical Checklist
- [ ] All P0 features implemented
- [ ] Passes Shopify app review requirements
- [ ] Mobile responsive (iOS/Android)
- [ ] Page load <3 seconds
- [ ] 99.9% uptime capability

### Business Checklist  
- [ ] User documentation complete
- [ ] Support system ready
- [ ] Analytics tracking live
- [ ] Billing system tested
- [ ] Marketing page live

### Quality Checklist
- [ ] 90%+ test coverage
- [ ] No critical bugs
- [ ] Accessibility compliant
- [ ] Security audit passed
- [ ] Performance benchmarked

## Quick Decisions Needed

1. **LLM Provider**: OpenAI GPT-4 vs Claude vs Open source?
2. **Analytics Tool**: Mixpanel vs Amplitude vs Custom?
3. **Support System**: Intercom vs Crisp vs Email only?
4. **Marketing Site**: Separate landing page vs Shopify listing only?
5. **Beta Program**: Private beta with 10-20 stores vs Public launch?

---

**Next Steps**: 
1. Approve MVP scope
2. Create Figma mockups for key screens
3. Set up development environment
4. Begin Sprint 1 implementation