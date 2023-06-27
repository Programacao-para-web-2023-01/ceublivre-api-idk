-- Migration number: 0004 	 2023-06-26T00:31:50.745Z

DROP TABLE Image;

ALTER TABLE Ticket
  ADD COLUMN imageFileId TEXT;