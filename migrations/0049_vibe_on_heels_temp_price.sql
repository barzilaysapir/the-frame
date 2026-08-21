-- Temporary ₪1 list price so Vibe on Heels can be purchased before the
-- real price (and lessons) are ready. Replaces the "בקרוב" placeholder.

UPDATE external_courses
  SET price_display = '₪1'
  WHERE slug = 'vibe-on-heels';
