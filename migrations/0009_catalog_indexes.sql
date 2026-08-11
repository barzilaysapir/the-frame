-- Defensive indexes for the now-100-row catalog (additive, non-destructive).
-- routines.slug / instructors.slug already have implicit PK indexes;
-- these cover the columns filtered/joined on that didn't have one yet.

CREATE INDEX IF NOT EXISTS routines_instructor_slug_idx ON routines (instructor_slug);
CREATE INDEX IF NOT EXISTS routines_style_idx ON routines (style);
CREATE INDEX IF NOT EXISTS routines_level_idx ON routines (level);
