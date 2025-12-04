INSERT INTO curriculum (subject, grade, language, chapter_number, chapter_title, concepts)
VALUES 
('science', 4, 'english', 1, 'Photosynthesis', '[{"id": "video1-test1", "title": "What is Photosynthesis?", "description": "Learn the basics of how plants make food.", "type": "video"}]'),
('math', 4, 'english', 1, 'Fractions', '[{"id": "frac-1", "title": "Introduction to Fractions", "description": "Understanding parts of a whole.", "type": "video"}]')
ON CONFLICT DO NOTHING;
