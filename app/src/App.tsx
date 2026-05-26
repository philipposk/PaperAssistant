import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AppShell } from "./components/AppShell";

const Dashboard = lazy(() =>
  import("./routes/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const Projects = lazy(() =>
  import("./routes/Projects").then((m) => ({ default: m.Projects })),
);
const ProjectView = lazy(() =>
  import("./routes/ProjectView").then((m) => ({ default: m.ProjectView })),
);
const Files = lazy(() =>
  import("./routes/Files").then((m) => ({ default: m.Files })),
);
const Figures = lazy(() =>
  import("./routes/Figures").then((m) => ({ default: m.Figures })),
);
const Tables = lazy(() =>
  import("./routes/Tables").then((m) => ({ default: m.Tables })),
);
const Notes = lazy(() =>
  import("./routes/Notes").then((m) => ({ default: m.Notes })),
);
const Settings = lazy(() =>
  import("./routes/Settings").then((m) => ({ default: m.Settings })),
);
const Examples = lazy(() =>
  import("./routes/Examples").then((m) => ({ default: m.Examples })),
);
const Auth = lazy(() =>
  import("./routes/Auth").then((m) => ({ default: m.Auth })),
);
const SearchRoute = lazy(() =>
  import("./routes/Search").then((m) => ({ default: m.Search })),
);
const Timeline = lazy(() =>
  import("./routes/Timeline").then((m) => ({ default: m.Timeline })),
);
const References = lazy(() =>
  import("./routes/References").then((m) => ({ default: m.References })),
);
const PdfViewer = lazy(() =>
  import("./routes/PdfViewer").then((m) => ({ default: m.PdfViewer })),
);
const SearchPapers = lazy(() =>
  import("./routes/SearchPapers").then((m) => ({ default: m.SearchPapers })),
);
const AcceptInvite = lazy(() =>
  import("./routes/AcceptInvite").then((m) => ({ default: m.AcceptInvite })),
);
const AuthCallback = lazy(() =>
  import("./routes/AuthCallback").then((m) => ({ default: m.AuthCallback })),
);

function RouteFallback() {
  return (
    <div className="h-full flex items-center justify-center text-sm text-[var(--color-ink-3)]">
      <Loader2 size={16} className="animate-spin mr-2" />
      Loading…
    </div>
  );
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Lazy><Dashboard /></Lazy> },
      { path: "projects", element: <Lazy><Projects /></Lazy> },
      { path: "projects/:id", element: <Lazy><ProjectView /></Lazy> },
      { path: "projects/:id/files", element: <Lazy><Files /></Lazy> },
      { path: "projects/:id/figures", element: <Lazy><Figures /></Lazy> },
      { path: "projects/:id/tables", element: <Lazy><Tables /></Lazy> },
      { path: "projects/:id/notes", element: <Lazy><Notes /></Lazy> },
      { path: "projects/:id/timeline", element: <Lazy><Timeline /></Lazy> },
      { path: "projects/:id/references", element: <Lazy><References /></Lazy> },
      { path: "projects/:id/files/:fileId/view", element: <Lazy><PdfViewer /></Lazy> },
      { path: "projects/:id/find-papers", element: <Lazy><SearchPapers /></Lazy> },
      { path: "accept/:token", element: <Lazy><AcceptInvite /></Lazy> },
      { path: "settings", element: <Lazy><Settings /></Lazy> },
      { path: "examples", element: <Lazy><Examples /></Lazy> },
      { path: "auth", element: <Lazy><Auth /></Lazy> },
      { path: "auth/callback", element: <Lazy><AuthCallback /></Lazy> },
      { path: "search", element: <Lazy><SearchRoute /></Lazy> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
