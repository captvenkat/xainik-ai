'use client';

type CohortRow = {
  source: string;
  referrals: number;
  opens: number;
  views: number;
  calls: number;
  emails: number;
  conv_view_to_call: number;
  conv_view_to_email: number;
};

export default function CohortTable({ rows }: { rows: CohortRow[] }) {
  return (
    <div className="overflow-x-auto border rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <Th>Source</Th><Th>Referrals</Th><Th>Opens</Th><Th>Views</Th>
            <Th>Calls</Th><Th>Emails</Th><Th>Call Conv.</Th><Th>Email Conv.</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.source} className="border-t">
              <Td className="font-medium capitalize">{r.source}</Td>
              <Td>{r.referrals}</Td><Td>{r.opens}</Td><Td>{r.views}</Td>
              <Td>{r.calls}</Td><Td>{r.emails}</Td>
              <Td>{(r.conv_view_to_call*100).toFixed(1)}%</Td>
              <Td>{(r.conv_view_to_email*100).toFixed(1)}%</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Th({children}:{children:React.ReactNode}){ return <th className="px-3 py-2 text-left">{children}</th>; }
function Td({children,className}:{children:React.ReactNode,className?:string}){ return <td className={`px-3 py-2 ${className||''}`}>{children}</td>; }
