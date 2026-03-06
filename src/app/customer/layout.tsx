export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="customer-portal">
      {/* Add customer-specific navigation/header here */}
      {children}
    </div>
  );
}