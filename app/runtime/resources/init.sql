CREATE TABLE users (
    id VARCHAR(32) PRIMARY KEY,
    email VARCHAR(42) UNIQUE NOT NULL CHECK (email LIKE '%@%.%'),
    password_hash VARCHAR(72) NOT NULL,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	personal_data_id INTEGER,
	FOREIGN KEY (personal_data_id) REFERENCES personal_data(id) ON DELETE CASCADE
);

CREATE TABLE personal_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(42),
    last_name VARCHAR(42)
);

CREATE TABLE authors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
	personal_data_id INTEGER,
	FOREIGN KEY (personal_data_id) REFERENCES personal_data(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE "documents" (
	"id"	INTEGER,
	"title"	VARCHAR(255) NOT NULL,
	"description"	VARCHAR(500),
	"type"	VARCHAR(32) CHECK("type" IN ('contrato', 'demanda', 'acuerdo', 'escritura', 'desconocido')),
	"unique_hash"	VARCHAR(255) NOT NULL UNIQUE,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	"main_path"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "versions" (
	"id"	INTEGER,
	"document_id"	INTEGER NOT NULL,
	"version_tag"	VARCHAR(255) NOT NULL,
	"file_path"	VARCHAR(500) NOT NULL,
	"file_hash"	VARCHAR(255) NOT NULL UNIQUE,
	"author_id"	INTEGER NOT NULL,
	"comment"	VARCHAR(500),
	"updated_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	"size_mb"	NUMERIC,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("author_id") REFERENCES "authors"("id"),
	FOREIGN KEY("document_id") REFERENCES "documents"("id") ON DELETE CASCADE
);

CREATE TABLE analyzed_content (
    version_id INTEGER PRIMARY KEY,
    text TEXT NOT NULL,
    entities JSON NOT NULL DEFAULT '{}',
    FOREIGN KEY (version_id) REFERENCES versions(id) ON DELETE CASCADE
);

CREATE TABLE legal_calendar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    event TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE TABLE settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    main_path TEXT NOT NULL
);

CREATE TABLE "spell_errors" (
	"id"	INTEGER,
	"word"	TEXT NOT NULL,
	"version_id"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT)
	FOREIGN KEY (version_id) REFERENCES versions(id) ON DELETE CASCADE
);