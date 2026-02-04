import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine
} from 'recharts';

// ============================================================
// OPERATION GLASS HOUSE - POVERTY FACADE EXHIBIT
// Case: 25PDFL01441 | Sayegh v. Sayegh
// Evidence Status: TIER 1 VERIFIED
// Generated: December 12, 2025 | PFV V16.3
// FORENSIC STANDARD: Absolute Geometry + Visual Separation + Gold Contrast
// ============================================================

const GlassHouseExhibit = () => {
  // TIER 1 VERIFIED - HARDCODED FORENSIC DATA
  const data = [
    {
      name: 'FL-150 Declared',
      value: 8000,
      label: '$8,000/mo',
      color: '#001F3F',
      stroke: 'none',
      strokeWidth: 0,
      annotation: '',
    },
    {
      name: 'Actual Bank Flow',
      value: 48000,
      label: '$48,000/mo',
      color: '#FFD700',
      stroke: 'none',
      strokeWidth: 0,
      annotation: '',
    },
    {
      name: 'Hidden Lien',
      value: 704000,
      label: '$704,000',
      color: '#E74C3C',
      stroke: '#FFFFFF',
      strokeWidth: 2,
      annotation: '',
    },
    {
      name: 'THE GAP',
      value: 696000,
      label: '$696K',
      color: '#C0392B',
      stroke: '#FFD700',      // GOLD border
      strokeWidth: 4,
      annotation: '⚠️ 87x CLAIMED INCOME',
    },
  ];

  // CSS Pulse Animation
  const pulseKeyframes = `
    @keyframes pulse {
      0% { opacity: 1; filter: brightness(1); }
      50% { opacity: 0.85; filter: brightness(1.25); }
      100% { opacity: 1; filter: brightness(1); }
    }
  `;

  // Custom Bar with Stroke for Visual Separation
  const CustomBar = (props) => {
    const { x, y, width, height, fill, payload } = props;
    const barStroke = payload?.stroke || 'none';
    const barStrokeWidth = payload?.strokeWidth || 0;
    const isPulsing = payload?.name === 'THE GAP' || payload?.name === 'Hidden Lien';

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          stroke={barStroke}
          strokeWidth={barStrokeWidth}
          style={isPulsing ? { animation: 'pulse 1.5s ease-in-out infinite' } : {}}
        />
      </g>
    );
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${Math.round(value / 1000)}K`;
    return `$${value}`;
  };

  return (
    <div style={{
      width: '1200px',
      margin: '0 auto',
      padding: '32px',
      backgroundColor: '#0D1B2A',
      borderRadius: '12px',
      border: '5px solid #D4AF37',
      fontFamily: 'Georgia, "Times New Roman", serif',
      boxSizing: 'border-box'
    }}>
      <style>{pulseKeyframes}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{
          color: '#D4AF37',
          fontSize: '32px',
          fontWeight: 'bold',
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          FREDDY SAYEGH: SWORN POVERTY vs. REALITY
        </h1>
        <h2 style={{
          color: '#FFFFFF',
          fontSize: '20px',
          fontWeight: 'normal',
          margin: '0 0 8px 0',
        }}>
          Case 25PDFL01441 | FL-150 Perjury Evidence
        </h2>
        <p style={{
          color: '#E74C3C',
          fontSize: '16px',
          margin: '0',
          fontWeight: 'bold',
        }}>
          LA Superior Court, Pasadena | Hearing: January 6, 2026
        </p>
      </div>

      {/* Chart - ABSOLUTE GEOMETRY */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#1B2838',
        borderRadius: '8px',
        padding: '20px 0'
      }}>
        <BarChart
          width={1000}
          height={600}
          data={data}
          layout="vertical"
          margin={{ top: 40, right: 260, left: 160, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2C3E50" />
          <XAxis
            type="number"
            tickFormatter={formatCurrency}
            stroke="#FFFFFF"
            tick={{ fill: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}
            domain={[0, 800000]}
            ticks={[0, 200000, 400000, 600000, 800000]}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#FFFFFF"
            tick={{ fill: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}
            width={170}
          />
          <Bar
            dataKey="value"
            shape={<CustomBar />}
            barSize={70}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
              />
            ))}
            {/* Value Labels - White */}
            <LabelList
              dataKey="label"
              position="right"
              fill="#FFFFFF"
              fontSize={18}
              fontWeight="bold"
              style={{ textShadow: '2px 2px 4px #000' }}
            />
          </Bar>
          {/* GOLD Annotation Label - FINAL CONTRAST FIX */}
          <Bar dataKey="value" barSize={0} fill="transparent">
            <LabelList
              dataKey="annotation"
              position="right"
              fill="#FFD700"
              fontSize={18}
              fontWeight="900"
              dx={100}
              style={{
                textShadow: '0px 2px 4px rgba(0,0,0,0.8)',
                fontWeight: 900
              }}
            />
          </Bar>
          <ReferenceLine
            x={696000}
            stroke="#FFD700"
            strokeDasharray="8 4"
            strokeWidth={2}
          />
        </BarChart>
      </div>

      {/* The Gap Alert Box - GOLD Border */}
      <div style={{
        textAlign: 'center',
        marginTop: '28px',
        padding: '24px',
        backgroundColor: '#C0392B',
        borderRadius: '8px',
        animation: 'pulse 1.5s ease-in-out infinite',
        border: '4px solid #FFD700',
        boxShadow: '0 0 30px rgba(231, 76, 60, 0.5)'
      }}>
        <p style={{
          color: '#FFD700',
          fontSize: '32px',
          fontWeight: '900',
          margin: '0',
          textTransform: 'uppercase',
          textShadow: '0px 2px 4px rgba(0,0,0,0.8)'
        }}>
          ⚠️ THE GAP: 87x CLAIMED INCOME
        </p>
        <p style={{
          color: '#FFFFFF',
          fontSize: '20px',
          margin: '12px 0 0 0',
        }}>
          $696,000 Hidden Assets | $704K Sham Lien (Zero Payments in 13 Years)
        </p>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '28px',
        paddingTop: '20px',
        borderTop: '3px solid #D4AF37',
      }}>
        <p style={{ color: '#888888', fontSize: '14px', margin: '0' }}>
          Source: Bank Records & FL-150 Filing | PFV V16.3 Verified | TIER 1 EVIDENCE
        </p>
        <p style={{
          color: '#E74C3C',
          fontSize: '13px',
          margin: '8px 0 0 0',
          fontStyle: 'italic',
        }}>
          Respondent: Fahed "Freddy" Sayegh (SBN 176293 - SUSPENDED February 2025)
        </p>
      </div>
    </div>
  );
};

export default GlassHouseExhibit;
