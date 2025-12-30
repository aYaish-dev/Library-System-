TRUNCATE reservations, resource_copies, resources, users RESTART IDENTITY CASCADE;

INSERT INTO users (sso_id, name, email, role) VALUES
('sso-student-1','Student One','student1@uni.edu','student'),
('sso-faculty-1','Faculty One','faculty1@uni.edu','faculty'),
('sso-staff-1','Staff Admin','staff1@uni.edu','staff');

INSERT INTO resources (isbn, title, author, digital_link) VALUES
('9780131103627','The C Programming Language','Kernighan & Ritchie',NULL),
('9780132350884','Clean Code','Robert C. Martin',NULL),
('9781492056355','Designing Data-Intensive Applications','Martin Kleppmann','https://example.com/ebook');

INSERT INTO resource_copies (resource_id, status, due_date, branch, floor, shelf) VALUES
(1,'available',NULL,'Main Library','1','A-12'),
(1,'checked_out',NOW() + INTERVAL '7 days','Main Library','1','A-12'),
(2,'checked_out',NOW() + INTERVAL '3 days','Main Library','2','B-05'),
(2,'missing',NULL,'Science Branch','1','S-02'),
(3,'available',NULL,'Main Library','3','D-01');
