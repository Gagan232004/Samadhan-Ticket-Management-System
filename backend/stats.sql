CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_tickets BIGINT,
  open_tickets BIGINT,
  ai_resolved_tickets BIGINT,
  avg_resolution_time_ms FLOAT,
  tickets_analyzed_today BIGINT,
  ai_resolved_today BIGINT,
  old_open_tickets BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*) as total_tickets,
      COUNT(*) FILTER (WHERE t.status = 'Open') as open_tickets,
      COUNT(*) FILTER (WHERE t.status = 'Resolved' AND u.email = 'ai@samadhaan.com') as ai_resolved_tickets,
      AVG(EXTRACT(EPOCH FROM (t."updatedAt" - t."createdAt")) * 1000) FILTER (WHERE t.status = 'Resolved') as avg_resolution_time_ms,
      COUNT(*) FILTER (WHERE t."createdAt" >= CURRENT_DATE) as tickets_analyzed_today,
      COUNT(*) FILTER (WHERE t."createdAt" >= CURRENT_DATE AND t.status = 'Resolved' AND u.email = 'ai@samadhaan.com') as ai_resolved_today,
      COUNT(*) FILTER (WHERE t.status = 'Open' AND t."createdAt" < NOW() - INTERVAL '24 hours') as old_open_tickets
    FROM ticket t
    LEFT JOIN "user" u ON t."assignedToId" = u.id
  )
  SELECT
    COALESCE(s.total_tickets, 0),
    COALESCE(s.open_tickets, 0),
    COALESCE(s.ai_resolved_tickets, 0),
    COALESCE(s.avg_resolution_time_ms, 0)::FLOAT,
    COALESCE(s.tickets_analyzed_today, 0),
    COALESCE(s.ai_resolved_today, 0),
    COALESCE(s.old_open_tickets, 0)
  FROM stats s;
END;
$$ LANGUAGE plpgsql;
