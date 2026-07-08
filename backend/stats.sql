DROP FUNCTION IF EXISTS get_dashboard_stats();

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_tickets BIGINT,
  open_tickets BIGINT,
  ai_resolved_tickets BIGINT,
  avg_resolution_time_ms FLOAT,
  tickets_analyzed_today BIGINT,
  ai_resolved_today BIGINT,
  old_open_tickets BIGINT,
  sla_near_breach BIGINT,
  sla_breached BIGINT,
  total_resolved_with_sla BIGINT,
  sla_met BIGINT
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
      COUNT(*) FILTER (WHERE t.status = 'Open' AND t."createdAt" < NOW() - INTERVAL '24 hours') as old_open_tickets,
      COUNT(*) FILTER (WHERE t.status = 'Open' AND t."slaDeadline" IS NOT NULL AND t."slaDeadline" > NOW() AND t."slaDeadline" <= NOW() + INTERVAL '2 hours') as sla_near_breach,
      COUNT(*) FILTER (WHERE t.status = 'Open' AND t."slaDeadline" IS NOT NULL AND t."slaDeadline" < NOW()) as sla_breached,
      COUNT(*) FILTER (WHERE t.status = 'Resolved' AND t."slaDeadline" IS NOT NULL) as total_resolved_with_sla,
      COUNT(*) FILTER (WHERE t.status = 'Resolved' AND t."slaDeadline" IS NOT NULL AND t."updatedAt" <= t."slaDeadline") as sla_met
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
    COALESCE(s.old_open_tickets, 0),
    COALESCE(s.sla_near_breach, 0),
    COALESCE(s.sla_breached, 0),
    COALESCE(s.total_resolved_with_sla, 0),
    COALESCE(s.sla_met, 0)
  FROM stats s;
END;
$$ LANGUAGE plpgsql;
