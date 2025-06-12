# Risk Engine

Core risk scoring and fraud detection logic

## Features
- Multi-factor risk scoring
- Pattern detection
- ML model integration
- Network effect calculations

## Usage

```javascript
const { RiskEngine } = require('@sos/risk-engine');

const engine = new RiskEngine();
const score = await engine.calculateRisk({
  ip: '192.168.1.1',
  email: 'test@example.com',
  phone: '+1234567890'
});
```