CREATE DATABASE IF NOT EXISTS sailingdb CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;
USE sailingdb;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+01:00";

-- --------------------------------------------------------

--
-- Estructura de la taula `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `username` varchar(25) NOT NULL,
  `role` varchar(31) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`username`),
  KEY `role` (`role`),
  KEY `full_name` (`full_name`),
  KEY `role_x_full_name` (`role`,`full_name`)
) ;

-- --------------------------------------------------------

--
-- Table structure for table `trip_types`
--

CREATE TABLE `trip_types` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `category` enum('GROUP','PRIVATE') NOT NULL,
  `description` varchar(255) NOT NULL,
  `price` double NOT NULL,
  `duration` int(11) DEFAULT NULL,
  `max_places` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `category` (`category`)
) ;

-- --------------------------------------------------------

--
-- Table structure for table `trip_type_departures`
--
CREATE TABLE `trip_type_departures` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `trip_type_id` bigint(20) NOT NULL,
  `departure` time(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_trip_type_id` (`trip_type_id`)
);


--
-- Table structure for table `trips`
--

CREATE TABLE `trips` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `type_id` bigint(20) NOT NULL,
  `client_username` varchar(25) NOT NULL,
  `places` int(11) NOT NULL,
  `date` date NOT NULL,
  `departure` time(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_type_id` (`type_id`),
  KEY `fk_client_username` (`client_username`)
);

--
-- Table structure for table `actions`
--

CREATE TABLE `actions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `type` varchar(31) NOT NULL,
  `performer_username` varchar(25) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  `trip_id` bigint(20) NOT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `new_date` date DEFAULT NULL,
  `new_departure` time(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `trip_x_date` (`trip_id`,`date`),
  KEY `fk_performer_username` (`performer_username`),
  KEY `fk_trip_id` (`trip_id`),
  KEY `type` (`type`)
  
);

--
-- Constraints for table `trip_times`
--
ALTER TABLE `trip_type_departures`
  ADD CONSTRAINT `fk_trip_type_id` FOREIGN KEY (`trip_type_id`) REFERENCES `trip_types` (`id`);

--
-- Constraints for table `actions`
--
ALTER TABLE `actions`
  ADD CONSTRAINT `fk_trip_id` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`),
  ADD CONSTRAINT `fk_performer_username` FOREIGN KEY (`performer_username`) REFERENCES `users` (`username`);

--
-- Constraints for table `trips`
--
ALTER TABLE `trips`
  ADD CONSTRAINT `fk_client_username` FOREIGN KEY (`client_username`) REFERENCES `users` (`username`),
  ADD CONSTRAINT `fk_type_id` FOREIGN KEY (`type_id`) REFERENCES `trip_types` (`id`);
  
  --
-- View `booked_places`
--
CREATE VIEW booked_places AS
SELECT d.trip_type_id, t.date, d.departure, CAST(SUM(COALESCE(t.places,0)) AS UNSIGNED) AS booked_places 
FROM `trip_type_departures` d INNER JOIN `trip_types` tt ON d.trip_type_id=tt.id 
INNER JOIN `trips` t ON tt.id=t.type_id AND d.departure=t.departure 
WHERE (
	SELECT `a`.`type` FROM `actions` `a` WHERE `a`.`date` = (SELECT max(`last_action`.`date`) 
	FROM `actions` `last_action` 
	WHERE `last_action`.`trip_id` = `a`.`trip_id` AND `last_action`.`trip_id` = `t`.`id`)) not in ('CANCELLATION') 
GROUP BY d.trip_type_id, t.date, d.departure;

-- --------------------------------------------------------
