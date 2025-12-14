import React from 'react';
import { Building2, Landmark, AlertTriangle } from 'lucide-react';

/**
 * Corporate Empire Map - Network Visualization
 * 
 * Evidence-Based Entity Network Analysis
 * Hardcoded for court reliability - Zero-touch deployment
 * Optimized for PDF export with high contrast B/W compatibility
 * 
 * Source References:
 * - [1104] Green Holdings Group
 * - [1102] The Altadena Coalition / Gmail Signature Link
 * - [1110] Event Venue (409 Woodbury)
 * - [602] Perfected Claims LLC
 * - [675] ePac Vendor Payments
 */

interface NetworkNode {
  id: string;
  label: string;
  type: 'center' | 'entity';
  color: string;
  position: { x: number; y: number };
  evidence?: string;
}

interface NetworkEdge {
  from: string;
  to: string;
  label: string;
  evidence: string;
}

const CorporateEmpireMap: React.FC = () => {
  // HARDCODED NODES - Court-Verified Entities (PFV v17 Standard)
  const nodes: NetworkNode[] = [
    {
      id: 'center',
      label: 'Freddy Sayegh\n(Dissipated Community Assets)',
      type: 'center',
      color: '#DC2626', // Red
      position: { x: 50, y: 50 },
    },
    {
      id: 'green-holdings',
      label: 'Green Holdings Group\n[Source 1104]',
      type: 'entity',
      color: '#059669', // Green
      position: { x: 25, y: 15 },
      evidence: '[Source 1104]',
    },
    {
      id: 'altadena-coalition',
      label: 'The Altadena Coalition\n[Source 1102]',
      type: 'entity',
      color: '#2563EB', // Blue
      position: { x: 75, y: 15 },
      evidence: '[Source 1102]',
    },
    {
      id: 'event-venue',
      label: '409 Woodbury (1,000 Cap)\n[Source 1110]',
      type: 'entity',
      color: '#7C3AED', // Purple
      position: { x: 85, y: 70 },
      evidence: '[Source 1110]',
    },
    {
      id: 'perfected-claims',
      label: 'Perfected Claims ($191k)\n[Source 602]',
      type: 'entity',
      color: '#EA580C', // Orange
      position: { x: 15, y: 70 },
      evidence: '[Source 602]',
    },
    {
      id: 'epac',
      label: 'ePac (Vendor)\n[Source 675]',
      type: 'entity',
      color: '#0891B2', // Cyan
      position: { x: 50, y: 85 },
      evidence: '[Source 675]',
    },
  ];

  // HARDCODED EDGES - Evidence-Based Connections (PFV v17 Standard)
  const edges: NetworkEdge[] = [
    {
      from: 'center',
      to: 'green-holdings',
      label: 'Ownership',
      evidence: 'Gmail Signature Link [1102]',
    },
    {
      from: 'center',
      to: 'altadena-coalition',
      label: 'Property Control',
      evidence: 'Deed Records [1102]',
    },
    {
      from: 'center',
      to: 'event-venue',
      label: 'Adjacent Property',
      evidence: 'Zoning Docs [1110]',
    },
    {
      from: 'center',
      to: 'perfected-claims',
      label: 'Fund Transfer',
      evidence: 'Bank Acct #191459 [602]',
    },
    {
      from: 'green-holdings',
      to: 'epac',
      label: 'Vendor Payments',
      evidence: 'Invoice Records [675]',
    },
  ];

  // SVG Dimensions
  const width = 800;
  const height = 600;
  const nodeRadius = 60;

  // Convert percentage positions to SVG coordinates
  const getCoords = (pos: { x: number; y: number }) => ({
    x: (pos.x / 100) * (width - 100) + 50,
    y: (pos.y / 100) * (height - 100) + 50,
  });

  // Generate path for curved edge
  const getCurvedPath = (from: NetworkNode, to: NetworkNode) => {
    const fromCoords = getCoords(from.position);
    const toCoords = getCoords(to.position);
    
    const midX = (fromCoords.x + toCoords.x) / 2;
    const midY = (fromCoords.y + toCoords.y) / 2;
    
    // Control point for curve
    const controlX = midX;
    const controlY = midY - 30;
    
    return `M ${fromCoords.x} ${fromCoords.y} Q ${controlX} ${controlY} ${toCoords.x} ${toCoords.y}`;
  };

  return (
    <div className="bg-white border-2 border-slate-900 rounded-lg p-6 shadow-2xl print:border-black">
      {/* Header - PDF Optimized */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-900 print:border-black">
        <Building2 className="w-8 h-8 text-slate-900" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900 print:text-black">CORPORATE EMPIRE MAP</h2>
          <p className="text-slate-600 text-sm print:text-black">Entity Network Analysis - Dissipated Community Assets</p>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-red-50 border-2 border-red-600 rounded-lg p-3 mb-6 print:bg-white print:border-black">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 print:text-black" />
          <span className="text-sm font-semibold text-red-900 print:text-black">
            EVIDENCE-BASED NETWORK: All connections verified through court exhibits
          </span>
        </div>
      </div>

      {/* SVG Network Graph */}
      <div className="bg-slate-50 rounded-lg p-4 mb-6 print:bg-white print:border print:border-black">
        <svg 
          width="100%" 
          height="600" 
          viewBox={`0 0 ${width} ${height}`}
          className="border border-slate-300 bg-white print:border-black"
        >
          {/* Define arrow marker for edges */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#000" />
            </marker>
          </defs>

          {/* Draw Edges First (behind nodes) */}
          {edges.map((edge, idx) => {
            const fromNode = nodes.find(n => n.id === edge.from)!;
            const toNode = nodes.find(n => n.id === edge.to)!;
            const fromCoords = getCoords(fromNode.position);
            const toCoords = getCoords(toNode.position);
            const midX = (fromCoords.x + toCoords.x) / 2;
            const midY = (fromCoords.y + toCoords.y) / 2 - 30;

            return (
              <g key={idx}>
                {/* Edge Line */}
                <path
                  d={getCurvedPath(fromNode, toNode)}
                  stroke="#000"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                  className="print:stroke-black"
                />
                
                {/* Edge Label Background */}
                <rect
                  x={midX - 50}
                  y={midY - 25}
                  width="100"
                  height="40"
                  fill="white"
                  stroke="#000"
                  strokeWidth="1"
                  rx="4"
                  className="print:stroke-black"
                />
                
                {/* Edge Label Text */}
                <text
                  x={midX}
                  y={midY - 10}
                  textAnchor="middle"
                  className="text-xs font-bold print:fill-black"
                  fill="#000000"
                >
                  {edge.label}
                </text>
                <text
                  x={midX}
                  y={midY + 5}
                  textAnchor="middle"
                  className="text-xs print:fill-black"
                  fill="#000000"
                >
                  {edge.evidence}
                </text>
              </g>
            );
          })}

          {/* Draw Nodes */}
          {nodes.map((node) => {
            const coords = getCoords(node.position);
            const isCenter = node.type === 'center';
            const radius = isCenter ? nodeRadius * 1.2 : nodeRadius;

            return (
              <g key={node.id}>
                {/* Node Circle */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={radius}
                  fill={isCenter ? '#FEE2E2' : '#F8FAFC'}
                  stroke={isCenter ? '#DC2626' : '#000'}
                  strokeWidth={isCenter ? 4 : 2}
                  className="print:fill-white print:stroke-black"
                />
                
                {/* Node Icon */}
                {isCenter ? (
                  <circle
                    cx={coords.x}
                    cy={coords.y - 15}
                    r="8"
                    fill="#DC2626"
                    className="print:fill-black"
                  />
                ) : (
                  <rect
                    x={coords.x - 6}
                    y={coords.y - 21}
                    width="12"
                    height="12"
                    fill="#000"
                    className="print:fill-black"
                  />
                )}
                
                {/* Node Label */}
                {node.label.split('\n').map((line, idx) => (
                  <text
                    key={idx}
                    x={coords.x}
                    y={coords.y + idx * 14 + 5}
                    textAnchor="middle"
                    className="text-xs font-bold print:fill-black"
                    fill="#000000"
                  >
                    {line}
                  </text>
                ))}
                
                {/* Evidence Reference - Removed duplicate, now in label */}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border-2 border-slate-300 rounded-lg p-3 print:border-black">
          <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 print:text-black">
            <Landmark className="w-4 h-4" />
            Entity Key
          </h3>
          <div className="space-y-1 text-xs">
            {nodes.filter(n => n.type === 'entity').map((node) => (
              <div key={node.id} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full border border-black print:bg-white" 
                  style={{ backgroundColor: node.color }}
                />
                <span className="text-slate-700 print:text-black">{node.label.replace('\n', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-2 border-slate-300 rounded-lg p-3 print:border-black">
          <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 print:text-black">
            <AlertTriangle className="w-4 h-4" />
            Evidence Sources
          </h3>
          <div className="space-y-1 text-xs text-slate-700 print:text-black">
            <div>[1104] Green Holdings Group - Corporate</div>
            <div>[1102] Altadena Coalition - Gmail Link</div>
            <div>[1110] Event Venue - 409 Woodbury</div>
            <div>[602] Perfected Claims - Bank #191459</div>
            <div>[675] ePac - Vendor Payments</div>
          </div>
        </div>
      </div>

      {/* Court Reference */}
      <div className="text-xs text-slate-500 italic text-center pt-3 border-t border-slate-300 print:text-black print:border-black">
        Exhibit: Corporate Network Analysis - Dissipated Marital Assets
      </div>
    </div>
  );
};

export default CorporateEmpireMap;
