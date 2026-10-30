// app/components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="font-bold text-xl">VisionTutor</h3>
            <p className="text-slate-300 mt-1">
              AI-powered tutoring for everyone
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <p className="text-slate-300 text-sm">
              © {new Date().getFullYear()} VisionTutor. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
