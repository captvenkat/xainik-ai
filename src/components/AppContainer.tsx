export default function AppContainer({ children }: { children: React.ReactNode }) {
  return <div className="max-w-[480px] mx-auto px-4">{children}</div>;
}
