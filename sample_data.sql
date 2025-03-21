USE sailingdb;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+01:00";

--
-- Bolcament de dades per a la taula `users`
--
START TRANSACTION;
INSERT INTO `users` (`username`, `role`, `password`, `full_name`, `phone`) VALUES
('alex', 'ADMIN', '$2a$10$D25CUjZHnolADZpCmQzWLee7eDX5LEA1jpa3chdrNZ8Ad5u4gHUbm', 'Àlex Macia Pérez', '444 35 15'),
('genis', 'CLIENT', '$2a$10$fN.nOfWlRY/LLotIWiseoeh/foQ1vFCY9bnpXmK3k8.VwW7F1xoPi', 'Genís Esteve i Prats', '333 15 15'),
('laia', 'ADMIN', '$2a$10$EwsBI6trHD56ncjlsxAmwuic5R/qAzx6AyekBpCafndN.CiFuwJjK', 'Laia Vives i Marsans', '444 15 01'),
('lola', 'CLIENT', '$2a$10$vTJ82FGgKP36.WHHtWAGNOvCt0bF27/0HzN9OFo1EuU722Z0PKhde', 'Lola Valls i Vilalta', '333 25 01'),
('maria', 'CLIENT', '$2a$10$EogCF6kJDxTPsfQFciZjROaSBd/8Ok3orVe49KdEebVdyVTYrCKs2', 'Maria Lopez i Castells', '333 35 13'),
('raul', 'CLIENT', '$2a$10$Zt92wjlBEPx2zXwdTfA4ZeM2cFAAX4MXY4y9y1BKMEZmYbNh.8dz6', 'Raul Casanova i Ferrer', '333 15 04'),
('robert', 'CLIENT', '$2a$10$H1S18hqeIbIoPgVU7ECURu6nsitQ0/sGSEJ9Z0Dw6rBV/bloAmCTS', 'Robert Planes i Pujol', '333 35 10'),
('toni', 'CLIENT', '$2a$10$T1lgKgp5XiQAuvTiq4alQeWkgCVHpsHVgmgk/X7wIkJwHypR6TMP2', 'Antoni Bosc i Cases', '333 25 08');
COMMIT;

--
-- Bolcament de dades per a la taula `trip_types`
--
START TRANSACTION;
INSERT INTO `trip_types` (`id`, `title`, `category`, `description`, `price`, `duration`, `max_places`) VALUES
(1, '1 Hour Sailing Tour', 'GROUP', '1h Sailing Experience', 30.0, 1, 9),
(2, '2 Hours Sailing Tour', 'GROUP', 'Relaxing 2h Sailing Tour', 45.0, 2, 9),
(3, 'Sunset Sail', 'GROUP', 'Sensational Sunset Sail', 50.0, 2, 9),
(4, 'Watch Live: America’s Cup', 'GROUP', 'Watch America’s Cup Barcelona 2024 Live (shared)', 350.0, 6, 11),
(5, 'Private Sailing Tour (max. 9)', 'PRIVATE', 'Private Sailing Tour (max. 9)', 200.0, 1, 9),
(6, 'Private Sailing Tour (max.11)', 'PRIVATE', 'Private Sailing Tour (max.11)', 300.0, 6, 11),
(7, 'Private Luxury Sailing Tour (max.12)', 'PRIVATE', 'Private Luxury Sailing Tour (max.12)', 350.0, 2, 12);
COMMIT;

--
-- Bolcament de dades per a la taula `trip_type_departures`
--
START TRANSACTION;
INSERT INTO `trip_type_departures` (`id`, `trip_type_id`, `departure`) VALUES
(1, 1, '9:30'),
(2, 1, '13:30'),
(3, 1, '17:30'),
(4, 2, '11:30'),
(5, 2, '15:30'),
(6, 3, '19:30'),
(7, 4, '12:30');
COMMIT;

--
-- Bolcament de dades per a la taula `trips`
--
START TRANSACTION;
INSERT INTO `trips` (`id`, `type_id`, `client_username`, `places`, `date`, `departure`) VALUES
(2, 1, 'genis', 2, '2025-03-01', '13:30:00.000000'),
(3, 1, 'lola', 2, '2025-03-01', '13:30:00.000000'),
(4, 1, 'maria', 4, '2025-03-01', '09:30:00.000000'),
(5, 1, 'maria', 4, '2025-03-08', '09:30:00.000000'),
(7, 2, 'raul', 3, '2025-03-01', '15:30:00.000000'),
(8, 2, 'robert', 2, '2025-03-01', '15:30:00.000000'),
(9, 5, 'toni', 8, '2025-03-01', '08:00:00.000000');
COMMIT;

--
-- Bolcament de dades per a la taula `actions`
--
START TRANSACTION;
INSERT INTO `actions` (`id`, `type`, `performer_username`, `date`, `trip_id`, `comments`, `new_date`, `new_departure`) VALUES
(1, 'BOOKING', 'genis', '2024-11-12 16:02:37', 2, NULL, NULL, NULL),
(2, 'BOOKING', 'lola', '2024-11-12 16:04:29', 3, NULL, NULL, NULL),
(3, 'BOOKING', 'maria', '2024-11-12 16:05:51', 4, NULL, NULL, NULL),
(4, 'CANCELLATION', 'maria', '2024-11-12 16:07:00', 4, 'Ens ha sorgit un imprevist familiar i no hi podrem anar', NULL, NULL),
(5, 'BOOKING', 'maria', '2024-11-12 16:07:45', 5, NULL, NULL, NULL),
(7, 'BOOKING', 'raul', '2024-11-12 16:26:37', 7, NULL, NULL, NULL),
(8, 'BOOKING', 'robert', '2024-11-12 16:27:25', 8, NULL, NULL, NULL),
(9, 'RESCHEDULING', 'laia', '2024-11-12 16:30:00', 7, 'Degut a l\'alerta per temporal, la sortida que teniem prevista per al 1 de març es mou al dia 8 de març.\r\n\r\nSi us plau, reviseu si podreu assistir o feu la cancel·lació oportuna en cas contrari', '2025-03-08', '15:30:00.000000'),
(10, 'RESCHEDULING', 'laia', '2024-11-12 16:30:00', 8, 'Degut a l\'alerta per temporal, la sortida que teniem prevista per al 1 de març es mou al dia 8 de març.\r\n\r\nSi us plau, reviseu si podreu assistir o feu la cancel·lació oportuna en cas contrari', '2025-03-08', '15:30:00.000000'),
(11, 'CANCELLATION', 'robert', '2024-11-12 16:56:00', 8, 'No puc anar aquest dia', NULL, NULL),
(12, 'BOOKING', 'toni', '2024-11-12 17:17:16', 9, NULL, NULL, NULL);
COMMIT;