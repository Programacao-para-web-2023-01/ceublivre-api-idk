-- Migration number: 0002 	 2023-06-09T19:25:16.067Z

ALTER TABLE Priority
  RENAME TO Category;

ALTER TABLE Ticket
  RENAME COLUMN priorityId TO categoryId;
