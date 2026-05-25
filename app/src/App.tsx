import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { Dashboard } from "./routes/Dashboard";
import { Projects } from "./routes/Projects";
import { ProjectView } from "./routes/ProjectView";
import { Files } from "./routes/Files";
import { Figures } from "./routes/Figures";
import { Tables } from "./routes/Tables";
import { Notes } from "./routes/Notes";
import { Settings } from "./routes/Settings";
import { Examples } from "./routes/Examples";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "projects", element: <Projects /> },
      { path: "projects/:id", element: <ProjectView /> },
      { path: "projects/:id/files", element: <Files /> },
      { path: "projects/:id/figures", element: <Figures /> },
      { path: "projects/:id/tables", element: <Tables /> },
      { path: "projects/:id/notes", element: <Notes /> },
      { path: "settings", element: <Settings /> },
      { path: "examples", element: <Examples /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
