import React from 'react';
import './CoercionTimeline.css';

const CoercionTimeline = () => {
  const events = [
    {
      date: "Oct 27, 2024",
      label: "Kirk Files Motion",
      detail: "$14,000 Attorney Fees",
      type: "filing",
      position: 0
    },
    {
      date: "Nov 19, 2024",
      label: "Court Orders Payment",
      detail: "FAHED (Husband) to Pay $13,347",
      type: "order",
      position: 1,
      target: "FAHED"
    },
    {
      date: "Nov 19-23, 2024",
      label: "Payment Received",
      detail: "Respondent/Adversary (Financial Controller) Pays $11,000 via Zelle",
      type: "payment",
      position: 2,
      source: "RESPONDENT",
      mismatch: true,
      timeline_marker: "Nov 19: Counsel Neutralized"
    },
    {
      date: "Nov 26, 2024",
      label: "Satisfaction Signed",
      detail: "Kirk Signs Satisfaction for FAHED",
      type: "satisfaction",
      position: 3,
      beneficiary: "FAHED"
    }
  ];

  // Fixed dimensions for PDF generation
  const width = 1000;
  const height = 700;
  const timelineY = 200;
  const flowY = 450;

  return (
    <div className="coercion-timeline-container">
      <div className="timeline-header">
        <h1>Unethical Collection Timeline</h1>
        <h2>Case 25PDFL01441 - Payment Liability Mismatch</h2>
      </div>

      <svg width={width} height={height} className="timeline-svg">
        {/* Timeline Base Line */}
        <line 
          x1={100} 
          y1={timelineY} 
          x2={900} 
          y2={timelineY} 
          stroke="#2c3e50" 
          strokeWidth="3"
        />

        {/* Timeline Events */}
        {events.map((event, index) => {
          const x = 100 + (index * 266);
          const isHighlight = event.mismatch;
          
          return (
            <g key={index}>
              {/* Event Marker */}
              <circle 
                cx={x} 
                cy={timelineY} 
                r={isHighlight ? 12 : 10}
                fill={isHighlight ? "#E74C3C" : "#3498DB"}
                stroke="#fff"
                strokeWidth="3"
                className={isHighlight ? "pulse-marker" : ""}
              />
              
              {/* Date Label */}
              <text 
                x={x} 
                y={timelineY - 30}
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill="#2c3e50"
              >
                {event.date}
              </text>
              
              {/* Event Label */}
              <text 
                x={x} 
                y={timelineY + 35}
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fill={isHighlight ? "#E74C3C" : "#2c3e50"}
              >
                {event.label}
              </text>
              
              {/* Event Detail */}
              <foreignObject x={x - 90} y={timelineY + 45} width="180" height="80">
                <div className="event-detail" style={{
                  fontSize: '13px',
                  textAlign: 'center',
                  color: isHighlight ? '#E74C3C' : '#555'
                }}>
                  {event.detail}
                </div>
              </foreignObject>
              
              {/* Timeline Marker for Counsel Neutralization */}
              {event.timeline_marker && (
                <g>
                  <rect 
                    x={x - 95} 
                    y={timelineY + 130} 
                    width="190" 
                    height="40" 
                    fill="#E74C3C" 
                    opacity="0.9"
                    rx="5"
                    className="pulse-box"
                  />
                  <text 
                    x={x} 
                    y={timelineY + 155}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="bold"
                    fill="#fff"
                  >
                    {event.timeline_marker}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Flow Diagram Section */}
        <text x={500} y={flowY - 60} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#2c3e50">
          Payment Flow vs. Court Order
        </text>

        {/* Court Order Box (pointing to FAHED) */}
        <g>
          <rect x={150} y={flowY} width={180} height={80} fill="#3498DB" opacity="0.2" stroke="#3498DB" strokeWidth="2" rx="5"/>
          <text x={240} y={flowY + 25} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#2c3e50">
            COURT ORDER
          </text>
          <text x={240} y={flowY + 45} textAnchor="middle" fontSize="13" fill="#2c3e50">
            Nov 19, 2024
          </text>
          <text x={240} y={flowY + 65} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#2c3e50">
            → FAHED MUST PAY
          </text>
        </g>

        {/* Arrow from Court Order to FAHED */}
        <defs>
          <marker id="arrowBlue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#3498DB" />
          </marker>
          <marker id="arrowRed" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#E74C3C" />
          </marker>
        </defs>

        <line x1={330} y1={flowY + 40} x2={430} y2={flowY + 40} stroke="#3498DB" strokeWidth="3" markerEnd="url(#arrowBlue)"/>
        
        {/* FAHED Box (Target) */}
        <g>
          <rect x={440} y={flowY - 30} width={120} height={60} fill="#ecf0f1" stroke="#3498DB" strokeWidth="2" rx="5"/>
          <text x={500} y={flowY - 5} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#2c3e50">
            FAHED
          </text>
          <text x={500} y={flowY + 15} textAnchor="middle" fontSize="12" fill="#555">
            (Husband)
          </text>
        </g>

        {/* Actual Payment Box (from Respondent) */}
        <g>
          <rect x={130} y={flowY + 120} width={220} height={80} fill="#E74C3C" opacity="0.2" stroke="#E74C3C" strokeWidth="3" rx="5" className="pulse-box"/>
          <text x={240} y={flowY + 145} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#E74C3C">
            ACTUAL PAYMENT
          </text>
          <text x={240} y={flowY + 165} textAnchor="middle" fontSize="13" fill="#E74C3C">
            Nov 19-23, 2024
          </text>
          <text x={240} y={flowY + 185} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#E74C3C">
            FROM RESPONDENT ✗
          </text>
        </g>

        {/* Arrow from Respondent Payment to Kirk (crossing over) */}
        <line x1={350} y1={flowY + 160} x2={430} y2={flowY + 120} stroke="#E74C3C" strokeWidth="3" markerEnd="url(#arrowRed)" strokeDasharray="5,5"/>
        
        {/* RESPONDENT Box (Wrong Source - Financial Controller) */}
        <g>
          <rect x={390} y={flowY + 90} width={220} height={70} fill="#ffecec" stroke="#E74C3C" strokeWidth="3" rx="5" className="pulse-box"/>
          <text x={500} y={flowY + 115} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#E74C3C">
            RESPONDENT/
          </text>
          <text x={500} y={flowY + 133} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#E74C3C">
            ADVERSARY
          </text>
          <text x={500} y={flowY + 152} textAnchor="middle" fontSize="11" fill="#E74C3C">
            (Financial Controller)
          </text>
        </g>

        {/* Mismatch Warning */}
        <g>
          <rect x={620} y={flowY + 50} width={300} height={100} fill="#fff5f5" stroke="#E74C3C" strokeWidth="3" rx="8" className="pulse-box"/>
          <text x={770} y={flowY + 75} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#E74C3C">
            ⚠ MISMATCH DETECTED
          </text>
          <text x={770} y={flowY + 100} textAnchor="middle" fontSize="13" fill="#555">
            Court ordered FAHED to pay
          </text>
          <text x={770} y={flowY + 120} textAnchor="middle" fontSize="13" fill="#555">
            RESPONDENT paid instead
          </text>
          <text x={770} y={flowY + 140} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#E74C3C">
            Satisfaction signed for FAHED
          </text>
        </g>
      </svg>

      <div className="timeline-footer">
        <div className="key-section">
          <div className="key-title">Key Facts:</div>
          <div className="key-items">
            <div className="key-item">
              <span className="key-dot blue"></span>
              <span>Court Order: FAHED liable for $13,347</span>
            </div>
            <div className="key-item">
              <span className="key-dot red"></span>
              <span>Actual Payment: Respondent/Adversary (Financial Controller) paid $11,000 (non-party)</span>
            </div>
            <div className="key-item">
              <span className="key-dot red"></span>
              <span>Satisfaction: Signed for FAHED (who never paid)</span>
            </div>
          </div>
        </div>
        <p className="case-number">
          Exhibit for Case 25PDFL01441 | Generated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default CoercionTimeline;
