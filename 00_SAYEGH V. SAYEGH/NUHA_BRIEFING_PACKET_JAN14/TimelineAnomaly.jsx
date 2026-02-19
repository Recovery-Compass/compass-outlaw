import React from 'react';
import './TimelineAnomaly.css';

const TimelineAnomaly = () => {
  const data = [
    { 
      label: "Court Ordered Timeline", 
      value: 1095, 
      days: 1095,
      color: "#000000",
      description: "Standard 3-year payment period",
      highlight: false
    },
    { 
      label: "Actual Payment Speed", 
      value: 4, 
      days: 4,
      color: "#000000",
      description: "Respondent paid immediately",
      highlight: true,
      annotation: "99.6% Acceleration (Suspicious Activity)"
    }
  ];

  const maxValue = Math.max(...data.map(d => d.value));
  const acceleration = ((data[0].value - data[1].value) / data[0].value * 100).toFixed(1);

  // Fixed dimensions for CRC 2.111 compliance - 1000px width with 96px padding (1-inch equivalent)
  const chartWidth = 1000;
  const chartHeight = 400;
  const padding = 96;

  return (
    <div className="timeline-anomaly-container" style={{ width: `${chartWidth}px`, padding: `${padding}px` }}>
      <div className="anomaly-header">
        <h1>Timeline Anomaly Analysis</h1>
        <h2>Case 25PDFL01441</h2>
      </div>

      <div className="chart-section" style={{ width: `${chartWidth - (padding * 2)}px`, height: `${chartHeight}px` }}>
        <div className="bars-container">
          {data.map((item, index) => {
            const barWidth = (item.value / maxValue) * 100;
            const displayWidth = Math.max(barWidth, 2); // Minimum 2% for visibility
            
            return (
              <div key={index} className="anomaly-bar-row">
                <div className="anomaly-bar-label">
                  <div className="label-text">{item.label}</div>
                  <div className="label-days">{item.days} days</div>
                </div>
                <div className="anomaly-bar-track">
                  <div 
                    className="anomaly-bar-fill"
                    style={{
                      width: `${displayWidth}%`,
                      backgroundColor: '#FFFFFF',
                      border: item.highlight ? '4px solid #000000' : '1px solid #000000',
                      minWidth: item.highlight ? '60px' : 'auto'
                    }}
                  >
                    <span className="anomaly-bar-value">
                      {item.days} days
                    </span>
                  </div>
                  {item.highlight && (
                    <div className="anomaly-inline-annotation">
                      <span className="annotation-text">{item.annotation}</span>
                    </div>
                  )}
                </div>
                <div className="bar-description">{item.description}</div>
              </div>
            );
          })}
        </div>

        <div className="caption-box">
          <div className="caption-content">
            <div className="caption-title">Financial Behavior Analysis:</div>
            <div className="caption-text">
              Respondent voluntarily forfeited 3 years of float to pay Counsel immediately.
            </div>
            <div className="caption-subtext">
              Normal Timeline: {data[0].days} days | Actual: {data[1].days} days | Acceleration: {acceleration}%
            </div>
          </div>
        </div>
      </div>

      <div className="anomaly-footer">
        <div className="comparison-stats">
          <div className="stat-item">
            <div className="stat-label">Court Standard</div>
            <div className="stat-value">{data[0].days} days</div>
          </div>
          <div className="stat-divider">vs</div>
          <div className="stat-item">
            <div className="stat-label">Actual Performance</div>
            <div className="stat-value">{data[1].days} days</div>
          </div>
          <div className="stat-divider">=</div>
          <div className="stat-item">
            <div className="stat-label">Acceleration Rate</div>
            <div className="stat-value stat-emphasis">{acceleration}%</div>
          </div>
        </div>
        <p className="case-number">
          Exhibit for Case 25PDFL01441 | Generated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default TimelineAnomaly;
