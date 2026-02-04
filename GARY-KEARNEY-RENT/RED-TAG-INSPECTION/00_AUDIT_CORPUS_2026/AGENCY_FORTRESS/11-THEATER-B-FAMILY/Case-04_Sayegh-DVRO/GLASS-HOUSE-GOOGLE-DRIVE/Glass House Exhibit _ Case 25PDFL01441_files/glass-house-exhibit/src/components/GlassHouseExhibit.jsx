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
// ============================================================

const GlassHouseExhibit = () => {
  // HARDCODED EVIDENCE DATA - Extracted from glass_house_exhibit_data.csv
  const data = [
    {
      name: 'FL-150 Declared',
      value: 8000,
      label: '$8K/mo',
      color: '#4A90A4',
      isPulsing: false,
    },
    {
      name: 'Actual Bank Flow',
      value: 48000,
      label: '$48K/mo',
      color: '#2ECC71',
      isPulsing: false,
    },
    {
      name: 'Hidden Lien',
      value: 704000,
      label: '$704K',
      color: '#E74C3C',
      isPulsing: true,
    },
    {
      name: 'THE GAP',
      value: 696000,
      label: '$696K DISCREPANCY',
      color: '#C0392B',
      isPulsing: true,
    },
  ];

  // CSS Pulse Animation - Psychological Strike
  const pulseKeyframes = `
    @keyframes pulse {
      0% { opacity: 1; filter: brightness(1); }
      50% { opacity: 0.7; filter: brightness(1.3); }
      100% { opacity: 1; filter: brightness(1); }
    }
  `;

  // Custom Bar Component with Pulse Effect
  const CustomBar = (props) => {
    const { x, y, width, height, fill, isPulsing } = props;
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          style={isPulsing ? { animation: 'pulse 1.5s ease-in-out infinite' } : {}}
        />
        {isPulsing && (
          <rect
            x={x - 2}
            y={y - 2}
            width={width + 4}
            height={height + 4}
            fill="none"
            stroke="#FF0000"
            strokeWidth="3"
            style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
          />
        )}
      </g>
    );
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: '#0D1B2A',
      borderRadius: '12px',
      border: '4px solid #D4AF37',
      fontFamily: 'Georgia, serif',
      boxSizing: 'border-box'
    }}>
      <style>{pulseKeyframes}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{
          color: '#D4AF37',
          fontSize: '28px',
          fontWeight: 'bold',
          margin: '0 0 8px 0',
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}>
          FREDDY SAYEGH: SWORN POVERTY vs. REALITY
        </h1>
        <h2 style={{
          color: '#FFFFFF',
          fontSize: '18px',
          fontWeight: 'normal',
          margin: '0 0 4px 0',
        }}>
          Case 25PDFL01441 | FL-150 Perjury Evidence
        </h2>
        <p style={{
          color: '#E74C3C',
          fontSize: '14px',
          margin: '0',
          fontWeight: 'bold',
        }}>
          LA Superior Court, Pasadena | Hearing: January 6, 2026
        </p>
      </div>

      {/* Chart - Fixed dimensions for PDF export */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <BarChart
          width={1000}
          height={600}
          data={data}
          layout="vertical"
          margin={{ top: 40, right: 200, left: 160, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1B2838" />
          <XAxis
            type="number"
            tickFormatter={formatCurrency}
            stroke="#FFFFFF"
            tick={{ fill: '#FFFFFF', fontSize: 14 }}
            domain={[0, 750000]}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#FFFFFF"
            tick={{ fill: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}
            width={150}
          />
          <Bar dataKey="value" shape={<CustomBar />} barSize={60}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} isPulsing={entry.isPulsing} />
            ))}
            <LabelList
              dataKey="label"
              position="right"
              fill="#FFFFFF"
              fontSize={16}
              fontWeight="bold"
              style={{ textShadow: '1px 1px 2px #000' }}
            />
          </Bar>
          <ReferenceLine x={696000} stroke="#FF0000" strokeDasharray="5 5" strokeWidth={2} />
        </BarChart>
      </div>

      {/* The Gap Alert - Psychological Strike */}
      <div style={{
        textAlign: 'center',
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#C0392B',
        borderRadius: '8px',
        animation: 'pulse 1.5s ease-in-out infinite',
        border: '2px solid #E74C3C'
      }}>
        <p style={{
          color: '#FFFFFF',
          fontSize: '24px',
          fontWeight: 'bold',
          margin: '0',
          textTransform: 'uppercase',
        }}>
          THE GAP: 87x CLAIMED INCOME
        </p>
        <p style={{
          color: '#FFFFFF',
          fontSize: '16px',
          margin: '8px 0 0 0',
        }}>
          $696,000 Hidden Assets | $704K Sham Lien (Zero Payments in 13 Years)
        </p>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '2px solid #D4AF37',
      }}>
        <p style={{ color: '#888888', fontSize: '12px', margin: '0' }}>
          Source: Bank Records & FL-150 Filing | PFV V16.3 Verified
        </p>
        <p style={{
          color: '#E74C3C',
          fontSize: '11px',
          margin: '4px 0 0 0',
          fontStyle: 'italic',
        }}>
          Respondent: Fahed "Freddy" Sayegh (SBN 176293 - SUSPENDED)
        </p>
      </div>
    </div>
  );
};

export default GlassHouseExhibit;
