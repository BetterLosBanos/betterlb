import { Navigate, useParams } from 'react-router-dom';

/**
 * Legacy redirect component for old document URLs.
 * Redirects from /openlgu/:type/:document to /openlgu/documents/:document
 * This maintains backward compatibility for existing bookmarks and links.
 */
export default function LegacyDocumentRedirect() {
  const { document } = useParams<{ document: string }>();
  return <Navigate to={`/openlgu/documents/${document}`} replace />;
}
