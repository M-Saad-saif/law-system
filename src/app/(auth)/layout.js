'use client';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-bg flex items-center justify-center min-h-screen p-4">
      {children}
    </div>
  );
}
