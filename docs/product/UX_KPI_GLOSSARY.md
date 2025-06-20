# UX KPI Glossary - Weaponized Friction Metrics

## 📊 Core KPI Definitions

### FER - Friction Efficiency Rate
**What it measures**: How accurately we apply the right amount of friction to the right visitors
- **Good outcome**: Legitimate users pass quickly (low friction)
- **Good outcome**: Bad actors get blocked or slowed (high friction)
- **Formula**: `(Correct Friction Decisions / Total Visitors) × Speed Factor`
- **Example**: If 95 out of 100 visitors get the appropriate friction level, FER = 95%

### CLF - Conversion Lift from Friction
**What it measures**: The positive revenue impact of using intelligent friction vs. one-size-fits-all
- **Good outcome**: Higher conversion because good customers face less friction
- **Good outcome**: Higher revenue because fraud is blocked
- **Formula**: `(Revenue with Smart Friction - Baseline Revenue) / Baseline Revenue`
- **Example**: If you made $100K without SOS and $115K with SOS, CLF = +15%

### GAES - Good Actor Experience Score
**What it measures**: How smooth the experience is for legitimate visitors
- **Good outcome**: Real customers never notice security
- **Bad outcome**: Good customers hit unnecessary friction
- **Formula**: `(Seamless Checkouts / Legitimate Visitors) × (1 - Average Delay)`
- **Example**: If 98% of good customers check out with <200ms delay, GAES = 98%

### BAFC - Bad Actor Friction Cost
**What it measures**: How expensive (in time/effort) we make it for attackers
- **Good outcome**: Attacking your store becomes unprofitable
- **Formula**: `Time Wasted × Challenge Complexity × Required Retries`
- **Example**: If a bot has to solve 5 CAPTCHAs taking 30 seconds each, BAFC = $50 in compute time

### NBS - Network Benefit Score
**What it measures**: Value created by sharing verifications across the merchant network
- **Good outcome**: Customer verified once, trusted everywhere
- **Formula**: `Friction Saved × Merchants Benefited × Conversion Impact`
- **Example**: 1M verifications recycled × 100 merchants × $10 value each = $1B network value

### NVRR - Network Verification Recycling Rate
**What it measures**: What percentage of verifications are reused vs. repeated
- **Good outcome**: High percentage means less friction for customers
- **Formula**: `Recycled Verifications / Total Verifications`
- **Example**: If 600K out of 1M verifications were recycled from other stores, NVRR = 60%

### TDR - Threat Deflection Rate
**What it measures**: How effectively we block actual threats
- **Good outcome**: 99%+ of attacks blocked
- **Formula**: `Threats Blocked / (Threats Blocked + Threats That Got Through)`
- **Example**: Blocked 990 bot attacks, 10 got through, TDR = 99%

## 📈 Traditional Metrics (For Comparison)

### AOV - Average Order Value
**What it is**: Average amount spent per order
**SOS Impact**: Should increase as trusted customers face less friction

### CAC - Customer Acquisition Cost
**What it is**: Cost to acquire a new customer
**SOS Impact**: Should decrease as conversion rates improve

### LTV - Lifetime Value
**What it is**: Total revenue from a customer over time
**SOS Impact**: Should increase as good customers have better experiences

### CR - Conversion Rate
**What it is**: Percentage of visitors who make a purchase
**SOS Impact**: Should increase through intelligent friction

## 🎯 Why These KPIs Matter

**Traditional Security Approach**:
- Measure: How many threats blocked?
- Problem: Also blocks good customers
- Result: Lower conversion

**SOS Approach**:
- Measure: Right friction for right visitor?
- Benefit: Good customers sail through
- Result: Higher conversion AND better security

## 💡 Real-World Examples

### Example 1: Fashion Store
- **Before SOS**: 3% conversion, high fraud
- **With SOS**: 
  - FER: 94% (accurate friction decisions)
  - CLF: +12% (more revenue)
  - GAES: 97% (smooth for good customers)
- **Result**: $50K/month additional revenue

### Example 2: Electronics Retailer
- **Before SOS**: Bot attacks draining inventory
- **With SOS**:
  - BAFC: $75/attack (too expensive for bots)
  - TDR: 99.5% (blocks almost all bots)
  - NBS: $2M/year (network protection value)
- **Result**: Inventory protected, sales up 18%

## 📊 Quick Reference

| KPI | Good Score | Bad Score | Check Frequency |
|-----|------------|-----------|-----------------|
| FER | >95% | <85% | Real-time |
| CLF | >+10% | <+5% | Daily |
| GAES | >98% | <90% | Hourly |
| BAFC | >$50 | <$10 | Per incident |
| NBS | >$1M/mo | <$100K/mo | Monthly |
| NVRR | >60% | <30% | Weekly |
| TDR | >99% | <95% | Real-time |

---

*"If you can't measure it, you can't weaponize it. These KPIs turn friction from a blunt instrument into a precision tool."*