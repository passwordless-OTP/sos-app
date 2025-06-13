export default function Dashboard() {
  // Polaris-like styles without imports
  const styles = {
    page: {
      margin: '0 auto',
      maxWidth: '99rem',
      padding: '2rem'
    },
    header: {
      marginBottom: '2rem'
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: '600',
      color: '#202223',
      margin: '0 0 0.25rem 0'
    },
    subtitle: {
      fontSize: '0.875rem',
      color: '#6d7175'
    },
    card: {
      background: '#ffffff',
      borderRadius: '0.5rem',
      boxShadow: '0 0 0 1px rgba(63, 63, 68, 0.05), 0 1px 3px 0 rgba(63, 63, 68, 0.15)',
      padding: '1.25rem',
      marginBottom: '1.25rem'
    },
    cardTitle: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#6d7175',
      marginBottom: '0.5rem'
    },
    metric: {
      fontSize: '2.25rem',
      fontWeight: '600',
      lineHeight: '1',
      marginBottom: '0.25rem'
    },
    button: {
      background: '#008060',
      color: '#ffffff',
      border: 'none',
      borderRadius: '0.375rem',
      padding: '0.75rem 1.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      width: '100%',
      transition: 'all 0.1s ease'
    },
    buttonHover: {
      background: '#006e52'
    },
    textField: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #c9cccf',
      borderRadius: '0.25rem',
      fontSize: '0.875rem',
      marginBottom: '1rem'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#202223',
      display: 'block',
      marginBottom: '0.25rem'
    },
    badge: {
      display: 'inline-block',
      padding: '0.125rem 0.625rem',
      borderRadius: '0.625rem',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    badgeSuccess: {
      background: '#aee9d1',
      color: '#002e1e'
    },
    badgeCritical: {
      background: '#fed3d1',
      color: '#4a1504'
    },
    badgeWarning: {
      background: '#ffea8a',
      color: '#533f04'
    },
    banner: {
      background: '#ebf5fa',
      border: '1px solid #b5d6e7',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '1.25rem',
      display: 'flex',
      gap: '0.75rem'
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>SOS - Store Operations Shield</h1>
        <p style={styles.subtitle}>AI-powered fraud prevention network for Shopify</p>
      </div>

      {/* Info Banner */}
      <div style={styles.banner}>
        <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
        <div>
          <strong>Network Intelligence Active</strong><br />
          <span style={{ fontSize: '0.875rem' }}>
            Connected to 17,453 stores • Monitoring 89,456 flagged identifiers • Real-time fraud prevention
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Total Checks</div>
          <div style={styles.metric}>1,247</div>
          <div style={{ fontSize: '0.875rem', color: '#6d7175' }}>All time</div>
        </div>
        
        <div style={styles.card}>
          <div style={styles.cardTitle}>Blocked Orders</div>
          <div style={{ ...styles.metric, color: '#d72c0d' }}>89</div>
          <div style={{ fontSize: '0.875rem', color: '#6d7175' }}>$11,303 saved</div>
        </div>
        
        <div style={styles.card}>
          <div style={styles.cardTitle}>Safe Orders</div>
          <div style={{ ...styles.metric, color: '#008060' }}>1,058</div>
          <div style={{ fontSize: '0.875rem', color: '#6d7175' }}>84.9% of total</div>
        </div>
        
        <div style={styles.card}>
          <div style={styles.cardTitle}>Network Size</div>
          <div style={{ ...styles.metric, color: '#7c39ed' }}>17,453</div>
          <div style={{ fontSize: '0.875rem', color: '#6d7175' }}>Protected stores</div>
        </div>
      </div>

      {/* Check Order Section */}
      <div style={styles.card}>
        <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Live Demo: Check Order</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={styles.label}>Order ID</label>
            <input type="text" defaultValue="#DEMO-1234" style={styles.textField} />
          </div>
          <div>
            <label style={styles.label}>Customer Email</label>
            <input type="email" defaultValue="suspicious@temp-mail.com" style={styles.textField} />
          </div>
          <div>
            <label style={styles.label}>IP Address</label>
            <input type="text" defaultValue="192.168.1.1" style={styles.textField} />
          </div>
          <div>
            <label style={styles.label}>Phone Number</label>
            <input type="tel" defaultValue="+1 (555) 123-4567" style={styles.textField} />
          </div>
        </div>
        
        <button 
          style={styles.button}
          onClick={() => alert('⚠️ HIGH RISK DETECTED!\n\nRisk Score: 85/100\n\n• Temporary email domain\n• VPN/Proxy detected\n• Reported by 3 other stores')}
        >
          Run Fraud Check
        </button>
      </div>

      {/* Recent Checks Table */}
      <div style={styles.card}>
        <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Recent Fraud Checks</h2>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e1e3e5' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: '500', color: '#6d7175' }}>Order ID</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: '500', color: '#6d7175' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: '500', color: '#6d7175' }}>Risk</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: '500', color: '#6d7175' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: '500', color: '#6d7175' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e1e3e5' }}>
              <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>#1001</td>
              <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>john@example.com</td>
              <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>15</td>
              <td style={{ padding: '0.75rem' }}>
                <span style={{ ...styles.badge, ...styles.badgeSuccess }}>Safe</span>
              </td>
              <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#008060' }}>✓ All checks passed</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e1e3e5' }}>
              <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>#1002</td>
              <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>suspicious@temp-mail.com</td>
              <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>85</td>
              <td style={{ padding: '0.75rem' }}>
                <span style={{ ...styles.badge, ...styles.badgeCritical }}>High Risk</span>
              </td>
              <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#d72c0d' }}>3 red flags detected</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e1e3e5' }}>
              <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>#1003</td>
              <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>customer@protonmail.com</td>
              <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>45</td>
              <td style={{ padding: '0.75rem' }}>
                <span style={{ ...styles.badge, ...styles.badgeWarning }}>Suspicious</span>
              </td>
              <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#b98900' }}>Anonymous email provider</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}