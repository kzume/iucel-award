-- Insert the 4 award categories
INSERT INTO categories (name, description) VALUES
  ('Best Innovative Project', 'Recognizing groundbreaking and creative solutions'),
  ('Best Technical Implementation', 'Excellence in technical execution and architecture'),
  ('Best User Experience', 'Outstanding user interface and experience design'),
  ('Best Social Impact', 'Projects making significant positive social change')
ON CONFLICT (name) DO NOTHING;

-- Get category IDs for inserting criteria
DO $$
DECLARE
  cat_innovative UUID;
  cat_technical UUID;
  cat_ux UUID;
  cat_social UUID;
BEGIN
  SELECT id INTO cat_innovative FROM categories WHERE name = 'Best Innovative Project';
  SELECT id INTO cat_technical FROM categories WHERE name = 'Best Technical Implementation';
  SELECT id INTO cat_ux FROM categories WHERE name = 'Best User Experience';
  SELECT id INTO cat_social FROM categories WHERE name = 'Best Social Impact';

  -- Criteria for Best Innovative Project
  INSERT INTO criteria (category_id, name, max_points, display_order) VALUES
    (cat_innovative, 'Originality and Creativity', 10, 1),
    (cat_innovative, 'Innovation Level', 10, 2),
    (cat_innovative, 'Problem-Solution Fit', 10, 3),
    (cat_innovative, 'Market Potential', 10, 4),
    (cat_innovative, 'Scalability', 10, 5),
    (cat_innovative, 'Overall Innovation Impact', 10, 6);

  -- Criteria for Best Technical Implementation
  INSERT INTO criteria (category_id, name, max_points, display_order) VALUES
    (cat_technical, 'Code Quality', 10, 1),
    (cat_technical, 'Architecture Design', 10, 2),
    (cat_technical, 'Performance Optimization', 10, 3),
    (cat_technical, 'Security Implementation', 10, 4),
    (cat_technical, 'Technology Stack Choice', 10, 5),
    (cat_technical, 'Technical Documentation', 10, 6);

  -- Criteria for Best User Experience
  INSERT INTO criteria (category_id, name, max_points, display_order) VALUES
    (cat_ux, 'Visual Design Quality', 10, 1),
    (cat_ux, 'Usability and Intuitiveness', 10, 2),
    (cat_ux, 'Accessibility', 10, 3),
    (cat_ux, 'Responsiveness', 10, 4),
    (cat_ux, 'User Flow', 10, 5),
    (cat_ux, 'Overall User Satisfaction', 10, 6);

  -- Criteria for Best Social Impact
  INSERT INTO criteria (category_id, name, max_points, display_order) VALUES
    (cat_social, 'Social Problem Addressed', 10, 1),
    (cat_social, 'Impact Potential', 10, 2),
    (cat_social, 'Sustainability', 10, 3),
    (cat_social, 'Community Engagement', 10, 4),
    (cat_social, 'Measurable Outcomes', 10, 5),
    (cat_social, 'Long-term Viability', 10, 6);
END $$;
