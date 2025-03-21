-- phpMyAdmin SQL Dump
-- version 4.8.0.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Temps de generació: 28-11-2024 a les 20:55:49
-- Versió del servidor: 10.1.32-MariaDB
-- Versió de PHP: 7.2.5

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de dades: `SAILINGS_DB`
--
CREATE DATABASE IF NOT EXISTS `SAILINGS_DB` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `SAILINGS_DB`;

-- --------------------------------------------------------

--
-- Estructura de la taula `ACTIONS`
--

DROP TABLE IF EXISTS `ACTIONS`;
CREATE TABLE IF NOT EXISTS `ACTIONS` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `DATE` datetime NOT NULL,
  `NEW_DATE` datetime DEFAULT NULL,
  `COMMENT` varchar(500) DEFAULT NULL,
  `TYPE` enum('RESCHEDULE','CANCELLATION','FINALIZATION','RESERVATION') NOT NULL,
  `PERFORMER_ID` varchar(25) NOT NULL,
  `BOOKING_ID` bigint(20) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `PERFORMER_ID` (`PERFORMER_ID`),
  KEY `BOOKING_ID` (`BOOKING_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de la taula `BOOKINGS`
--

DROP TABLE IF EXISTS `BOOKINGS`;
CREATE TABLE IF NOT EXISTS `BOOKINGS` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `TOTAL_PRICE` double NOT NULL,
  `PLACES` int(11) NOT NULL,
  `DEPARTURE` time NOT NULL,
  `SAILING_ID` bigint(20) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `SAILING_ID` (`SAILING_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de la taula `DEPARTURE_HOURS`
--

DROP TABLE IF EXISTS `DEPARTURE_HOURS`;
CREATE TABLE IF NOT EXISTS `DEPARTURE_HOURS` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `HOUR` time NOT NULL,
  `SAILING_ID` bigint(20) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `SAILING_ID` (`SAILING_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de la taula `SAILINGS`
--

DROP TABLE IF EXISTS `SAILINGS`;
CREATE TABLE IF NOT EXISTS `SAILINGS` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `TITLE` varchar(255) NOT NULL,
  `DESCRIPTION` varchar(500) NOT NULL,
  `PRICE` double NOT NULL,
  `DURATION` time NOT NULL,
  `AVAILABLE_PLACES` int(11) NOT NULL,
  `CATEGORY` enum('GROUP','PRIVATE') NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de la taula `USERS`
--

DROP TABLE IF EXISTS `USERS`;
CREATE TABLE IF NOT EXISTS `USERS` (
  `USERNAME` varchar(25) NOT NULL,
  `PASSWORD` varchar(255) NOT NULL,
  `FULL_NAME` varchar(100) NOT NULL,
  `PHONE` varchar(20) NOT NULL,
  `ROLE` enum('ADMIN','CUSTOMER') NOT NULL,
  PRIMARY KEY (`USERNAME`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Restriccions per a la taula `ACTIONS`
--
ALTER TABLE `ACTIONS`
  ADD CONSTRAINT `FK_BOOKING_ID_ACTIONS` FOREIGN KEY (`BOOKING_ID`) REFERENCES `BOOKINGS` (`ID`),
  ADD CONSTRAINT `FK_PERFORMER_ID_ACTIONS` FOREIGN KEY (`PERFORMER_ID`) REFERENCES `USERS` (`username`);

--
-- Restriccions per a la taula `BOOKINGS`
--
ALTER TABLE `BOOKINGS`
  ADD CONSTRAINT `FK_SAILING_ID_BOOKINGS` FOREIGN KEY (`SAILING_ID`) REFERENCES `SAILINGS` (`ID`);

--
-- Restriccions per a la taula `DEPARTURE_HOURS`
--
ALTER TABLE `DEPARTURE_HOURS`
  ADD CONSTRAINT `FK_SAILING_ID_DEPARTURE_HOURS` FOREIGN KEY (`SAILING_ID`) REFERENCES `SAILINGS` (`ID`);
COMMIT;


-- --------------------------------------------------------

--
-- Bolcament de dades per a la taula `USERS`
--

INSERT INTO `USERS` (`USERNAME`, `PASSWORD`, `FULL_NAME`, `PHONE`, `ROLE`) VALUES
('ARIEL', 'ariel', 'Ariel Gómez Valiente', '610929404', 'ADMIN'),
('JUAN', 'juan', 'Juan Gómez Gómez', '123456789', 'CUSTOMER');


--
-- Bolcament de dades per a la taula `SAILINGS`
--

INSERT INTO `SAILINGS` (`ID`, `TITLE`, `DESCRIPTION`, `PRICE`, `DURATION`, `AVAILABLE_PLACES`, `CATEGORY`) VALUES
(1, 'Maravilloso viaje por las islas baleares', 'viaje por las islas baleares donde podras divertirte con toda tu familia si me das los dineritos', 100.99, '08:00:00', 9, 'GROUP'),
(2, 'Viaje privado por las islas canarias', 'Increible viaje privado por las islas canarias para ti y tu parejita', 200, '05:00:00', 2, 'PRIVATE');


--
-- Bolcament de dades per a la taula `DEPARTURE_HOURS`
--

INSERT INTO `DEPARTURE_HOURS` (`ID`, `HOUR`, `SAILING_ID`) VALUES
(1, '10:00:00', 1),
(2, '11:00:00', 1),
(3, '09:00:00', 1),
(4, '08:00:00', 1);


--
-- Bolcament de dades per a la taula `BOOKINGS`
--

INSERT INTO `BOOKINGS` (`ID`, `TOTAL_PRICE`, `PLACES`, `DEPARTURE`, `SAILING_ID`) VALUES
(1, 400, 5, '10:00:00', 1),
(2, 2000, 2, '15:00:00', 2);


--
-- Bolcament de dades per a la taula `ACTIONS`
--

INSERT INTO `ACTIONS` (`ID`, `DATE`, `NEW_DATE`, `COMMENT`, `TYPE`, `PERFORMER_ID`, `BOOKING_ID`) VALUES
(1, '2024-11-28 09:34:13', NULL, NULL, 'RESERVATION', 'JUAN', 1),
(2, '2024-11-28 09:41:26', '2024-11-30 08:38:27', NULL, 'RESCHEDULE', 'ARIEL', 1),
(3, '2024-11-28 13:27:39', NULL, NULL, 'RESERVATION', 'JUAN', 2),
(4, '2024-11-28 13:42:18', NULL, 'me dejó la novia :\'(', 'CANCELLATION', 'JUAN', 2),
(5, '2024-12-01 12:22:30', NULL, 'Todo fue bien. Me olvidé de marcarlo ayer.', 'FINALIZATION', 'ARIEL', 1);


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
