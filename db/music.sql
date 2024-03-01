CREATE DATABASE music;
USE music;

CREATE TABLE artists (
	idArtist INT auto_increment primary key,
    `name` VARCHAR(45) not null,
    genre VARCHAR(45) not null,
    hit VARCHAR(45) not null,
    grammys INT not null
);

INSERT INTO artists (name, genre, hit, grammys)
VALUES ('Lana del Rey', 'Indie pop', 'Born to die', 5), 
('Dua Lipa', 'Pop', 'Houdini', 7),
('Charlotte de Witte', 'Techno', 'Overdrive', 2);

CREATE TABLE festivals (
	idFestival INT auto_increment primary key,
    `name` VARCHAR(45) not null,
    location VARCHAR(45) not null,
    `date` date not null,
    price float not null
);

INSERT INTO festivals (name, location, date, price) 
VALUES ('Primavera Sound', 'Barcelona', '2024-05-29', 295), 
('Mad Cool Festival', 'Madrid', '2024-07-10', 210), 
('Aquasella', 'Asturias', '2024-08-14', 85);


-- Añadir una columna fk_festival en la tabla artists para la clave foránea
ALTER TABLE artists
ADD fk_festival INT;

-- Establecer la restricción de clave foránea
ALTER TABLE artists
ADD CONSTRAINT fk_festival
FOREIGN KEY (fk_festival)
REFERENCES festivals(idFestival);

-- Obtener toda la información de artistas y festivales relacionada
SELECT artists.idArtist, artists.name, artists.genre, artists.hit, artists.grammys, festivals.name AS festival_name
FROM artists
JOIN festivals ON artists.fk_festival = festivals.idFestival;

--- BONUS

CREATE TABLE usuarios_db (
	id INT auto_increment primary key,
    email VARCHAR(45) unique,
    `name` VARCHAR(45),
    address VARCHAR(60),
    password VARCHAR(30)
);

INSERT INTO usuarios_db (email, name, address, password) 
VALUES ('roberta@gmail.com', 'Roberta', 'Calle Pobla de Segur', 'roberta.123');

ALTER TABLE usuarios_db MODIFY COLUMN password VARCHAR(100);